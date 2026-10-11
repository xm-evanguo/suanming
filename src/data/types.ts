/** Shared data shapes for interpretation tables. All display text is Simplified Chinese. */

export type Dim = "career" | "wealth" | "love" | "health" | "wisdom";

/** 0-100 for each life dimension. Used by the fusion summary. */
export type Scores = Record<Dim, number>;

export type WuXing = "木" | "火" | "土" | "金" | "水";

/** A full interpretation profile for one archetype (a sign, a star, a card...). */
export interface Profile {
  /** Display name, e.g. "白羊座". */
  name: string;
  /** Short poetic epithet, e.g. "燃烧的开拓者". */
  title: string;
  /** 3-6 short keywords (2-4 Chinese characters each). */
  keywords: string[];
  /** One or two sentences. */
  summary: string;
  /** 2-4 sentences about character. */
  personality: string;
  /** 1-3 sentences each. */
  career: string;
  love: string;
  health: string;
  advice: string;
  scores: Scores;
  /** Associated Chinese element, when it has a reasonable mapping. */
  element?: WuXing;
  luckyColors?: string[];
  luckyNumbers?: number[];
  /** One of: 东 南 西 北 东南 西南 东北 西北 中. */
  luckyDirection?: string;
}

/** A short entry for minor tables (tones, palace names, aspects...). */
export interface Brief {
  name: string;
  keywords: string[];
  text: string;
}
