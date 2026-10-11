import { digitSum } from "../core/ganzhi";
import { MAJOR_ARCANA } from "../data/tarot";
import { plainProfileSections, profileLucky } from "./profile";
import { type MethodFn, mixScores } from "./types";

/** Mary K. Greer's birth-card reduction: sum until ≤ 22; 22 is The Fool (0). */
export function greerCards(sum: number): { personality: number; soul: number } {
  let n = sum;
  while (n > 22) n = digitSum(n);
  const personality = n === 22 ? 0 : n;
  let soul = n;
  while (soul >= 10) soul = digitSum(soul);
  return { personality, soul };
}

export interface TarotVisual {
  personality: number;
  soul: number;
  yearCard: number;
  sum: number;
}

export const tarot: MethodFn<TarotVisual> = (chart) => {
  const { year, month, day } = chart.input;
  const sum = month + day + year;
  const { personality, soul } = greerCards(sum);
  const now = new Date();
  const yearCard = greerCards(month + day + now.getFullYear()).personality;


  const p = MAJOR_ARCANA[personality]!;
  const s = MAJOR_ARCANA[soul]!;
  const y = MAJOR_ARCANA[yearCard]!;
  const same = personality === soul;
  const base = plainProfileSections(p, `塔罗的22张大牌里，用出生日期的数字可以找到最对应你的一张，你的是「${p.name}」。`);

  return {
    id: "tarot",
    name: "塔罗牌",
    intro: "以生日数字求得一生相随的“生命牌”（Mary K. Greer 法）。若有具体问题，可以在本页亲手抽三张牌。",
    origin: "西方",
    icon: p.symbol,
    headline: same ? `生命牌 · ${p.name}` : `人格牌 ${p.name} · 灵魂牌 ${s.name}`,
    tagline: p.title,
    keywords: p.keywords,
    scores: mixScores(same ? [[p.scores, 3], [y.scores, 1]] : [[p.scores, 3], [s.scores, 1], [y.scores, 1]]),
    element: p.element,
    lucky: profileLucky(p),
    facts: [
      { label: "生日数字和", value: `${month} + ${day} + ${year} = ${sum}` },
      { label: "人格牌", value: `${p.num} · ${p.name}（${p.en}）` },
      { label: "灵魂牌", value: `${s.num} · ${s.name}` },
      { label: `${now.getFullYear()} 年度牌`, value: `${y.num} · ${y.name}` },
    ],
    sections: [
      { title: `人格牌 · ${p.name}`, body: `${p.birthCard}${p.personality}` },
      ...(same ? [] : [{ title: `灵魂牌 · ${s.name}`, body: s.birthCard }]),
      { title: `${now.getFullYear()} 年度牌 · ${y.name}`, body: y.upright },
      { title: "事业与感情", body: `${p.career}${p.love}` },
      { title: "牌的低语", body: p.advice },
    ],
    plain: {
      summary: `按你的生日，和你最对应的一张牌是「${p.name}」（${p.title}）。${p.summary}${same ? "" : `你内心更深的一面，对应「${s.name}」。`}`,
      sections: [
        { ...base[0]!, body: `${base[0]!.body}${same ? "" : `你内心更深的一面是「${s.name}」：${s.birthCard}`}` },
        base[1]!,
        base[2]!,
        base[3]!,
        { title: `${now.getFullYear()} 年的提示`, body: `今年用同样的方法算出的提示牌是「${y.name}」。${y.upright}` },
        {
          title: "这套方法怎么算的",
          body: "塔罗大牌共有22张，编号0到21。把你出生的月、日、年的数字全部加起来，再一位位相加，直到落在22以内，就对应到一张牌。它不需要抽牌，说的是你一生都带着的主题。",
        },
      ],
    },
    caveats: ["生命牌与年度牌由生日数字算出，不需要抽牌。页面下方的三张牌由你亲手抽取，与生辰无关，结果不计入综合评分。"],
    visual: { personality, soul, yearCard, sum },
  };
};
