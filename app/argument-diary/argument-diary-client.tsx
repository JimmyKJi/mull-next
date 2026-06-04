"use client";

// ArgumentDiaryClient — form + analysis + history.
//
// User pastes their account of an argument, optionally adds context
// (relationship to other party, what was at stake). On submit:
// POST /api/argument-diary/analyze → render the analysis.
// Entries (account + analysis) saved to localStorage history.

import { useEffect, useState } from "react";
import {
  saveAnthologyEntry,
} from "@/lib/anthology";
import { emitFeatureEvent } from "@/lib/capabilities";
import { t, type Locale } from "@/lib/translations";

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-editorial), Georgia, serif";

const HISTORY_KEY = "mull.argument_diary";
const MAX_CHARS = 4000;

type AnalysisShape = {
  steelman: string;
  fallacies: { name: string; explanation: string }[];
  kindred: { philosopher: string; take: string }[];
};

type DiaryEntry = {
  id: string;
  ts: number;
  account: string;
  context?: string;
  analysis: AnalysisShape;
};

export default function ArgumentDiaryClient({
  locale = "en",
}: {
  locale?: Locale;
}) {
  const [history, setHistory] = useState<DiaryEntry[]>([]);
  const [account, setAccount] = useState("");
  const [context, setContext] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latest, setLatest] = useState<DiaryEntry | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(HISTORY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DiaryEntry[];
        setHistory(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  async function submit() {
    if (submitting || !account.trim()) return;
    if (account.length > MAX_CHARS) {
      setError(t("argdiary.err_too_long", locale, { n: MAX_CHARS }));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/argument-diary/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account: account.trim(),
          context: context.trim() || undefined,
          locale,
        }),
      });
      if (!res.ok) {
        const e = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(
          e.error || t("argdiary.err_request", locale, { status: res.status }),
        );
      }
      const data = (await res.json()) as { analysis: AnalysisShape };
      const entry: DiaryEntry = {
        id: typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}`,
        ts: Date.now(),
        account: account.trim(),
        context: context.trim() || undefined,
        analysis: data.analysis,
      };
      const nextHistory = [entry, ...history];
      setHistory(nextHistory);
      try {
        window.localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
      } catch {
        // ignore quota
      }
      setLatest(entry);
      setAccount("");
      setContext("");
      emitFeatureEvent(
        "argument_diary",
        `Logged an argument · ${entry.analysis.fallacies?.length ?? 0} fallacies surfaced`,
        2,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : t("argdiary.err_generic", locale));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Input */}
      <div
        className="border-[3px] border-[#221E18] bg-[#FFFCF4] p-5"
        style={{ boxShadow: "4px 4px 0 0 #8C3717" }}
      >
        <label
          className="text-[10px] tracking-[0.22em] text-[#8C6520]"
          style={{ fontFamily: pixel, textTransform: "uppercase" }}
        >
          {t("argdiary.account_label", locale)}
        </label>
        <textarea
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          rows={8}
          placeholder={t("argdiary.account_placeholder", locale)}
          disabled={submitting}
          style={{
            marginTop: 8,
            width: "100%",
            padding: "10px 12px",
            background: "#FBF6E8",
            border: "2px solid #221E18",
            fontFamily: serif,
            fontSize: 15.5,
            lineHeight: 1.6,
            color: "#221E18",
            resize: "vertical",
            minHeight: 180,
            borderRadius: 0,
          }}
        />
        <div
          className="mt-1 flex justify-between text-[10px] tracking-[0.18em]"
          style={{
            fontFamily: pixel,
            color: account.length > MAX_CHARS ? "#8C3717" : "#8C6520",
            textTransform: "uppercase",
          }}
        >
          <span>
            {account.length} / {MAX_CHARS}
          </span>
        </div>

        <label
          className="mt-4 block text-[10px] tracking-[0.22em] text-[#8C6520]"
          style={{ fontFamily: pixel, textTransform: "uppercase" }}
        >
          {t("argdiary.context_label", locale)}
        </label>
        <input
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder={t("argdiary.context_placeholder", locale)}
          disabled={submitting}
          style={{
            marginTop: 8,
            width: "100%",
            padding: "8px 12px",
            background: "#FBF6E8",
            border: "2px solid #221E18",
            fontFamily: serif,
            fontSize: 14,
            color: "#221E18",
            borderRadius: 0,
          }}
        />

        {error && (
          <div
            style={{
              marginTop: 12,
              padding: "10px 12px",
              background: "#FEE9E0",
              borderLeft: "4px solid #8C3717",
              color: "#8C3717",
              fontFamily: serif,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={submitting || !account.trim()}
          className="mt-4 w-full border-[3px] border-[#221E18] px-4 py-3 text-[12px] tracking-[0.18em] text-[#1A1820]"
          style={{
            fontFamily: pixel,
            textTransform: "uppercase",
            background:
              submitting || !account.trim() ? "#D6CDB6" : "#F8C75E",
            boxShadow:
              submitting || !account.trim() ? "none" : "4px 4px 0 0 #8C3717",
            cursor:
              submitting || !account.trim() ? "default" : "pointer",
          }}
        >
          {submitting
            ? t("argdiary.analyzing", locale)
            : t("argdiary.analyze", locale)}
        </button>
      </div>

      {/* Result */}
      {latest && <AnalysisCard entry={latest} locale={locale} />}

      {/* History */}
      {history.length > 1 && (
        <details
          className="border-2 border-[#221E18] bg-[#FFFCF4] px-3 py-2"
          style={{ fontFamily: serif }}
        >
          <summary
            className="cursor-pointer text-[12px] text-[#8C6520]"
            style={{ fontFamily: pixel, letterSpacing: "0.18em", textTransform: "uppercase" }}
          >
            {t("argdiary.past_entries", locale, {
              n: history.length - (latest ? 1 : 0),
            })}
          </summary>
          <ul className="mt-3 space-y-2">
            {history
              .filter((h) => h.id !== latest?.id)
              .map((h) => (
                <li key={h.id}>
                  <details
                    className="border-l-2 border-[#8C6520] bg-[#FBF6E8] px-3 py-2"
                  >
                    <summary
                      className="cursor-pointer text-[13px] text-[#221E18]"
                      style={{ fontFamily: serif }}
                    >
                      {new Date(h.ts).toLocaleDateString(
                        locale === "zh" ? "zh-CN" : undefined,
                      )} — {h.account.slice(0, 80)}…
                    </summary>
                    <div className="mt-2">
                      <AnalysisCard entry={h} locale={locale} />
                    </div>
                  </details>
                </li>
              ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function AnalysisCard({
  entry,
  locale,
}: {
  entry: DiaryEntry;
  locale: Locale;
}) {
  return (
    <div className="space-y-3">
      <Section title={t("argdiary.section_steelman", locale)} accent="#2F5D5C">
        <p
          className="text-[15px] leading-[1.65] text-[#221E18]"
          style={{ fontFamily: serif }}
        >
          {entry.analysis.steelman}
        </p>
      </Section>

      <Section title={t("argdiary.section_fallacies", locale)} accent="#8C3717">
        <ul className="space-y-3">
          {entry.analysis.fallacies?.map((f, i) => (
            <li key={i}>
              <div
                className="text-[11px] tracking-[0.18em] text-[#8C3717]"
                style={{ fontFamily: pixel, textTransform: "uppercase" }}
              >
                {f.name}
              </div>
              <p
                className="mt-1 text-[14.5px] leading-[1.55] text-[#221E18]"
                style={{ fontFamily: serif }}
              >
                {f.explanation}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t("argdiary.section_kindred", locale)} accent="#1E3A5F">
        <ul className="space-y-3">
          {entry.analysis.kindred?.map((k, i) => (
            <li key={i}>
              <div
                className="flex items-baseline justify-between gap-2"
              >
                <span
                  className="text-[11px] tracking-[0.18em] text-[#1E3A5F]"
                  style={{ fontFamily: pixel, textTransform: "uppercase" }}
                >
                  {k.philosopher.toUpperCase()}
                </span>
                <SaveTakeButton
                  philosopher={k.philosopher}
                  take={k.take}
                  locale={locale}
                />
              </div>
              <p
                className="mt-1 text-[14.5px] leading-[1.55] text-[#221E18]"
                style={{ fontFamily: serif }}
              >
                {k.take}
              </p>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function Section({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="border-l-[5px] border-[#221E18] bg-[#FFFCF4] p-4"
      style={{ borderLeftColor: accent, boxShadow: "3px 3px 0 0 #B8862F" }}
    >
      <div
        className="text-[10px] tracking-[0.22em]"
        style={{
          fontFamily: pixel,
          color: accent,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        ▶ {title}
      </div>
      {children}
    </div>
  );
}

function SaveTakeButton({
  philosopher,
  take,
  locale,
}: {
  philosopher: string;
  take: string;
  locale: Locale;
}) {
  const [saved, setSaved] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        if (saved) return;
        saveAnthologyEntry({
          source: "manual",
          text: take,
          attribution: philosopher,
        });
        emitFeatureEvent("anthology", `Saved a kindred take: ${philosopher}`);
        setSaved(true);
      }}
      disabled={saved}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        background: saved ? "#2F5D5C" : "#FFFCF4",
        color: saved ? "#F8EDC8" : "#8C6520",
        border: "1.5px solid #221E18",
        fontFamily: pixel,
        fontSize: 9,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        cursor: saved ? "default" : "pointer",
      }}
    >
      {saved ? "✓" : "★"} {t("argdiary.save", locale)}
    </button>
  );
}
