// One-time welcome email. Fired by the /account page (via the
// WelcomePinger client component) on first visit. Idempotent: if
// welcome_emails already has a row for this user, this is a no-op.
//
// Falls back to dry-run logging if EMAIL_PROVIDER_API_KEY / EMAIL_FROM
// aren't set, so it's safe to deploy before the email infra is wired
// up. Live mode kicks in automatically when both env vars are present.
//
// Required env vars when actually sending:
//   EMAIL_PROVIDER_API_KEY      — Resend API key
//   EMAIL_FROM                  — e.g. "Mull <hello@mull.world>"
//
// Required SQL: 20260514_welcome_emails.sql

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';

function maskEmail(email: string): string {
  const at = email.indexOf('@');
  if (at <= 0) return '***';
  return email[0] + '***' + email.slice(at);
}

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  if (!user.email) return NextResponse.json({ ok: true, skipped: 'no email' });

  // Already-sent guard — RLS lets the user read their own row.
  const { data: existing } = await supabase
    .from('welcome_emails')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (existing) return NextResponse.json({ ok: true, alreadySent: true });

  const apiKey = process.env.EMAIL_PROVIDER_API_KEY;
  const fromAddr = process.env.EMAIL_FROM;
  const liveMode = !!(apiKey && fromAddr);

  const body = composeWelcome({ email: user.email });

  if (liveMode) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddr,
          to: user.email,
          subject: 'Welcome to Mull',
          html: body.html,
          text: body.text,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error('[welcome] Resend failed', res.status, text.slice(0, 200));
        // Don't mark as sent if delivery failed — let next page load retry.
        return NextResponse.json({ error: 'Send failed.', status: res.status }, { status: 502 });
      }
    } catch (e) {
      console.error('[welcome] Resend threw', e);
      return NextResponse.json({ error: 'Send threw.' }, { status: 502 });
    }
  } else {
    console.log(`[welcome] (DRY RUN) would email ${maskEmail(user.email)}`);
  }

  // Mark as sent. If this insert fails (rare), we'd send again next
  // load — annoying but not catastrophic. We tolerate the small
  // double-send risk in exchange for dead-simple flow.
  const { error: insertErr } = await supabase
    .from('welcome_emails')
    .insert({ user_id: user.id });
  if (insertErr && insertErr.code !== '23505') {
    // 23505 = unique_violation, a race with another tab's request — fine.
    console.error('[welcome] mark-sent failed', insertErr);
  }

  return NextResponse.json({ ok: true, sent: liveMode, dryRun: !liveMode });
}

function composeWelcome({ email }: { email: string }): { html: string; text: string } {
  const text = [
    `Welcome to Mull.`,
    ``,
    `A few things you might do next:`,
    ``,
    `· Today's dilemma — one short philosophical question, your answer, a small shift on your map.`,
    `  https://mull.world/dilemma`,
    ``,
    `· Your account — see your archetype, your map of how you think, and the trail of how it's evolving.`,
    `  https://mull.world/account`,
    ``,
    `· Compare with a friend — paste two handles, see two minds side by side.`,
    `  https://mull.world/compare`,
    ``,
    `Your archetype is a starting point, not a verdict.`,
    `The map shifts as you do.`,
    ``,
    `If anything is broken or confusing, the floating Feedback button on every page lands directly in my inbox.`,
    `Or just reply to this email.`,
    ``,
    `— Jimmy`,
    `Mull · mull.world`,
    ``,
    `(You can turn off all email any time from your account settings.)`,
  ].join('\n');

  const html = `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 36px 28px; color: #221E18; background: #FAF6EC;">
      <div style="font-size: 11px; font-weight: 600; color: #8C6520; text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 14px;">A first note</div>
      <h1 style="font-family: Georgia, serif; font-size: 32px; font-weight: 500; margin: 0 0 8px; letter-spacing: -0.5px;">Welcome to Mull.</h1>
      <p style="font-style: italic; font-size: 17px; color: #4A4338; margin: 0 0 28px; line-height: 1.55;">A small handful of things you might do next.</p>

      <div style="padding: 18px 20px; background: #FFFCF4; border: 1px solid #EBE3CA; border-left: 3px solid #B8862F; border-radius: 8px; margin-bottom: 14px;">
        <div style="font-family: Inter, sans-serif; font-size: 11px; font-weight: 600; color: #8C6520; text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 8px;">Today's dilemma</div>
        <p style="margin: 0 0 10px; font-size: 15.5px; line-height: 1.55;">One short philosophical question. Your answer. A small shift on your map.</p>
        <a href="https://mull.world/dilemma" style="font-family: Inter, sans-serif; font-size: 13px; color: #8C6520; text-decoration: underline; text-underline-offset: 3px;">Answer today's →</a>
      </div>

      <div style="padding: 18px 20px; background: #FFFCF4; border: 1px solid #EBE3CA; border-left: 3px solid #2F5D5C; border-radius: 8px; margin-bottom: 14px;">
        <div style="font-family: Inter, sans-serif; font-size: 11px; font-weight: 600; color: #2F5D5C; text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 8px;">Your account</div>
        <p style="margin: 0 0 10px; font-size: 15.5px; line-height: 1.55;">Your archetype, your map of how you think, and the trail of how it&rsquo;s evolving.</p>
        <a href="https://mull.world/account" style="font-family: Inter, sans-serif; font-size: 13px; color: #8C6520; text-decoration: underline; text-underline-offset: 3px;">Open your account →</a>
      </div>

      <div style="padding: 18px 20px; background: #FFFCF4; border: 1px solid #EBE3CA; border-left: 3px solid #7A4A2E; border-radius: 8px; margin-bottom: 28px;">
        <div style="font-family: Inter, sans-serif; font-size: 11px; font-weight: 600; color: #7A4A2E; text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 8px;">Compare with a friend</div>
        <p style="margin: 0 0 10px; font-size: 15.5px; line-height: 1.55;">Paste two handles. See two minds side by side.</p>
        <a href="https://mull.world/compare" style="font-family: Inter, sans-serif; font-size: 13px; color: #8C6520; text-decoration: underline; text-underline-offset: 3px;">Compare →</a>
      </div>

      <p style="font-style: italic; font-size: 16px; color: #4A4338; margin: 0 0 12px; line-height: 1.55;">
        Your archetype is a starting point, not a verdict.
      </p>
      <p style="font-style: italic; font-size: 16px; color: #4A4338; margin: 0 0 28px; line-height: 1.55;">
        The map shifts as you do.
      </p>

      <p style="font-family: Inter, sans-serif; font-size: 13.5px; color: #4A4338; line-height: 1.55; margin: 0 0 24px;">
        If anything is broken or confusing, the floating <strong>Feedback</strong> button on every page lands directly in my inbox. Or reply to this email.
      </p>

      <p style="font-family: Inter, sans-serif; font-size: 13.5px; color: #221E18; margin: 0 0 4px;">— Jimmy</p>
      <p style="font-family: Inter, sans-serif; font-size: 11px; color: #8C6520; letter-spacing: 0.16em; text-transform: uppercase; margin: 0;">Mull · mull.world</p>

      <p style="font-family: Inter, sans-serif; font-size: 11px; color: #8C6520; margin-top: 36px; opacity: 0.7;">
        Sent to ${escapeHtml(email)}. <a href="https://mull.world/account" style="color: #8C6520;">Turn off email in account settings</a>.
      </p>
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
