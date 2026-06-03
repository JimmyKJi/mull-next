// gen-logo-assets.mjs — generate all brand-logo assets from the
// hand-drawn source art (scripts/assets/mull-logo-source.jpg).
//
// The source is black line-art on white (a globe-headed figure reading
// an open book, portrait ~828×1054). We derive a TRANSPARENT INK PNG by
// turning luminance into an alpha channel: black ink → opaque ink
// (#221E18), white paper → transparent. Anti-aliased edges stay smooth
// because mid-greys map to partial alpha.
//
// Outputs:
//   public/mull-logo.png        transparent ink master (height ≤ 600)
//   public/favicon-512.png      512×512 cream tile + centered logo
//   public/apple-touch-icon.png 180×180 cream tile + centered logo
//   public/favicon.svg          SVG wrapping an embedded 128px cream tile
//
// Run:  node scripts/gen-logo-assets.mjs
//
// Re-runnable: deterministic from the source jpg. Safe to re-run after
// tweaking the source or the tuning constants below.

import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "scripts/assets/mull-logo-source.jpg");
const PUB = path.join(ROOT, "public");

// Brand palette.
const INK = { r: 0x22, g: 0x1e, b: 0x18 }; // #221E18 warm near-black
const CREAM = "#F4ECD6"; // parchment tile behind icon logos

// Alpha curve: luminance → ink alpha. Pixels darker than LO are fully
// opaque ink; lighter than HI are fully transparent; linear between.
// This both cleans JPEG speckle in the white paper and crisps edges.
const LO = 40;
const HI = 235;

// Max height of the transparent web logo master.
const WEB_MAX_H = 600;

function alphaFromLuma(luma) {
  if (luma <= LO) return 255;
  if (luma >= HI) return 0;
  return Math.round((255 * (HI - luma)) / (HI - LO));
}

async function buildTransparentInk() {
  // Flatten onto white (defensive — source has no alpha), trim the white
  // border, then read a single-channel greyscale raster.
  const { data, info } = await sharp(SRC)
    .flatten({ background: "#ffffff" })
    .trim({ background: "#ffffff", threshold: 25 })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: w, height: h } = info;
  const rgba = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    rgba[i * 4 + 0] = INK.r;
    rgba[i * 4 + 1] = INK.g;
    rgba[i * 4 + 2] = INK.b;
    rgba[i * 4 + 3] = alphaFromLuma(data[i]);
  }

  // PNG buffer at native (trimmed) resolution.
  const masterPng = await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
    .png()
    .toBuffer();

  return { masterPng, width: w, height: h };
}

// Compose the transparent logo centered on a square cream tile, scaling
// the logo to occupy `coverage` of the tile's smaller dimension.
async function creamTile(logoPng, logoW, logoH, tile, coverage) {
  // Fit the portrait logo by HEIGHT (it's taller than wide).
  const targetH = Math.round(tile * coverage);
  const resized = await sharp(logoPng)
    .resize({ height: targetH })
    .toBuffer();
  const meta = await sharp(resized).metadata();
  const left = Math.round((tile - meta.width) / 2);
  const top = Math.round((tile - meta.height) / 2);

  return sharp({
    create: {
      width: tile,
      height: tile,
      channels: 4,
      background: CREAM,
    },
  })
    .composite([{ input: resized, left, top }])
    .png()
    .toBuffer();
}

async function main() {
  const { masterPng, width, height } = await buildTransparentInk();
  console.log(`trimmed logo: ${width}×${height} (aspect ${(width / height).toFixed(4)})`);

  // 1. Web master — transparent ink, height-capped.
  const webH = Math.min(WEB_MAX_H, height);
  await sharp(masterPng).resize({ height: webH }).png({ compressionLevel: 9 }).toFile(path.join(PUB, "mull-logo.png"));
  console.log(`wrote public/mull-logo.png (height ${webH})`);

  // 2. favicon-512.png — cream tile, logo ~70% height.
  const fav512 = await creamTile(masterPng, width, height, 512, 0.7);
  await writeFile(path.join(PUB, "favicon-512.png"), fav512);
  console.log("wrote public/favicon-512.png (512×512)");

  // 3. apple-touch-icon.png — cream tile, logo ~70% height.
  const apple = await creamTile(masterPng, width, height, 180, 0.7);
  await writeFile(path.join(PUB, "apple-touch-icon.png"), apple);
  console.log("wrote public/apple-touch-icon.png (180×180)");

  // 4. favicon.svg — wrap a small (128px) cream tile as embedded base64.
  //    SVG is listed first in layout metadata, so it must carry the new
  //    art. A 128px raster keeps the file small while staying crisp at
  //    the 16–48px sizes browsers actually render favicons.
  const fav128 = await creamTile(masterPng, width, height, 128, 0.7);
  const b64 = fav128.toString("base64");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <title>Mull</title>
  <image href="data:image/png;base64,${b64}" width="64" height="64"/>
</svg>
`;
  await writeFile(path.join(PUB, "favicon.svg"), svg);
  console.log("wrote public/favicon.svg (embedded 128px tile)");

  // 5. og.png — 1200×630 social-share card. We keep the existing card's
  //    typeset chrome (the "Mull." wordmark, tagline, and footer are baked
  //    into scripts/assets/og-base-clean.png — the original card with the
  //    old constellation graphic blurred away) and composite the new
  //    globe-reader logo into the right-hand space. Re-typesetting in SVG
  //    isn't an option here: sharp's librsvg won't load the local Cormorant
  //    Garamond TTF, so any regenerated wordmark falls back to a sans.
  const ogBase = path.join(ROOT, "scripts/assets/og-base-clean.png");
  const OG_LOGO_H = 400; // logo height on the card
  const OG_CX = 967; // horizontal center of the right-hand space
  const OG_CY = 300; // vertical center, aligned with the text block
  const ogLogo = await sharp(path.join(PUB, "mull-logo.png")).resize({ height: OG_LOGO_H }).toBuffer();
  const om = await sharp(ogLogo).metadata();
  await sharp(ogBase)
    .composite([
      {
        input: ogLogo,
        left: Math.round(OG_CX - om.width / 2),
        top: Math.round(OG_CY - om.height / 2),
      },
    ])
    .removeAlpha() // the card is fully opaque; OG scrapers prefer no alpha
    .png()
    .toFile(path.join(PUB, "og.png"));
  console.log("wrote public/og.png (1200×630 social card)");

  console.log("\nMullMark aspect ratio (width/height):", (width / height).toFixed(4));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
