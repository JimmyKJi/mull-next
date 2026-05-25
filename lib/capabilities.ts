// Capability Atlas — the dopamine spine of Mull.
//
// Every retention surface (Crucible, Anthology, Wandering, Spar,
// Arena, Pilgrimage, Dilemma, Diary, Argument Diary, etc.) emits
// "capability events" — small typed records of meaningful actions.
// Those events aggregate into six skill scores. The /atlas page
// makes the user's growth visible. Returning users come back to
// see their levels rise.
//
// Why six skills (not three, not twelve):
//   Three is too few to give every feature a home. Twelve is too
//   many to remember. Six is small enough to memorize and big enough
//   that each retention feature can build at least one skill.
//
// The six skills, with the surfaces that build them:
//
//   RIGOR        — Spar verdicts, Arena scores, Argument Diary
//                  steelman quality. "How tight is your reasoning?"
//   DEPTH        — Pilgrimage day completion, Wandering Question
//                  Friday syntheses, Long Letter (when shipped).
//                  "How far in are you willing to go?"
//   CONSISTENCY  — Dilemma streak, Crucible completion rate, Spar
//                  cadence. "How often are you actually showing up?"
//   RANGE        — Anthology breadth (different archetypes/topics
//                  saved), Constellation Quest completions. "How
//                  wide does your reading travel?"
//   SELF_AWARE   — Diary entries, Crucible reports, Argument Diary
//                  fallacy-spotting. "How honestly do you see
//                  yourself?"
//   SYNTHESIS    — Wandering syntheses, Reading Hour syntheses,
//                  Pilgrimage Day 20+ (reflection days). "Can you
//                  pull multiple threads into a coherent picture?"
//
// State storage: localStorage v1 (key: "mull.capability_events").
// One row per event, append-only. Compaction at 1000 events: keep
// the most recent 800 + the daily summary roll-ups of older ones.
//
// Level formula: each level requires 10 + level * 5 XP. So level 1
// at 15 XP, level 5 at 35 XP, level 10 at 60 XP, level 30 at 160 XP.
// Steep enough that early gains feel quick; flattens enough that
// late levels demand real commitment.

import type { DimKey } from "./dimensions";

export type Skill =
  | "RIGOR"
  | "DEPTH"
  | "CONSISTENCY"
  | "RANGE"
  | "SELF_AWARE"
  | "SYNTHESIS";

export const SKILLS: Skill[] = [
  "RIGOR",
  "DEPTH",
  "CONSISTENCY",
  "RANGE",
  "SELF_AWARE",
  "SYNTHESIS",
];

/** Display metadata for each skill — used on /atlas + status badges. */
export const SKILL_META: Record<
  Skill,
  { name: string; description: string; color: string; verb: string }
> = {
  RIGOR: {
    name: "Rigor",
    description: "How tight is your reasoning?",
    color: "#1E3A5F", // navy — cartographer-ish
    verb: "tightening",
  },
  DEPTH: {
    name: "Depth",
    description: "How far in are you willing to go?",
    color: "#5D5777", // purple-gray — threshold-ish
    verb: "deepening",
  },
  CONSISTENCY: {
    name: "Consistency",
    description: "How often are you actually showing up?",
    color: "#8C6520", // amber — keel-ish
    verb: "showing up",
  },
  RANGE: {
    name: "Range",
    description: "How wide does your reading travel?",
    color: "#7A8B43", // olive — garden-ish
    verb: "widening",
  },
  SELF_AWARE: {
    name: "Self-Awareness",
    description: "How honestly do you see yourself?",
    color: "#8C3717", // burnt orange — forge-ish
    verb: "noticing",
  },
  SYNTHESIS: {
    name: "Synthesis",
    description: "Can you pull threads into a picture?",
    color: "#2F5D5C", // teal — touchstone-ish
    verb: "pulling together",
  },
};

/** Source — which feature fired the event. Open union so new
 *  features can add without touching this file. */
export type EventSource =
  | "dilemma"
  | "diary"
  | "exercise"
  | "spar"
  | "arena"
  | "pilgrimage"
  | "crucible"
  | "anthology"
  | "wandering"
  | "argument_diary"
  | "reading_hour"
  | "long_letter";

export type CapabilityEvent = {
  /** Unix ms. */
  ts: number;
  /** Which skill this builds. */
  skill: Skill;
  /** Which feature fired it (for analytics + Atlas breakdown). */
  source: EventSource;
  /** How much XP (typically 1–5). */
  xp: number;
  /** Optional human-readable label (shown on Atlas event log). */
  label?: string;
};

/** XP needed to reach level N (where 0 = baseline, 1 = first earned). */
export function xpForLevel(level: number): number {
  if (level <= 0) return 0;
  return 10 + level * 5;
}

/** Cumulative XP to reach level N. */
export function cumulativeXpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i <= level; i++) total += xpForLevel(i);
  return total;
}

