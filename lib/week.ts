// Week-handling helpers shared between the editor's-picks RPC and
// the curation UI. We use ISO weeks keyed by their Monday in UTC,
// which lines up with how Postgres' `date_trunc('week', ...)`
// computes weeks too.

export function mondayOfWeek(d: Date = new Date()): Date {
  const u = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  // getUTCDay: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  // We want Monday as the start; offset Sunday by 6 days.
  const day = u.getUTCDay();
  const diff = (day + 6) % 7;          // days since last Monday
  u.setUTCDate(u.getUTCDate() - diff);
  return u;
}

export function weekKey(d: Date = new Date()): string {
  const m = mondayOfWeek(d);
  const yyyy = m.getUTCFullYear();
  const mm = String(m.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(m.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Human label like "May 12 – May 18, 2026" for a week-key string.
export function weekRangeLabel(weekKeyStr: string, locale = 'en'): string {
  const start = new Date(`${weekKeyStr}T00:00:00Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const startStr = start.toLocaleDateString(locale === 'en' ? 'en-US' : locale, opts);
  const endStr = end.toLocaleDateString(locale === 'en' ? 'en-US' : locale, {
    ...opts,
    year: 'numeric',
  });
  return `${startStr} – ${endStr}`;
}
