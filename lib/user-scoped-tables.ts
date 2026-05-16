// Canonical registry of every Postgres table that stores per-user data.
//
// Why this exists: account deletion and account export both have to enumerate
// every user-scoped table. Historically those two routes maintained separate
// hardcoded lists, and they drifted — at one point the delete route wiped 18
// tables while the export route only included 10, meaning users could ask for
// "everything we have" and silently miss 8 tables' worth of their own data.
//
// The fix: a single registry that BOTH routes iterate over. If a table is
// added here it shows up in both flows; if it's omitted it doesn't appear in
// either, which is loud and easy to notice. New user-scoped tables MUST be
// added to this list — that's the only invariant a future contributor has to
// remember, and it's enforced by the structure of the routes themselves.
//
// See scripts/check-table-invariants.mjs for a sanity-check that prints the
// registry, validates the shape, and surfaces tables in migrations whose
// `user_id` columns aren't registered here.

export type DeleteStrategy =
  // Explicitly DELETE FROM <table> WHERE user_id = <uid>. The default and
  // safest choice — works regardless of FK config drift.
  | 'wipe'
  // The table has ON DELETE SET NULL on its FK to auth.users. We keep the
  // row but the identifier disappears when the auth.users row is removed.
  // Used for `feedback` (the body text is the maintainer's research record,
  // not personal data) and for ops tables where user_id is incidental.
  | 'fk_set_null'
  // The table has ON DELETE CASCADE via a parent (not auth.users directly).
  // E.g. `diary_embeddings` cascades from `diary_entries`. We still list it
  // here for transparency, but no explicit code is required.
  | 'fk_cascade';

export type UserScopedTable = {
  /** Postgres table name. */
  name: string;
  /** What happens to rows in this table when the account is deleted. */
  deleteStrategy: DeleteStrategy;
  /** Whether to include rows from this table in /api/account/export. */
  inExport: boolean;
  /**
   * True when at most one row exists per user. Drives `.maybeSingle()` in
   * the export pipeline so the payload field is `<table>: {…}` not
   * `<table>: [{…}]`.
   */
  singleton?: boolean;
  /**
   * Required: a short rationale visible to the next contributor. If you're
   * about to register a new table and you can't write a note about why,
   * step back — you probably haven't thought through the privacy implication
   * yet.
   */
  note: string;
};

// ─── The registry ───────────────────────────────────────────────────
//
// Roughly chronological by when each table was added. Keep the order stable
// so diffs are reviewable, and add new entries at the end.

