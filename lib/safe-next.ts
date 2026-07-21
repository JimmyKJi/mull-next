// Validates a `?next=` return path before redirecting to it after
// sign-in. Protected pages send users to `/login?next=/arena/pve/…`;
// honoring that param naively would create an open redirect
// (`?next=https://evil.example` or the scheme-relative `//evil.example`),
// so only same-origin absolute paths survive.
//
// Rules: must start with a single '/', must not start with '//' or
// '/\' (browsers normalize backslash to slash, making '/\evil.com'
// scheme-relative), and must not smuggle a protocol.

export function safeNextPath(raw: string | null | undefined): string | null {
  if (!raw) return null;
  // Reject control characters (CR/LF/NUL/etc). A real path never contains
  // them; keeping them out means this value can't smuggle a newline into
  // any redirect header if the helper is ever reused server-side.
  if (/[\u0000-\u001f\u007f]/.test(raw)) return null;
  if (!raw.startsWith('/')) return null;
  if (raw.startsWith('//') || raw.startsWith('/\\')) return null;
  return raw;
}
