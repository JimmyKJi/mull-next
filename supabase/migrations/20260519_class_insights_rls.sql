-- Class insights — teacher read access to student data.
--
-- The /classes/[id]/insights page aggregates each student's latest
-- quiz attempt into a class-wide map + pre/post comparison. Without
-- new policies, the existing "users see own" RLS on quiz_attempts
-- would return nothing for the teacher.
--
-- We grant teachers SELECT on quiz_attempts whose owner is a member
-- of one of their classes. Two-hop check via class_members → classes
-- → teacher_user_id. Cheap because class_members is indexed on
-- user_id and the set per teacher is small.
--
-- We deliberately do NOT grant teachers SELECT on dilemma_responses
-- / diary_entries / exercise_reflections in their students' private
-- trajectory. Those are personal entries. Class work happens via
-- class_assignment_submissions which the teacher already sees by
-- being the class owner. This separation is the privacy contract
-- with students: "your teacher sees your assignments, not your diary."

DROP POLICY IF EXISTS "Teachers read student quiz attempts" ON quiz_attempts;
CREATE POLICY "Teachers read student quiz attempts"
  ON quiz_attempts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM class_members cm
      JOIN classes c ON c.id = cm.class_id
     WHERE cm.user_id = quiz_attempts.user_id
       AND c.teacher_user_id = auth.uid()
  ));
