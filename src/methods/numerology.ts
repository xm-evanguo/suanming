import { digitSum } from "../core/ganzhi";
import { LIFE_PATH, PERSONAL_YEAR } from "../data/numerology";
import { PLAIN_NUM_LINE, PLAIN_NUM_MISSING } from "../data/plain-numerology";
import { plainProfileSections, profileLucky, profileSections } from "./profile";
import { plainTitles, type MethodFn } from "./types";
import { isEn, listJoin, t } from "../i18n";
import { methodName } from "./names";

const MASTER = [11, 22, 33];

/** Reduce to 1-9, keeping master numbers when `keepMaster`. */
export function reduce(n: number, keepMaster = true): number {
  let x = n;
  while (x > 9 && !(keepMaster && MASTER.includes(x))) x = digitSum(x);
  return x;
}

export function lifePath(y: number, m: number, d: number): { value: number; steps: string } {
  const rm = reduce(m);
  const rd = reduce(d);
  const ry = reduce(y);
  const value = reduce(rm + rd + ry);
  return {
    value,
    steps: t(`月 ${m}→${rm}，日 ${d}→${rd}，年 ${y}→${ry}；${rm}+${rd}+${ry} = ${rm + rd + ry} → ${value}`, `Month ${m}→${rm}, day ${d}→${rd}, year ${y}→${ry}; ${rm}+${rd}+${ry} = ${rm + rd + ry} → ${value}`),
  };
}

export interface NumerologyVisual {
  lifePath: number;
  digits: string;
  /** Count of each digit 1-9 in the birth date (Lo Shu grid). */
  grid: Record<number, number>;
  lines: string[];
  birthday: number;
  personalYear: number;
}

/** Lo Shu grid lines considered “connected” when all three digits are present. */
const LINES: { cells: number[]; name: string; en: string }[] = [
  { cells: [4, 9, 2], name: "4-9-2 决心之线", en: "4-9-2 line of resolve" },
  { cells: [3, 5, 7], name: "3-5-7 灵性之线", en: "3-5-7 line of spirit" },
  { cells: [8, 1, 6], name: "8-1-6 行动之线", en: "8-1-6 line of action" },
  { cells: [4, 3, 8], name: "4-3-8 思维之线", en: "4-3-8 line of thought" },
  { cells: [9, 5, 1], name: "9-5-1 意志之线", en: "9-5-1 line of will" },
  { cells: [2, 7, 6], name: "2-7-6 情感之线", en: "2-7-6 line of feeling" },
  { cells: [4, 5, 6], name: "4-5-6 富足之线", en: "4-5-6 line of plenty" },
  { cells: [2, 5, 8], name: "2-5-8 艺术之线", en: "2-5-8 line of art" },
];

