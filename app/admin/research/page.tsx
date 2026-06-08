// /admin/research — the research console. Everything the maintainer
// (Jimmy) needs to turn Mull's quiz data into a paper, in one place:
//
//   - Consent overview: who opted in, opt-in rate, the corpus size.
//   - Overall archetype distribution (ALL attempts — operational, aggregate).
//   - The consented research corpus (research_quiz_responses):
//       · 16-D dimension means across opted-in vectors
//       · per-question answer distributions for the quick + detailed sets
//       · mode split
//   - A one-click anonymized export (JSON / CSV) for offline analysis.
//
// Gated to ADMIN_USER_IDS. Reads aggregates via the SERVICE-ROLE client
// (bypasses RLS); never surfaces a user_id. The per-question + dimension
// figures are drawn ONLY from research_quiz_responses, which holds rows
// for opted-in users exclusively — so this view is consent-clean by
// construction. The "overall archetype distribution" is the one figure
// computed over all attempts; it's aggregate and non-identifying, and
// answers the maintainer's "how is everyone landing?" question.

import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { isAdminUserId } from '@/lib/admin';
import { DIM_KEYS, DIM_NAMES } from '@/lib/dimensions';
import { QUICK_QUESTIONS } from '@/lib/quiz-questions';
import { DETAILED_QUESTIONS } from '@/lib/quiz-questions-detailed';
import type { Question } from '@/lib/quiz-questions';
import {
  localeRegion,
  REGION_LABELS,
  REGION_LOCALES,
  type LocaleRegion,
} from '@/lib/locale-region';
import {
  DEMOGRAPHIC_FIELDS,
  DEMOGRAPHIC_OPTIONS,
  fieldLabelKey,
  optionLabelKey,
  type DemographicField,
} from '@/lib/demographics';
import { t } from '@/lib/translations';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Research · Admin · Mull',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const serif = 'var(--font-prose)';
const pixel = "var(--font-pixel-display, 'Courier New', monospace)";

// One element of a stored answer trail (research_quiz_responses.answers).
type AnswerEl =
  | { q: number; kind: 'single'; a: number }
  | { q: number; kind: 'multi'; indices: number[] }
  | { q: number; kind: 'skip' };

// Per-question aggregate.
type QStat = { counts: number[]; skip: number; responders: number };

type ResearchRow = {
  mode: string | null;
  answers: unknown;
  archetype: string | null;
  vector: unknown;
  locale: string | null;
};

// Aggregate figures for one language-region bucket (Western/Eastern/Unknown).
type RegionAgg = {
  region: LocaleRegion;
  label: string;
  total: number;
  quick: number;
  detailed: number;
  dimMeans: number[];
  dimN: number;
  arch: [string, number][];
};

// ── Optional self-reported demographics (research_demographics) ─────
// One row per opted-in user who shared anything; every field nullable.
type DemoRow = Partial<Record<DemographicField, string | null>>;
type DemoDist = { code: string; label: string; count: number };
type DemoFieldAgg = {
  field: DemographicField;
  label: string;
  answered: number; // rows with a non-null value (incl. prefer_not_to_say)
  notShared: number; // rows left blank for this field
  dist: DemoDist[]; // canonical-order distribution across the field's options
};
type DemographicsAgg = { total: number; coverage: number; fields: DemoFieldAgg[] };

// Tally the consented demographics rows into a per-field distribution. English
// labels via the demo.* i18n keys; aggregate counts only, never a user_id.
// `notShared` (NULL) is kept distinct from a 'prefer_not_to_say' answer.
function aggregateDemographics(rows: DemoRow[], optIn: number): DemographicsAgg {
  const fields: DemoFieldAgg[] = DEMOGRAPHIC_FIELDS.map((field) => {
    const counts: Record<string, number> = {};
    let answered = 0;
    let notShared = 0;
    for (const row of rows) {
      const v = row[field];
      if (v == null || v === '') {
        notShared++;
        continue;
      }
      answered++;
      counts[v] = (counts[v] || 0) + 1;
    }
    const dist: DemoDist[] = DEMOGRAPHIC_OPTIONS[field].map((code) => ({
      code,
      label: t(optionLabelKey(code), 'en'),
      count: counts[code] || 0,
    }));
    return { field, label: t(fieldLabelKey(field), 'en'), answered, notShared, dist };
  });
  const total = rows.length;
  const coverage = optIn > 0 ? Math.round((total / optIn) * 100) : 0;
  return { total, coverage, fields };
}

