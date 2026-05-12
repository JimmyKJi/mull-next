// Shared helper for .mjs scripts to load the canonical archetype
// targets from lib/archetype-targets.ts.
//
// Why this helper exists: TS modules can't be `import`-ed from .mjs
// without a build step or runtime transpiler. To avoid duplicating
// the archetype-target values across multiple .mjs scripts (which
// is exactly what we're trying to stop with lib/archetype-targets.ts
// in the first place), we parse the file's array literal directly.
//
// The file is JS-compatible inside the ARCHETYPE_TARGETS array body
// — no type annotations, no TS-only syntax — so we can extract the
// body and `eval` it. eval is safe here: the input is a file we
// control, not user-provided data.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..');

export async function loadArchetypeTargets() {
  const src = await readFile(join(REPO, 'lib/archetype-targets.ts'), 'utf8');
  const declMatch = src.match(/export const ARCHETYPE_TARGETS[\s\S]*?=\s*\[/);
  if (!declMatch) {
    throw new Error('Could not find ARCHETYPE_TARGETS declaration in lib/archetype-targets.ts.');
  }
  const openIdx = declMatch.index + declMatch[0].length - 1;
  let depth = 0, closeIdx = -1;
  for (let i = openIdx; i < src.length; i++) {
    if (src[i] === '[') depth++;
    else if (src[i] === ']') {
      depth--;
      if (depth === 0) { closeIdx = i; break; }
    }
  }
  if (closeIdx < 0) {
    throw new Error('Could not find closing bracket of ARCHETYPE_TARGETS array.');
  }
  const body = src.slice(openIdx, closeIdx + 1);
  // Strip trailing `as const`, which is the only TS-only syntax that
  // could appear inside the array literal section.
  const cleaned = body.replace(/\]\s*as\s+const\s*$/, ']');
  // eslint-disable-next-line no-eval
  return eval('(' + cleaned + ')');
}
