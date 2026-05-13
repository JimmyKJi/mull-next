// ArchetypeStrip — small grid showing all 10 archetypes as preview
// chips. Each chip uses the per-archetype primary color for the dot
// and links to /archetype/[key] for the long-form essay.
//
// Server component; no JS required. Picked up onView for a soft
// stagger reveal in a future enhancement (left as plain HTML for
// now to keep first paint fast and not require a client boundary).

import Link from "next/link";
import { ARCHETYPES } from "@/lib/archetypes";
import { getArchetypeColor } from "@/lib/archetype-colors";

export default function ArchetypeStrip() {
  return (
    <section
      className="mt-20 max-w-[640px]"
      aria-label="The ten archetypes"
    >
      <div className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-ink-soft,#4A4338)] opacity-65">
        The ten archetypes
      </div>
      <h2
        className="mt-3 font-display text-[28px] leading-tight text-[var(--color-ink,#221E18)] sm:text-[32px]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Ten ways of holding the world
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-ink-soft,#4A4338)]">
        Each is one stable pattern across the 16 dimensions. The quiz
        places you near the one you&rsquo;re closest to — but you&rsquo;re
        a continuous point in space, not a fixed type.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {ARCHETYPES.map((a) => {
          const color = getArchetypeColor(a.key);
          return (
            <Link
              key={a.key}
              href={`/archetype/${a.key}`}
              className="group flex items-center gap-2.5 rounded-xl border border-[var(--color-line,#D6CDB6)] bg-[var(--color-cream-2,#F1EAD8)] px-3 py-2.5 transition-all hover:border-[color:var(--hover-border)] hover:bg-[color:var(--hover-bg)]"
              style={
                {
                  // CSS vars consumed by the hover: color depends on
                  // the per-archetype palette but we don't want to swap
                  // the className per-archetype.
                  ["--hover-border" as string]: color.deep,
                  ["--hover-bg" as string]: color.soft,
                } as React.CSSProperties
              }
            >
              <span
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: color.primary }}
                aria-hidden
              />
              <span className="font-display text-[16px] italic text-[var(--color-ink,#221E18)] group-hover:text-[color:var(--hover-border)]" style={{ fontFamily: "var(--font-display)" }}>
                {capitalize(a.key)}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