export const numerology: MethodFn<NumerologyVisual> = (chart) => {
  const { year, month, day } = chart.input;
  const lp = lifePath(year, month, day);
  const p = LIFE_PATH[lp.value]!;
  const birthday = reduce(day);
  const now = new Date().getFullYear();
  const personalYear = reduce(reduce(month) + reduce(day) + reduce(now), false);
  const py = PERSONAL_YEAR[personalYear]!;

  const digits = `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`;
  const grid: Record<number, number> = {};
  for (let i = 1; i <= 9; i++) grid[i] = 0;
  for (const ch of digits) if (ch !== "0") grid[Number(ch)]! += 1;
  const lines = LINES.filter((l) => l.cells.every((c) => grid[c]! > 0)).map((l) => (isEn() ? l.en : l.name));
  const missing = Object.entries(grid)
    .filter(([, v]) => v === 0)
    .map(([k]) => k);

  const base = plainProfileSections(p, `把你出生年月日的数字一位位加起来，直到只剩一位（11、22、33除外），你得到的核心数字是 ${lp.value}，也就是「${p.title}」这一类人。`);
  const plainLines = lines.map((n) => PLAIN_NUM_LINE[n.split(" ")[0]!]).filter(Boolean);
  const plainMissing = missing.map((m) => PLAIN_NUM_MISSING[m]).filter(Boolean).slice(0, 3);

  if (isEn()) {
    const yearName = py.name.replace(/^Personal Year \d · /, "");
    const baseEn = plainProfileSections(p, `Add up the digits of your birth date one by one until a single digit is left (11, 22 and 33 are kept). Your core number is ${lp.value}, which is the type known as \"${p.title}\".`);
    return {
      id: "numerology",
      name: methodName("numerology"),
      intro: "Number mysticism that goes back to Pythagoras: your birth date is reduced to one core number that shows your gifts and lessons in this life.",
      origin: "西方",
      icon: "∞",
      headline: `Life Path ${lp.value}`,
      tagline: p.title,
      keywords: p.keywords,
      scores: p.scores,
      element: p.element,
      lucky: profileLucky(p),
      facts: [
        { label: "Reduction", value: lp.steps },
        { label: "Birthday number", value: String(birthday) },
        { label: `Personal year ${now}`, value: `${personalYear} · ${py.name}` },
        { label: "Lo Shu lines", value: lines.join(", ") || "No complete line" },
      ],
      sections: [
        ...profileSections(p, `Number ${lp.value} · `),
        {
          title: "Nine-square grid",
          body:
            `Your birth digits ${digits} fall into the nine squares. ` +
            (lines.length ? `They join into ${listJoin(lines.map((l) => `the ${l}`))}; this energy flows in you naturally. ` : "No complete line is formed, so your energy is spread out and flexible. ") +
            (missing.length ? `The missing digits ${listJoin(missing)} are lessons to practise on purpose in this life.` : "All nine digits are present, which is very rare."),
        },
        { title: `${now} · Personal year ${personalYear} · ${yearName}`, body: py.text },
      ],
      plain: {
        summary: `Your core number is ${lp.value}: \"${p.title}\". ${p.summary} For you, ${now} is the \"${yearName}\".`,
        sections: [
          baseEn[0]!,
          baseEn[1]!,
          baseEn[2]!,
          {
            title: "Strengths and lessons in your numbers",
            body:
              (plainLines.length ? `Taken together, your birth digits show that you ${plainLines.join("; ")}. ` : "Your birth digits are fairly spread out, which makes you flexible and not boxed in by one pattern. ") +
              (plainMissing.length ? `Some digits do not appear in your birth date, which hints at things to practise, such as: ${plainMissing.join("; ")}.` : "All nine digits appear, so you are fairly balanced across the board."),
          },
          { title: `The rhythm of ${now}`, body: `${py.text} ${baseEn[3]!.body}` },
          {
            title: plainTitles().how,
            body: "Numerology comes from the number teachings of Pythagoras in ancient Greece, which hold that numbers hide patterns of character. It reduces your birth year, month and day each to a single digit, then adds them to get one core number. It then looks at which digits appear in your birth date to see which traits are strong and which need practice.",
          },
        ],
      },
      caveats: ["Schools of numerology reduce the date in different ways. Here the month, day and year are reduced separately and then added, and the master numbers 11, 22 and 33 are kept."],
      visual: { lifePath: lp.value, digits, grid, lines, birthday, personalYear },
    };
  }

  return {
    id: "numerology",
    name: "生命灵数",
    intro: "源自毕达哥拉斯的数字神秘学：把出生日期化约为一个核心数字，揭示此生的天赋与课题。",
    origin: "西方",
    icon: "∞",
    headline: `生命灵数 ${lp.value}`,
    tagline: p.title,
    keywords: p.keywords,
    scores: p.scores,
    element: p.element,
    lucky: profileLucky(p),
    facts: [
      { label: "化约过程", value: lp.steps },
      { label: "生日数", value: String(birthday) },
      { label: `${now} 个人流年`, value: `${personalYear} · ${py.name}` },
      { label: "九宫连线", value: lines.join("、") || "无连线" },
    ],
    sections: [
      ...profileSections(p, `灵数 ${lp.value} · `),
      {
        title: "九宫格",
        body:
          `生日数字 ${digits} 落入九宫：` +
          (lines.length ? `连成「${lines.join("」「")}」，这些能量在你身上天然流动。` : "没有完整连线，能量分散而灵活。") +
          (missing.length ? `空缺的数字 ${missing.join("、")} 是此生需要刻意练习的课题。` : "九个数字俱全，十分少见。"),
      },
      { title: `${now} 流年 ${personalYear} · ${py.name}`, body: py.text },
    ],
    plain: {
      summary: `你的核心数字是 ${lp.value}：「${p.title}」。${p.summary}${now} 年对你来说是「${py.name.replace(/^个人年 \d · /, "")}」。`,
      sections: [
        base[0]!,
        base[1]!,
        base[2]!,
        {
          title: "数字里的强项和功课",
          body:
            (plainLines.length ? `你的生日数字凑在一起，显示你${plainLines.join("；")}。` : "你的生日数字比较分散，特点是灵活，不被单一模式限制。") +
            (plainMissing.length ? `生日里没出现的一些数字，提示你可以多练习这些事，比如：${plainMissing.join("；")}。` : "九个数字都出现了，各方面比较均衡。"),
        },
        { title: `${now} 年的节奏和建议`, body: `${py.text}${base[3]!.body}` },
        {
          title: "这套方法怎么算的",
          body: "生命灵数来自古希腊毕达哥拉斯的数字学说，认为数字背后有性格的规律。它把出生的年、月、日分别加到一位数，再相加，得到一个核心数字；再看生日里出现了哪些数字，看哪些特点强，哪些需要练习。",
        },
      ],
    },
    caveats: ["生命灵数有多种化约流派，此处采用“月、日、年分别化约后相加”，并保留大师数 11/22/33。"],
    visual: { lifePath: lp.value, digits, grid, lines, birthday, personalYear },
  };
};
