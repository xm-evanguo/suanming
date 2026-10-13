import { pick } from "../i18n";
import type { Chart } from "../core/chart";
import { astrology } from "./astrology";
import { bazi } from "./bazi";
import { chaldean } from "./chaldean";
import { chenggu } from "./chenggu";
import { firdaria } from "./firdaria";
import { hellenistic } from "./hellenistic";
import { kyusei } from "./kyusei";
import { maya } from "./maya";
import { meihua } from "./meihua";
import { numerology } from "./numerology";
import { sukuyo } from "./sukuyo";
import { tarot } from "./tarot";
import type { MethodFn, MethodId, MethodResult } from "./types";
import { vedic } from "./vedic";
import { ziwei } from "./ziwei";

export const METHODS: Record<MethodId, MethodFn> = {
  bazi,
  ziwei,
  chenggu,
  meihua,
  kyusei,
  sukuyo,
  astrology,
  hellenistic,
  chaldean,
  firdaria,
  tarot,
  numerology,
  vedic,
  maya,
};

export const METHOD_ORDER = Object.keys(METHODS) as MethodId[];

export const METHOD_NAMES: Record<MethodId, string> = {
  bazi: "生辰八字", ziwei: "紫微斗数", chenggu: "袁天罡称骨", meihua: "梅花易数",
  kyusei: "九星気学", sukuyo: "宿曜占星", astrology: "西洋占星", hellenistic: "希腊化占星",
  chaldean: "迦勒底七曜", firdaria: "波斯法达", tarot: "塔罗牌", numerology: "生命灵数",
  vedic: "吠陀占星", maya: "玛雅历",
};

export const METHOD_NAMES_EN: Record<MethodId, string> = {
  bazi: "Four Pillars (BaZi)", ziwei: "Zi Wei Dou Shu", chenggu: "Bone Weighing", meihua: "Plum Blossom I Ching",
  kyusei: "Nine Star Ki", sukuyo: "Sukuyō Lunar Mansions", astrology: "Western Astrology", hellenistic: "Hellenistic Astrology",
  chaldean: "Chaldean Days and Hours", firdaria: "Persian Firdaria", tarot: "Tarot", numerology: "Numerology",
  vedic: "Vedic Nakshatra", maya: "Maya Tzolk'in",
};

/** A system's display name in the current language. */
export const methodName = (id: MethodId) => pick(METHOD_NAMES, METHOD_NAMES_EN)[id];

export function runAll(chart: Chart): MethodResult[] {
  return METHOD_ORDER.map((id) => METHODS[id](chart));
}
