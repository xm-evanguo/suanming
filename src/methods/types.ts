import type { Chart } from "../core/chart";
import type { Scores, WuXing } from "../data/types";

export type MethodId =
  | "bazi"
  | "ziwei"
  | "chenggu"
  | "meihua"
  | "shengxiao"
  | "kyusei"
  | "sukuyo"
  | "astrology"
  | "tarot"
  | "numerology"
  | "vedic"
  | "maya";

export type Origin = "中国" | "日本" | "西方" | "印度" | "玛雅";

export interface Fact {
  label: string;
  value: string;
}

export interface Section {
  title: string;
  body: string;
}

export interface MethodResult<V = unknown> {
  id: MethodId;
  name: string;
  /** One-line description of the system. */
  intro: string;
  origin: Origin;
  icon: string;
  /** The main verdict, e.g. "庚金日主 · 身弱". */
  headline: string;
  /** A short poetic phrase. */
  tagline: string;
  keywords: string[];
  scores: Scores;
  element?: WuXing;
  lucky: { colors: string[]; numbers: number[]; directions: string[] };
  /** Computed technical values, shown during the calculation ritual and on the page. */
  facts: Fact[];
  sections: Section[];
  /** Notes on approximations (unknown birth time, school differences...). */
  caveats: string[];
  visual: V;
}

export type MethodFn<V = unknown> = (chart: Chart) => MethodResult<V>;

export const clampScore = (n: number) => Math.max(10, Math.min(99, Math.round(n)));

export function mixScores(parts: [Scores, number][]): Scores {
  const out: Scores = { career: 0, wealth: 0, love: 0, health: 0, wisdom: 0 };
  const total = parts.reduce((s, [, w]) => s + w, 0);
  for (const [sc, w] of parts) for (const k of Object.keys(out) as (keyof Scores)[]) out[k] += (sc[k] * w) / total;
  for (const k of Object.keys(out) as (keyof Scores)[]) out[k] = clampScore(out[k]);
  return out;
}

export function shiftScores(s: Scores, delta: Partial<Scores>): Scores {
  const out = { ...s };
  for (const [k, v] of Object.entries(delta) as [keyof Scores, number][]) out[k] = clampScore(out[k] + v);
  return out;
}

export const UNKNOWN_TIME_NOTE = "未提供准确出生时间，按正午 12:00 推算；与时辰相关的部分仅供参考。";
