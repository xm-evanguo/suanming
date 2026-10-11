import { digitSum } from "../core/ganzhi";
import { MAJOR_ARCANA } from "../data/tarot";
import { profileLucky } from "./profile";
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

/** Small deterministic PRNG (mulberry32) so a reading is stable for a given person and day. */
export function seededRandom(seedText: string): () => number {
  let h = 1779033703 ^ seedText.length;
  for (let i = 0; i < seedText.length; i++) {
    h = Math.imul(h ^ seedText.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface TarotVisual {
  personality: number;
  soul: number;
  yearCard: number;
  spread: { card: number; reversed: boolean; position: string }[];
  sum: number;
}

export const tarot: MethodFn<TarotVisual> = (chart) => {
  const { year, month, day } = chart.input;
  const sum = month + day + year;
  const { personality, soul } = greerCards(sum);
  const now = new Date();
  const yearCard = greerCards(month + day + now.getFullYear()).personality;

  const today = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const rand = seededRandom(`${year}-${month}-${day}-${chart.input.hour}:${chart.input.minute}|${today}`);
  const deck = MAJOR_ARCANA.map((c) => c.num);
  const spread = ["过去 · 根源", "现在 · 课题", "未来 · 指引"].map((position) => {
    const card = deck.splice(Math.floor(rand() * deck.length), 1)[0]!;
    return { card, reversed: rand() < 0.3, position };
  });

  const p = MAJOR_ARCANA[personality]!;
  const s = MAJOR_ARCANA[soul]!;
  const y = MAJOR_ARCANA[yearCard]!;
  const same = personality === soul;

  return {
    id: "tarot",
    name: "塔罗牌",
    intro: "以生日数字求得一生相随的“生命牌”（Mary K. Greer 法），再为今天抽出三张大阿卡纳的时间之流牌阵。",
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
      ...spread.map((c) => {
        const card = MAJOR_ARCANA[c.card]!;
        return { title: `${c.position} · ${card.name}${c.reversed ? "（逆位）" : ""}`, body: c.reversed ? card.reversed : card.upright };
      }),
      { title: "事业与感情", body: `${p.career}${p.love}` },
      { title: "牌的低语", body: p.advice },
    ],
    caveats: ["今日牌阵由你的生辰与今天的日期共同决定，每天会有不同的三张牌。"],
    visual: { personality, soul, yearCard, spread, sum },
  };
};
