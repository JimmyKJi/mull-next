"use client";

// QuizCTA — the two big quiz-start buttons (Quick start / Detailed
// diagnosis) plus the "just show me the map" skip link.
//
// V2: bolder. The recommended path (Quick) is now visibly the
// primary action — accent-bg card with deep-amber type, a substantial
// arrow CTA pill, and a slight lift on hover. The Detailed option is
// the secondary cream card. Both are tall enough to read as deliberate
// choices, not button-row chrome. The skip link sits below as an
// explicit third option, not a footnote.

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Locale } from "@/lib/translations";
import { t } from "@/lib/translations";
import { EASE, SPRING } from "@/lib/motion-tokens";

type Props = {
  locale: Locale;
};

export default function QuizCTA({ locale }: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial="pre"
      animate="reveal"
      variants={{
        pre: {},
        reveal: {
          transition: {
            staggerChildren: reduce ? 0 : 0.12,
            delayChildren: reduce ? 0 : 0.6,
          },
        },
      }}
      className="mt-16 max-w-[720px]"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <QuizButton
          href="/quiz?mode=quick"
          name={t("home.quick_name", locale)}
          meta={t("home.quick_meta", locale)}
          desc={t("home.quick_desc", locale)}
          cta={t("home.begin", locale)}
          variant="primary"
          reduce={!!reduce}
        />
        <QuizButton
          href="/quiz?mode=detailed"
          name={t("home.detailed_name", locale)}
          meta={t("home.detailed_meta", locale)}
          desc={t("home.detailed_desc", locale)}
          cta={t("home.begin", locale)}
          variant="secondary"
          reduce={!!reduce}
        />
      </div>

      <motion.div
        variants={{
          pre: { opacity: 0, y: 8 },
          reveal: { opacity: 1, y: 0 },
        }}
        transition={{ duration: reduce ? 0 : 0.5, ease: EASE.outSoft }}
        className="mt-5 flex justify-center"
      >
        <Link
          href="/result-preview"
          className="text-[14px] text-[var(--color-ink-soft,#4A4338)] underline decoration-[var(--color-line,#D6CDB6)] decoration-1 underline-offset-4 hover:text-[var(--color-ink,#221E18)] hover:decoration-[var(--color-acc-deep,#8C6520)]"
        >
          {t("home.just_map", locale)}
        </Link>
      </motion.div>
    </motion.div>
  );
}

function QuizButton({
  href,
  name,
  meta,
  desc,
  cta,
  variant,
  reduce,
}: {
  href: string;
  name: string;
  meta: string;
  desc: string;
  cta: string;
  variant: "primary" | "secondary";
  reduce: boolean;
}) {
  const isPrimary = variant === "primary";

  return (
    <motion.div
      variants={{
        pre: { opacity: 0, y: 30, scale: 0.96 },
        reveal: { opacity: 1, y: 0, scale: 1 },
      }}
      transition={reduce ? { duration: 0 } : SPRING.soft}
      whileHover={reduce ? undefined : { y: -4 }}
      whileTap={reduce ? undefined : { y: -1, scale: 0.99 }}
    >
      <Link
        href={href}
        className={
          // Card-style button — significantly more visual weight than
          // V1. Primary is filled with the accent-soft tone and
          // deep-amber type; secondary is cream with a darker border.
          "group block h-full rounded-3xl border-2 p-7 transition-all duration-300 sm:p-8 " +
          (isPrimary
            ? "border-[var(--color-acc-deep,#8C6520)] bg-[var(--color-acc-soft,#F8EDC8)] hover:shadow-[0_20px_50px_rgba(140,101,32,0.25)]"
            : "border-[var(--color-line,#D6CDB6)] bg-[var(--color-cream-2,#F1EAD8)] hover:border-[var(--color-acc-deep,#8C6520)]/60 hover:shadow-[0_16px_40px_rgba(34,30,24,0.12)]")
        }
      >
        <div className="flex items-baseline justify-between gap-3">
          <span
            className={
              "font-display text-[28px] leading-tight sm:text-[32px] " +
              (isPrimary
                ? "text-[var(--color-acc-deep,#8C6520)]"
                : "text-[var(--color-ink,#221E18)]")
            }
            style={{ fontFamily: "var(--font-display)" }}
          >
            {name}
          </span>
        </div>
        <div
          className={
            "mt-1 text-[11px] uppercase tracking-[0.16em] " +
            (isPrimary
              ? "text-[var(--color-acc-deep,#8C6520)]/70"
              : "text-[var(--color-ink-soft,#4A4338)]/80")
          }
        >
          {meta}
        </div>
        <p className="mt-5 text-[15.5px] leading-relaxed text-[var(--color-ink-soft,#4A4338)]">
          {desc}
        </p>
        <div className="mt-6 flex items-center gap-2">
          <span
            className={
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[14px] font-medium transition-transform group-hover:translate-x-0.5 " +
              (isPrimary
                ? "bg-[var(--color-acc-deep,#8C6520)] text-[var(--color-acc-soft,#F8EDC8)]"
                : "border border-[var(--color-acc-deep,#8C6520)]/30 text-[var(--color-acc-deep,#8C6520)]")
            }
          >
            {cta}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
