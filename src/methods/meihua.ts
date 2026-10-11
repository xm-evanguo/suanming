import { zhiIndex } from "../core/ganzhi";
import { HEXAGRAMS, TRIGRAMS } from "../data/hexagrams";
import { WU_XING } from "../data/bazi";
import { PLAIN_HEXAGRAMS, PLAIN_MOVING_STAGE, PLAIN_TI_YONG } from "../data/plain-meihua";
import { type MethodFn, UNKNOWN_TIME_NOTE } from "./types";

/** 先天八卦数: 1乾 2兑 3离 4震 5巽 6坎 7艮 8坤. */
export const XIANTIAN = ["乾", "兑", "离", "震", "巽", "坎", "艮", "坤"] as const;

/** Lines bottom → top, 1 = yang. */
export const TRIGRAM_LINES: Record<string, [number, number, number]> = {
  乾: [1, 1, 1],
  兑: [1, 1, 0],
  离: [1, 0, 1],
  震: [1, 0, 0],
  巽: [0, 1, 1],
  坎: [0, 1, 0],
  艮: [0, 0, 1],
  坤: [0, 0, 0],
};

/** King Wen number for [upper, lower]. */
const KING_WEN: [string, string][] = [
  ["乾", "乾"], ["坤", "坤"], ["坎", "震"], ["艮", "坎"], ["坎", "乾"], ["乾", "坎"], ["坤", "坎"], ["坎", "坤"],
  ["巽", "乾"], ["乾", "兑"], ["坤", "乾"], ["乾", "坤"], ["乾", "离"], ["离", "乾"], ["坤", "艮"], ["震", "坤"],
  ["兑", "震"], ["艮", "巽"], ["坤", "兑"], ["巽", "坤"], ["离", "震"], ["艮", "离"], ["艮", "坤"], ["坤", "震"],
  ["乾", "震"], ["艮", "乾"], ["艮", "震"], ["兑", "巽"], ["坎", "坎"], ["离", "离"], ["兑", "艮"], ["震", "巽"],
  ["乾", "艮"], ["震", "乾"], ["离", "坤"], ["坤", "离"], ["巽", "离"], ["离", "兑"], ["坎", "艮"], ["震", "坎"],
  ["艮", "兑"], ["巽", "震"], ["兑", "乾"], ["乾", "巽"], ["兑", "坤"], ["坤", "巽"], ["兑", "坎"], ["坎", "巽"],
  ["兑", "离"], ["离", "巽"], ["震", "震"], ["艮", "艮"], ["巽", "艮"], ["震", "兑"], ["震", "离"], ["离", "艮"],
  ["巽", "巽"], ["兑", "兑"], ["巽", "坎"], ["坎", "兑"], ["巽", "兑"], ["震", "艮"], ["坎", "离"], ["离", "坎"],
];
export const KING_WEN_TABLE = KING_WEN;

export const hexNumber = (upper: string, lower: string) => KING_WEN.findIndex(([u, l]) => u === upper && l === lower) + 1;

const trigramOf = (lines: number[]) => Object.keys(TRIGRAM_LINES).find((k) => TRIGRAM_LINES[k]!.join("") === lines.join(""))!;

export interface HexView {
  num: number;
  name: string;
  fullName: string;
  upper: string;
  lower: string;
  /** Six lines, bottom → top. */
  lines: number[];
}

export interface MeihuaVisual {
  ben: HexView;
  hu: HexView;
  bian: HexView;
  moving: number;
  numbers: { year: number; month: number; day: number; hour: number };
}

function view(upper: string, lower: string): HexView {
  const num = hexNumber(upper, lower);
  const h = HEXAGRAMS[num - 1]!;
  return { num, name: h.name, fullName: h.fullName, upper, lower, lines: [...TRIGRAM_LINES[lower]!, ...TRIGRAM_LINES[upper]!] };
}

