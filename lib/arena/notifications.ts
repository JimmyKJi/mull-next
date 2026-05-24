// Arena PvP email notifications.
//
// Three transactional emails:
//   - challenge_accepted: challenger learns someone took their open
//     challenge + the opponent's opening response is in
//   - your_turn:  other player has just played, it's now this user's turn
//   - verdict:    judge has ruled, both players get the verdict link
//
// All three use lib/email.sendEmail — Resend if configured, dry-run
// log otherwise. Each email is short, useful, and links straight back
// into the match. No tracking pixels, no marketing copy.
//
// User email is fetched server-side via Supabase service-role client
// (auth.users isn't directly queryable from anon/authenticated). For
// the prototype we don't have a "disable notifications" setting yet;
// recipients can simply not reply. We can add an opt-out table later.

import { createClient as createServiceClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://mull.world";

/** Service-role client — needed to read auth.users email field
 *  which is not exposed via RLS to the requester. */
function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createServiceClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Look up a user's email by id. Returns null if unavailable. */
async function lookupEmail(userId: string): Promise<string | null> {
  const admin = adminClient();
  if (!admin) return null;
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data?.user?.email) return null;
  return data.user.email;
}

// ─── Email templates ─────────────────────────────────────────────

type TemplateContext = {
  topicTitle: string;
  matchUrl: string;
  opponentLabel: string;
};

function challengeAcceptedTemplate(ctx: TemplateContext): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `${ctx.opponentLabel} accepted your Arena challenge`;
  const text = `Your Arena challenge on "${ctx.topicTitle}" was accepted by ${ctx.opponentLabel}. Their opening response is in — it's your turn to play.

Continue the match: ${ctx.matchUrl}

— Mull`;
  const html = baseHtml(`
    <h2 style="font-family: Georgia, serif; font-size:20px; color:#221E18; margin:0 0 12px;">Your challenge was accepted</h2>
    <p style="font-family: Georgia, serif; font-size:16px; line-height:1.5; color:#221E18; margin:0 0 14px;"><strong>${escapeHtml(ctx.opponentLabel)}</strong> took your Arena challenge on <em>${escapeHtml(ctx.topicTitle)}</em>. Their opening response is in.</p>
    <p style="font-family: Georgia, serif; font-size:16px; line-height:1.5; color:#221E18; margin:0 0 20px;">It's your turn now.</p>
    ${ctaButton("Continue the match", ctx.matchUrl)}
  `);
  return { subject, text, html };
}

function yourTurnTemplate(ctx: TemplateContext): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `Your turn — ${ctx.opponentLabel} just played`;
  const text = `${ctx.opponentLabel} just played their turn in your Arena match on "${ctx.topicTitle}". It's your turn now.

Continue: ${ctx.matchUrl}

— Mull`;
  const html = baseHtml(`
    <h2 style="font-family: Georgia, serif; font-size:20px; color:#221E18; margin:0 0 12px;">Your turn</h2>
    <p style="font-family: Georgia, serif; font-size:16px; line-height:1.5; color:#221E18; margin:0 0 20px;"><strong>${escapeHtml(ctx.opponentLabel)}</strong> just played in your match on <em>${escapeHtml(ctx.topicTitle)}</em>.</p>
    ${ctaButton("Continue the match", ctx.matchUrl)}
  `);
  return { subject, text, html };
}

function verdictTemplate(ctx: TemplateContext & { verdictLine: string }): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = `Verdict in — ${ctx.topicTitle}`;
  const text = `The verdict is in on your Arena match vs ${ctx.opponentLabel} on "${ctx.topicTitle}".

${ctx.verdictLine}

See the breakdown: ${ctx.matchUrl}

— Mull`;
  const html = baseHtml(`
    <h2 style="font-family: Georgia, serif; font-size:20px; color:#221E18; margin:0 0 12px;">The verdict is in</h2>
    <p style="font-family: Georgia, serif; font-size:16px; line-height:1.5; color:#221E18; margin:0 0 14px;">Your match vs <strong>${escapeHtml(ctx.opponentLabel)}</strong> on <em>${escapeHtml(ctx.topicTitle)}</em> has been judged.</p>
    <p style="font-family: 'Courier New', monospace; font-size:14px; color:#221E18; background:#F8EDC8; border:2px solid #221E18; padding:10px 14px; margin:0 0 20px;">${escapeHtml(ctx.verdictLine)}</p>
    ${ctaButton("See the full breakdown", ctx.matchUrl)}
  `);
  return { subject, text, html };
}

