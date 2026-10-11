import { astro } from "iztro";
import { WU_XING } from "../data/bazi";
import { EMPTY_SOUL_TEXT, MAJOR_STARS, MUTAGEN, PALACE_INFO } from "../data/ziwei";
import type { WuXing } from "../data/types";
import { type MethodFn, mixScores, UNKNOWN_TIME_NOTE } from "./types";

export interface ZiweiPalace {
  name: string;
  stem: string;
  branch: string;
  major: { name: string; brightness: string; mutagen: string }[];
  minor: string[];
  isBody: boolean;
  decadal: string;
}

export interface ZiweiVisual {
  palaces: ZiweiPalace[];
  center: { label: string; value: string }[];
  soulBranch: string;
}

/** iztro time index: 0 = early 子 (00-01), 1 = 丑 ... 11 = 亥, 12 = late 子 (23-24). */
export const ziweiTimeIndex = (h: number) => (h === 23 ? 12 : Math.floor((h + 1) / 2));

export const ziwei: MethodFn<ZiweiVisual> = (chart) => {
  const t = chart.cnTime;
  const a = astro.bySolar(`${t.y}-${t.m}-${t.d}`, ziweiTimeIndex(t.h), chart.input.gender === "male" ? "男" : "女", true, "zh-CN");

  const palaces: ZiweiPalace[] = a.palaces.map((p) => ({
    name: p.name,
    stem: p.heavenlyStem,
    branch: p.earthlyBranch,
    major: p.majorStars.map((s) => ({ name: s.name, brightness: s.brightness ?? "", mutagen: s.mutagen ?? "" })),
    minor: p.minorStars.map((s) => s.name),
    isBody: p.isBodyPalace,
    decadal: `${p.decadal.range[0]}-${p.decadal.range[1]}`,
  }));
  const byName = (n: string) => palaces.find((p) => p.name === n)!;
  const soul = byName("命宫");
  // A palace without major stars borrows the stars of its opposite palace (迁移).
  const borrowed = soul.major.length === 0;
  const soulStars = (borrowed ? byName("迁移") : soul).major.filter((s) => s.name in MAJOR_STARS);
  const starInfo = soulStars.map((s) => MAJOR_STARS[s.name]!);
  const scores = starInfo.length ? mixScores(starInfo.map((s) => [s.scores, 1])) : { career: 60, wealth: 60, love: 60, health: 60, wisdom: 60 };
  const element = (a.fiveElementsClass as string).charAt(0) as WuXing;

  const mutagens = palaces.flatMap((p) => p.major.filter((s) => s.mutagen).map((s) => ({ star: s.name, mutagen: s.mutagen, palace: p.name })));
  const palaceLine = (n: string) => {
    const p = byName(n);
    const stars = p.major.map((s) => s.name).join("、") || "无主星";
    return `${n}（${p.stem}${p.branch}）坐 ${stars}：${PALACE_INFO[n] ?? ""}`;
  };
  const starNames = soulStars.map((s) => s.name).join("、") || "无";

  return {
    id: "ziwei",
    name: "紫微斗数",
    intro: "以紫微星为首的百余颗星曜排入十二宫，观命宫主星与四化飞星。",
    origin: "中国",
    icon: "✶",
    headline: `命宫${borrowed ? "借" : "坐"}「${starNames}」`,
    tagline: `${a.fiveElementsClass} · 命主${a.soul} · 身主${a.body}`,
    keywords: starInfo.flatMap((s) => s.keywords).slice(0, 5),
    scores,
    element,
    lucky: { colors: WU_XING[element].colors, numbers: WU_XING[element].numbers, directions: [WU_XING[element].direction] },
    facts: [
      { label: "农历", value: a.lunarDate },
      { label: "命宫", value: `${soul.stem}${soul.branch}宫 · ${starNames}` },
      { label: "身宫", value: palaces.find((p) => p.isBody)?.name ?? "" },
      { label: "五行局", value: a.fiveElementsClass },
      { label: "四化", value: mutagens.map((m) => `${m.star}化${m.mutagen}`).join(" ") },
    ],
    sections: [
      {
        title: "命宫主星",
        body: (borrowed ? EMPTY_SOUL_TEXT : "") + starInfo.map((s) => `【${s.name}】${s.text}`).join(""),
      },
      {
        title: "四化飞星",
        body: mutagens.map((m) => `${m.star}化${m.mutagen}入${m.palace}：${MUTAGEN[m.mutagen as keyof typeof MUTAGEN]?.text ?? ""}`).join(""),
      },
      { title: "事业与财帛", body: `${palaceLine("官禄")}${palaceLine("财帛")}` },
      { title: "夫妻与福德", body: `${palaceLine("夫妻")}${palaceLine("福德")}` },
      { title: "疾厄与迁移", body: `${palaceLine("疾厄")}${palaceLine("迁移")}` },
    ],
    caveats: [
      ...(chart.input.timeKnown ? [] : [UNKNOWN_TIME_NOTE]),
      "紫微斗数对时辰极为敏感，时辰相差一格，命盘即完全不同。",
    ],
    visual: {
      palaces,
      soulBranch: soul.branch,
      center: [
        { label: "阳历", value: a.solarDate },
        { label: "农历", value: a.lunarDate },
        { label: "八字", value: a.chineseDate },
        { label: "五行局", value: a.fiveElementsClass },
        { label: "命主 / 身主", value: `${a.soul} / ${a.body}` },
        { label: "生肖 / 星座", value: `${a.zodiac} / ${a.sign}` },
      ],
    },
  };
};
