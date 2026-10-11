/**
 * Deterministic seed for the hand-drawn tarot spread.
 * The deck order and the reversals come from the question, the topic and the local time to the minute.
 * The same inputs in the same minute give the same deck. The user's clicks then choose the cards.
 * This is a ritual design. It does not make a reading more accurate.
 */

export const SEED_VERSION = "draw-v1";
const TRIGRAMS = ["☰", "☱", "☲", "☳", "☴", "☵", "☶", "☷"];

export type SeededCard = { num: number; reversed: boolean };
export type DrawSeed = { stamp: string; sigil: string; deck: SeededCard[]; rand: () => number };

/** Make visually equal questions give the same seed (full-width forms, extra spaces). */
export function normalizeQuestion(q: string): string {
  return q.normalize("NFKC").replace(/\s+/g, " ").trim();
}

/** Local time to the minute, e.g. "2026-10-11 16:32". */
export function minuteStamp(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** cyrb128 string hash: four 32-bit words, made to seed sfc32. */
function cyrb128(str: string): [number, number, number, number] {
  let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
  for (let i = 0; i < str.length; i++) {
    const k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  h1 ^= h2 ^ h3 ^ h4;
  h2 ^= h1;
  h3 ^= h1;
  h4 ^= h1;
  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
}

/** sfc32 PRNG. Returns unsigned 32-bit integers. */
function sfc32(a: number, b: number, c: number, d: number): () => number {
  return () => {
    a |= 0; b |= 0; c |= 0; d |= 0;
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return t >>> 0;
  };
}

/** Uniform integer in [0, n) without modulo bias. */
export function seededInt(next: () => number, n: number): number {
  const limit = Math.floor(0x1_0000_0000 / n) * n;
  let x = next();
  while (x >= limit) x = next();
  return x % n;
}

export function drawSeed(question: string, topic: string, at: Date, size = 22): DrawSeed {
  const stamp = minuteStamp(at);
  const words = cyrb128([SEED_VERSION, normalizeQuestion(question), topic, stamp].join("\n"));
  const next = sfc32(...words);
  for (let i = 0; i < 12; i++) next();
  const nums = Array.from({ length: size }, (_, i) => i);
  for (let i = size - 1; i > 0; i--) {
    const j = seededInt(next, i + 1);
    [nums[i], nums[j]] = [nums[j]!, nums[i]!];
  }
  const deck = nums.map((num) => ({ num, reversed: seededInt(next, 2) === 1 }));
  const sigil = words.map((w) => TRIGRAMS[w >>> 29]!).join("");
  return { stamp, sigil, deck, rand: () => next() / 0x1_0000_0000 };
}