export const USER_SCOPED_TABLES: readonly UserScopedTable[] = [
  // ── Core user content (everything a person creates inside Mull) ───
  {
    name: 'quiz_attempts',
    deleteStrategy: 'wipe',
    inExport: true,
    note: 'Each quiz session a user completed. Their 16-D vector + archetype + flavor.',
  },
  {
    name: 'dilemma_responses',
    deleteStrategy: 'wipe',
    inExport: true,
    note: 'Daily dilemma submissions with prose, vector_delta, analysis, diagnosis, kinship.',
  },
  {
    name: 'diary_entries',
    deleteStrategy: 'wipe',
    inExport: true,
    note: 'Long-form journaling. Same analysis pipeline as dilemmas.',
  },
  {
    name: 'debate_history',
    deleteStrategy: 'wipe',
    inExport: true,
    note: 'Generated philosopher debates the user kept.',
  },
  {
    name: 'exercise_reflections',
    deleteStrategy: 'wipe',
    inExport: true,
    note: 'Reflections written after completing a Stoic/Socratic/Buddhist exercise.',
  },

  // ── Per-user settings + state ─────────────────────────────────────
  {
    name: 'public_profiles',
    deleteStrategy: 'wipe',
    inExport: true,
    singleton: true,
    note: "User's public-profile visibility settings. Default is everything off.",
  },
  {
    name: 'notification_preferences',
    deleteStrategy: 'wipe',
    inExport: true,
    singleton: true,
    note: 'Opt-in flags + local-hour/TZ for the daily reminder email.',
  },
  {
    name: 'subscriptions',
    deleteStrategy: 'wipe',
    inExport: true,
    singleton: true,
    note: 'Stripe-shaped subscription state. Not live yet but the table exists.',
  },

  // ── Mo (premium AI coach) — schema exists, no UI yet ──────────────
  {
    name: 'mo_conversations',
    deleteStrategy: 'wipe',
    inExport: true,
    note: 'Per-conversation rows for the Mo coach. No active UI yet.',
  },
  {
    name: 'mo_messages',
    deleteStrategy: 'wipe',
    inExport: true,
    note: 'Per-message rows for Mo. Also FK-cascades from mo_conversations, but we list it explicitly to survive FK drift.',
  },

  // ── Diary derived data (embeddings + clusters) ────────────────────
  // Cascades from diary_entries via FK, but we wipe explicitly so a future
  // diary table redesign doesn't accidentally leave orphans behind.
  {
    name: 'diary_embeddings',
    deleteStrategy: 'wipe',
    inExport: true,
    note: 'Semantic embedding per diary entry. Derived but user might want to see what we stored about them.',
  },
  {
    name: 'diary_clusters',
    deleteStrategy: 'wipe',
    inExport: true,
    note: 'Cached cluster assignments + Claude-generated summaries per user.',
  },
  {
    name: 'diary_entry_clusters',
    deleteStrategy: 'wipe',
    inExport: true,
    note: 'Which cluster each diary entry belongs to in the latest snapshot.',
  },

  // ── Email dedupe ledgers ──────────────────────────────────────────
  // Small metadata tables that record which one-shot emails we've sent.
  // Including them in export is transparency: the user can see exactly
  // which courtesy emails we've dispatched on their behalf.
  {
    name: 'welcome_emails',
    deleteStrategy: 'wipe',
    inExport: true,
    singleton: true,
    note: 'Dedupe row for the one-time welcome email. At most one per user.',
  },
  {
    name: 'streak_break_emails',
    deleteStrategy: 'wipe',
    inExport: true,
    note: 'Per-miss-date dedupe for the streak-loss courtesy email.',
  },

  // ── Ops + observability ───────────────────────────────────────────
  {
    name: 'error_log',
    deleteStrategy: 'wipe',
    inExport: true,
    note: 'Server + client errors we logged for this user. Wiped on delete; included in export so users can see what we recorded about them.',
  },

  // ── Referrals ─────────────────────────────────────────────────────
  {
    name: 'referral_codes',
    deleteStrategy: 'wipe',
    inExport: true,
    singleton: true,
    note: "User's own referral code. One row per user.",
  },
  {
    name: 'referrals',
    deleteStrategy: 'wipe',
    inExport: true,
    singleton: true,
    note: 'Which referrer introduced this user (if any). One row per user (the introducee).',
  },

  // ── Tables we keep after deletion (with user_id NULLed) ───────────
  // These have ON DELETE SET NULL on the FK to auth.users. The user's
  // identifier vanishes; the row text remains. We DO include them in
  // export so a user requesting their data before deletion sees what
  // they wrote.
  {
    name: 'feedback',
    deleteStrategy: 'fk_set_null',
    inExport: true,
    note: 'Feedback text body. Body kept as the maintainer\'s research record after deletion; the user_id disappears via FK ON DELETE SET NULL.',
  },

  // ── Ops tables that aren't meaningful to export ───────────────────
  {
    name: 'rate_limit_events',
    deleteStrategy: 'fk_set_null',
    inExport: false,
    note: 'IP-hashed rate-limit events. Auto-pruned every 24h by a cron. Not worth exporting (it\'s ephemeral ops data and the IPs are already hashed).',
  },

  // ── Classroom (teacher + student membership) ──────────────────────
  // Classes are owned by a teacher (FK CASCADE) and joined by students
  // via invite codes. On user delete: classes the user *taught*
  // cascade away (taking class_members + class_assignments with them);
  // memberships the user *had as a student* cascade away too. The
  // simplest model for v1; teacher hand-off is a v2 feature.
  {
    name: 'classes',
    deleteStrategy: 'wipe',
    inExport: true,
    note: 'Classes the user created as a teacher. Each is a roster of students who joined via invite_code, plus the assignments threaded under it.',
  },
  {
    name: 'class_members',
    deleteStrategy: 'wipe',
    inExport: true,
    note: 'Class memberships — one row per (class, student) pair. Wipe on user delete removes them from every class they joined.',
  },
  {
    name: 'class_assignments',
    deleteStrategy: 'wipe',
    inExport: true,
    note: 'Assignments the user created as a teacher. Cascades from classes on teacher delete; included here so the export path also surfaces them.',
  },
  {
    name: 'class_assignment_submissions',
    deleteStrategy: 'wipe',
    inExport: true,
    note: 'Student responses to class assignments. One per (assignment, student). Wipe removes the user\'s submissions on delete.',
  },
  {
    name: 'friend_challenges',
    deleteStrategy: 'wipe',
    inExport: true,
    note: 'Friend-challenge invite codes the user minted. Telemetry on view_count / accept_count is theirs to see.',
  },
] as const;

// ─── Derived accessors ──────────────────────────────────────────────
//
// Pre-computed so callers don't iterate the full list every time. Order
// preserved so the delete loop is deterministic.

/** Tables we explicitly DELETE in the account-delete route. */
export const TABLES_TO_WIPE: readonly string[] = USER_SCOPED_TABLES
  .filter(t => t.deleteStrategy === 'wipe')
  .map(t => t.name);

/** Tables we SELECT from in the account-export route. */
export const TABLES_TO_EXPORT: readonly UserScopedTable[] = USER_SCOPED_TABLES
  .filter(t => t.inExport);

/**
 * Sanity check called at module load — duplicate detection + note presence.
 * Cheap and runs once. If the registry is malformed we want to know loudly
 * at deploy time rather than the next time a user requests deletion.
 */
function validateRegistry() {
  const seen = new Set<string>();
  for (const t of USER_SCOPED_TABLES) {
    if (seen.has(t.name)) {
      throw new Error(`[user-scoped-tables] duplicate table name: ${t.name}`);
    }
    seen.add(t.name);
    if (!t.note || t.note.trim().length < 8) {
      throw new Error(`[user-scoped-tables] missing or too-short note on ${t.name}`);
    }
  }
}
validateRegistry();
