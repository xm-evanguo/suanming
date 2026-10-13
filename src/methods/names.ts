import { pick } from "../i18n";
import type { MethodId } from "./types";

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
