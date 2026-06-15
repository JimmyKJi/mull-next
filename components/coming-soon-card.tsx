// ComingSoonCard — slim reusable "this feature is being built"
// scaffold used by the four deferred retention surfaces (Reading
// Hour, Letters Between Inheritors, Mull Open, Long Letter).
//
// Each takes a title + the design pitch + a list of "what it'll do"
// + a "when" hint. No signup capture in v1 (Mull's main email
// list isn't wired yet); users land here, get the pitch, and the
// honest "later this year" cadence.

import Link from "next/link";
import { t, type Locale } from "@/lib/translations";

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-editorial), Georgia, serif";

type Props = {
  eyebrow: string;
  title: string;
  pitch: string;
  doing: string[];
  when: string;
  accent: { primary: string; deep: string; soft: string };
  /** Optional related surface to nudge users toward in the meantime. */
  meantime?: { href: string; label: string };
  /** Locale for the card's own chrome ("what it'll do", "when", etc.).
   *  Content props (pitch/doing/when) must already be localized by the
   *  caller. Defaults to English. */
  locale?: Locale;
};

export default function ComingSoonCard({
  eyebrow,
  title,
  pitch,
  doing,
  when,
  accent,
  meantime,
  locale = "en",
}: Props) {
  return (
    <div className="space-y-5">
      <div
        className="border-[4px] p-6"
        style={{
          background: accent.soft,
          borderColor: accent.deep,
          boxShadow: `5px 5px 0 0 ${accent.deep}`,
        }}
      >
        <div
          style={{
            fontFamily: pixel,
            fontSize: 10,
            color: accent.deep,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            marginBottom: 14,
          }}
        >
          ▶ {eyebrow}
        </div>
        <h2
          className="text-[28px] leading-tight"
          style={{ fontFamily: pixel, color: "var(--color-ink)", textShadow: `3px 3px 0 var(--pixel-shadow, ${accent.primary})` }}
        >
          {title.toUpperCase()}
        </h2>
        <p
          className="mt-4 text-[16px] leading-[1.65] text-ink"
          style={{ fontFamily: serif }}
        >
          {pitch}
        </p>
      </div>

      <div
        className="border-[3px] border-ink bg-[#FFFCF4] p-5"
        style={{ boxShadow: "3px 3px 0 0 var(--color-acc)" }}
      >
        <div
          style={{
            fontFamily: pixel,
            fontSize: 10,
            color: "var(--color-acc-deep)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          ▶ {t("csc.doing", locale)}
        </div>
        <ul className="space-y-2">
          {doing.map((d, i) => (
            <li
              key={i}
              className="border-l-4 px-3 py-2 text-[14.5px] leading-[1.55] text-ink"
              style={{
                fontFamily: serif,
                borderColor: accent.primary,
                background: "#FBF6E8",
              }}
            >
              {d}
            </li>
          ))}
        </ul>
      </div>

      <div
        className="border-2 border-ink bg-[#1A1612] px-4 py-3 text-acc-soft"
        style={{ fontFamily: serif, fontSize: 14 }}
      >
        <div
          style={{
            fontFamily: pixel,
            fontSize: 10,
            color: "#F8C75E",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          ▶ {t("csc.when", locale)}
        </div>
        {when}
      </div>

      {meantime && (
        <div
          className="border-2 border-acc-deep bg-[#F5EFDC] px-4 py-3"
          style={{ fontFamily: serif, fontSize: 14, color: "var(--color-ink)" }}
        >
          <strong>{t("csc.meantime", locale)}</strong>{" "}
          <Link
            href={meantime.href}
            className="text-acc-deep underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
          >
            {meantime.label}
          </Link>
        </div>
      )}
    </div>
  );
}
