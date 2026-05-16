// One-time welcome email. Fired by the /account page (via the
// WelcomePinger client component) on first visit. Idempotent: if
// welcome_emails already has a row for this user, this is a no-op.
//
// Email sending + dry-run fallback live in lib/email.ts. This route
// composes the body, gates on the welcome_emails dedupe table, and
// hands the send off to the shared helper.
//
// Required env vars when actually sending: EMAIL_PROVIDER_API_KEY
// and EMAIL_FROM (see .env.example).
//
// Required SQL: 20260514_welcome_emails.sql

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendEmail } from '@/lib/email';

export const runtime = 'nodejs';

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

  const body = composeWelcome({ email: user.email });
  const result = await sendEmail({
    to: user.email,
    subject: 'Welcome to Mull',
    html: body.html,
    text: body.text,
    logTag: 'welcome',
  });

  // Don't mark as sent if delivery failed — let the next page load
  // retry. (Dry-run counts as "sent" for the dedupe purpose since we
  // don't want to spam the same address with dry-run logs forever.)
  if (!result.ok) {
    return NextResponse.json({ error: 'Send failed.', status: result.status }, { status: 502 });
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

  return NextResponse.json({ ok: true, sent: result.sent, dryRun: result.dryRun });
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
