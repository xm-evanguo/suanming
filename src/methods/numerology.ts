import { digitSum } from "../core/ganzhi";
import { LIFE_PATH, PERSONAL_YEAR } from "../data/numerology";
import { profileLucky, profileSections } from "./profile";
import type { MethodFn } from "./types";

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
  return { value, steps: `月 ${m}→${rm}，日 ${d}→${rd}，年 ${y}→${ry}；${rm}+${rd}+${ry} = ${rm + rd + ry} → ${value}` };
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
const LINES: { cells: number[]; name: string }[] = [
  { cells: [4, 9, 2], name: "4-9-2 决心之线" },
  { cells: [3, 5, 7], name: "3-5-7 灵性之线" },
  { cells: [8, 1, 6], name: "8-1-6 行动之线" },
  { cells: [4, 3, 8], name: "4-3-8 思维之线" },
  { cells: [9, 5, 1], name: "9-5-1 意志之线" },
  { cells: [2, 7, 6], name: "2-7-6 情感之线" },
  { cells: [4, 5, 6], name: "4-5-6 富足之线" },
  { cells: [2, 5, 8], name: "2-5-8 艺术之线" },
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
  const lines = LINES.filter((l) => l.cells.every((c) => grid[c]! > 0)).map((l) => l.name);
  const missing = Object.entries(grid)
    .filter(([, v]) => v === 0)
    .map(([k]) => k);

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
    caveats: ["生命灵数有多种化约流派，此处采用“月、日、年分别化约后相加”，并保留大师数 11/22/33。"],
    visual: { lifePath: lp.value, digits, grid, lines, birthday, personalYear },
  };
};
