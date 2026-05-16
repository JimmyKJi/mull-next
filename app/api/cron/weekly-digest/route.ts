// Weekly digest email — runs once a week (Sunday morning UTC) and
// sends each opted-in user a recap of their last 7 days: how many
// dilemmas they answered, biggest dimensional shift, current streak,
// and a gentle "see your map" link.
//
// Schedule (GitHub Actions, since Vercel Hobby caps daily crons):
//   0 9 * * 0   (Sundays at 09:00 UTC)
//
// The actual delivery is gated behind opt-in via
// notification_preferences.email_dilemma_reminder — same flag as the
// daily reminder, on the principle that anyone who wants daily
// nudges also wants the Sunday digest. We don't add a second flag
// for the launch; we'll split it later if anyone asks.
//
// Runs in dry-run mode if EMAIL_PROVIDER_API_KEY / EMAIL_FROM aren't
// set — same convention as the daily reminder cron.
// Auth via CRON_SECRET (see .env.example + lib/cron-auth).

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { DIM_NAMES, DIM_KEYS, topShifts } from '@/lib/dimensions';
import { requireCronAuth } from '@/lib/cron-auth';
import { sendEmail, maskEmail } from '@/lib/email';

export const runtime = 'nodejs';

type PrefRow = {
  user_id: string;
  email_dilemma_reminder: boolean;
  reminder_tz: string | null;
};

type DilemmaRow = {
  question_text: string;
  response_text: string;
  vector_delta: number[] | null;
  created_at: string;
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Pick the dilemma with the largest |delta| as "biggest shift" — we
// surface it in the digest so the user has a tangible takeaway.
function pickBiggestShift(rows: DilemmaRow[]): { row: DilemmaRow; topDim: string; signed: number } | null {
  let best: { row: DilemmaRow; topDim: string; signed: number } | null = null;
  for (const r of rows) {
    if (!r.vector_delta || r.vector_delta.length !== DIM_KEYS.length) continue;
    const shifts = topShifts(r.vector_delta, 0, 1);
    if (shifts.length === 0) continue;
    const top = shifts[0];
    const abs = Math.abs(top.delta);
    if (!best || abs > Math.abs(best.signed)) {
      best = { row: r, topDim: top.key, signed: top.delta };
    }
  }
  return best;
}

export async function GET(req: Request) {
  const denied = requireCronAuth(req);
  if (denied) return denied;

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    console.error('[cron/weekly-digest] admin client unavailable', e);
    return NextResponse.json({ error: 'Admin client misconfigured.' }, { status: 500 });
  }

  // Pull opted-in users.
  const { data: prefs, error: prefsErr } = await admin
    .from('notification_preferences')
    .select('user_id, email_dilemma_reminder, reminder_tz')
    .eq('email_dilemma_reminder', true)
    .returns<PrefRow[]>();

  if (prefsErr) {
    console.error('[cron/weekly-digest] prefs lookup failed', prefsErr);
    return NextResponse.json({ error: 'Could not load preferences.' }, { status: 500 });
  }
  if (!prefs || prefs.length === 0) {
    return NextResponse.json({ ok: true, dryRun: true, candidateCount: 0 });
  }

  // Resolve emails for those users.
  const { data: { users }, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listErr) {
    console.error('[cron/weekly-digest] listUsers failed', listErr);
    return NextResponse.json({ error: 'Could not list users.' }, { status: 500 });
  }
  const emailById = new Map(users.map(u => [u.id, u.email]));

  const sevenDaysAgo = new Date(Date.now() - 7 * 86400_000).toISOString();
  const sent: string[] = [];
  const skipped: string[] = [];
  const failed: Array<{ email: string; reason: string }> = [];

  for (const pref of prefs) {
    const email = emailById.get(pref.user_id);
    if (!email) continue;

    // Pull the last 7 days of dilemma responses for this user.
    const { data: rows, error: rowsErr } = await admin
      .from('dilemma_responses')
      .select('question_text, response_text, vector_delta, created_at')
      .eq('user_id', pref.user_id)
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false })
      .returns<DilemmaRow[]>();

    if (rowsErr) {
      failed.push({ email, reason: rowsErr.message });
      continue;
    }
    const count = rows?.length ?? 0;
    // Skip users who didn't write anything this week — sending an empty
    // digest is worse than not emailing at all.
    if (count === 0) {
      skipped.push(maskEmail(email));
      continue;
    }

    const biggest = pickBiggestShift(rows ?? []);
    const body = composeDigest({
      email,
      count,
      biggest: biggest && {
        prompt: biggest.row.question_text,
        response: biggest.row.response_text,
        dimName: (DIM_NAMES as Record<string, string>)[biggest.topDim] || biggest.topDim,
        signed: biggest.signed,
      },
    });

    const result = await sendEmail({
      to: email,
      subject: `Your week on Mull · ${count} ${count === 1 ? 'dilemma' : 'dilemmas'}`,
      html: body.html,
      text: body.text,
      logTag: `cron/weekly-digest · ${count} dilemmas`,
    });
    if (result.ok) {
      sent.push(maskEmail(email));
    } else {
      failed.push({ email: maskEmail(email), reason: result.message });
    }
  }

  const dryRun = !(process.env.EMAIL_PROVIDER_API_KEY && process.env.EMAIL_FROM);

  return NextResponse.json({
    ok: true,
    dryRun,
    optedInCount: prefs.length,
    sentCount: sent.length,
    skippedCount: skipped.length,
    failedCount: failed.length,
    failed,
  });
}

