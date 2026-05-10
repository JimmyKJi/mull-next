// Daily dilemma email reminder cron — TIME-ZONE AWARE.
//
// SCAFFOLD ONLY — composes the messages and lists who'd be emailed, but does
// not actually send. Wire up an email provider (Resend, Postmark, SendGrid)
// then uncomment the `sendEmail()` block at the bottom.
//
// How it works (TZ-smart version):
//   - Cron fires HOURLY (Vercel Cron config below).
//   - For each opted-in user, compute the current hour in their stored TZ.
//   - If that local hour matches their `reminder_local_hour`, queue them.
//   - Result: every user gets emailed at their own 9 AM (or whatever hour
//     they chose), not at one global UTC hour.
//
// Vercel Cron config — add to vercel.json:
//   {
//     "crons": [{
//       "path": "/api/cron/dilemma-reminders",
//       "schedule": "0 * * * *"
//     }]
//   }
//   (top of every hour, UTC)
//
// Required env vars when actually sending:
//   CRON_SECRET                 — random string, also set in Vercel Cron header
//   EMAIL_PROVIDER_API_KEY      — Resend / Postmark / etc.
//   EMAIL_FROM                  — e.g. "Mull <hello@mull.world>"
//
// Required SQL migrations:
//   20260510_notification_prefs.sql

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getDailyDilemma } from '@/lib/dilemmas';

export const runtime = 'nodejs';

type Pref = {
  user_id: string;
  email_dilemma_reminder: boolean;
  reminder_local_hour: number;
  reminder_tz: string;
};

// Mask an email for log output: keep first char + domain. e.g.
// "alice@example.com" → "a***@example.com". Vercel logs are
// queryable, so the full user roster shouldn't sit in plain text.
function maskEmail(email: string): string {
  const at = email.indexOf('@');
  if (at <= 0) return '***';
  const local = email.slice(0, at);
  const domain = email.slice(at);
  return local[0] + '***' + domain;
}

// Returns the current hour (0–23) in the given IANA time zone.
// Returns null if the time zone is invalid (we just skip those users).
function localHourIn(tz: string, when: Date = new Date()): number | null {
  try {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      hour12: false,
    });
    const parts = fmt.formatToParts(when);
    const hourPart = parts.find(p => p.type === 'hour');
    if (!hourPart) return null;
    const h = parseInt(hourPart.value, 10);
    // "24" can appear from some implementations — normalize to 0.
    return h === 24 ? 0 : h;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  // Auth gate.
  const authHeader = req.headers.get('authorization') || '';
  const expected = process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : null;
  if (!expected || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    console.error('[cron/dilemma-reminders] admin client unavailable', e);
    return NextResponse.json({ error: 'Admin client misconfigured.' }, { status: 500 });
  }

  // Today's dilemma — same prompt every user gets in their inbox.
  const { dilemma } = getDailyDilemma();

  // Pull all opted-in preferences in one shot. The set is small (only people
  // who explicitly opted in) so this is cheap even at scale.
  const { data: prefs, error: prefsErr } = await admin
    .from('notification_preferences')
    .select('user_id, email_dilemma_reminder, reminder_local_hour, reminder_tz')
    .eq('email_dilemma_reminder', true)
    .returns<Pref[]>();

  if (prefsErr) {
    console.error('[cron/dilemma-reminders] prefs lookup failed', prefsErr);
    return NextResponse.json({ error: 'Could not load preferences.' }, { status: 500 });
  }

  const now = new Date();
  const candidates = (prefs ?? []).filter(p => {
    const localHour = localHourIn(p.reminder_tz, now);
    return localHour !== null && localHour === p.reminder_local_hour;
  });

  if (candidates.length === 0) {
    return NextResponse.json({ ok: true, dryRun: true, candidateCount: 0, message: 'No users due this hour.' });
  }

  // Resolve user emails for the matched user_ids.
  // listUsers can paginate — for now we pull a single page big enough to
  // cover normal volumes. Scale beyond ~1000 active reminder users will
  // require batching by user_id, which we'll do then.
  const { data: { users }, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listErr) {
    console.error('[cron/dilemma-reminders] listUsers failed', listErr);
    return NextResponse.json({ error: 'Could not list users.' }, { status: 500 });
  }

  const emailById = new Map(users.map(u => [u.id, u.email]));
  const sent: string[] = [];
  const failed: Array<{ email: string; reason: string }> = [];

  // Live mode if both env vars are set, otherwise dry-run with logging.
  // Wired via Resend's REST API (no SDK install required) — POST to
  // https://api.resend.com/emails with a Bearer key.
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY;
  const fromAddr = process.env.EMAIL_FROM;
  const liveMode = !!(apiKey && fromAddr);

  for (const cand of candidates) {
    const email = emailById.get(cand.user_id);
    if (!email) continue;
    const body = composeBody({ email, dilemmaPrompt: dilemma.prompt });
    try {
      if (liveMode) {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromAddr,
            to: email,
            subject: "Today's dilemma · Mull",
            html: body.html,
            text: body.text,
          }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Resend ${res.status}: ${text.slice(0, 200)}`);
        }
      } else {
        // Mask email in logs — Vercel logs are queryable; full
        // addresses there leak the user roster. Show only first
        // char + domain.
        console.log(`[cron/dilemma-reminders] (DRY RUN) would email ${maskEmail(email)} (their local ${cand.reminder_local_hour}:00 in ${cand.reminder_tz})`);
      }
      sent.push(email);
    } catch (e) {
      console.error(`[cron/dilemma-reminders] send failed for ${maskEmail(email)}:`, e);
      failed.push({ email, reason: (e as Error).message });
    }
  }

  return NextResponse.json({
    ok: true,
    dryRun: !liveMode,
    optedInCount: prefs?.length ?? 0,
    candidateCount: candidates.length,
    sentCount: sent.length,
    failedCount: failed.length,
    failed,
  });
}

function composeBody({ email, dilemmaPrompt }: { email: string; dilemmaPrompt: string }): { html: string; text: string } {
  const url = 'https://mull.world/dilemma';
  const text = [
    `Today's dilemma:`,
    ``,
    dilemmaPrompt,
    ``,
    `Reflect: ${url}`,
    ``,
    `— Mull`,
    ``,
    `(You can turn these off any time from your account settings.)`,
  ].join('\n');
  const html = `
    <div style="font-family: Georgia, serif; max-width: 540px; margin: 0 auto; padding: 32px; color: #221E18; background: #FAF6EC;">
      <div style="font-size: 11px; font-weight: 600; color: #8C6520; text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 14px;">Today's dilemma</div>
      <p style="font-style: italic; font-size: 19px; line-height: 1.5; margin: 0 0 28px;">${escapeHtml(dilemmaPrompt)}</p>
      <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #221E18; color: #FAF6EC; text-decoration: none; border-radius: 8px; font-family: Inter, sans-serif; font-size: 14px;">Reflect →</a>
      <p style="font-family: Inter, sans-serif; font-size: 12px; color: #8C6520; margin-top: 36px; opacity: 0.7;">Sent to ${escapeHtml(email)}. <a href="https://mull.world/account" style="color: #8C6520;">Turn off in account settings</a>.</p>
    </div>
  `;
  return { html, text };
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