// Roll a slice of research rows up into the aggregate figures the region
// comparison renders. Mirrors the overall-corpus math, scoped to a bucket.
function aggregateRows(rows: ResearchRow[]): Omit<RegionAgg, 'region' | 'label'> {
  let quick = 0;
  let detailed = 0;
  const dimSums = new Array(16).fill(0);
  let dimN = 0;
  const archCounts: Record<string, number> = {};
  for (const row of rows) {
    if (row.mode === 'quick') quick++;
    else if (row.mode === 'detailed') detailed++;
    if (Array.isArray(row.vector) && row.vector.length === 16) {
      for (let i = 0; i < 16; i++) dimSums[i] += Number(row.vector[i]) || 0;
      dimN++;
    }
    const k = (row.archetype || 'unknown').toLowerCase();
    archCounts[k] = (archCounts[k] || 0) + 1;
  }
  const dimMeans = dimSums.map((s) => (dimN > 0 ? s / dimN : 0));
  const arch = Object.entries(archCounts).sort((a, b) => b[1] - a[1]);
  return { total: rows.length, quick, detailed, dimMeans, dimN, arch };
}

function buildQStats(trails: unknown[], questionCount: number): QStat[] {
  const stats: QStat[] = Array.from({ length: questionCount }, () => ({
    counts: [],
    skip: 0,
    responders: 0,
  }));
  for (const trail of trails) {
    if (!Array.isArray(trail)) continue;
    for (const raw of trail) {
      const el = raw as AnswerEl;
      const q = el?.q;
      if (typeof q !== 'number' || q < 0 || q >= questionCount) continue;
      const s = stats[q];
      s.responders++;
      if (el.kind === 'single' && typeof el.a === 'number') {
        s.counts[el.a] = (s.counts[el.a] || 0) + 1;
      } else if (el.kind === 'multi' && Array.isArray(el.indices)) {
        for (const i of el.indices) s.counts[i] = (s.counts[i] || 0) + 1;
      } else if (el.kind === 'skip') {
        s.skip++;
      }
    }
  }
  return stats;
}

async function loadResearch() {
  const admin = createAdminClient();

  const [
    usersRes,
    consentRows,
    attemptsArch,
    attemptsTotal,
    researchRows,
    researchTotal,
    demoRowsRes,
  ] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin.from('research_consent').select('consent').limit(5000),
    admin.from('quiz_attempts').select('archetype').limit(20000),
    admin.from('quiz_attempts').select('*', { count: 'exact', head: true }),
    admin
      .from('research_quiz_responses')
      .select('mode, answers, archetype, vector, locale')
      .limit(20000),
    admin
      .from('research_quiz_responses')
      .select('*', { count: 'exact', head: true }),
    admin
      .from('research_demographics')
      .select(DEMOGRAPHIC_FIELDS.join(', '))
      .limit(20000),
  ]);

  // ── Consent overview ──────────────────────────────────────────────
  let optIn = 0;
  let optOut = 0;
  for (const r of (consentRows.data as { consent: string }[] | null) || []) {
    if (r.consent === 'yes') optIn++;
    else if (r.consent === 'no') optOut++;
  }
  const decided = optIn + optOut;
  const totalUsers = usersRes.data?.users?.length ?? 0;
  const undecided = Math.max(0, totalUsers - decided);
  const optInRate = decided > 0 ? Math.round((optIn / decided) * 100) : 0;

  // ── Overall archetype distribution (all attempts) ─────────────────
  const archCounts: Record<string, number> = {};
  for (const row of (attemptsArch.data as { archetype: string }[] | null) || []) {
    const k = (row.archetype || 'unknown').toLowerCase();
    archCounts[k] = (archCounts[k] || 0) + 1;
  }
  const overallArch = Object.entries(archCounts).sort((a, b) => b[1] - a[1]);

  // ── Consented research corpus ─────────────────────────────────────
  const rows = (researchRows.data as ResearchRow[] | null) || [];
  const quickTrails: unknown[] = [];
  const detailedTrails: unknown[] = [];
  const dimSums = new Array(16).fill(0);
  let dimN = 0;
  for (const row of rows) {
    if (row.mode === 'quick') quickTrails.push(row.answers);
    else if (row.mode === 'detailed') detailedTrails.push(row.answers);
    if (Array.isArray(row.vector) && row.vector.length === 16) {
      for (let i = 0; i < 16; i++) dimSums[i] += Number(row.vector[i]) || 0;
      dimN++;
    }
  }
  const dimMeans = dimSums.map((s) => (dimN > 0 ? s / dimN : 0));

  // ── Language-region split (Western / Eastern / Unknown) ───────────
  // Bucket the consented corpus by the UI language captured on each row,
  // then aggregate each bucket. `locale` is NULL on rows captured before
  // the 20260602_research_locale migration — those land in "Unknown".
  const buckets: Record<LocaleRegion, ResearchRow[]> = {
    western: [],
    eastern: [],
    unknown: [],
  };
  for (const row of rows) buckets[localeRegion(row.locale)].push(row);
  const regionOrder: LocaleRegion[] = ['western', 'eastern', 'unknown'];
  const regions: RegionAgg[] = regionOrder.map((region) => ({
    region,
    label: REGION_LABELS[region],
    ...aggregateRows(buckets[region]),
  }));

  // ── Optional demographics (opted-in users who shared general info) ─
  const demoRows = (demoRowsRes.data as DemoRow[] | null) || [];
  const demographics = aggregateDemographics(demoRows, optIn);

  return {
    consent: { optIn, optOut, undecided, decided, totalUsers, optInRate },
    regions,
    demographics,
    corpus: {
      total: researchTotal.count ?? rows.length,
      quick: quickTrails.length,
      detailed: detailedTrails.length,
    },
    attemptsTotal: attemptsTotal.count ?? 0,
    overallArch,
    dimMeans,
    dimN,
    quickStats: buildQStats(quickTrails, QUICK_QUESTIONS.length),
    detailedStats: buildQStats(detailedTrails, DETAILED_QUESTIONS.length),
    fetchedAt: new Date().toISOString(),
  };
}

