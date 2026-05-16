// /classes/[id]/insights — teacher-only class analytics.
//
// Three sections:
//   1. Archetype distribution — which archetypes the class clusters into
//   2. Class-wide dimensional map — 16-D average + spread bar chart
//   3. Pre/post shift — how the class moved when ≥1 student has 2+
//      quiz attempts (so we have a first/last to compare)
//
// All pulled from each student's quiz attempts via the new
// "Teachers read student quiz attempts" RLS policy from
// 20260519_class_insights_rls.sql. Teachers see aggregates +
// individual student names; students never see this page.

import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import MullWordmark from '@/components/mull-wordmark';
import { DIM_KEYS, DIM_NAMES } from '@/lib/dimensions';

export const metadata: Metadata = {
  title: 'Class insights · Mull',
  robots: { index: false, follow: false },
};

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "'Cormorant Garamond', Georgia, serif";

type Cls = {
  id: string;
  name: string;
  teacher_user_id: string;
};

type Attempt = {
  user_id: string;
  archetype: string;
  alignment_pct: number;
  vector: number[];
  taken_at: string;
};

export default async function ClassInsightsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: classId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/classes/${classId}/insights`);

  const { data: cls } = await supabase
    .from('classes')
    .select('id, name, teacher_user_id')
    .eq('id', classId)
    .maybeSingle<Cls>();
  if (!cls) notFound();

  // Students-only access denied — bounce to class detail (where they
  // can see their own stuff anyway).
  if (cls.teacher_user_id !== user.id) {
    redirect(`/classes/${classId}`);
  }

  // Get all roster student IDs first so we can scope the quiz lookup.
  // RLS would already gate this but we want to know which students
  // never took a quiz, so we need the full roster.
  const { data: roster } = await supabase
    .from('class_members')
    .select('user_id')
    .eq('class_id', cls.id)
    .eq('role', 'student')
    .returns<{ user_id: string }[]>();

  const studentIds = (roster ?? []).map(r => r.user_id);
  const totalStudents = studentIds.length;

  // Pull all quiz attempts for the class roster. Per the new RLS
  // policy, the teacher can SELECT these. Ordered oldest → newest
  // so we can identify first / last per student in JS.
  let allAttempts: Attempt[] = [];
  if (studentIds.length > 0) {
    const { data } = await supabase
      .from('quiz_attempts')
      .select('user_id, archetype, alignment_pct, vector, taken_at')
      .in('user_id', studentIds)
      .order('taken_at', { ascending: true })
      .returns<Attempt[]>();
    allAttempts = data ?? [];
  }

  // Latest attempt per student.
  const latestByStudent = new Map<string, Attempt>();
  // First attempt per student (for pre/post analysis).
  const firstByStudent = new Map<string, Attempt>();
  for (const a of allAttempts) {
    if (!firstByStudent.has(a.user_id)) firstByStudent.set(a.user_id, a);
    latestByStudent.set(a.user_id, a); // overwrites each iteration → last one wins
  }

  const studentsWithQuiz = latestByStudent.size;
  const studentsWithoutQuiz = totalStudents - studentsWithQuiz;

  // ── Section 1: archetype distribution ─────────────────────────────
  const archCounts = new Map<string, number>();
  for (const a of latestByStudent.values()) {
    const k = a.archetype || 'Unknown';
    archCounts.set(k, (archCounts.get(k) ?? 0) + 1);
  }
  const archDistribution = Array.from(archCounts.entries())
    .sort((a, b) => b[1] - a[1]);

  // ── Section 2: class-wide dimensional average ─────────────────────
  // Element-wise mean of each student's latest vector, plus a min/max
  // spread to show class disagreement on each dimension.
  const dimStats: { idx: number; key: string; name: string; mean: number; min: number; max: number; n: number }[] = [];
  if (latestByStudent.size > 0) {
    for (let i = 0; i < 16; i++) {
      let sum = 0, min = Infinity, max = -Infinity, n = 0;
      for (const a of latestByStudent.values()) {
        if (!Array.isArray(a.vector) || a.vector.length !== 16) continue;
        const v = a.vector[i] ?? 0;
        sum += v;
        if (v < min) min = v;
        if (v > max) max = v;
        n++;
      }
      const key = DIM_KEYS[i];
      dimStats.push({
        idx: i,
        key,
        name: DIM_NAMES[key as keyof typeof DIM_NAMES] || key,
        mean: n > 0 ? sum / n : 0,
        min: n > 0 ? min : 0,
        max: n > 0 ? max : 0,
        n,
      });
    }
  }
  // Sort by mean descending so the strongest tendencies surface first.
  const dimStatsSorted = [...dimStats].sort((a, b) => b.mean - a.mean);

  // ── Section 3: pre/post shift ─────────────────────────────────────
  // For each student with ≥2 quiz attempts, compute the per-dim delta
  // (last - first). Average those deltas across the class. Only count
  // students with ≥2 attempts; otherwise there's no "shift" to compute.
  const shiftSums: number[] = new Array(16).fill(0);
  let shiftStudentCount = 0;
  for (const userId of firstByStudent.keys()) {
    const first = firstByStudent.get(userId)!;
    const last = latestByStudent.get(userId)!;
    if (first === last) continue; // only one attempt → no shift
    if (!Array.isArray(first.vector) || !Array.isArray(last.vector)) continue;
    if (first.vector.length !== 16 || last.vector.length !== 16) continue;
    for (let i = 0; i < 16; i++) {
      shiftSums[i] += (last.vector[i] ?? 0) - (first.vector[i] ?? 0);
    }
    shiftStudentCount++;
  }
  const avgShifts = shiftStudentCount > 0
    ? shiftSums.map(s => s / shiftStudentCount)
    : null;

  // Top 5 absolute shifts (largest |delta|) so we surface the
  // dimensions where the class moved the most regardless of direction.
  const topShifts = avgShifts
    ? avgShifts
        .map((d, i) => ({
          idx: i,
          key: DIM_KEYS[i],
          name: DIM_NAMES[DIM_KEYS[i] as keyof typeof DIM_NAMES] || DIM_KEYS[i],
          delta: d,
        }))
        .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
        .slice(0, 5)
    : [];

  return (
    <main className="mx-auto max-w-[820px] px-6 pb-32 pt-10 sm:px-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <MullWordmark />
        <Link href={`/classes/${cls.id}`} style={{
          fontFamily: pixel, fontSize: 11,
          color: '#4A4338', textDecoration: 'none',
          letterSpacing: 0.4, textTransform: 'uppercase',
        }}>
          ◂ {cls.name.toUpperCase()}
        </Link>
      </div>

      <div style={{
        fontFamily: pixel, fontSize: 12,
        color: '#8C6520', textTransform: 'uppercase',
        letterSpacing: '0.18em', marginBottom: 14,
      }}>
        ▸ CLASS INSIGHTS · {cls.name.toUpperCase()}
      </div>

      <h1 style={{
        fontFamily: pixel,
        fontSize: 26,
        margin: '0 0 14px',
        color: '#221E18',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        textShadow: '3px 3px 0 #B8862F',
        lineHeight: 1.1,
      }}>
        WHERE YOUR CLASS SITS
      </h1>

      <p style={{
        fontFamily: serif,
        fontStyle: 'italic',
        fontSize: 16.5,
        color: '#4A4338',
        margin: '0 0 26px',
        lineHeight: 1.55,
      }}>
        Aggregated from each student&rsquo;s latest quiz attempt. Individual
        responses stay private; you see only the class-wide pattern.
        {studentsWithoutQuiz > 0 && (
          <>
            {' '}
            <span style={{ color: '#7A2E2E' }}>
              {studentsWithoutQuiz} of {totalStudents} students haven&rsquo;t
              taken the quiz yet — encourage them to.
            </span>
          </>
        )}
      </p>

      {/* Stat row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12,
        marginBottom: 36,
      }}>
        <StatTile label="Students" value={totalStudents} accent="#221E18" />
        <StatTile label="Took the quiz" value={studentsWithQuiz} accent="#2F5D5C" />
        <StatTile label="Quiz attempts total" value={allAttempts.length} accent="#B8862F" />
        <StatTile label="With pre/post" value={shiftStudentCount} accent="#7A4A2E" />
      </div>

      {studentsWithQuiz === 0 ? (
        <EmptyClass classId={cls.id} />
      ) : (
        <>
          {/* Section 1: archetype distribution */}
          <Section title="▸ ARCHETYPE DISTRIBUTION">
            <p style={subtitleStyle}>
              How your class clusters across the ten archetypes.
            </p>
            <ul style={listStyle}>
              {archDistribution.map(([archetype, count]) => {
                const max = archDistribution[0][1] || 1;
                const pct = Math.round((count / max) * 100);
                return (
                  <li key={archetype} style={rowStyle}>
                    <span style={{
                      flex: '0 0 160px',
                      fontFamily: serif,
                      fontSize: 15,
                      color: '#221E18',
                    }}>
                      {archetype.replace(/^The /, '')}
                    </span>
                    <div style={barTrackStyle}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: '#B8862F',
                      }} />
                    </div>
                    <span style={countStyle}>
                      {count}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Section>

          {/* Section 2: dimensional average */}
          <Section title="▸ CLASS DIMENSIONAL MAP">
            <p style={subtitleStyle}>
              Average position of your class across all 16 dimensions.
              Bar = the mean; the lighter span behind it shows the full
              range from the lowest to the highest student.
            </p>
            <ul style={listStyle}>
              {dimStatsSorted.map(d => {
                const meanPct = Math.max(0, Math.min(100, (d.mean / 10) * 100));
                const minPct = Math.max(0, Math.min(100, (d.min / 10) * 100));
                const maxPct = Math.max(0, Math.min(100, (d.max / 10) * 100));
                return (
                  <li key={d.key} style={rowStyle}>
                    <span style={{
                      flex: '0 0 160px',
                      fontFamily: serif,
                      fontSize: 14,
                      color: '#221E18',
                    }}>
                      {d.name}
                    </span>
                    <div style={{ ...barTrackStyle, position: 'relative' }}>
                      {/* Spread band — min to max */}
                      <div style={{
                        position: 'absolute',
                        left: `${minPct}%`,
                        width: `${Math.max(2, maxPct - minPct)}%`,
                        top: 1,
                        bottom: 1,
                        background: 'rgba(184, 134, 47, 0.25)',
                      }} />
                      {/* Mean marker */}
                      <div style={{
                        position: 'absolute',
                        left: `calc(${meanPct}% - 2px)`,
                        width: 4,
                        top: -2,
                        bottom: -2,
                        background: '#221E18',
                      }} />
                    </div>
                    <span style={countStyle}>
                      {d.mean.toFixed(1)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Section>

          {/* Section 3: pre/post shift */}
          {shiftStudentCount > 0 && avgShifts ? (
            <Section title="▸ HOW THE CLASS HAS SHIFTED">
              <p style={subtitleStyle}>
                Average per-dimension shift between first and latest quiz
                attempts, across the {shiftStudentCount} student{shiftStudentCount === 1 ? '' : 's'} with multiple
                attempts. The top five biggest absolute moves are listed below —
                the dimensions where your class&rsquo;s collective thinking changed
                most over the term.
              </p>
              <ul style={listStyle}>
                {topShifts.map(s => (
                  <li key={s.key} style={rowStyle}>
                    <span style={{
                      flex: '0 0 160px',
                      fontFamily: serif,
                      fontSize: 15,
                      color: '#221E18',
                    }}>
                      {s.name}
                    </span>
                    <span style={{
                      fontFamily: pixel,
                      fontSize: 12,
                      color: s.delta > 0 ? '#2F5D5C' : '#7A2E2E',
                      letterSpacing: 0.4,
                      padding: '4px 10px',
                      background: s.delta > 0 ? '#E5F0EE' : '#F5E0E0',
                      border: `2px solid ${s.delta > 0 ? '#2F5D5C' : '#7A2E2E'}`,
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {s.delta > 0 ? '+' : ''}{s.delta.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          ) : (
            <Section title="▸ PRE/POST SHIFT · NOT YET AVAILABLE">
              <p style={subtitleStyle}>
                None of your students have taken the quiz more than once yet.
                When at least one student takes a second quiz attempt (most
                useful at the end of the term), this section will show
                how the class&rsquo;s thinking has shifted.
              </p>
            </Section>
          )}
        </>
      )}
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2 style={{
        fontFamily: pixel,
        fontSize: 14,
        color: '#221E18',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        marginBottom: 12,
        textShadow: '2px 2px 0 #B8862F',
      }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function StatTile({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div style={{
      padding: '14px 16px',
      background: '#FFFCF4',
      border: '3px solid #221E18',
      boxShadow: `3px 3px 0 0 ${accent}`,
      borderRadius: 0,
    }}>
      <div style={{
        fontFamily: pixel,
        fontSize: 24,
        color: '#221E18',
        lineHeight: 1,
        letterSpacing: 0.4,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: pixel,
        fontSize: 9,
        color: accent,
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        marginTop: 6,
      }}>
        {label.toUpperCase()}
      </div>
    </div>
  );
}

function EmptyClass({ classId }: { classId: string }) {
  return (
    <div style={{
      padding: '24px 22px',
      background: '#FFFCF4',
      border: '3px dashed #8C6520',
      borderRadius: 0,
      textAlign: 'center',
    }}>
      <p style={{
        fontFamily: serif,
        fontStyle: 'italic',
        fontSize: 16,
        color: '#8C6520',
        margin: '0 0 14px',
        lineHeight: 1.55,
      }}>
        No quiz attempts yet from your roster. Once students take the
        quiz, this page surfaces archetype distribution + class-wide
        dimensional position + pre/post shift over the term.
      </p>
      <Link
        href={`/classes/${classId}`}
        className="pixel-press"
        style={{
          display: 'inline-block',
          padding: '10px 16px',
          background: '#221E18',
          color: '#FAF6EC',
          border: '3px solid #221E18',
          boxShadow: '3px 3px 0 0 #B8862F',
          borderRadius: 0,
          fontFamily: pixel,
          fontSize: 11,
          letterSpacing: 0.4,
          textTransform: 'uppercase',
          textDecoration: 'none',
          transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
        }}
      >
        ◂ BACK TO CLASS
      </Link>
    </div>
  );
}

const subtitleStyle: React.CSSProperties = {
  fontFamily: serif,
  fontStyle: 'italic',
  fontSize: 14.5,
  color: '#4A4338',
  margin: '0 0 14px',
  lineHeight: 1.55,
};

const listStyle: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'grid',
  gap: 8,
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '10px 14px',
  background: '#FFFCF4',
  border: '2px solid #221E18',
  borderRadius: 0,
};

const barTrackStyle: React.CSSProperties = {
  flex: 1,
  height: 10,
  background: '#FAF6EC',
  border: '2px solid #221E18',
  position: 'relative',
};

const countStyle: React.CSSProperties = {
  fontFamily: pixel,
  fontSize: 12,
  color: '#8C6520',
  letterSpacing: 0.4,
  fontVariantNumeric: 'tabular-nums',
  flex: '0 0 48px',
  textAlign: 'right',
};
