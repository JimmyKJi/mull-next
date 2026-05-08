-- Per-user notification preferences. Currently just dilemma reminders.
-- Storing the preferred local hour (0–23) + IANA time zone lets the cron
-- compare each user's local clock against the cron's run-time and only
-- send when it's that user's local 9 AM (or whatever they picked).

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id                       uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_dilemma_reminder        boolean NOT NULL DEFAULT false,
  -- Local hour-of-day, 0–23, when the reminder should fire.
  reminder_local_hour           integer NOT NULL DEFAULT 9
                                  CHECK (reminder_local_hour >= 0 AND reminder_local_hour <= 23),
  -- IANA time zone ID, e.g. "America/New_York", "Europe/London".
  -- Falls back to UTC if not set.
  reminder_tz                   text NOT NULL DEFAULT 'UTC',
  created_at                    timestamptz NOT NULL DEFAULT now(),
  updated_at                    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own prefs" ON notification_preferences;
CREATE POLICY "Users see own prefs"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own prefs" ON notification_preferences;
CREATE POLICY "Users update own prefs"
  ON notification_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Helper index for the cron's "who should I email this hour?" query.
CREATE INDEX IF NOT EXISTS notification_prefs_reminder_lookup
  ON notification_preferences(reminder_local_hour, reminder_tz)
  WHERE email_dilemma_reminder = true;
