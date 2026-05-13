// Footer — small, quiet site footer. Mirrors the inline footer at the
// bottom of public/mull.html so the migrated home stays at parity:
// brand pill, ownership note, four quiet links to about/methodology/
// privacy/terms.
//
// Server component. Will get used on the new /home and /result routes
// once 3d lands.

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mx-auto mt-16 max-w-[680px] border-t border-[#EBE3CA] px-6 pt-8 pb-8 text-[12.5px] leading-relaxed text-[var(--color-acc-deep,#8C6520)]">
      <div className="flex flex-wrap items-baseline justify-between gap-4 opacity-90">
        <div className="opacity-90">
          <strong className="font-semibold text-[var(--color-ink,#221E18)]">
            Mull
          </strong>{" "}
          · a passion project ·{" "}
          <a
            href="mailto:jimmy.kaian.ji@gmail.com"
            className="text-[var(--color-acc-deep,#8C6520)] underline decoration-[var(--color-acc,#B8862F)]/30 underline-offset-3 hover:decoration-[var(--color-acc-deep,#8C6520)]"
          >
            jimmy.kaian.ji@gmail.com
          </a>
        </div>
        <nav className="flex flex-wrap gap-4">
          <Link
            href="/about"
            className="underline decoration-[var(--color-acc,#B8862F)]/40 underline-offset-3 hover:decoration-[var(--color-acc-deep,#8C6520)]"
          >
            About
          </Link>
          <Link
            href="/methodology"
            className="underline decoration-[var(--color-acc,#B8862F)]/40 underline-offset-3 hover:decoration-[var(--color-acc-deep,#8C6520)]"
          >
            Methodology
          </Link>
          <Link
            href="/privacy"
            className="underline decoration-[var(--color-acc,#B8862F)]/40 underline-offset-3 hover:decoration-[var(--color-acc-deep,#8C6520)]"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="underline decoration-[var(--color-acc,#B8862F)]/40 underline-offset-3 hover:decoration-[var(--color-acc-deep,#8C6520)]"
          >
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}