const mod = (n: number, m: number) => n % m || m;

const TI_YONG: Record<string, { verdict: string; text: string; delta: number }> = {
  比和: { verdict: "体用比和", text: "体卦与用卦五行相同，内外同心，诸事顺遂。", delta: 6 },
  用生体: { verdict: "用生体 · 大吉", text: "外境生扶自身，常有意外之助、贵人之喜。", delta: 10 },
  体克用: { verdict: "体克用 · 吉", text: "你能驾驭局面，事虽需费力，终可如愿。", delta: 4 },
  体生用: { verdict: "体生用 · 耗", text: "付出多于所得，宜量力而行，防精力与钱财外泄。", delta: -4 },
  用克体: { verdict: "用克体 · 慎", text: "外部压力较大，宜守不宜攻，等待时机再动。", delta: -8 },
};

export const meihua: MethodFn<MeihuaVisual> = (chart) => {
  const l = chart.lunar;
  const year = zhiIndex(l.getYearZhi()) + 1;
  const month = Math.abs(l.getMonth() as number);
  const day = l.getDay() as number;
  const hour = zhiIndex(l.getTimeZhi()) + 1;
  const upper = XIANTIAN[mod(year + month + day, 8) - 1]!;
  const lower = XIANTIAN[mod(year + month + day + hour, 8) - 1]!;
  const moving = mod(year + month + day + hour, 6);

  const ben = view(upper, lower);
  // 互卦: lines 2-4 form the lower trigram, lines 3-5 the upper.
  const hu = view(trigramOf(ben.lines.slice(2, 5)), trigramOf(ben.lines.slice(1, 4)));
  const bianLines = ben.lines.map((v, i) => (i === moving - 1 ? 1 - v : v));
  const bian = view(trigramOf(bianLines.slice(3)), trigramOf(bianLines.slice(0, 3)));

  // 体 is the trigram without the moving line, 用 the one with it.
  const ti = moving <= 3 ? upper : lower;
  const yong = moving <= 3 ? lower : upper;
  const tiWx = TRIGRAMS[ti]!.element;
  const yongWx = TRIGRAMS[yong]!.element;
  const order = ["木", "火", "土", "金", "水"];
  const d = (order.indexOf(yongWx) - order.indexOf(tiWx) + 5) % 5;
  const relKey = d === 0 ? "比和" : d === 4 ? "用生体" : d === 2 ? "体克用" : d === 1 ? "体生用" : "用克体";
  const rel = TI_YONG[relKey]!;

  const hb = HEXAGRAMS[ben.num - 1]!;
  const hv = HEXAGRAMS[bian.num - 1]!;
  const hh = HEXAGRAMS[hu.num - 1]!;
  const scores = { ...hb.scores };
  for (const k of Object.keys(scores) as (keyof typeof scores)[]) scores[k] = Math.max(10, Math.min(99, Math.round(scores[k] * 0.7 + hv.scores[k] * 0.3 + rel.delta)));
  const tiInfo = WU_XING[tiWx];
  const plainBen = PLAIN_HEXAGRAMS[ben.num - 1]!;
  const plainHu = PLAIN_HEXAGRAMS[hu.num - 1]!;
  const plainBian = PLAIN_HEXAGRAMS[bian.num - 1]!;
  const plainRel = PLAIN_TI_YONG[relKey]!;
  const sameEnd = ben.num === bian.num;

  return {
    id: "meihua",
    name: "梅花易数",
    intro: "北宋邵雍所传，以农历年、月、日、时之数起卦，观本卦、互卦、变卦与体用生克。",
    origin: "中国",
    icon: "䷀",
    headline: `${hb.fullName} → ${hv.fullName}`,
    tagline: `第 ${ben.num} 卦 · 动${["初", "二", "三", "四", "五", "上"][moving - 1]}爻 · ${rel.verdict}`,
    keywords: hb.keywords.slice(0, 4),
    scores,
    element: tiWx,
    lucky: { colors: tiInfo.colors.slice(0, 2), numbers: [TRIGRAMS[ti] ? XIANTIAN.indexOf(ti as (typeof XIANTIAN)[number]) + 1 : 1], directions: [tiInfo.direction] },
    facts: [
      { label: "起卦数", value: `年${year} 月${month} 日${day} 时${hour}` },
      { label: "上卦", value: `(${year}+${month}+${day}) mod 8 → ${upper}` },
      { label: "下卦", value: `(${year}+${month}+${day}+${hour}) mod 8 → ${lower}` },
      { label: "动爻", value: `(${year + month + day + hour}) mod 6 → 第 ${moving} 爻` },
      { label: "本 / 互 / 变", value: `${hb.name} / ${hh.name} / ${hv.name}` },
    ],
    sections: [
      { title: `本卦 · ${hb.fullName}`, body: `卦辞：“${hb.judgment}” 象曰：“${hb.image}” ${hb.meaning}` },
      { title: `互卦 · ${hh.fullName}`, body: `互卦藏于本卦之中，揭示事情发展的过程。${hh.meaning}` },
      { title: `变卦 · ${hv.fullName}`, body: `动爻一变，便见归宿。卦辞：“${hv.judgment}” ${hv.meaning}` },
      {
        title: `体用 · ${rel.verdict}`,
        body: `体卦为${ti}（${TRIGRAMS[ti]!.nature}，属${tiWx}），代表你自身；用卦为${yong}（${TRIGRAMS[yong]!.nature}，属${yongWx}），代表外境。${rel.text}`,
      },
    ],
    plain: {
      summary: `用你的出生时间起出的“卦”，说的是你人生的底色，关键词是「${hb.keywords[0]}」「${hb.keywords[1]}」。${sameEnd ? "" : `后面会往「${hv.keywords[0]}」的方向发展。`}${{ 比和: "你和环境很合拍。", 用生体: "整体环境偏顺。", 体克用: "局面你能掌控。", 体生用: "要留意量力而行。", 用克体: "外部压力偏大。" }[relKey]}`,
      sections: [
        { title: "你人生的底色", body: `${plainBen}（这个卦传统上叫“${hb.name}”。）` },
        { title: "过程中会经历什么", body: hu.num === ben.num ? "事情发展到中途，情形和底色很相近，不会有太大的反差。" : `事情发展到中途，常会碰到这样的情形：${plainHu}（传统上叫“${hh.name}”。）` },
        { title: "最后往哪里走", body: `变化出现在${PLAIN_MOVING_STAGE[moving - 1]}。${sameEnd ? "走向与底色相近，说明你的路比较一致。" : bian.num === hu.num ? "最终的走向和中途的情形相近，前面的提示同样适用。" : `事情会逐渐往这样的方向发展：${plainBian}（传统上叫“${hv.name}”。）`}` },
        { title: "你和外部环境的关系", body: plainRel },
        {
          title: "给你的建议",
          body: `${rel.delta >= 0 ? "整体趋势对你有利，" : "整体需要谨慎一些，"}最要用心的是${PLAIN_MOVING_STAGE[moving - 1]}。${rel.delta >= 0 ? "顺势而为就好。" : "做决定前，多留一点余量。"}`,
        },
        {
          title: "这套方法怎么算的",
          body: "梅花易数用农历出生的年、月、日、时，各换成一个数字，再加起来得出一个“卦”（一种由六条线组成的图形）。它是用你的生辰起的，所以说的是人生底色，不是在回答某个具体问题。",
        },
      ],
    },
    caveats: [...(chart.input.timeKnown ? [] : [UNKNOWN_TIME_NOTE]), "此为以生辰起的“本命卦”，象征一生的底色，而非对某件具体事情的占问。"],
    visual: { ben, hu, bian, moving, numbers: { year, month, day, hour } },
  };
};
