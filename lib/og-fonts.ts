// Bundled-font loader for next/og ImageResponse. Reads .ttf files
// from /public/fonts at module load — no runtime network fetch, so
// failures we'd hit with Google Fonts on Vercel can't happen.
//
// Files (~1.7 MB total) bundle into the serverless function on
// deploy; cold-start cost is one fs.readFile per font (~5–10ms).
// Module-level cache means warm instances reuse the bytes.

import { readFile } from 'node:fs/promises';
import path from 'node:path';

type FontEntry = {
  name: string;
  data: Buffer;
  weight: 400 | 500 | 600 | 700;
  style: 'normal' | 'italic';
};

let cache: FontEntry[] | null = null;

export async function loadOGFonts(): Promise<FontEntry[]> {
  if (cache) return cache;

  const dir = path.join(process.cwd(), 'public', 'fonts');
  try {
    const [cormorant, cormorantItalic, inter, interBold] = await Promise.all([
      readFile(path.join(dir, 'CormorantGaramond-Medium.ttf')),
      readFile(path.join(dir, 'CormorantGaramond-MediumItalic.ttf')),
      readFile(path.join(dir, 'Inter-Regular.ttf')),
      readFile(path.join(dir, 'Inter-SemiBold.ttf')),
    ]);

    cache = [
      { name: 'Cormorant', data: cormorant, weight: 500, style: 'normal' },
      { name: 'Cormorant', data: cormorantItalic, weight: 500, style: 'italic' },
      { name: 'Inter', data: inter, weight: 400, style: 'normal' },
      { name: 'Inter', data: interBold, weight: 600, style: 'normal' },
    ];
    return cache;
  } catch (e) {
    console.warn('[og-fonts] readFile failed; rendering will use Satori defaults:', e);
    cache = [];
    return cache;
  }
}

// Convert one of the FIGURES SVG strings into a data URI we can drop
// into an <img src=...> inside the OG card. Satori parses SVG inside
// img tags reliably, where direct <svg> JSX is finicky.
export function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