export default async function ResearchAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/admin/research');
  if (!isAdminUserId(user.id)) redirect('/account');

  const d = await loadResearch();

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px 120px' }}>
      <header style={{ marginBottom: 28 }}>
        <div
          style={{
            fontFamily: pixel,
            fontSize: 11,
            color: 'var(--color-acc-deep)',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            marginBottom: 8,
          }}
        >
          ▸ ADMIN · RESEARCH
        </div>
        <h1
          style={{
            fontFamily: pixel,
            fontSize: 28,
            margin: 0,
            color: 'var(--color-ink)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            textShadow: '3px 3px 0 var(--color-acc)',
          }}
        >
          RESEARCH CONSOLE
        </h1>
        <p
          style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 15,
            color: 'var(--color-ink-soft)',
            margin: '12px 0 0',
            maxWidth: 640,
            lineHeight: 1.55,
          }}
        >
          The consented research corpus — per-question answer distributions,
          dimension means, and the opt-in dataset behind any paper. Per-question
          and dimension figures are drawn only from users who opted in; the
          overall archetype distribution is aggregate across all attempts.
        </p>
        <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <ExportLink href="/api/admin/research/export?format=json" label="▼ EXPORT JSON" />
          <ExportLink href="/api/admin/research/export?format=csv" label="▼ EXPORT CSV" />
          <ExportLink href="/admin" label="← LAUNCH DASHBOARD" muted />
        </div>
      </header>

      {/* ── Consent overview ─────────────────────────────────────── */}
      <section style={cardStyle('#2F5D5C')}>
        <h2 style={sectionTitle}>▸ RESEARCH CONSENT</h2>
        <p style={sectionSub}>
          Opt-in is explicit and reversible. Undecided = signed-in users who
          haven&rsquo;t answered the consent gate yet.
        </p>
        <div
          style={{
            marginTop: 16,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 12,
          }}
        >
          <BigStat label="Opted in" value={d.consent.optIn} accent="#2F5D5C" />
          <BigStat label="Opted out" value={d.consent.optOut} accent="#7A2E2E" />
          <BigStat label="Undecided" value={d.consent.undecided} accent="#8C6520" />
          <BigStat label="Opt-in rate" value={`${d.consent.optInRate}%`} accent="#B8862F" />
        </div>
      </section>

      {/* ── Corpus size ──────────────────────────────────────────── */}
      <section style={cardStyle('var(--color-acc)')}>
        <h2 style={sectionTitle}>▸ RESEARCH CORPUS</h2>
        <p style={sectionSub}>
          Consented quiz completions captured with their full per-question
          trail. This is the dataset the distributions below are computed from.
        </p>
        <div
          style={{
            marginTop: 16,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 12,
          }}
        >
          <BigStat label="Total responses" value={d.corpus.total} accent="#B8862F" />
          <BigStat label="Quick (20Q)" value={d.corpus.quick} accent="#7A4A2E" />
          <BigStat label="Detailed (50Q)" value={d.corpus.detailed} accent="#5A3A6A" />
          <BigStat label="All attempts" value={d.attemptsTotal} accent="#4A4338" />
        </div>
        {d.corpus.total === 0 && (
          <p
            style={{
              fontFamily: serif,
              fontStyle: 'italic',
              color: 'var(--color-acc-deep)',
              margin: '16px 0 0',
              fontSize: 14,
            }}
          >
            No consented responses captured yet. Once opted-in users complete the
            quiz, their per-question answers appear here. (Capture began with the
            20260601_research migration — it&rsquo;s forward-looking from opt-in.)
          </p>
        )}
      </section>

      {/* ── Optional demographics (opt-in self-reports) ──────────── */}
      <DemographicsBreakdown data={d.demographics} />

      {/* ── By language region (Western / Eastern / Unknown) ─────── */}
      <section style={cardStyle('#3A5A6A')}>
        <h2 style={sectionTitle}>▸ BY LANGUAGE REGION</h2>
        <p style={sectionSub}>
          The consented corpus split by UI language at capture time.{' '}
          <strong>Western</strong> = {REGION_LOCALES.western.join(' · ')}.{' '}
          <strong>Eastern</strong> = {REGION_LOCALES.eastern.join(' · ')}.{' '}
          <strong>Unknown</strong> = captured before language tracking (not
          backfilled). A coarse cut on interface language — not a claim about
          who anyone is.
        </p>
        <div
          style={{
            marginTop: 16,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 14,
          }}
        >
          {d.regions.map((r) => (
            <RegionCard key={r.region} region={r} />
          ))}
        </div>
      </section>

      {/* ── Dimension means: Western vs Eastern ──────────────────── */}
      <RegionDimCompare regions={d.regions} />

      {/* ── Overall archetype distribution (all attempts) ────────── */}
      {d.overallArch.length > 0 && (
        <section style={cardStyle('#7A4A2E')}>
          <h2 style={sectionTitle}>▸ OVERALL ARCHETYPE DISTRIBUTION</h2>
          <p style={sectionSub}>
            How every quiz taker lands across the ten archetypes (all attempts,
            aggregate). {d.attemptsTotal.toLocaleString()} total.
          </p>
          <div style={{ marginTop: 18 }}>
            {d.overallArch.map(([key, count]) => {
              const max = d.overallArch[0][1] || 1;
              const total = d.overallArch.reduce((s, [, c]) => s + c, 0) || 1;
              const pct = Math.round((count / total) * 100);
              const barPct = Math.round((count / max) * 100);
              return (
                <DistRow
                  key={key}
                  label={key}
                  barPct={barPct}
                  right={`${count} · ${pct}%`}
                  color="#7A4A2E"
                  capitalize
                />
              );
            })}
          </div>
        </section>
      )}

      {/* ── 16-D dimension means (consented) ─────────────────────── */}
      <section style={cardStyle('#5A3A6A')}>
        <h2 style={sectionTitle}>▸ DIMENSION MEANS</h2>
        <p style={sectionSub}>
          Average position on each of the 16 dimensions across{' '}
          {d.dimN.toLocaleString()} consented vectors. Signed — teal leans
          positive, brick leans negative.
        </p>
        {d.dimN === 0 ? (
          <p
            style={{
              fontFamily: serif,
              fontStyle: 'italic',
              color: 'var(--color-acc-deep)',
              margin: '16px 0 0',
              fontSize: 14,
            }}
          >
            No consented vectors yet.
          </p>
        ) : (
          <div style={{ marginTop: 18 }}>
            {(() => {
              const maxAbs = Math.max(...d.dimMeans.map((m) => Math.abs(m)), 0.01);
              return DIM_KEYS.map((k, i) => {
                const mean = d.dimMeans[i];
                const barPct = Math.round((Math.abs(mean) / maxAbs) * 100);
                const positive = mean >= 0;
                return (
                  <div
                    key={k}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '170px 1fr 64px',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontFamily: serif, fontSize: 14, color: 'var(--color-ink)' }}>
                      <strong>{k}</strong>{' '}
                      <span style={{ color: 'var(--color-acc-deep)', fontSize: 12.5 }}>
                        {DIM_NAMES[k]}
                      </span>
                    </span>
                    <div
                      style={{
                        height: 10,
                        background: 'var(--color-cream)',
                        border: '2px solid var(--color-ink)',
                      }}
                    >
                      <div
                        style={{
                          width: `${barPct}%`,
                          height: '100%',
                          background: positive ? '#2F5D5C' : '#7A2E2E',
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontFamily: pixel,
                        fontSize: 12,
                        color: 'var(--color-ink)',
                        textAlign: 'right',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {mean >= 0 ? '+' : ''}
                      {mean.toFixed(2)}
                    </span>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </section>

      {/* ── Per-question distributions: QUICK ────────────────────── */}
      <QuestionSet
        title="PER-QUESTION · QUICK SET"
        subtitle={`What opted-in takers picked, question by question (${d.corpus.quick} responses).`}
        questions={QUICK_QUESTIONS}
        stats={d.quickStats}
        empty={d.corpus.quick === 0}
        open
      />

      {/* ── Per-question distributions: DETAILED (collapsed) ─────── */}
      <QuestionSet
        title="PER-QUESTION · DETAILED SET"
        subtitle={`The 50-question deep version (${d.corpus.detailed} responses). Click to expand.`}
        questions={DETAILED_QUESTIONS}
        stats={d.detailedStats}
        empty={d.corpus.detailed === 0}
        open={false}
      />

      <p
        style={{
          fontFamily: pixel,
          fontSize: 10,
          color: 'var(--color-acc-deep)',
          letterSpacing: 0.4,
          textTransform: 'uppercase',
          marginTop: 28,
        }}
      >
        ▸ FETCHED {new Date(d.fetchedAt).toLocaleString('en-GB')} · AGGREGATES
        ONLY · NO USER IDS
      </p>
    </main>
  );
}

// ── Per-question section, wrapped in a native <details> so the long
//    detailed set can stay folded. ───────────────────────────────────
function QuestionSet({
  title,
  subtitle,
  questions,
  stats,
  empty,
  open,
}: {
  title: string;
  subtitle: string;
  questions: Question[];
  stats: QStat[];
  empty: boolean;
  open: boolean;
}) {
  return (
    <section style={cardStyle('#2F5D5C')}>
      <details open={open}>
        <summary
          style={{
            cursor: 'pointer',
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <span style={{ ...sectionTitle, margin: 0 }}>▸ {title}</span>
          <span style={sectionSub}>{subtitle}</span>
        </summary>
        {empty ? (
          <p
            style={{
              fontFamily: serif,
              fontStyle: 'italic',
              color: 'var(--color-acc-deep)',
              margin: '16px 0 0',
              fontSize: 14,
            }}
          >
            No consented responses for this set yet.
          </p>
        ) : (
          <div style={{ marginTop: 20 }}>
            {questions.map((q, qi) => (
              <QuestionDistribution key={qi} index={qi} question={q} stat={stats[qi]} />
            ))}
          </div>
        )}
      </details>
    </section>
  );
}

function QuestionDistribution({
  index,
  question,
  stat,
}: {
  index: number;
  question: Question;
  stat: QStat | undefined;
}) {
  const responders = stat?.responders ?? 0;
  const isMulti = !!question.multi;
  return (
    <div
      style={{
        padding: '14px 0 16px',
        borderBottom: '2px dashed var(--color-line)',
      }}
    >
      <div
        style={{
          fontFamily: pixel,
          fontSize: 10,
          color: 'var(--color-acc-deep)',
          letterSpacing: 0.4,
          textTransform: 'uppercase',
          marginBottom: 6,
        }}
      >
        Q{String(index + 1).padStart(2, '0')}
        {isMulti ? ` · MULTI (≤${question.multi?.max})` : ''} · {responders} answered
        {stat && stat.skip > 0 ? ` · ${stat.skip} skipped` : ''}
      </div>
      <p
        style={{
          fontFamily: serif,
          fontSize: 15.5,
          color: 'var(--color-ink)',
          margin: '0 0 10px',
          lineHeight: 1.4,
        }}
      >
        {question.p}
      </p>
      <div>
        {question.a.map((ans, ai) => {
          const count = stat?.counts[ai] ?? 0;
          const pct = responders > 0 ? Math.round((count / responders) * 100) : 0;
          return (
            <DistRow
              key={ai}
              label={ans.t}
              barPct={pct}
              right={`${count} · ${pct}%`}
              color="#2F5D5C"
            />
          );
        })}
      </div>
    </div>
  );
}

// A single labeled bar row. Used by both the archetype distribution and
// the per-answer breakdowns.
function DistRow({
  label,
  barPct,
  right,
  color,
  capitalize,
}: {
  label: string;
  barPct: number;
  right: string;
  color: string;
  capitalize?: boolean;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 90px',
        alignItems: 'center',
        gap: 12,
        marginBottom: 7,
      }}
    >
      <div>
        <div
          style={{
            fontFamily: serif,
            fontSize: 14,
            color: 'var(--color-ink)',
            marginBottom: 3,
            textTransform: capitalize ? 'capitalize' : 'none',
            lineHeight: 1.35,
          }}
        >
          {label}
        </div>
        <div
          style={{
            height: 8,
            background: 'var(--color-cream)',
            border: '2px solid var(--color-ink)',
          }}
        >
          <div
            style={{
              width: `${Math.min(100, barPct)}%`,
              height: '100%',
              background: color,
            }}
          />
        </div>
      </div>
      <span
        style={{
          fontFamily: pixel,
          fontSize: 11.5,
          color: 'var(--color-acc-deep)',
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: 0.3,
        }}
      >
        {right}
      </span>
    </div>
  );
}

function BigStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div
      style={{
        padding: '14px 16px',
        background: '#FFFCF4',
        border: '3px solid var(--color-ink)',
        boxShadow: `3px 3px 0 0 ${accent}`,
      }}
    >
      <div
        style={{
          fontFamily: pixel,
          fontSize: 10,
          color: accent,
          textTransform: 'uppercase',
          letterSpacing: '0.16em',
          marginBottom: 8,
        }}
      >
        ▸ {label}
      </div>
      <div
        style={{
          fontFamily: pixel,
          fontSize: 28,
          color: 'var(--color-ink)',
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
    </div>
  );
}

// Accent color per region — teal (Western), plum (Eastern), gold (Unknown).
function regionAccent(region: LocaleRegion): string {
  if (region === 'western') return '#2F5D5C';
  if (region === 'eastern') return '#7A2E5A';
  return 'var(--color-acc-deep)';
}

// One summary card per language region: total responses, the quick/detailed
// split, and the region's top archetypes.
function RegionCard({ region }: { region: RegionAgg }) {
  const accent = regionAccent(region.region);
  const locales =
    region.region === 'unknown'
      ? null
      : REGION_LOCALES[region.region];
  const top = region.arch.slice(0, 3);
  return (
    <div
      style={{
        padding: '16px 18px',
        background: '#FFFCF4',
        border: '3px solid var(--color-ink)',
        boxShadow: `3px 3px 0 0 ${accent}`,
      }}
    >
      <div
        style={{
          fontFamily: pixel,
          fontSize: 11,
          color: accent,
          textTransform: 'uppercase',
          letterSpacing: '0.16em',
          marginBottom: 4,
        }}
      >
        ▸ {region.label}
      </div>
      <div
        style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 12,
          color: 'var(--color-acc-deep)',
          marginBottom: 12,
        }}
      >
        {locales ? locales.join(' · ') : 'pre-tracking · no locale'}
      </div>
      <div
        style={{
          fontFamily: pixel,
          fontSize: 30,
          color: 'var(--color-ink)',
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {region.total.toLocaleString()}
      </div>
      <div style={{ fontFamily: serif, fontSize: 13, color: 'var(--color-ink-soft)', marginTop: 6 }}>
        {region.quick.toLocaleString()} quick · {region.detailed.toLocaleString()} detailed
      </div>
      {top.length > 0 ? (
        <div style={{ marginTop: 12, borderTop: '2px dashed var(--color-line)', paddingTop: 10 }}>
          <div
            style={{
              fontFamily: pixel,
              fontSize: 9,
              color: 'var(--color-acc-deep)',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              marginBottom: 6,
            }}
          >
            Top archetypes
          </div>
          {top.map(([k, c]) => {
            const pct = region.total > 0 ? Math.round((c / region.total) * 100) : 0;
            return (
              <div
                key={k}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: serif,
                  fontSize: 13,
                  color: 'var(--color-ink)',
                  textTransform: 'capitalize',
                  marginBottom: 3,
                }}
              >
                <span>{k}</span>
                <span style={{ color: 'var(--color-acc-deep)', fontVariantNumeric: 'tabular-nums' }}>
                  {c} · {pct}%
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            marginTop: 12,
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 13,
            color: 'var(--color-acc-deep)',
          }}
        >
          No responses yet.
        </div>
      )}
    </div>
  );
}

// A single signed mini-bar (one region's mean on one dimension), tagged
// W/E. Positive leans teal, negative leans brick — same convention as the
// overall dimension-means panel.
function MiniSignedBar({
  tag,
  mean,
  maxAbs,
  na,
}: {
  tag: string;
  mean: number;
  maxAbs: number;
  na: boolean;
}) {
  const barPct = na ? 0 : Math.round((Math.abs(mean) / maxAbs) * 100);
  const positive = mean >= 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          fontFamily: pixel,
          fontSize: 9,
          color: 'var(--color-acc-deep)',
          width: 12,
          flexShrink: 0,
        }}
      >
        {tag}
      </span>
      <div
        style={{
          flex: 1,
          height: 9,
          background: 'var(--color-cream)',
          border: '2px solid var(--color-ink)',
        }}
      >
        <div
          style={{
            width: `${barPct}%`,
            height: '100%',
            background: positive ? '#2F5D5C' : '#7A2E2E',
          }}
        />
      </div>
      <span
        style={{
          fontFamily: pixel,
          fontSize: 11,
          color: na ? '#B8AE96' : 'var(--color-ink)',
          width: 46,
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
          flexShrink: 0,
        }}
      >
        {na ? '—' : `${mean >= 0 ? '+' : ''}${mean.toFixed(2)}`}
      </span>
    </div>
  );
}

// Western-vs-Eastern dimension-means comparison: for each of the 16
// dimensions, the two regions' mean positions side by side on a shared
// scale. The single most research-relevant cross-cultural readout.
function RegionDimCompare({ regions }: { regions: RegionAgg[] }) {
  const western = regions.find((r) => r.region === 'western');
  const eastern = regions.find((r) => r.region === 'eastern');
  const wN = western?.dimN ?? 0;
  const eN = eastern?.dimN ?? 0;

  const maxAbs = Math.max(
    ...(western?.dimMeans ?? []).map((m) => Math.abs(m)),
    ...(eastern?.dimMeans ?? []).map((m) => Math.abs(m)),
    0.01,
  );

  return (
    <section style={cardStyle('#7A2E5A')}>
      <h2 style={sectionTitle}>▸ DIMENSION MEANS · WESTERN vs EASTERN</h2>
      <p style={sectionSub}>
        Average position on each dimension, Western (W, {wN.toLocaleString()}{' '}
        vectors) beside Eastern (E, {eN.toLocaleString()} vectors). Shared
        scale; teal leans positive, brick negative. A dash means no vectors in
        that region yet.
      </p>
      {wN === 0 && eN === 0 ? (
        <p
          style={{
            fontFamily: serif,
            fontStyle: 'italic',
            color: 'var(--color-acc-deep)',
            margin: '16px 0 0',
            fontSize: 14,
          }}
        >
          No consented vectors in either region yet. Once opted-in users quiz
          with a Western- or Eastern-language UI, the comparison fills in here.
        </p>
      ) : (
        <div style={{ marginTop: 18 }}>
          {DIM_KEYS.map((k, i) => (
            <div
              key={k}
              style={{
                display: 'grid',
                gridTemplateColumns: '160px 1fr 1fr',
                alignItems: 'center',
                gap: 14,
                marginBottom: 10,
              }}
            >
              <span style={{ fontFamily: serif, fontSize: 13.5, color: 'var(--color-ink)' }}>
                <strong>{k}</strong>{' '}
                <span style={{ color: 'var(--color-acc-deep)', fontSize: 12 }}>{DIM_NAMES[k]}</span>
              </span>
              <MiniSignedBar
                tag="W"
                mean={western?.dimMeans[i] ?? 0}
                maxAbs={maxAbs}
                na={wN === 0}
              />
              <MiniSignedBar
                tag="E"
                mean={eastern?.dimMeans[i] ?? 0}
                maxAbs={maxAbs}
                na={eN === 0}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// Per-field accent so each demographic band reads as its own group.
const DEMO_FIELD_ACCENT: Record<DemographicField, string> = {
  age_range: '#2F5D5C',
  gender: '#7A2E5A',
  cultural_group: '#7A4A2E',
  education: '#5A3A6A',
  religion: 'var(--color-acc)',
};

// Optional self-reported demographics, aggregate only. One band per field
// (age / gender / cultural background / education / religion), each a
// canonical-order distribution. "Not shared" (blank) is kept distinct from
// "Prefer not to say" (an explicit decline counted as an answer).
function DemographicsBreakdown({ data }: { data: DemographicsAgg }) {
  return (
    <section style={cardStyle('#5A3A6A')}>
      <h2 style={sectionTitle}>▸ DEMOGRAPHICS</h2>
      <p style={sectionSub}>
        Optional self-reports from opted-in users.{' '}
        {data.total.toLocaleString()} shared at least one field
        {data.coverage > 0 ? ` (${data.coverage}% of opted-in users)` : ''}. Bars
        show shares among those who answered each field.{' '}
        <strong>Not shared</strong> = left blank; <strong>Prefer not to say</strong>{' '}
        is an explicit decline, counted as an answer.
      </p>
      {data.total === 0 ? (
        <p
          style={{
            fontFamily: serif,
            fontStyle: 'italic',
            color: 'var(--color-acc-deep)',
            margin: '16px 0 0',
            fontSize: 14,
          }}
        >
          No demographics shared yet. Once opted-in users fill in the optional
          “general info” step, the breakdown appears here.
        </p>
      ) : (
        <div style={{ marginTop: 14 }}>
          {data.fields.map((f) => (
            <DemoFieldBlock key={f.field} field={f} />
          ))}
        </div>
      )}
    </section>
  );
}

function DemoFieldBlock({ field }: { field: DemoFieldAgg }) {
  const accent = DEMO_FIELD_ACCENT[field.field];
  return (
    <div style={{ padding: '12px 0 14px', borderBottom: '2px dashed var(--color-line)' }}>
      <div
        style={{
          fontFamily: pixel,
          fontSize: 10,
          color: 'var(--color-acc-deep)',
          letterSpacing: 0.4,
          textTransform: 'uppercase',
          marginBottom: 10,
        }}
      >
        {field.label} · {field.answered} answered
        {field.notShared > 0 ? ` · ${field.notShared} not shared` : ''}
      </div>
      {field.answered === 0 ? (
        <div
          style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 13.5,
            color: 'var(--color-acc-deep)',
          }}
        >
          No answers yet.
        </div>
      ) : (
        field.dist.map((entry) => {
          const pct =
            field.answered > 0
              ? Math.round((entry.count / field.answered) * 100)
              : 0;
          return (
            <DistRow
              key={entry.code}
              label={entry.label}
              barPct={pct}
              right={`${entry.count} · ${pct}%`}
              color={accent}
            />
          );
        })
      )}
    </div>
  );
}

function ExportLink({
  href,
  label,
  muted,
}: {
  href: string;
  label: string;
  muted?: boolean;
}) {
  return (
    <a
      href={href}
      style={{
        display: 'inline-block',
        padding: '8px 14px',
        background: muted ? 'transparent' : 'var(--color-ink)',
        color: muted ? 'var(--color-acc-deep)' : 'var(--color-acc-soft)',
        border: `2px solid ${muted ? 'var(--color-acc-deep)' : 'var(--color-ink)'}`,
        boxShadow: muted ? 'none' : '3px 3px 0 0 var(--color-acc)',
        fontFamily: pixel,
        fontSize: 11,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        textDecoration: 'none',
      }}
    >
      {label}
    </a>
  );
}

function cardStyle(accent: string): React.CSSProperties {
  return {
    padding: '24px 26px',
    background: '#FFFCF4',
    border: '4px solid var(--color-ink)',
    boxShadow: `4px 4px 0 0 ${accent}`,
    borderRadius: 0,
    marginBottom: 24,
  };
}

const sectionTitle: React.CSSProperties = {
  fontFamily: pixel,
  fontSize: 16,
  color: 'var(--color-ink)',
  margin: '0 0 6px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
};

const sectionSub: React.CSSProperties = {
  fontFamily: serif,
  fontStyle: 'italic',
  fontSize: 14,
  color: 'var(--color-ink-soft)',
  margin: 0,
};
