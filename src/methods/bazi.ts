import { generatedBy, ganWuXing, WUXING, wxRelation } from "../core/ganzhi";
import { DAY_MASTERS, SHI_SHEN, WU_XING } from "../data/bazi";
import { PLAIN_DAY_MASTER, PLAIN_DAYUN, PLAIN_ELEMENT_HELP, PLAIN_EXCESS, PLAIN_LACK, PLAIN_SHISHEN, PLAIN_TAISUI } from "../data/plain-bazi";
import { SHENG_XIAO } from "../data/shengxiao";
import type { WuXing } from "../data/types";
import { type ShengxiaoVisual, zodiacInfo } from "./shengxiao";
import { type MethodFn, shiftScores, UNKNOWN_TIME_NOTE } from "./types";

export interface Pillar {
  label: string;
  gan: string;
  zhi: string;
  ganGod: string;
  hidden: { gan: string; god: string }[];
  nayin: string;
}

export interface BaziVisual {
  pillars: Pillar[];
  dayGan: string;
  /** Percent share of each element, weighted. */
  wuxing: Record<WuXing, number>;
  strong: boolean;
  selfShare: number;
  favorable: WuXing[];
  dayun: { ganzhi: string; startAge: number; startYear: number; endYear: number }[];
  startYun: string;
  zodiac: ShengxiaoVisual;
}

const HIDDEN_WEIGHTS: Record<number, number[]> = { 1: [1], 2: [0.7, 0.3], 3: [0.6, 0.3, 0.1] };

