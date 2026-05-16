// Streak-break courtesy email cron.
//
// Runs daily. For each opted-in user who had a streak ≥ 3 within the
// last 14 days but missed their last 2 consecutive days, sends a
// gentle "we missed you" email — once per break (the streak_break_emails
// table dedupes).
//
// Why streak ≥ 3: emailing someone who tried Mull once and didn't
// come back feels intrusive. Three days in a row is meaningful enough
// that a courtesy ping feels welcome, not nagging.
//
// Schedule (GitHub Actions): 0 14 * * *  (14:00 UTC daily — well after
// most timezones' "morning chance to do today's dilemma" has passed).
//
// Dry-run when EMAIL_PROVIDER_API_KEY / EMAIL_FROM aren't set.
// Auth via CRON_SECRET (see .env.example + lib/cron-auth).

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { requireCronAuth } from '@/lib/cron-auth';
import { sendEmail, maskEmail } from '@/lib/email';

export const runtime = 'nodejs';

type PrefRow = {
  user_id: string;
  email_dilemma_reminder: boolean;
};

type ResponseDateRow = {
  dilemma_date: string;
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Walk dates backward from today; return the streak length immediately
// before the first break (i.e. the streak the user just broke). The
// grace policy mirrors the SQL function: one missed day is forgiven,
// two consecutive misses break.
function lastBrokenStreakInfo(dates: Set<string>, today: Date): {
  brokenStreak: number;
  missDate: string | null;  // ISO date of the SECOND missed day
} {
  let cursor = new Date(today);
  cursor.setUTCDate(cursor.getUTCDate());
  // Skip ahead if today not yet answered (same as page logic).
  const todayKey = cursor.toISOString().slice(0, 10);
  if (!dates.has(todayKey)) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  let consecutiveMisses = 0;
  let firstMissAfterRun: string | null = null;
  // Walk forward through misses first to find the break.
  // But we want to detect: did the user just break a streak?
  // Approach: walk backward, count any leading misses.
  cursor = new Date(today);
  for (let i = 0; i < 14; i++) {
    const k = cursor.toISOString().slice(0, 10);
    if (dates.has(k)) break;
    consecutiveMisses++;
    if (consecutiveMisses === 2) firstMissAfterRun = k;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  if (consecutiveMisses < 2 || !firstMissAfterRun) {
    return { brokenStreak: 0, missDate: null };
  }
  // Now cursor is at the day AFTER the last day they answered. Walk
  // back from there to count the streak that was broken.
  let brokenStreak = 0;
  let graceUsed = false;
  cursor = new Date(today);
  cursor.setUTCDate(cursor.getUTCDate() - consecutiveMisses); // skip the misses
  for (let i = 0; i < 365; i++) {
    const k = cursor.toISOString().slice(0, 10);
    if (dates.has(k)) {
      brokenStreak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else if (!graceUsed) {
      graceUsed = true;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else {
      break;
    }
  }
  return { brokenStreak, missDate: firstMissAfterRun };
}

export async function GET(req: Request) {
  const denied = requireCronAuth(req);
  if (denied) return denied;

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    console.error('[cron/streak-break] admin client unavailable', e);
    return NextResponse.json({ error: 'Admin client misconfigured.' }, { status: 500 });
  }

  const { data: prefs, error: prefsErr } = await admin
    .from('notification_preferences')
    .select('user_id, email_dilemma_reminder')
    .eq('email_dilemma_reminder', true)
    .returns<PrefRow[]>();
  if (prefsErr) {
    console.error('[cron/streak-break] prefs lookup failed', prefsErr);
    return NextResponse.json({ error: 'Could not load preferences.' }, { status: 500 });
  }
  if (!prefs || prefs.length === 0) {
    return NextResponse.json({ ok: true, dryRun: true, candidateCount: 0 });
  }

  const { data: { users }, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listErr) {
    console.error('[cron/streak-break] listUsers failed', listErr);
    return NextResponse.json({ error: 'Could not list users.' }, { status: 500 });
  }
  const emailById = new Map(users.map(u => [u.id, u.email]));

  const today = new Date();
  const since = new Date(today.getTime() - 30 * 86400_000).toISOString();
  const sent: string[] = [];
  const skipped: string[] = [];
  const failed: Array<{ email: string; reason: string }> = [];

  for (const pref of prefs) {
    const email = emailById.get(pref.user_id);
    if (!email) continue;

    const { data: rows } = await admin
      .from('dilemma_responses')
      .select('dilemma_date')
      .eq('user_id', pref.user_id)
      .gte('created_at', since)
      .returns<ResponseDateRow[]>();
    const dates = new Set((rows ?? []).map(r => r.dilemma_date));
    if (dates.size === 0) { skipped.push('no recent activity'); continue; }

    const info = lastBrokenStreakInfo(dates, today);
    if (info.brokenStreak < 3 || !info.missDate) {
      skipped.push('no qualifying break');
      continue;
    }

    // Already sent for this break?
    const { data: existing } = await admin
      .from('streak_break_emails')
      .select('user_id')
      .eq('user_id', pref.user_id)
      .eq('miss_date', info.missDate)
      .maybeSingle();
    if (existing) { skipped.push('already sent'); continue; }

    const body = composeStreakBreak({ email, brokenStreak: info.brokenStreak });
    const result = await sendEmail({
      to: email,
      subject: `${info.brokenStreak} days · come back when you can`,
      html: body.html,
      text: body.text,
      logTag: `cron/streak-break · broken ${info.brokenStreak}-day streak`,
    });

    if (!result.ok) {
      failed.push({ email: maskEmail(email), reason: result.message });
      continue;
    }

    // Mark as sent regardless (live or dry) so we don't keep
    // preparing the same email every day. In dry-run dev that
    // means re-running the cron picks up new candidates only.
    await admin.from('streak_break_emails').insert({
      user_id: pref.user_id,
      miss_date: info.missDate,
    });
    sent.push(maskEmail(email));
  }

  const dryRun = !(process.env.EMAIL_PROVIDER_API_KEY && process.env.EMAIL_FROM);

  return NextResponse.json({
    ok: true,
    dryRun,
    optedInCount: prefs.length,
    sentCount: sent.length,
    skipped: skipped.length,
    failed,
  });
}

function composeStreakBreak({
  email, brokenStreak,
}: {
  email: string;
  brokenStreak: number;
}): { html: string; text: string } {
  const url = 'https://mull.world/dilemma';
  const text = [
    `${brokenStreak} days. That's worth something.`,
    ``,
    `Life happens. The map doesn't go anywhere — your archetype, your trail, all of it is still here when you're ready to come back.`,
    ``,
    `Today's dilemma: ${url}`,
    ``,
    `— Mull`,
    ``,
    `(One-time courtesy note. You can turn off email any time from your account settings.)`,
  ].join('\n');

  const html = `
    <div style="font-family: Georgia, serif; max-width: 540px; margin: 0 auto; padding: 36px 28px; color: #221E18; background: #FAF6EC;">
      <div style="font-size: 11px; font-weight: 600; color: #8C6520; text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 14px;">A note</div>
      <h1 style="font-family: Georgia, serif; font-size: 32px; font-weight: 500; margin: 0 0 8px; letter-spacing: -0.5px;">${brokenStreak} days. That&rsquo;s worth something.</h1>
      <p style="font-style: italic; font-size: 17px; color: #4A4338; margin: 0 0 28px; line-height: 1.55;">
        Life happens. The map doesn&rsquo;t go anywhere &mdash; your archetype, your trail, all of it is still here when you&rsquo;re ready.
      </p>
      <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #221E18; color: #FAF6EC; text-decoration: none; border-radius: 8px; font-family: Inter, sans-serif; font-size: 14px;">Today&rsquo;s dilemma →</a>
      <p style="font-family: Inter, sans-serif; font-size: 11px; color: #8C6520; margin-top: 36px; opacity: 0.7;">
        Sent to ${escapeHtml(email)}. <a href="https://mull.world/account" style="color: #8C6520;">Turn off email in account settings</a>.
      </p>
    </div>
  `;
  return { html, text };
}
