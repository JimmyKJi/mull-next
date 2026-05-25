// Personal Anthology — your commonplace book.
//
// Save quotes, passages, exchanges, and reflections from any Mull
// surface. Borges meets Pinterest, with a 16-D model behind it.
//
// v1 state: localStorage (key: "mull.anthology"). Each entry has a
// source field so we can later cluster by theme or surface them on
// a "what you've been thinking about" view.

export type AnthologySource =
  | "spar"
  | "arena"
  | "pilgrimage"
  | "wandering"
  | "philosopher"
  | "topic"
  | "dilemma"
  | "diary"
  | "manual";

export type AnthologyEntry = {
  /** Unix ms. */
  ts: number;
  /** Stable client-side id. */
  id: string;
  /** Where the quote came from. */
  source: AnthologySource;
  /** The captured text. */
  text: string;
  /** Optional attribution (philosopher name, source label, etc.). */
  attribution?: string;
  /** Optional URL back to the surface where it was captured. */
  link?: string;
  /** User's optional 1-line note about why they saved it. */
  note?: string;
};

export const ANTHOLOGY_KEY = "mull.anthology";

export function readAnthology(): AnthologyEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ANTHOLOGY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AnthologyEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveAnthologyEntry(
  entry: Omit<AnthologyEntry, "ts" | "id">,
): AnthologyEntry {
  const full: AnthologyEntry = {
    ...entry,
    ts: Date.now(),
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  };
  if (typeof window !== "undefined") {
    const current = readAnthology();
    const next = [...current, full];
    try {
      window.localStorage.setItem(ANTHOLOGY_KEY, JSON.stringify(next));
    } catch {
      // ignore quota
    }
    window.dispatchEvent(new CustomEvent("mull:anthology-change"));
  }
  return full;
}

export function removeAnthologyEntry(id: string): void {
  if (typeof window === "undefined") return;
  const next = readAnthology().filter((e) => e.id !== id);
  try {
    window.localStorage.setItem(ANTHOLOGY_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent("mull:anthology-change"));
}

/** Count of distinct sources in the anthology — a rough "Range" metric
 *  that the Atlas can show without a full event re-aggregation. */
export function sourceBreadth(entries: AnthologyEntry[]): number {
  return new Set(entries.map((e) => e.source)).size;
}
