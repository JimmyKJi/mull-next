-- Classes — the foundation of Mull's classroom-tool track.
--
-- Schema:
--   classes        — one row per class (teacher creates)
--   class_members  — join table; students belong to classes
--
-- Flow:
--   1. Teacher signs in → POST /api/classes/create → gets a 6-char invite_code
--   2. Teacher shares mull.world/join/<code> with students
--   3. Student visits → if signed in, /api/classes/join POSTs membership;
--      otherwise → sign up first, code stashed for after auth
--   4. Class roster + assignments + class-only discussion live keyed on class_id
--
-- Privacy default: student responses to class assignments are visible to
-- teacher + classmates within the class context only. NOT promoted to the
-- /search Original Thinking feed or /u/<handle> public profile unless the
-- student separately opts in via show_archetype/show_diary on their profile.
-- (That separation is enforced by the assignment-submission table in
-- 20260518_class_assignments.sql, not here.)

-- ─── Classes ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS classes (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- The teacher who created the class. CASCADE means deleting the
  -- teacher account removes the class — the simplest model for v1.
  -- If we want to support teacher hand-off later, switch to SET NULL
  -- + a "transferred to ..." flow.
  teacher_user_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Display name visible to students. "Intro to Ethics — Fall 2026"
  name             text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  -- 6-char base36-uppercase code: ABC123. Globally unique.
  -- Sliced from a generated string in the create API; collision retry
  -- handled there.
  invite_code      text NOT NULL UNIQUE CHECK (char_length(invite_code) = 6),
  -- Optional context fields.
  description      text,
  term             text,           -- "Fall 2026", "Spring 2027", etc.
  school_name      text,
  -- Archived classes hide from /classes index but remain readable for
  -- historical retrospectives. Soft-delete pattern.
  is_archived      boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Teacher can read + update + delete their own classes.
DROP POLICY IF EXISTS "Teachers manage own classes" ON classes;
CREATE POLICY "Teachers manage own classes"
  ON classes FOR ALL
  USING (auth.uid() = teacher_user_id)
  WITH CHECK (auth.uid() = teacher_user_id);

-- Students read classes they belong to. Subquery-based RLS — cheap
-- because class_members is small and indexed on user_id below.
DROP POLICY IF EXISTS "Members read their classes" ON classes;
CREATE POLICY "Members read their classes"
  ON classes FOR SELECT
  USING (id IN (
    SELECT class_id FROM class_members WHERE user_id = auth.uid()
  ));

CREATE INDEX IF NOT EXISTS classes_teacher_user_id_idx
  ON classes(teacher_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS classes_invite_code_idx
  ON classes(invite_code);

-- ─── Class members ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS class_members (
  class_id  uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  user_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Role inside the class. For v1: 'student' only (teacher is implicit
  -- via classes.teacher_user_id). 'co_teacher' reserved for v2.
  role      text NOT NULL DEFAULT 'student'
            CHECK (role IN ('student', 'co_teacher')),
  -- Optional pseudonym to display inside the class. Lets teachers run
  -- "blind" classes where responses are anonymous to other students
  -- but still tagged for the teacher's grading.
  pseudonym text,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (class_id, user_id)
);

ALTER TABLE class_members ENABLE ROW LEVEL SECURITY;

-- Members see other members of classes they're in. This drives the
-- class roster view + class-only discussion attribution.
DROP POLICY IF EXISTS "Members read classmate roster" ON class_members;
CREATE POLICY "Members read classmate roster"
  ON class_members FOR SELECT
  USING (class_id IN (
    SELECT class_id FROM class_members WHERE user_id = auth.uid()
  ));

-- Teachers see + manage members of classes they teach.
DROP POLICY IF EXISTS "Teachers manage class roster" ON class_members;
CREATE POLICY "Teachers manage class roster"
  ON class_members FOR ALL
  USING (EXISTS (
    SELECT 1 FROM classes c
     WHERE c.id = class_members.class_id
       AND c.teacher_user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM classes c
     WHERE c.id = class_members.class_id
       AND c.teacher_user_id = auth.uid()
  ));

-- Users can remove themselves (leave the class).
DROP POLICY IF EXISTS "Users leave their own membership" ON class_members;
CREATE POLICY "Users leave their own membership"
  ON class_members FOR DELETE
  USING (user_id = auth.uid());

-- Join uses the SECURITY DEFINER RPC below (which validates the code)
-- rather than a direct insert policy. Without this an attacker who
-- guesses or harvests invite codes could add arbitrary users; routing
-- through the RPC keeps the join atomic + audit-traceable.

CREATE INDEX IF NOT EXISTS class_members_user_id_idx
  ON class_members(user_id);

-- ─── Join RPC ──────────────────────────────────────────────────────
-- SECURITY DEFINER: the function runs with the privileges of the
-- function owner (postgres), bypassing the missing INSERT policy on
-- class_members. The function itself validates that the code is
-- valid + that the caller is signed in + caps the join.

CREATE OR REPLACE FUNCTION class_join_by_code(p_code text)
RETURNS TABLE (class_id uuid, class_name text, already_member boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_class_id uuid;
  v_class_name text;
  v_uid uuid := auth.uid();
  v_existing int;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not signed in' USING ERRCODE = 'insufficient_privilege';
  END IF;

  SELECT c.id, c.name
    INTO v_class_id, v_class_name
    FROM classes c
   WHERE c.invite_code = upper(trim(p_code))
     AND c.is_archived = false;

  IF v_class_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code' USING ERRCODE = 'no_data_found';
  END IF;

  -- Already a member? Return that fact rather than re-inserting.
  SELECT count(*) INTO v_existing
    FROM class_members cm
   WHERE cm.class_id = v_class_id AND cm.user_id = v_uid;

  IF v_existing > 0 THEN
    class_id := v_class_id;
    class_name := v_class_name;
    already_member := true;
    RETURN NEXT;
    RETURN;
  END IF;

  INSERT INTO class_members (class_id, user_id, role)
    VALUES (v_class_id, v_uid, 'student');

  class_id := v_class_id;
  class_name := v_class_name;
  already_member := false;
  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION class_join_by_code(text) TO authenticated;

-- updated_at auto-bump on classes.
CREATE OR REPLACE FUNCTION touch_classes_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS classes_touch_updated_at ON classes;
CREATE TRIGGER classes_touch_updated_at
  BEFORE UPDATE ON classes
  FOR EACH ROW
  EXECUTE FUNCTION touch_classes_updated_at();
