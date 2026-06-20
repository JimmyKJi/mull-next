#!/usr/bin/env node
// Design-token migration — PILOT (value-preserving).
//
// Converts hardcoded hex colors that EXACTLY match a design token
// (app/globals.css @theme) into token references, WITHOUT changing any
// rendered pixel. Two contexts, two forms:
//
//   1. Tailwind arbitrary color utility  text-[#221E18]  -> text-ink
//      (Tailwind v4 generates text-/bg-/border-/decoration-/fill-/…-<name>
//       from each --color-<name>; the compiled value is identical.)
//
//   2. Inline CSS / arbitrary-value hex  "…0 #B8862F"     -> "…0 var(--color-acc)"
//      boxShadow / textShadow / style={{…}} / shadow-[…#hex] arbitrary values.
//
// What it deliberately does NOT touch (the SVG-attribute / WebGL trap):
//   SVG presentation attributes  fill="#8C6520"  stroke="#D6CDB6"
//   R3F / three.js color props   color="#B8862F" emissive="#8C6520"
// `var()` does not resolve inside an SVG/WebGL attribute value, so
// rewriting those would change rendering. They are matched by the
// attribute form  ="#hex"  and protected via a negative lookbehind.
//
// Non-token hexes (palette drift: #FFFCF4, #2F5D5C, #1A1612, #0E1419,
// #F8C75E, …) are left untouched — they aren't in the token system.
//
// Usage:
//   node scripts/migrate-tokens-pilot.js --dry  app/page.tsx …   # report only
//   node scripts/migrate-tokens-pilot.js        app/page.tsx …   # write in place

const fs = require('fs');

// hex (UPPER, no #) -> canonical Tailwind/css token name.
// Mirrors app/globals.css @theme. Aliases (#F1EAD8 is both cream-2 and
// star; #F8EDC8 is both acc-soft and acc-bg) collapse to one canonical
// name — the rendered value is identical either way.
const TOKEN = {
  '221E18': 'ink',
  '4A4338': 'ink-soft',
  D6CDB6: 'line',
  FAF6EC: 'cream',
  F1EAD8: 'cream-2',
  B8862F: 'acc',
  '8C6520': 'acc-deep',
  F8EDC8: 'acc-soft',
  '0C141E': 'night',
  '131F2E': 'night-2',
  '1D2D44': 'night-3',
};

const args = process.argv.slice(2);
const dry = args.includes('--dry');
// --classonly: run ONLY Pass A (Tailwind bracket utilities). Skips the
// bare-hex→var() pass. Use for files where a bare hex might be DATA fed
// into an SVG attr / WebGL prop / email HTML (where var() does not
// resolve): SVG sprite/chart components, lib color-data modules, email
// templates. Pass A is always safe — it only ever matches className brackets.
const classonly = args.includes('--classonly');
const files = args.filter((a) => !a.startsWith('--'));

if (files.length === 0) {
  console.error('No files given.');
  process.exit(1);
}

// Pass A — bracketed Tailwind color utility:  <prefix>-[#HEX]<​/opacity?>
// prefix is the bit right before -[#  (letters + hyphens; any variant
// like hover:/sm: stays outside the match because it ends in ':').
const RE_TW = /([a-zA-Z][a-zA-Z-]*)-\[#([0-9A-Fa-f]{6})\](\/[0-9.]+)?/g;

// Pass B — bare hex in a CSS context. The (?<!=") lookbehind skips
// attribute-form hexes (fill="#…", color="#…") which must stay literal.
const RE_BARE = /(?<!=")#([0-9A-Fa-f]{6})\b/g;

let grandTotal = 0;

for (const file of files) {
  let src = fs.readFileSync(file, 'utf8');
  const classHits = {};
  const inlineHits = {};
  const leftAttr = {}; // token hexes left untouched because attribute-form

  src = src.replace(RE_TW, (m, prefix, hex, opacity) => {
    const name = TOKEN[hex.toUpperCase()];
    if (!name) return m; // non-token → leave
    classHits[hex.toUpperCase()] = (classHits[hex.toUpperCase()] || 0) + 1;
    return `${prefix}-${name}${opacity || ''}`;
  });

  if (!classonly) {
    src = src.replace(RE_BARE, (m, hex) => {
      const name = TOKEN[hex.toUpperCase()];
      if (!name) return m; // non-token → leave
      inlineHits[hex.toUpperCase()] = (inlineHits[hex.toUpperCase()] || 0) + 1;
      return `var(--color-${name})`;
    });
  }

  // Audit: any remaining token hex must be attribute-form (SVG/WebGL).
  const remaining = src.match(/#[0-9A-Fa-f]{6}/g) || [];
  for (const h of remaining) {
    const hex = h.slice(1).toUpperCase();
    if (TOKEN[hex]) leftAttr[hex] = (leftAttr[hex] || 0) + 1;
  }

  const nClass = Object.values(classHits).reduce((a, b) => a + b, 0);
  const nInline = Object.values(inlineHits).reduce((a, b) => a + b, 0);
  grandTotal += nClass + nInline;

  console.log(`\n${file}`);
  console.log(`  class  -> token util : ${nClass}  ${JSON.stringify(classHits)}`);
  console.log(`  inline -> var(...)   : ${nInline}  ${JSON.stringify(inlineHits)}`);
  if (Object.keys(leftAttr).length) {
    console.log(
      `  LEFT (attr-form SVG/WebGL, token but not migrated): ${JSON.stringify(leftAttr)}`,
    );
  }

  if (!dry) {
    fs.writeFileSync(file, src, 'utf8');
    console.log('  ✓ written');
  } else {
    console.log('  (dry-run, not written)');
  }
}

console.log(`\nTotal conversions: ${grandTotal}${dry ? ' (dry-run)' : ''}`);