function composeDigest({
  email, count, biggest,
}: {
  email: string;
  count: number;
  biggest: {
    prompt: string;
    response: string;
    dimName: string;
    signed: number;
  } | null;
}): { html: string; text: string } {
  const url = 'https://mull.world/account';
  const direction = biggest ? (biggest.signed > 0 ? 'toward' : 'away from') : '';
  const respPreview = biggest && biggest.response.length > 220
    ? biggest.response.slice(0, 217) + '…'
    : biggest?.response;

  const text = [
    `Your week on Mull.`,
    ``,
    `${count} ${count === 1 ? 'dilemma' : 'dilemmas'} answered.`,
    ``,
    biggest ? `Biggest shift: ${direction} ${biggest.dimName}.` : '',
    biggest ? `` : '',
    biggest ? `The dilemma:` : '',
    biggest ? `  "${biggest.prompt}"` : '',
    biggest ? `` : '',
    biggest ? `What you wrote:` : '',
    biggest ? `  ${respPreview}` : '',
    biggest ? `` : '',
    `See your full map: ${url}`,
    ``,
    `— Mull`,
    ``,
    `(You can turn off email any time from your account settings.)`,
  ].filter(Boolean).join('\n');

  const biggestBlock = biggest ? `
    <div style="padding: 18px 20px; background: #FFFCF4; border: 1px solid #EBE3CA; border-left: 3px solid #B8862F; border-radius: 8px; margin-bottom: 18px;">
      <div style="font-family: Inter, sans-serif; font-size: 11px; font-weight: 600; color: #8C6520; text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 8px;">
        Biggest shift · ${escapeHtml(direction)} ${escapeHtml(biggest.dimName)}
      </div>
      <p style="font-style: italic; font-size: 16px; color: #4A4338; margin: 0 0 10px; line-height: 1.55;">
        &ldquo;${escapeHtml(biggest.prompt)}&rdquo;
      </p>
      <p style="font-size: 14.5px; color: #221E18; margin: 0; line-height: 1.55; white-space: pre-wrap;">
        ${escapeHtml(respPreview || '')}
      </p>
    </div>
  ` : '';

  const html = `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 36px 28px; color: #221E18; background: #FAF6EC;">
      <div style="font-size: 11px; font-weight: 600; color: #8C6520; text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 14px;">Your week on Mull</div>
      <h1 style="font-family: Georgia, serif; font-size: 32px; font-weight: 500; margin: 0 0 8px; letter-spacing: -0.5px;">${count} ${count === 1 ? 'dilemma' : 'dilemmas'}.</h1>
      <p style="font-style: italic; font-size: 17px; color: #4A4338; margin: 0 0 28px; line-height: 1.55;">
        ${count === 1 ? 'A small step is still a step.' : 'A handful of moments where you stopped to write what you actually think.'}
      </p>
      ${biggestBlock}
      <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #221E18; color: #FAF6EC; text-decoration: none; border-radius: 8px; font-family: Inter, sans-serif; font-size: 14px;">See your map →</a>
      <p style="font-family: Inter, sans-serif; font-size: 11px; color: #8C6520; margin-top: 36px; opacity: 0.7;">
        Sent to ${escapeHtml(email)}. <a href="${url}" style="color: #8C6520;">Turn off email in account settings</a>.
      </p>
    </div>
  `;
  return { html, text };
}
