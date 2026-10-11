import { WU_XING } from "../data/bazi";
import type { Dim, Scores, WuXing } from "../data/types";
import type { BaziVisual } from "./bazi";
import type { MethodResult } from "./types";

export const DIM_NAMES: Record<Dim, string> = { career: "事业", wealth: "财富", love: "感情", health: "健康", wisdom: "智慧" };
export const DIMS = Object.keys(DIM_NAMES) as Dim[];

export interface Fusion {
  scores: Scores;
  overall: number;
  strongest: Dim;
  weakest: Dim;
  /** How many methods rank each dimension as their own top one. */
  topVotes: Record<Dim, number>;
  elements: Record<WuXing, number>;
  dominantElement: WuXing;
  weakElement: WuXing;
  keywords: { word: string; from: string }[];
  lucky: { colors: string[]; numbers: number[]; directions: string[] };
  oracle: string[];
  outlook: { from: string; text: string }[];
}

function topByCount<T>(items: T[], n: number): T[] {
  const count = new Map<T, number>();
  for (const it of items) count.set(it, (count.get(it) ?? 0) + 1);
  return [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k);
}

const WEST_TO_WX: Record<string, WuXing> = { 火: "火", 土: "土", 风: "金", 水: "水" };

export function fuse(results: MethodResult[]): Fusion {
  const by = Object.fromEntries(results.map((r) => [r.id, r])) as Record<string, MethodResult>;
  const scores = Object.fromEntries(
    DIMS.map((d) => [d, Math.round(results.reduce((s, r) => s + r.scores[d], 0) / results.length)]),
  ) as Scores;
  const overall = Math.round(DIMS.reduce((s, d) => s + scores[d], 0) / DIMS.length);
  const strongest = DIMS.reduce((a, b) => (scores[a] >= scores[b] ? a : b));
  const weakest = DIMS.reduce((a, b) => (scores[a] <= scores[b] ? a : b));
  const topVotes = Object.fromEntries(DIMS.map((d) => [d, 0])) as Record<Dim, number>;
  for (const r of results) topVotes[DIMS.reduce((a, b) => (r.scores[a] >= r.scores[b] ? a : b))] += 1;

  // Element votes: the 八字 distribution counts as 4 votes, the western element balance as 2, every method's own element as 1.
  const elements: Record<WuXing, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  const bz = by.bazi?.visual as BaziVisual | undefined;
  if (bz) for (const w of Object.keys(elements) as WuXing[]) elements[w] += (bz.wuxing[w] / 100) * 4;
  const west = (by.astrology?.visual as { elements?: Record<string, number> } | undefined)?.elements;
  if (west) {
    const total = Object.values(west).reduce((a, b) => a + b, 0) || 1;
    for (const [k, v] of Object.entries(west)) elements[WEST_TO_WX[k]!] += (v / total) * 2;
  }
  for (const r of results) if (r.element) elements[r.element] += 1;
  const sum = Object.values(elements).reduce((a, b) => a + b, 0);
  for (const w of Object.keys(elements) as WuXing[]) elements[w] = Math.round((elements[w] / sum) * 100);
  const wxKeys = Object.keys(elements) as WuXing[];
  const dominantElement = wxKeys.reduce((a, b) => (elements[a] >= elements[b] ? a : b));
  const weakElement = wxKeys.reduce((a, b) => (elements[a] <= elements[b] ? a : b));

  const seen = new Set<string>();
  const keywords: Fusion["keywords"] = [];
  for (const r of results)
    for (const w of r.keywords)
      if (!seen.has(w)) {
        seen.add(w);
        keywords.push({ word: w, from: r.name });
        break;
      }

  const lucky = {
    colors: topByCount([...WU_XING[weakElement].colors, ...results.flatMap((r) => r.lucky.colors)].map((c) => c.replace(/色$/, "")), 4),
    numbers: topByCount(results.flatMap((r) => r.lucky.numbers).filter((n) => n > 0 && n < 100), 4),
    directions: topByCount(results.flatMap((r) => r.lucky.directions).filter((d) => d !== "中宫"), 2),
  };

  const t = (id: string) => by[id]?.tagline ?? "";
  const h = (id: string) => by[id]?.headline ?? "";
  const oracle = [
    `在东方的命盘里，你是「${h("bazi")}」——${t("bazi")}；紫微星盘说你${h("ziwei")}，梅花易数为你起出${h("meihua")}。`,
    `在西方的星空下，你是${h("astrology")}，${t("astrology")}；数字称你为「${t("numerology")}」，塔罗为你翻开${h("tarot")}。`,
    `日本的星宿认你为${h("sukuyo")}、${h("kyusei")}；恒河畔的占星师看见你的${h("vedic")}，玛雅祭司则唤你「${t("maya")}」。`,
    `${results.length} 种体系的平均画像中，「${DIM_NAMES[strongest]}」最为闪耀（${scores[strongest]} 分，${topVotes[strongest]} 种体系视其为你的首要天赋），「${DIM_NAMES[weakest]}」是此生最值得经营的课题。五行能量以「${dominantElement}」最盛、「${weakElement}」最弱——${WU_XING[weakElement].lackText}`,
  ];

  const outlook: Fusion["outlook"] = [];
  const addFact = (id: string, labelIncludes: string) => {
    const f = by[id]?.facts.find((x) => x.label.includes(labelIncludes));
    if (f) outlook.push({ from: by[id]!.name, text: `${f.label}：${f.value}` });
  };
  addFact("bazi", "太岁");
  addFact("kyusei", "年盘");
  addFact("tarot", "年度牌");
  addFact("numerology", "个人流年");
  addFact("vedic", "当前大运");
  const dy = by.bazi?.sections.find((s) => s.title === "大运流转");
  if (dy) outlook.push({ from: "生辰八字", text: dy.body.split("。")[0] ?? "" });

  return { scores, overall, strongest, weakest, topVotes, elements, dominantElement, weakElement, keywords, lucky, oracle, outlook };
}
