"use client";

// QuizCTA — the two big quiz-start buttons (Quick start / Detailed
// diagnosis) plus the "just show me the map" skip link.
//
// Client component because the buttons get a subtle hover/press
// motion (Framer Motion via the motion primitives). Navigation is
// plain Next.js <Link> so the press is intentional and shareable.
//
// The "Just show me the map" route doesn't exist in the redesign yet
// (it's part of the constellation Phase 3e); link goes to /result-preview
// for now so visitors who hit it during Phase 3 don't dead-end.

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Locale } from "@/lib/translations";
import { t } from "@/lib/translations";
import { DURATION, EASE } from "@/lib/motion-tokens";

type Props = {
  locale: Locale;
};

export default function QuizCTA({ locale }: Props) {
  const reduce = useReducedMotion();

  return (
    <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:gap-4">
      <QuizButton
        href="/quiz?mode=quick"
        name={t("home.quick_name", locale)}
        meta={t("home.quick_meta", locale)}
        desc={t("home.quick_desc", locale)}
        cta={t("home.begin", locale)}
        primary
        reduce={!!reduce}
      />
      <QuizButton
        href="/quiz?mode=detailed"
        name={t("home.detailed_name", locale)}
        meta={t("home.detailed_meta", locale)}
        desc={t("home.detailed_desc", locale)}
        cta={t("home.begin", locale)}
        reduce={!!reduce}
      />
      <div className="mt-2 flex items-center justify-center sm:mt-0 sm:basis-full">
        <Link
          href="/result-preview"
          className="text-[14px] text-[var(--color-ink-soft,#4A4338)] underline decoration-[var(--color-line,#D6CDB6)] decoration-1 underline-offset-4 hover:text-[var(--color-ink,#221E18)] hover:decoration-[var(--color-acc-deep,#8C6520)]"
        >
          {t("home.just_map", locale)}
        </Link>
      </div>
    </div>
  );
}

function QuizButton({
  href,
  name,
  meta,
  desc,
  cta,
  primary = false,
  reduce,
}: {
  href: string;
  name: string;
  meta: string;
  desc: string;
  cta: string;
  primary?: boolean;
  reduce: boolean;
}) {
  return (
    <motion.div
      whileHover={reduce ? undefined : { y: -2 }}
      whileTap={reduce ? undefined : { y: 0, scale: 0.99 }}
      transition={{ duration: reduce ? 0 : DURATION.fast, ease: EASE.outSoft }}
      className="flex-1"
    >
      <Link
        href={href}
        className={
          // Card-style button. `primary` is a slight shade darker so the
          // first option reads as the recommended path without shouting.
          "group block h-full rounded-2xl border bg-[var(--color-cream-2,#F1EAD8)] p-6 transition-shadow " +
          (primary
            ? "border-[var(--color-acc-deep,#8C6520)]/25 shadow-[0_2px_8px_rgba(34,30,24,0.05)] hover:shadow-[0_12px_32px_rgba(34,30,24,0.12)]"
            : "border-[var(--color-line,#D6CDB6)] hover:shadow-[0_12px_32px_rgba(34,30,24,0.08)]")
        }
      >
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-display text-[24px] leading-tight text-[var(--color-ink,#221E18)]" style={{ fontFamily: "var(--font-display)" }}>
            {name}
          </span>
          <span className="text-[12px] text-[var(--color-ink-soft,#4A4338)]">
            {meta}
          </span>
        </div>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-ink-soft,#4A4338)]">
          {desc}
        </p>
        <div className="mt-4 text-[14px] font-medium text-[var(--color-acc-deep,#8C6520)] transition-transform group-hover:translate-x-0.5">
          {cta}
        </div>
      </Link>
    </motion.div>
  );
}
