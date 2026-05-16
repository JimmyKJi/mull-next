// Shared Resend email sender + dry-run fallback.
//
// Four routes (welcome, dilemma-reminders, streak-break, weekly-digest)
// previously duplicated:
//   - Reading EMAIL_PROVIDER_API_KEY + EMAIL_FROM
//   - The fetch('https://api.resend.com/emails', …) call
//   - The non-2xx handling
//   - The maskEmail logger
//
// This module centralizes that. Live mode kicks in automatically when
// both env vars are present; otherwise we log a masked "would send"
// line and return ok with `dryRun: true`. Either way the call shape is
// identical, so consumers don't branch on liveness.
//
// Required env vars (when actually sending):
//   EMAIL_PROVIDER_API_KEY  — Resend API key
//   EMAIL_FROM              — e.g. "Mull <hello@mull.world>"

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Optional tag for the dry-run log line. Helps disambiguate which
   *  caller a "[email] would send to …" line came from. */
  logTag?: string;
};

export type SendEmailResult =
  | { ok: true; sent: true; dryRun: false }
  | { ok: true; sent: false; dryRun: true }
  | { ok: false; sent: false; dryRun: false; status: number; message: string };

/** True if both EMAIL_PROVIDER_API_KEY and EMAIL_FROM are set. */
export function emailLiveMode(): boolean {
  return !!(process.env.EMAIL_PROVIDER_API_KEY && process.env.EMAIL_FROM);
}

/** Mask an email for logs ("a***@example.com") to avoid leaking the
 *  full address to Vercel logs (queryable / shared with team). */
export function maskEmail(email: string): string {
  const at = email.indexOf('@');
  if (at <= 0) return '***';
  return email[0] + '***' + email.slice(at);
}

/**
 * Send one transactional email through Resend, or log a dry-run line
 * when the env vars aren't configured. Never throws — wraps fetch
 * errors into a structured result so callers can log + move on.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY;
  const fromAddr = process.env.EMAIL_FROM;
  const tagPrefix = input.logTag ? `[${input.logTag}] ` : '[email] ';

  if (!apiKey || !fromAddr) {
    console.log(`${tagPrefix}(DRY RUN) would email ${maskEmail(input.to)} · "${input.subject}"`);
    return { ok: true, sent: false, dryRun: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddr,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      const message = `Resend ${res.status}: ${body.slice(0, 200)}`;
      console.error(`${tagPrefix}send failed for ${maskEmail(input.to)} — ${message}`);
      return { ok: false, sent: false, dryRun: false, status: res.status, message };
    }
    return { ok: true, sent: true, dryRun: false };
  } catch (e) {
    const message = (e as Error).message || 'Unknown send error';
    console.error(`${tagPrefix}send threw for ${maskEmail(input.to)} — ${message}`);
    return { ok: false, sent: false, dryRun: false, status: 0, message };
  }
}
