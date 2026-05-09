// Admin gate. Reads ADMIN_USER_IDS env var (comma-separated UUIDs)
// and exposes a small predicate API. The env var is private (no
// NEXT_PUBLIC_ prefix), so admin status can only be checked
// server-side — any client trying to forge a request without the
// admin user's session cookie will fail the auth check upstream
// before this even runs.
//
// Set in Vercel: Project → Settings → Environment Variables →
//   ADMIN_USER_IDS = <jimmy's auth.users.id>
// Multiple admins comma-separated:
//   ADMIN_USER_IDS = uuid1,uuid2,uuid3

const ADMIN_IDS = (process.env.ADMIN_USER_IDS ?? '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

export function isAdminUserId(userId: string | null | undefined): boolean {
  if (!userId) return false;
  return ADMIN_IDS.includes(userId);
}

// Convenience: returns the list. Useful only for diagnostic logging
// in dev — never expose this to a client.
export function adminUserIds(): string[] {
  return [...ADMIN_IDS];
}
