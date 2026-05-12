// Per-archetype color palettes — extracted from public/mull.html
// ARCHETYPES so any redesign surface can theme itself by archetype
// without re-defining the palette inline.
//
// Why a separate file (not added to lib/archetypes.ts):
//   lib/archetypes.ts is consumed by /archetype/[slug] today and the
//   redesign hasn't decided whether the long-form page should also
//   adopt these colors. Keeping them isolated means I can iterate on
//   the redesign POC without dragging in a schema change to a shipping
//   surface. Once the redesign settles, this can be folded into the
//   Archetype type.
//
// The keys here MUST match the `key` field in lib/archetypes.ts (same
// slugs the figure SVGs use). Add a new entry when you add a new
// archetype.

export type ArchetypeColor = {
  /** Mid-saturation primary — the per-archetype accent. */
  primary: string;
  /** Darker variant for text-on-cream contrast. */
  deep: string;
  /** Pale, low-saturation tint — used for chip backgrounds and the
   *  ambient halo behind the figure. */
  soft: string;
  /** Brighter accent — for the small flourishes that need to pop. */
  accent: string;
};

export const ARCHETYPE_COLORS: Record<string, ArchetypeColor> = {
  cartographer: { primary: "#1E3A5F", deep: "#0F2236", soft: "#E0E8F0", accent: "#3D6FA5" },
  keel:         { primary: "#8B5A2B", deep: "#5C3D1E", soft: "#F0E5D2", accent: "#B07A45" },
  threshold:    { primary: "#9089A8", deep: "#5D5777", soft: "#EDE9F2", accent: "#B5A8C7" },
  pilgrim:      { primary: "#7A2E2E", deep: "#4D1818", soft: "#F5DCD0", accent: "#A85050" },
  touchstone:   { primary: "#2F5D5C", deep: "#173533", soft: "#D5E5E4", accent: "#5A8A88" },
  hearth:       { primary: "#D4A93D", deep: "#8C6520", soft: "#F8EDC8", accent: "#E8C870" },
  forge:        { primary: "#C7522A", deep: "#8C3717", soft: "#F5DCD0", accent: "#E07A4A" },
  hammer:       { primary: "#6B3E8C", deep: "#3F2454", soft: "#E8DCF0", accent: "#9067B0" },
  garden:       { primary: "#7A8B43", deep: "#4F5A26", soft: "#E5E8D0", accent: "#A0B065" },
  lighthouse:   { primary: "#3D7DA8", deep: "#1F4666", soft: "#D5E5F0", accent: "#6FA8D0" },
};

// Default fallback (the cream/amber default theme), in case a key is
// missing — matches the :root --acc/--acc-deep/--acc-soft trio.
export const DEFAULT_ARCHETYPE_COLOR: ArchetypeColor = {
  primary: "#B8862F",
  deep: "#8C6520",
  soft: "#F8EDC8",
  accent: "#D4A93D",
};

export function getArchetypeColor(key: string): ArchetypeColor {
  return ARCHETYPE_COLORS[key] ?? DEFAULT_ARCHETYPE_COLOR;
}
