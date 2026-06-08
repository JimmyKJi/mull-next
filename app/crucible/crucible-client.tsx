"use client";

// CrucibleClient — daily commit + tomorrow's check-in.
//
// Two surfaces stacked:
//   1. Yesterday's check-in — only shown if there's a yesterday
//      crucible AND the user hasn't reported on it yet
//   2. Today's commit + note
//
// Reports are persisted to localStorage. On a kept report, fires a
// CONSISTENCY + SELF_AWARE capability event (so the user gets the
// dopamine toast on completion).

import { useEffect, useState } from "react";
import {
  type Crucible,
  type CrucibleReport,
  CRUCIBLE_KEY,
} from "@/lib/crucible";
import { localizeCrucible } from "@/lib/crucible-i18n";
import { t, type Locale } from "@/lib/translations";
import { emitFeatureEvent } from "@/lib/capabilities";

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-editorial), Georgia, serif";

type Props = {
  today: Crucible;
  yesterday: Crucible;
  todayKey: string;
  yesterdayKey: string;
  locale?: Locale;
};

export default function CrucibleClient({
  today,
  yesterday,
  todayKey,
  yesterdayKey,
  locale = "en",
}: Props) {
  const todayL = localizeCrucible(today, locale);
  const yesterdayL = localizeCrucible(yesterday, locale);
  const [reports, setReports] = useState<CrucibleReport[] | null>(null);
  const [committed, setCommitted] = useState(false);
  const [yesterdayNote, setYesterdayNote] = useState("");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CRUCIBLE_KEY);
      const parsed = raw ? (JSON.parse(raw) as CrucibleReport[]) : [];
      setReports(parsed);
      // If today's commit is already recorded, lock it.
      if (parsed.some((r) => r.dateKey === todayKey)) setCommitted(true);
    } catch {
      setReports([]);
    }
  }, [todayKey]);

  function persistReports(next: CrucibleReport[]) {
    setReports(next);
    try {
      window.localStorage.setItem(CRUCIBLE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  function commitToday() {
    if (!reports || committed) return;
    const next = [
      ...reports.filter((r) => r.dateKey !== todayKey),
      {
        dateKey: todayKey,
        crucibleId: today.id,
        status: "tried" as const,
      },
    ];
    persistReports(next);
    setCommitted(true);
    emitFeatureEvent(
      "crucible",
      `Committed to Crucible · ${today.category}`,
      1,
    );
  }

  function reportYesterday(status: CrucibleReport["status"]) {
    if (!reports) return;
    const next = [
      ...reports.filter((r) => r.dateKey !== yesterdayKey),
      {
        dateKey: yesterdayKey,
        crucibleId: yesterday.id,
        status,
        note: yesterdayNote || undefined,
      },
    ];
    persistReports(next);
    if (status === "kept") {
      emitFeatureEvent("crucible", `Crucible kept: ${yesterday.category}`, 2);
    } else if (status === "tried") {
      emitFeatureEvent("crucible", `Crucible attempted: ${yesterday.category}`, 1);
    }
    // Skipped fires a smaller self-awareness event — naming the skip
    // is itself self-aware.
    if (status === "skipped") {
      emitFeatureEvent("crucible", `Crucible skipped honestly`, 0.5);
    }
  }

  if (reports === null) {
    return (
      <div className="text-center text-[14px] text-acc-deep" style={{ fontFamily: serif }}>
        {t("crucible.loading", locale)}
      </div>
    );
  }

  const yesterdayReported = reports.some(
    (r) => r.dateKey === yesterdayKey && (r.status === "kept" || r.status === "skipped"),
  );

  // Streak: consecutive days ending at todayKey or yesterdayKey with
  // a kept-or-tried report.
  const streak = (() => {
    const set = new Set(
      reports
        .filter((r) => r.status === "kept" || r.status === "tried")
        .map((r) => r.dateKey),
    );
    let count = 0;
    const cursor = new Date();
    cursor.setUTCHours(0, 0, 0, 0);
    if (!set.has(cursor.toISOString().slice(0, 10))) {
      cursor.setUTCDate(cursor.getUTCDate() - 1);
      if (!set.has(cursor.toISOString().slice(0, 10))) return 0;
    }
    while (set.has(cursor.toISOString().slice(0, 10))) {
      count++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    return count;
  })();

  return (
    <div className="space-y-5">
      {/* Streak chip */}
      {streak > 0 && (
        <div
          className="inline-flex items-center gap-2 border-2 border-ink bg-[#1A1612] px-3 py-1.5 text-[10px] tracking-[0.22em] text-[#F8C75E]"
          style={{ fontFamily: pixel, textTransform: "uppercase" }}
        >
          {t("crucible.streak", locale, {
            n: streak,
            unit: t(streak === 1 ? "crucible.day" : "crucible.days", locale),
          })}
        </div>
      )}

      {/* Yesterday's check-in */}
      {!yesterdayReported && (
        <div
          className="border-[3px] border-ink bg-[#FBF6E8] p-5"
          style={{ boxShadow: "3px 3px 0 0 #2F5D5C" }}
        >
          <div
            className="text-[10px] tracking-[0.22em] text-[#2F5D5C]"
            style={{ fontFamily: pixel, textTransform: "uppercase" }}
          >
            {t("crucible.checkin_eyebrow", locale)}
          </div>
          <p
            className="mt-2 text-[16px] leading-[1.55] text-ink"
            style={{ fontFamily: serif }}
          >
            {yesterdayL.prompt}
          </p>
          <textarea
            value={yesterdayNote}
            onChange={(e) => setYesterdayNote(e.target.value)}
            placeholder={t("crucible.note_placeholder", locale)}
            rows={3}
            style={{
              marginTop: 12,
              width: "100%",
              padding: "10px 12px",
              background: "#FFFCF4",
              border: "2px solid var(--color-ink)",
              fontFamily: serif,
              fontSize: 14.5,
              lineHeight: 1.55,
              color: "var(--color-ink)",
              resize: "vertical",
              minHeight: 80,
              borderRadius: 0,
            }}
          />
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => reportYesterday("kept")}
              className="border-2 border-ink px-3 py-2 text-[11px] tracking-[0.18em] text-acc-soft hover:opacity-90"
              style={{
                background: "#2F5D5C",
                fontFamily: pixel,
                textTransform: "uppercase",
                boxShadow: "2px 2px 0 0 var(--color-acc)",
              }}
            >
              {t("crucible.kept", locale)}
            </button>
            <button
              type="button"
              onClick={() => reportYesterday("tried")}
              className="border-2 border-ink bg-[#F8C75E] px-3 py-2 text-[11px] tracking-[0.18em] text-[#1A1820] hover:bg-acc"
              style={{
                fontFamily: pixel,
                textTransform: "uppercase",
                boxShadow: "2px 2px 0 0 #2F5D5C",
              }}
            >
              {t("crucible.tried", locale)}
            </button>
            <button
              type="button"
              onClick={() => reportYesterday("skipped")}
              className="border-2 border-acc-deep bg-transparent px-3 py-2 text-[11px] tracking-[0.18em] text-acc-deep hover:bg-[#F5EFDC]"
              style={{
                fontFamily: pixel,
                textTransform: "uppercase",
              }}
            >
              {t("crucible.skipped", locale)}
            </button>
          </div>
        </div>
      )}

      {/* Today's commit */}
      <div
        className="border-[4px] border-ink bg-[#FFFCF4] p-6"
        style={{ boxShadow: "5px 5px 0 0 var(--color-acc)" }}
      >
        <div
          className="flex items-baseline justify-between gap-2"
        >
          <span
            className="text-[10px] tracking-[0.22em] text-acc-deep"
            style={{ fontFamily: pixel, textTransform: "uppercase" }}
          >
            {t("crucible.today_eyebrow", locale, {
              category: t(`crucible.category.${today.category}`, locale),
            })}
          </span>
          <span
            className="text-[10px] tracking-[0.18em] text-acc"
            style={{ fontFamily: pixel, textTransform: "uppercase" }}
          >
            {t("crucible.count_of", locale, {
              n: String(today.id).padStart(2, "0"),
            })}
          </span>
        </div>
        <h2
          className="mt-4 text-[22px] leading-[1.35] text-ink"
          style={{ fontFamily: serif }}
        >
          {todayL.prompt}
        </h2>
        <p
          className="mt-3 text-[14px] italic leading-[1.55] text-acc-deep"
          style={{ fontFamily: serif }}
        >
          {todayL.framing}
        </p>
        {committed ? (
          <div
            className="mt-5 border-2 border-[#2F5D5C] bg-[#E5EFEC] px-4 py-3 text-[14px] text-[#1A4140]"
            style={{ fontFamily: serif }}
          >
            {t("crucible.committed", locale)}
          </div>
        ) : (
          <button
            type="button"
            onClick={commitToday}
            className="mt-5 w-full border-[3px] border-ink bg-[#F8C75E] px-4 py-3 text-[12px] tracking-[0.18em] text-[#1A1820] hover:bg-acc"
            style={{
              fontFamily: pixel,
              textTransform: "uppercase",
              boxShadow: "4px 4px 0 0 #2F5D5C",
            }}
          >
            {t("crucible.commit_btn", locale)}
          </button>
        )}
      </div>

      <p
        className="text-[13px] italic text-acc-deep"
        style={{ fontFamily: serif }}
      >
        {t("crucible.footer", locale)}
      </p>
    </div>
  );
}
