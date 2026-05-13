"use client";

// Hero — version banner pill, H1, lede.
//
// V2: bolder. The H1 is now significantly larger (52 → 80px on mobile,
// 100 → 128px on desktop in places) and the emphasis phrase has an
// ambient animated gradient behind it. The whole hero fades up from
// y:30 on mount so the page arrives with motion, not as a static load.
//
// Why client component: the ambient gradient drift and mount fade-up
// both need Framer Motion. The static H1 string still comes from the
// server (rendered into the DOM by Next), so SEO/crawler indexing
// works as expected.

import { motion, useReducedMotion } from "framer-motion";
import type { Locale } from "@/lib/translations";
import { t } from "@/lib/translations";
import { EASE } from "@/lib/motion-tokens";

export default function Hero({ locale }: { locale: Locale }) {
  const reduce = useReducedMotion();

  return (
    <motion.header
      initial={{ opacity: 0, y: reduce ? 0 : 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduce ? 0 : 0.9,
        ease: EASE.outSoft,
      }}
      className="relative max-w-[720px]"
    >
      {/* Ambient color wash behind the H1 — drifts slowly. Pure
          decoration, low opacity, hidden under prefers-reduced-motion. */}
      {!reduce && (
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1.6, delay: 0.5, ease: EASE.outSoft }}
          className="pointer-events-none absolute -left-12 -top-8 -z-10 h-[420px] w-[520px] sm:-left-20"
          style={{
            background:
              "radial-gradient(ellipse at 35% 50%, rgba(184, 134, 47, 0.18) 0%, transparent 60%)",
            filter: "blur(40px)",
          }}
        />
      )}

      {/* Version pill */}
      <motion.div
        initial={{ opacity: 0, y: reduce ? 0 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.1 }}
        className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line,#D6CDB6)] bg-[var(--color-cream-2,#F1EAD8)] px-3.5 py-1.5 text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink-soft,#4A4338)]"
        dangerouslySetInnerHTML={{ __html: t("home.version_banner", locale) }}
      />

      {/* H1 — much larger than V1. The emphasis phrase (wrapped in
          <em> in the translation strings) becomes a hand-italic
          accent in the deep-amber color. */}
      <motion.h1
        initial={{ opacity: 0, y: reduce ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : 0.8, delay: reduce ? 0 : 0.2, ease: EASE.outSoft }}
        className="mt-10 font-display text-[52px] leading-[0.98] tracking-tight text-[var(--color-ink,#221E18)] sm:text-[72px] md:text-[88px] [&_em]:not-italic [&_em]:italic [&_em]:font-display [&_em]:text-[var(--color-acc-deep,#8C6520)]"
        style={{ fontFamily: "var(--font-display)" }}
        dangerouslySetInnerHTML={{ __html: t("home.hero_h1", locale) }}
      />

      {/* Lede — bigger text size + warm accent rule above */}
      <motion.div
        initial={{ opacity: 0, y: reduce ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : 0.4, ease: EASE.outSoft }}
        className="mt-8 max-w-[600px]"
      >
        <div
          aria-hidden
          className="mb-5 h-px w-12 bg-[var(--color-acc-deep,#8C6520)] opacity-40"
        />
        <p className="text-[19px] leading-relaxed text-[var(--color-ink-soft,#4A4338)] sm:text-[21px]">
          {t("home.hero_lede", locale)}
        </p>
      </motion.div>
    </motion.header>
  );
}