export const bazi: MethodFn<BaziVisual> = (chart) => {
  const ec = chart.eightChar;
  const keys = ["Year", "Month", "Day", "Time"] as const;
  const labels = ["年柱", "月柱", "日柱", "时柱"];
  const pillars: Pillar[] = keys.map((k, i) => {
    const hideGan: string[] = ec[`get${k}HideGan`]();
    const zhiGods: string[] = ec[`get${k}ShiShenZhi`]();
    return {
      label: labels[i]!,
      gan: ec[`get${k}Gan`](),
      zhi: ec[`get${k}Zhi`](),
      ganGod: k === "Day" ? "日主" : ec[`get${k}ShiShenGan`](),
      hidden: hideGan.map((g, j) => ({ gan: g, god: zhiGods[j] ?? "" })),
      nayin: ec[`get${k}NaYin`](),
    };
  });

  // Element strength: each stem counts 1, each branch spreads 1 over its hidden stems; the month branch (月令) counts 1.5x.
  const raw: Record<WuXing, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  pillars.forEach((p, i) => {
    raw[ganWuXing(p.gan)] += 1;
    const w = HIDDEN_WEIGHTS[p.hidden.length] ?? [1];
    const factor = i === 1 ? 1.5 : 1;
    p.hidden.forEach((h, j) => {
      raw[ganWuXing(h.gan)] += (w[j] ?? 0) * factor;
    });
  });
  const total = Object.values(raw).reduce((a, b) => a + b, 0);
  const wuxing = Object.fromEntries(WUXING.map((w) => [w, Math.round((raw[w] / total) * 100)])) as Record<WuXing, number>;

  const dayGan = pillars[2]!.gan;
  const self = ganWuXing(dayGan);
  const selfShare = wuxing[self] + wuxing[generatedBy(self)];
  const strong = selfShare >= 45;
  // Simplified 喜用神: a strong day master wants to be drained or controlled; a weak one wants support.
  const candidates = WUXING.filter((w) => {
    const rel = wxRelation(self, w);
    return strong ? rel === "我生" || rel === "我克" || rel === "克我" : rel === "同" || rel === "生我";
  });
  const favorable = [...candidates].sort((a, b) => wuxing[a] - wuxing[b]).slice(0, 2);

  const yun = ec.getYun(chart.input.gender === "male" ? 1 : 0);
  const dayun = yun
    .getDaYun()
    .slice(1, 9)
    // biome-ignore lint: untyped library objects
    .map((d: any) => ({ ganzhi: d.getGanZhi(), startAge: d.getStartAge(), startYear: d.getStartYear(), endYear: d.getEndYear() }));
  const startYun = `出生后 ${yun.getStartYear()} 年 ${yun.getStartMonth()} 个月 ${yun.getStartDay()} 天起运`;

  const dm = DAY_MASTERS[dayGan as keyof typeof DAY_MASTERS];
  const godCount: Record<string, number> = {};
  for (const p of pillars) {
    if (p.ganGod !== "日主") godCount[p.ganGod] = (godCount[p.ganGod] ?? 0) + 1;
    for (const h of p.hidden) godCount[h.god] = (godCount[h.god] ?? 0) + 0.5;
  }
  const topGods = Object.entries(godCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([g]) => g);

  const share = (rel: string) => WUXING.filter((w) => wxRelation(self, w) === rel).reduce((s, w) => s + wuxing[w], 0);
  const scores = shiftScores(dm.scores, {
    wealth: share("我克") >= 20 ? 6 : share("我克") === 0 ? -6 : 0,
    career: share("克我") >= 15 ? 5 : 0,
    wisdom: share("生我") >= 20 ? 5 : 0,
    love: share("我生") >= 20 ? 4 : 0,
    health: -Math.round((Math.max(...Object.values(wuxing)) - 20) / 4),
  });

  const missing = WUXING.filter((w) => wuxing[w] === 0);
  const maxWx = WUXING.reduce((a, b) => (wuxing[a] >= wuxing[b] ? a : b));
  const fav = favorable.map((w) => WU_XING[w]);
  const now = new Date().getFullYear();
  const zodiac = zodiacInfo(chart);
  const currentYun = dayun.find((d: { startYear: number; endYear: number }) => now >= d.startYear && now <= d.endYear);

  // Plain reading: same computed values, everyday wording.
  const pdm = PLAIN_DAY_MASTER[dayGan]!;
  const animal = SHENG_XIAO[zodiac.visual.index]!;
  const animalName = (i: number) => SHENG_XIAO[i]!.name;
  const friends = zodiac.visual.sanhe.filter((i) => i !== zodiac.visual.index).map(animalName).join("、");
  const taisui = PLAIN_TAISUI[zodiac.visual.thisYear.relation] ?? "";
  const wealthShare = share("我克");
  const workMoney =
    wealthShare >= 20
      ? "你对赚钱的机会比较敏感，抓得住就能有收获。"
      : wealthShare === 0
        ? "赚钱不是你天生最敏感的一块，靠专业技能慢慢积累，比追机会更稳。"
        : "钱的方面，稳扎稳打比押注更适合你。";
  const firstSentence = (t: string) => (t.includes("。") ? `${t.slice(0, t.indexOf("。"))}。` : t);
  const helpLines = favorable.slice(0, 2).map((w) => PLAIN_ELEMENT_HELP[w]);
  const phase = currentYun ? PLAIN_DAYUN[wxRelation(self, ganWuXing(currentYun.ganzhi.charAt(0)))] : "";
  const energyLine = strong
    ? "你自身的力量很足，不缺主见和底气，更需要的是找到出口，把力气用在事业、表达和责任上。"
    : "你自身的力量偏弱，单打独斗容易累，有团队、长辈或好导师的支持，你会走得更稳。";
  const balanceLine =
    wuxing[maxWx] >= 30 ? PLAIN_EXCESS[maxWx] : missing.length ? "" : "你身上各种特质比较均衡，没有哪一块特别突出或缺失，这让你比较能适应不同环境。";

  return {
    id: "bazi",
    name: "生辰八字",
    intro: "以出生的年、月、日、时排出四柱天干地支，观五行生克与十神格局。",
    origin: "中国",
    icon: "☯",
    headline: `${dayGan}${self}日主 · ${strong ? "身强" : "身弱"}`,
    tagline: `${dm.image}，${dm.title}`,
    keywords: dm.keywords,
    scores,
    element: self,
    lucky: {
      colors: fav.flatMap((f) => f.colors).slice(0, 3),
      numbers: fav.flatMap((f) => f.numbers).slice(0, 4),
      directions: fav.map((f) => f.direction),
    },
    facts: [
      { label: "四柱", value: pillars.map((p) => p.gan + p.zhi).join(" ") },
      { label: "日主", value: `${dayGan}（${dm.yinYang}${self}）` },
      { label: "五行分布", value: WUXING.map((w) => `${w}${wuxing[w]}%`).join(" ") },
      { label: "喜用参考", value: favorable.join("、") },
      { label: "起运", value: startYun },
      ...zodiac.facts,
    ],
    sections: [
      { title: "日主本相", body: `${dm.summary}${dm.personality}` },
      ...zodiac.sections,
      {
        title: "五行格局",
        body:
          `你的命局中「${maxWx}」最旺，占 ${wuxing[maxWx]}%。${WU_XING[maxWx].excessText}` +
          (missing.length ? `命局缺「${missing.join("、")}」：${missing.map((m) => WU_XING[m].lackText).join("")}` : "五行俱全，根基较为周全。") +
          `日主同党（比劫与印）合计约 ${selfShare}%，判为${strong ? "身强" : "身弱"}，宜取「${favorable.join("、")}」为喜用。`,
      },
      {
        title: "十神透视",
        body: topGods.map((g) => `「${g}」较显：${SHI_SHEN[g as keyof typeof SHI_SHEN]?.text ?? ""}`).join(""),
      },
      { title: "事业财运", body: dm.career },
      { title: "感情姻缘", body: dm.love },
      { title: "健康调养", body: `${dm.health}喜用「${favorable[0]}」，可多接触${fav[0]?.colors.join("、")}色调，朝向${fav[0]?.direction}方。` },
      {
        title: "大运流转",
        body: currentYun
          ? `${now} 年你正行「${currentYun.ganzhi}」大运（${currentYun.startYear}–${currentYun.endYear}）。${dm.advice}`
          : dm.advice,
      },
    ],
    plain: {
      summary:
        `你像${pdm.image}。${energyLine}` +
        `你属${animal.name}，${animal.summary.replace(/^属.的你/, "").replace(/^，/, "")}`,
      sections: [
        { title: "你是怎样的人", body: `${pdm.who}属${animal.name}的你，${firstSentence(animal.personality).replace(/^你/, "")}${topGods.map((g) => firstSentence(PLAIN_SHISHEN[g] ?? "")).join("")}` },
        { title: "适合做什么", body: `${pdm.work}${workMoney}` },
        { title: "感情里的你", body: `${pdm.love}属${animal.name}的你，和属${friends}的人比较合拍；和属${animalName(zodiac.visual.chong)}的人容易碰撞，多沟通就能磨合。` },
        {
          title: "身体和精力",
          body: `${pdm.body}${balanceLine}${missing.length ? missing.map((m) => PLAIN_LACK[m]).join("") : ""}`,
        },
        {
          title: "给你的建议",
          body:
            `${strong ? "你的力气够用，重点是用对地方。" : "你需要借力，别一个人硬扛。"}日常可以这样补充能量：${helpLines.join("；")}。` +
            `${taisui}${phase ? `你正走在一个十年阶段（${currentYun!.startYear}–${currentYun!.endYear}）：${phase}` : ""}`,
        },
        {
          title: "这套方法怎么算的",
          body: "八字把你出生的年、月、日、时，各换成两个字，一共八个字。再看里面木、火、土、金、水五种元素各占多少，以及它们怎样互相帮忙或互相克制，由此推出你的性格倾向和人生节奏。属相是出生年对应的动物，按立春划分年份。",
        },
      ],
    },
    caveats: [
      ...(chart.input.timeKnown ? [] : [UNKNOWN_TIME_NOTE]),
      zodiac.caveat,
      "喜用神为简化推算（按同党比例判断身强弱），专业断法还需看调候、格局与通关。",
    ],
    visual: { pillars, dayGan, wuxing, strong, selfShare, favorable, dayun, startYun, zodiac: zodiac.visual },
  };
};
