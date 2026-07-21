// StreakStrip — the last N days as a row of pixel cells: filled (in the
// archetype color) on days you reflected, hollow on days you didn't,
// today outlined. A small, glanceable "have I kept the rhythm" strip
// for the Today home — distinct from the full-year ActivityHeatmap.
// Server component; cells flex-wrap so the strip never overflows.

type Accent = { primary: string; deep: string; soft: string };

export function StreakStrip({
  dates,
  todayKey,
  accent,
  days = 21,
}: {
  dates: string[];
  todayKey: string;
  accent: Accent;
  days?: number;
}) {
  const set = new Set(dates);
  const cursor = new Date(todayKey);
  const cells: { key: string; on: boolean; today: boolean }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(cursor);
    d.setUTCDate(cursor.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    cells.push({ key, on: set.has(key), today: key === todayKey });
  }

  return (
    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      {cells.map((c) => (
        <div
          key={c.key}
          title={c.key}
          style={{
            width: 13,
            height: 13,
            background: c.on ? accent.primary : '#EFE7D0',
            border: c.today
              ? `2px solid ${accent.deep}`
              : `1px solid ${c.on ? accent.deep : 'var(--color-line)'}`,
          }}
        />
      ))}
    </div>
  );
}
