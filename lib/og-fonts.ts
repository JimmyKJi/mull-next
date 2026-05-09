// Font loader for next/og ImageResponse. Fetches Google Fonts woff
// files at runtime, then caches them at the module level so warm
// serverless instances reuse the bytes for subsequent OG renders.
//
// Why Google Fonts via HTTP instead of bundling .ttf files in /public:
//   - Bundling forces the woff bytes into the serverless function
//     bundle, bloating every cold start.
//   - The CSS API hands us only the glyphs Latin-1 commonly needs,
//     keeping the fetch under ~50KB.
//
// The tiny User-Agent dance is required: without a real-looking UA
// string Google returns the woff2-only stylesheet, which Satori
// can't decode.

const CACHE: Record<string, ArrayBuffer> = {};

async function fetchFont(family: string, weight: number, italic: boolean): Promise<ArrayBuffer | null> {
  const cacheKey = `${family}:${weight}:${italic ? 'i' : 'n'}`;
  if (CACHE[cacheKey]) return CACHE[cacheKey];

  const familyParam = family.replace(/ /g, '+');
  // ital,wght@0,500 vs ital,wght@1,400 axis specs — Google's CSS2 API.
  const ital = italic ? '1' : '0';
  const cssUrl = `https://fonts.googleapis.com/css2?family=${familyParam}:ital,wght@${ital},${weight}&display=swap`;

  try {
    const cssRes = await fetch(cssUrl, {
      // Old-IE UA → Google returns truetype URLs Satori can read,
      // not the modern woff2 bytecode it can't.
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:36.0) Gecko/20100101 Firefox/36.0' },
    });
    if (!cssRes.ok) return null;
    const css = await cssRes.text();
    const match = css.match(/src:\s*url\(([^)]+)\)\s*format\(['"]?truetype['"]?\)/);
    if (!match) return null;
    const fontRes = await fetch(match[1]);
    if (!fontRes.ok) return null;
    const buf = await fontRes.arrayBuffer();
    CACHE[cacheKey] = buf;
    return buf;
  } catch (e) {
    console.warn(`[og-fonts] failed to load ${cacheKey}:`, e);
    return null;
  }
}

// Load the four fonts every Mull OG image needs. Returns an array shaped
// for ImageResponse's `fonts` option. Failed fetches drop silently —
// Satori falls back to system fonts for the missing weights.
export async function loadOGFonts(): Promise<Array<{
  name: string;
  data: ArrayBuffer;
  weight: 400 | 500 | 600 | 700;
  style: 'normal' | 'italic';
}>> {
  const [serifReg, serifItalic, sansReg, sansBold] = await Promise.all([
    fetchFont('Cormorant Garamond', 500, false),
    fetchFont('Cormorant Garamond', 500, true),
    fetchFont('Inter', 400, false),
    fetchFont('Inter', 600, false),
  ]);

  const fonts: Array<{
    name: string; data: ArrayBuffer;
    weight: 400 | 500 | 600 | 700; style: 'normal' | 'italic';
  }> = [];
  if (serifReg) fonts.push({ name: 'Cormorant', data: serifReg, weight: 500, style: 'normal' });
  if (serifItalic) fonts.push({ name: 'Cormorant', data: serifItalic, weight: 500, style: 'italic' });
  if (sansReg) fonts.push({ name: 'Inter', data: sansReg, weight: 400, style: 'normal' });
  if (sansBold) fonts.push({ name: 'Inter', data: sansBold, weight: 600, style: 'normal' });
  return fonts;
}