/** Given a total XP, return the level + progress to next. */
export function levelFromXp(totalXp: number): {
  level: number;
  intoLevel: number;
  toNext: number;
} {
  let level = 0;
  let remaining = totalXp;
  while (remaining >= xpForLevel(level + 1)) {
    remaining -= xpForLevel(level + 1);
    level++;
  }
  return {
    level,
    intoLevel: remaining,
    toNext: xpForLevel(level + 1),
  };
}

/** Total XP per skill from a list of events. */
export function aggregateXp(events: CapabilityEvent[]): Record<Skill, number> {
  const totals: Record<Skill, number> = {
    RIGOR: 0,
    DEPTH: 0,
    CONSISTENCY: 0,
    RANGE: 0,
    SELF_AWARE: 0,
    SYNTHESIS: 0,
  };
  for (const e of events) {
    totals[e.skill] = (totals[e.skill] ?? 0) + e.xp;
  }
  return totals;
}

// ─── LocalStorage hooks ────────────────────────────────────────────

const STORAGE_KEY = "mull.capability_events";
const MAX_EVENTS = 1000; // compaction threshold

/** Read events from localStorage. Returns [] in non-browser env. */
export function readEvents(): CapabilityEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e) =>
        typeof e?.ts === "number" &&
        typeof e?.skill === "string" &&
        typeof e?.xp === "number",
    ) as CapabilityEvent[];
  } catch {
    return [];
  }
}

/** Append events; trim to MAX_EVENTS if oversized. */
export function appendEvents(toAdd: CapabilityEvent[]): CapabilityEvent[] {
  if (typeof window === "undefined") return toAdd;
  const current = readEvents();
  const next = [...current, ...toAdd];
  const trimmed =
    next.length > MAX_EVENTS
      ? next.slice(next.length - MAX_EVENTS)
      : next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore storage quota errors
  }
  // Notify other tabs / components that the Atlas changed.
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("mull:capability-event"));
  }
  return trimmed;
}

/** Single-event convenience. */
export function recordEvent(e: Omit<CapabilityEvent, "ts">): void {
  appendEvents([{ ...e, ts: Date.now() }]);
}

// ─── Composed helpers used by features ───────────────────────────

/** Lookup for which skills a given source primarily builds. Used by
 *  feature-side handlers to fire the right events without each
 *  caller hard-coding mappings. */
export const SOURCE_BUILDS: Record<EventSource, Skill[]> = {
  dilemma: ["CONSISTENCY", "SELF_AWARE"],
  diary: ["SELF_AWARE", "DEPTH"],
  exercise: ["SELF_AWARE", "RIGOR"],
  spar: ["RIGOR", "CONSISTENCY"],
  arena: ["RIGOR", "DEPTH"],
  pilgrimage: ["DEPTH", "CONSISTENCY"],
  crucible: ["CONSISTENCY", "SELF_AWARE"],
  anthology: ["RANGE", "SYNTHESIS"],
  wandering: ["DEPTH", "SYNTHESIS"],
  argument_diary: ["RIGOR", "SELF_AWARE"],
  reading_hour: ["DEPTH", "RANGE"],
  long_letter: ["DEPTH", "SELF_AWARE"],
};

/** Fire a standard event from a feature: builds the primary skill
 *  + a smaller bump to the secondary. Returns the events fired so
 *  callers can show "+3 Rigor" toasts. */
export function emitFeatureEvent(
  source: EventSource,
  label?: string,
  weight: number = 1,
): CapabilityEvent[] {
  const [primary, secondary] = SOURCE_BUILDS[source];
  const events: CapabilityEvent[] = [];
  const ts = Date.now();
  events.push({ ts, source, skill: primary, xp: 3 * weight, label });
  if (secondary && secondary !== primary) {
    events.push({ ts, source, skill: secondary, xp: 1 * weight, label });
  }
  appendEvents(events);
  return events;
}

// ─── Streak helper (used by /atlas + the badge components) ─────────

/** Sorted unique ISO date strings (UTC) of events. */
export function activeDates(events: CapabilityEvent[]): string[] {
  const set = new Set<string>();
  for (const e of events) {
    set.add(new Date(e.ts).toISOString().slice(0, 10));
  }
  return Array.from(set).sort();
}

/** Current streak: consecutive days ending today (or yesterday if
 *  today not yet) where at least one event fired. */
export function currentStreak(events: CapabilityEvent[]): number {
  const dates = new Set(activeDates(events));
  if (dates.size === 0) return 0;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const cursor = new Date(today);
  let key = cursor.toISOString().slice(0, 10);
  if (!dates.has(key)) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    key = cursor.toISOString().slice(0, 10);
    if (!dates.has(key)) return 0;
  }
  let streak = 0;
  while (dates.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

// Type re-exports so feature lib files don't have to re-import DimKey.
export type { DimKey };
