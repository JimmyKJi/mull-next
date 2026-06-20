// Arena philosopher voice — Haiku call to generate the opponent's
// next turn given the transcript so far.
//
// Uses Claude Haiku (claude-haiku-4-5 if available; fallback
// claude-3-5-haiku-20241022) — cheap per turn (~$0.005) and quick.
// The voice fingerprint is what gives character; Haiku is fine for
// staying in voice once primed.
//
// Anthropic prompt caching is used: the system prompt (voice +
// topic) is marked as cacheable so subsequent turns in the same
// debate hit the cache. ~90% off cached input tokens.

import { getArenaPhilosopher, getArenaTopic, type ArenaPhilosopher } from './data';
import { LOCALE_FOR_PROMPT, type Locale } from '../translations';

type AnthropicMessage = {
  role: 'user' | 'assistant';
  content: string | Array<{ type: 'text'; text: string; cache_control?: { type: 'ephemeral' } }>;
};

type AnthropicSystemBlock = {
  type: 'text';
  text: string;
  cache_control?: { type: 'ephemeral' };
};

type AnthropicResponse = {
  content?: Array<{ type: string; text?: string }>;
  error?: { message?: string; type?: string };
};

const HAIKU_MODEL = 'claude-haiku-4-5';

export type VoiceTurn = {
  speaker: 'user' | 'opponent';
  content: string;
};

/** Generate the opponent's next turn. */
export async function generatePhilosopherTurn(args: {
  philosopher: ArenaPhilosopher;
  topicPrompt: string;
  transcript: VoiceTurn[];
  /** Optional: cap on response length (in characters). Defaults to
   *  ~1500 chars — keeps debates tight + bounds cost. */
  maxChars?: number;
  /** Optional: language for the response. Defaults to English (Arena
   *  default). When non-English, the philosopher stays in voice but
   *  writes in this language. */
  locale?: Locale;
}): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('[arena] missing ANTHROPIC_API_KEY');
    return null;
  }

  const maxChars = args.maxChars ?? 1500;

  const systemBlocks: AnthropicSystemBlock[] = [
    {
      type: 'text',
      text: buildSystem(args.philosopher, args.topicPrompt, maxChars, args.locale ?? 'en'),
      cache_control: { type: 'ephemeral' }, // cache the voice + topic
    },
  ];

  // Build conversation history. Map: user turns → user role,
  // opponent turns → assistant role (so Haiku continues "as" the
  // opponent naturally).
  const messages: AnthropicMessage[] = args.transcript.map((t) => ({
    role: t.speaker === 'user' ? 'user' : 'assistant',
    content: t.content,
  }));

  // If the last message is from the opponent (assistant), add a
  // nudge from the user side asking for next response. Should never
  // happen in normal flow but guards against malformed input.
  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
    messages.push({
      role: 'user',
      content: '(Your turn. Respond now.)',
    });
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'prompt-caching-2024-07-31',
    },
    body: JSON.stringify({
      model: HAIKU_MODEL,
      max_tokens: 600,
      system: systemBlocks,
      messages,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('[arena] Haiku error', res.status, errText);
    return null;
  }
  const data: AnthropicResponse = await res.json();
  if (data.error) {
    console.error('[arena] Haiku returned error', data.error);
    return null;
  }
  const text = data.content?.find((c) => c.type === 'text')?.text;
  if (!text || !text.trim()) return null;
  return text.trim();
}

function buildSystem(
  p: ArenaPhilosopher,
  topicPrompt: string,
  maxChars: number,
  locale: Locale,
): string {
  const languageDirective =
    locale !== 'en' && LOCALE_FOR_PROMPT[locale]
      ? `\n- Write your entire response in ${LOCALE_FOR_PROMPT[locale]}. Stay fully in ${p.name}'s voice while writing in that language — do not include any English.`
      : '';
  return `${p.voice}

You are in a structured debate. The topic is:

"${topicPrompt}"

Your opponent (a real person) will state their view. You will respond as ${p.name} would — pressing where they're weak, conceding where they're right, advancing your own view through engagement with theirs.

Rules of the format:
- Keep each turn under ${maxChars} characters. Brevity sharpens.
- Address the opponent's specific moves directly. Don't restate your position; advance the dialogue.
- Stay in voice. ${p.name} doesn't break character.
- This is one of several turns — don't wrap up the whole question in one response. Make one or two clean moves, then let them respond.${languageDirective}

Do not preface your response with your name or "Response:". Just respond.`;
}

/** Convenience: same call but supplying the philosopher + topic by
 *  slug — looked up from the seed data. */
export async function generateByName(args: {
  philosopherName: string;
  topicSlug: string;
  transcript: VoiceTurn[];
}): Promise<string | null> {
  const p = getArenaPhilosopher(args.philosopherName);
  const t = getArenaTopic(args.topicSlug);
  if (!p || !t) return null;
  return generatePhilosopherTurn({
    philosopher: p,
    topicPrompt: t.prompt,
    transcript: args.transcript,
  });
}
