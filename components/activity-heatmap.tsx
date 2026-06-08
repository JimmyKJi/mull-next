// ActivityHeatmap — GitHub-style 7x52 grid showing user activity
// across the last 52 weeks. Each cell is one day, colored by the
// number of events on that day (dilemma + diary + exercise + quiz).
//
// Server-component-safe (no client JS). Pure visualization of
// timestamps the parent already loads. Mobile: horizontal scroll.
//
// Retention design intent (RETENTION-NOTES.md §11): pixel-styled,
// cheap data, fun visual. A returning user lands on /account and
// sees their effort over time — the kind of thing that makes
// "logged in three times this month" feel like something instead
// of nothing.

import { ARCHETYPE_COLORS } from "@/lib/archetype-colors";
import { type Locale } from "@/lib/translations";

type Props = {
  /** All event timestamps, in any order. Only the date portion
   *  (UTC) is used to bucket; time-of-day is discarded. */
  timestamps: number[];
  /** End date for the grid. Defaults to today. The grid shows the
   *  preceding 52 weeks ending on the week containing this date. */
  endDate?: Date;
  /** Optional accent color for filled cells. Defaults to amber. */
  accent?: { primary: string; deep: string; soft: string };
  /** Display locale. Pluralized English copy ("entry"/"entries") maps
   *  poorly to t() keys, so zh is rendered inline. Defaults 'en'. */
  locale?: Locale;
};

const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", ""];
const DAY_LABELS_ZH = ["周一", "", "周三", "", "周五", "", ""];
const WEEKS = 52;
const CELL = 12; // px
const GAP = 3;   // px

export function ActivityHeatmap({
  timestamps,
  endDate = new Date(),
  accent = ARCHETYPE_COLORS.hearth, // warm amber default
  locale = "en",
}: Props) {
  const isZh = locale === "zh";
  const dayLabels = isZh ? DAY_LABELS_ZH : DAY_LABELS;
  // Bucket timestamps by ISO date (YYYY-MM-DD, UTC). Counts duplicates.
  const counts = new Map<string, number>();
  for (const ts of timestamps) {
    const d = new Date(ts);
    const key = d.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  // Build a 52-week × 7-day grid ending on the Sunday of endDate's week.
  // GitHub uses Sun-Sat columns; we use Mon-Sun rows for readability.
  // Compute the most-recent Monday so each column is a Mon-Sun week.
  const end = new Date(endDate);
  end.setUTCHours(0, 0, 0, 0);
  // Roll back to the Monday of the current week.
  const dow = (end.getUTCDay() + 6) % 7; // 0=Mon, 6=Sun
  const lastMonday = new Date(end);
  lastMonday.setUTCDate(end.getUTCDate() - dow);

  // Generate weeks oldest → newest (left → right).
  const weeks: Array<Array<{ date: string; count: number }>> = [];
  for (let w = WEEKS - 1; w >= 0; w--) {
    const monday = new Date(lastMonday);
    monday.setUTCDate(lastMonday.getUTCDate() - w * 7);
    const days: Array<{ date: string; count: number }> = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(monday);
      day.setUTCDate(monday.getUTCDate() + d);
      const key = day.toISOString().slice(0, 10);
      const count = counts.get(key) ?? 0;
      // Don't show future days in the current week.
      const isFuture = day.getTime() > endDate.getTime();
      days.push({ date: key, count: isFuture ? -1 : count });
    }
    weeks.push(days);
  }

  // Total events shown.
  const total = weeks.flat().reduce((s, d) => s + (d.count > 0 ? d.count : 0), 0);
  const days = weeks.flat().filter((d) => d.count > 0).length;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <p
          className="text-[14px] leading-[1.55] text-ink-soft"
          style={{ fontFamily: "var(--font-editorial)" }}
        >
          {isZh ? (
            <>
              过去一年，<strong className="text-ink">{total}</strong> 条记录，遍布{" "}
              <strong className="text-ink">{days}</strong> 天。
            </>
          ) : (
            <>
              <strong className="text-ink">{total}</strong>{" "}
              {total === 1 ? "entry" : "entries"} across{" "}
              <strong className="text-ink">{days}</strong>{" "}
              {days === 1 ? "day" : "days"} in the last year.
            </>
          )}
        </p>
        <Legend accent={accent} locale={locale} />
      </div>
      <div
        className="overflow-x-auto border-2 border-ink bg-[#FFFCF4] p-3"
        style={{ boxShadow: "3px 3px 0 0 var(--color-acc)" }}
      >
        <div className="flex gap-[3px]">
          {/* Y-axis day labels */}
          <div
            className="flex flex-col gap-[3px] pr-2"
            style={{ fontFamily: "var(--font-pixel-display)" }}
          >
            {dayLabels.map((d, i) => (
              <div
                key={i}
                className="text-[9px] tracking-[0.18em] text-acc-deep"
                style={{ height: CELL, lineHeight: `${CELL}px` }}
              >
                {d.toUpperCase()}
              </div>
            ))}
          </div>

          {/* The grid itself */}
          <div className="flex gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day, di) => (
                  <Cell key={di} count={day.count} date={day.date} accent={accent} locale={locale} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Cell({
  count,
  date,
  accent,
  locale = "en",
}: {
  count: number;
  date: string;
  accent: { primary: string; deep: string; soft: string };
  locale?: Locale;
}) {
  // Tooltip suffix: zh has no entry/entries plural, so render a single
  // form ("条记录"); en keeps the pluralized form.
  const suffix =
    count > 0
      ? locale === "zh"
        ? ` · ${count} 条记录`
        : ` · ${count} ${count === 1 ? "entry" : "entries"}`
      : "";
  // -1 = future (not yet possible), 0 = empty, 1 / 2-3 / 4+ tiers.
  const bg =
    count < 0
      ? "transparent"
      : count === 0
        ? "#E2D8B6"
        : count === 1
          ? accent.soft
          : count <= 3
            ? accent.primary
            : accent.deep;
  const border =
    count < 0
      ? "transparent"
      : count === 0
        ? "var(--color-line)"
        : accent.deep;
  return (
    <div
      title={`${date}${suffix}`}
      style={{
        width: CELL,
        height: CELL,
        background: bg,
        border: `1px solid ${border}`,
      }}
    />
  );
}

function Legend({
  accent,
  locale = "en",
}: {
  accent: { primary: string; deep: string; soft: string };
  locale?: Locale;
}) {
  return (
    <div
      className="flex items-center gap-2 text-[10px] tracking-[0.18em] text-acc-deep"
      style={{ fontFamily: "var(--font-pixel-display)" }}
    >
      <span>{locale === "zh" ? "少" : "LESS"}</span>
      <div className="flex gap-[3px]">
        <div style={{ width: 10, height: 10, background: "#E2D8B6", border: `1px solid var(--color-line)` }} />
        <div style={{ width: 10, height: 10, background: accent.soft, border: `1px solid ${accent.deep}` }} />
        <div style={{ width: 10, height: 10, background: accent.primary, border: `1px solid ${accent.deep}` }} />
        <div style={{ width: 10, height: 10, background: accent.deep, border: `1px solid ${accent.deep}` }} />
      </div>
      <span>{locale === "zh" ? "多" : "MORE"}</span>
    </div>
  );
}