// ─── Public API ──────────────────────────────────────────────────

export async function notifyChallengeAccepted(args: {
  challengerUserId: string;
  opponentLabel: string;
  topicTitle: string;
  sessionId: string;
}): Promise<void> {
  const email = await lookupEmail(args.challengerUserId);
  if (!email) return;
  const t = challengeAcceptedTemplate({
    topicTitle: args.topicTitle,
    matchUrl: `${SITE}/arena/pvp/${args.sessionId}`,
    opponentLabel: args.opponentLabel,
  });
  await sendEmail({
    to: email,
    subject: t.subject,
    text: t.text,
    html: t.html,
    logTag: "arena/accepted",
  });
}

export async function notifyYourTurn(args: {
  recipientUserId: string;
  opponentLabel: string;
  topicTitle: string;
  sessionId: string;
}): Promise<void> {
  const email = await lookupEmail(args.recipientUserId);
  if (!email) return;
  const t = yourTurnTemplate({
    topicTitle: args.topicTitle,
    matchUrl: `${SITE}/arena/pvp/${args.sessionId}`,
    opponentLabel: args.opponentLabel,
  });
  await sendEmail({
    to: email,
    subject: t.subject,
    text: t.text,
    html: t.html,
    logTag: "arena/turn",
  });
}

export async function notifyVerdict(args: {
  recipientUserId: string;
  opponentLabel: string;
  topicTitle: string;
  sessionId: string;
  /** "You won 22-18" / "You lost 17-23" / "Draw 20-20". Pre-formatted. */
  verdictLine: string;
}): Promise<void> {
  const email = await lookupEmail(args.recipientUserId);
  if (!email) return;
  const t = verdictTemplate({
    topicTitle: args.topicTitle,
    matchUrl: `${SITE}/arena/pvp/${args.sessionId}`,
    opponentLabel: args.opponentLabel,
    verdictLine: args.verdictLine,
  });
  await sendEmail({
    to: email,
    subject: t.subject,
    text: t.text,
    html: t.html,
    logTag: "arena/verdict",
  });
}

// ─── Templates helpers ───────────────────────────────────────────

function baseHtml(body: string): string {
  return `<!doctype html>
<html><body style="margin:0; padding:24px; background:#FAF6EC; color:#221E18;">
<div style="max-width:520px; margin:0 auto; background:#FFFCF4; border:3px solid #221E18; padding:24px;">
  <div style="font-family:'Courier New',monospace; font-size:11px; letter-spacing:0.2em; text-transform:uppercase; color:#8C6520; margin-bottom:16px;">▸ MULL · THE ARENA</div>
  ${body}
  <hr style="border:none; border-top:1px solid #D6CDB6; margin:24px 0 12px;" />
  <p style="font-family: Georgia, serif; font-size:12px; color:#8C6520; margin:0; line-height:1.4;">You're getting this because you have an active Arena match. Reply to this email if you want to stop receiving Arena notifications and we'll switch them off for you.</p>
</div>
</body></html>`;
}

function ctaButton(label: string, href: string): string {
  return `<p style="margin:0;"><a href="${href}" style="display:inline-block; padding:12px 20px; background:#F8C75E; color:#1A1820; border:2px solid #221E18; text-decoration:none; font-family:'Courier New',monospace; font-size:12px; letter-spacing:0.18em; text-transform:uppercase;">▶ ${escapeHtml(label).toUpperCase()}</a></p>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
