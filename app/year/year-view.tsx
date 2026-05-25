"use client";

// YearView — aggregates capability events + anthology entries by
// month, renders headline numbers + a 12x6 month/skill heatmap +
// a top-moves list.

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  SKILLS,
  SKILL_META,
  type CapabilityEvent,
  type Skill,
  readEvents,
} from "@/lib/capabilities";
import { readAnthology, type AnthologyEntry } from "@/lib/anthology";

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-editorial), Georgia, serif";

const MONTH_LABELS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export default function YearView() {
  const [events, setEvents] = useState<CapabilityEvent[] | null>(null);
  const [anthology, setAnthology] = useState<AnthologyEntry[] | null>(null);

  useEffect(() => {
    setEvents(readEvents());
    setAnthology(readAnthology());
    const handler = () => {
      setEvents(readEvents());
      setAnthology(readAnthology());
    };
    window.addEventListener("mull:capability-event", handler);
    window.addEventListener("mull:anthology-change", handler);
    return () => {
      window.removeEventListener("mull:capability-event", handler);
      window.removeEventListener("mull:anthology-change", handler);
    };
  }, []);

  if (events === null || anthology === null) {
    return (
      <div className="text-center text-[14px] text-[#8C6520]" style={{ fontFamily: serif }}>
        Loading your year…
      </div>
    );
  }

  const year = new Date().getFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1)).getTime();
  const yearEnd = new Date(Date.UTC(year + 1, 0, 1)).getTime();
  const thisYearsEvents = events.filter((e) => e.ts >= yearStart && e.ts < yearEnd);
  const thisYearsAnthology = anthology.filter((e) => e.ts >= yearStart && e.ts < yearEnd);

  // Bucket events by [month][skill]
  const grid: number[][] = Array.from({ length: 12 }, () =>
    Array(SKILLS.length).fill(0),
  );
  for (const e of thisYearsEvents) {
    const month = new Date(e.ts).getUTCMonth();
    const skillIdx = SKILLS.indexOf(e.skill);
    if (skillIdx >= 0) grid[month][skillIdx] += e.xp;
  }
  const maxCell = Math.max(1, ...grid.flat());

  // Top-skill this year.
  const skillTotals: Record<Skill, number> = {
    RIGOR: 0, DEPTH: 0, CONSISTENCY: 0, RANGE: 0, SELF_AWARE: 0, SYNTHESIS: 0,
  };
  for (const e of thisYearsEvents) skillTotals[e.skill] += e.xp;
  const topSkill = (Object.entries(skillTotals).sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0] ?? "CONSISTENCY") as Skill;

  // Most-active month.
  const monthTotals = grid.map((row, m) => ({ m, total: row.reduce((a, b) => a + b, 0) }));
  const topMonth = monthTotals.sort((a, b) => b.total - a.total)[0];

  // Active days (unique dates with at least one event).
  const activeDays = new Set(
    thisYearsEvents.map((e) => new Date(e.ts).toISOString().slice(0, 10)),
  ).size;

  return (
    <div className="space-y-5">
      {/* Headlines */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="MOVES" value={String(thisYearsEvents.length)} color="#B8862F" />
        <Stat label="ACTIVE DAYS" value={String(activeDays)} color="#2F5D5C" />
        <Stat label="SAVED" value={String(thisYearsAnthology.length)} color="#8C3717" />
        <Stat
          label="TOP SKILL"
          value={SKILL_META[topSkill].name.toUpperCase()}
          color={SKILL_META[topSkill].color}
        />
      </div>

      {/* The 12-month × 6-skill heatmap */}
      <div
        className="border-[3px] border-[#221E18] bg-[#FFFCF4]"
        style={{ boxShadow: "4px 4px 0 0 #B8862F" }}
      >
        <div
          className="flex items-center justify-between border-b-2 border-[#221E18] bg-[#221E18] px-4 py-2 text-[10px] tracking-[0.22em] text-[#F8EDC8]"
          style={{ fontFamily: pixel }}
        >
          <span>▶ MOVES BY MONTH AND SKILL · {year}</span>
          <span className="text-[#B8862F]">YEAR.SYS</span>
        </div>
        <div className="overflow-x-auto p-4">
          <table style={{ borderCollapse: "collapse", minWidth: 540 }}>
            <thead>
              <tr>
                <td />
                {MONTH_LABELS.map((m, mi) => (
                  <th
                    key={m}
                    style={{
                      fontFamily: pixel,
                      fontSize: 9,
                      letterSpacing: "0.18em",
                      color: mi === new Date().getUTCMonth() ? "#221E18" : "#8C6520",
                      padding: "0 6px",
                    }}
                  >
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SKILLS.map((s, si) => {
                const meta = SKILL_META[s];
                return (
                  <tr key={s}>
                    <th
                      style={{
                        fontFamily: pixel,
                        fontSize: 10,
                        letterSpacing: "0.18em",
                        textAlign: "right",
                        paddingRight: 8,
                        color: meta.color,
                      }}
                    >
                      {meta.name.toUpperCase()}
                    </th>
                    {MONTH_LABELS.map((_, mi) => {
                      const v = grid[mi][si];
                      const intensity = v / maxCell;
                      return (
                        <td
                          key={mi}
                          title={`${meta.name} · ${MONTH_LABELS[mi]} · ${v} XP`}
                          style={{
                            width: 28,
                            height: 22,
                            padding: 2,
                          }}
                        >
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              background:
                                v === 0 ? "#F5EFDC" : meta.color,
                              opacity:
                                v === 0 ? 1 : Math.max(0.25, intensity),
                              border:
                                mi === new Date().getUTCMonth()
                                  ? `2px solid ${meta.color}`
                                  : `1px solid #E2D8B6`,
                            }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div
          className="border-t-2 border-[#221E18] bg-[#FBF6E8] px-4 py-2 text-[12px] italic text-[#5C4528]"
          style={{ fontFamily: serif }}
        >
          {topMonth && topMonth.total > 0 ? (
            <>
              Your most active month so far: <strong>{MONTH_LABELS[topMonth.m]}</strong>{" "}
              ({topMonth.total} XP).
            </>
          ) : (
            "No events recorded this year yet. Start one of the surfaces below."
          )}
        </div>
      </div>

      {/* CTAs to the active surfaces */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { href: "/spar", label: "Daily Spar" },
          { href: "/crucible", label: "Crucible" },
          { href: "/wandering", label: "Wandering" },
          { href: "/pilgrimage", label: "Pilgrimage" },
        ].map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="border-2 border-[#221E18] bg-[#FFFCF4] px-3 py-2 text-center text-[11px] tracking-[0.18em] text-[#221E18] hover:bg-[#F8EDC8]"
            style={{
              fontFamily: pixel,
              textTransform: "uppercase",
              boxShadow: "2px 2px 0 0 #B8862F",
            }}
          >
            ▶ {c.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="border-2 border-[#221E18] bg-[#FFFCF4] p-3 text-center"
      style={{ boxShadow: `2px 2px 0 0 ${color}` }}
    >
      <div
        className="text-[22px] leading-none text-[#221E18]"
        style={{ fontFamily: pixel }}
      >
        {value}
      </div>
      <div
        className="mt-1 text-[9px] tracking-[0.22em]"
        style={{
          fontFamily: pixel,
          color,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </div>
  );
}
