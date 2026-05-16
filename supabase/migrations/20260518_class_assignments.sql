-- Class assignments — teachers post a prompt (custom dilemma, an
-- existing exercise, or a free-text diary prompt) to a class with
-- an optional due date. Students respond inline; teacher sees a
-- roster grid of submitted-vs-not.
--
-- Two tables:
--   class_assignments              — the prompt itself
--   class_assignment_submissions   — one per (assignment, student)
--
-- v1 keeps submission text denormalized in the submission row (vs
-- linking into dilemma_responses / diary_entries / exercise_reflections).
-- Cleaner RLS, no triple-FK ugliness. Cost: the student's personal
-- /account trajectory doesn't include class-assignment work unless
-- we add a "promote to personal trajectory" toggle in v2. For now,
-- the assignment lives inside the class context only.

CREATE TABLE IF NOT EXISTS class_assignments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id      uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  -- Who created the assignment. Usually the teacher; co-teachers in
  -- v2 might also create. CASCADE on user delete (the class itself
  -- cascades to teacher anyway).
  created_by    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Kind drives the student-facing UI hint + what the teacher's
  -- expected to fill in. Free text for v1; we can constrain to
  -- enum later.
  kind          text NOT NULL CHECK (kind IN ('dilemma','exercise','diary_prompt')),
  title         text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  -- The actual prompt body the student responds to. Required.
  prompt        text NOT NULL CHECK (char_length(prompt) BETWEEN 1 AND 4000),
  -- Optional teacher instructions ("Aim for 200–400 words", "Cite at
  -- least one philosopher from the syllabus", etc).
  instructions  text,
  -- Optional reference into Mull's own corpus — exercise slug, or
  -- dilemma index. Just text for flexibility.
  source_ref    text,
  -- Due date is optional — some assignments are "do at your own pace".
  due_at        timestamptz,
  is_archived   boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE class_assignments ENABLE ROW LEVEL SECURITY;

-- Teachers read + write assignments on classes they own.
DROP POLICY IF EXISTS "Teachers manage class assignments" ON class_assignments;
CREATE POLICY "Teachers manage class assignments"
  ON class_assignments FOR ALL
  USING (EXISTS (
    SELECT 1 FROM classes c
     WHERE c.id = class_assignments.class_id
       AND c.teacher_user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM classes c
     WHERE c.id = class_assignments.class_id
       AND c.teacher_user_id = auth.uid()
  ));

-- Students read assignments on classes they're a member of.
DROP POLICY IF EXISTS "Members read class assignments" ON class_assignments;
CREATE POLICY "Members read class assignments"
  ON class_assignments FOR SELECT
  USING (class_id IN (
    SELECT class_id FROM class_members WHERE user_id = auth.uid()
  ));

CREATE INDEX IF NOT EXISTS class_assignments_class_id_idx
  ON class_assignments(class_id, created_at DESC);
CREATE INDEX IF NOT EXISTS class_assignments_due_at_idx
  ON class_assignments(due_at) WHERE due_at IS NOT NULL;

-- updated_at auto-bump
DROP TRIGGER IF EXISTS class_assignments_touch_updated_at ON class_assignments;
CREATE TRIGGER class_assignments_touch_updated_at
  BEFORE UPDATE ON class_assignments
  FOR EACH ROW
  EXECUTE FUNCTION touch_classes_updated_at();

-- ─── Submissions ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS class_assignment_submissions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id   uuid NOT NULL REFERENCES class_assignments(id) ON DELETE CASCADE,
  student_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  response_text   text NOT NULL CHECK (char_length(response_text) BETWEEN 1 AND 8000),
  -- Whether the teacher has marked this as graded / reviewed. v1
  -- doesn't enforce a rubric; just a checkbox.
  reviewed_at     timestamptz,
  submitted_at    timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  -- One submission per (assignment, student). Re-submits overwrite
  -- via UPSERT in the API route.
  UNIQUE (assignment_id, student_user_id)
);

ALTER TABLE class_assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Students read + write their own submissions.
DROP POLICY IF EXISTS "Students manage own submissions" ON class_assignment_submissions;
CREATE POLICY "Students manage own submissions"
  ON class_assignment_submissions FOR ALL
  USING (student_user_id = auth.uid())
  WITH CHECK (student_user_id = auth.uid());

-- Teachers read + update (mark reviewed) submissions for their classes.
DROP POLICY IF EXISTS "Teachers read class submissions" ON class_assignment_submissions;
CREATE POLICY "Teachers read class submissions"
  ON class_assignment_submissions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM class_assignments a
      JOIN classes c ON c.id = a.class_id
     WHERE a.id = class_assignment_submissions.assignment_id
       AND c.teacher_user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Teachers mark submissions reviewed" ON class_assignment_submissions;
CREATE POLICY "Teachers mark submissions reviewed"
  ON class_assignment_submissions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM class_assignments a
      JOIN classes c ON c.id = a.class_id
     WHERE a.id = class_assignment_submissions.assignment_id
       AND c.teacher_user_id = auth.uid()
  ));

CREATE INDEX IF NOT EXISTS class_assignment_submissions_assignment_idx
  ON class_assignment_submissions(assignment_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS class_assignment_submissions_student_idx
  ON class_assignment_submissions(student_user_id, submitted_at DESC);

DROP TRIGGER IF EXISTS submissions_touch_updated_at ON class_assignment_submissions;
CREATE TRIGGER submissions_touch_updated_at
  BEFORE UPDATE ON class_assignment_submissions
  FOR EACH ROW
  EXECUTE FUNCTION touch_classes_updated_at();
