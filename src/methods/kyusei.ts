import { Solar } from "lunar-javascript";
import { zhiIndex } from "../core/ganzhi";
import { MONTH_STAR_TEXT, NINE_STARS } from "../data/kyusei";
import { profileLucky, profileSections } from "./profile";
import { type MethodFn, shiftScores } from "./types";

/** 後天定位盤 (Lo Shu): positions in reading order SE S SW / E C W / NE N NW. */
export const LOSHU = [4, 9, 2, 3, 5, 7, 8, 1, 6];
export const LOSHU_DIRS = ["东南", "南", "西南", "东", "中宫", "西", "东北", "北", "西北"];

const wrap9 = (n: number) => ((((n - 1) % 9) + 9) % 9) + 1;

/** 本命星 of a 立春-based year: 11 minus the digital root of the year. */
export function yearStar(year: number): number {
  const dr = year % 9 || 9;
  return wrap9(11 - dr);
}

/** 月命星 from the year star and the 節月 index (寅 = 0 ... 丑 = 11). */
export function monthStar(yStar: number, monthFromYin: number): number {
  const start = [1, 4, 7].includes(yStar) ? 8 : [3, 6, 9].includes(yStar) ? 2 : 5;
  return wrap9(start - monthFromYin);
}

/** Star placed at each Lo Shu cell when `center` sits in the middle. */
export const boardFor = (center: number) => LOSHU.map((v) => wrap9(v - 5 + center));

/** The 立春 year a solar date belongs to. */
export function liChunYear(y: number, m: number, monthZhi: string): number {
  return m <= 2 && (monthZhi === "子" || monthZhi === "丑") ? y - 1 : y;
}

const PALACE_YEAR_TEXT: Record<string, { text: string; delta: number }> = {
  中宫: { text: "本命星回到中宫，是九年一遇的“八方塞”之年：万事处在转折点，宜整顿、宜沉淀，不宜冒进。", delta: -4 },
  北: { text: "落坎宫，是蛰伏与蓄力之年。适合学习与规划，为下一轮上升打地基。", delta: -3 },
  西南: { text: "落坤宫，是耕耘之年。脚踏实地做事，汗水会在后年变成果实。", delta: 1 },
  东: { text: "落震宫，是发芽之年。新的计划与想法纷纷冒头，大胆行动会有回响。", delta: 4 },
  东南: { text: "落巽宫，是信用与人脉之年。远方的消息、合作与姻缘都容易成形。", delta: 6 },
  西北: { text: "落乾宫，是登顶之年。责任与地位上升，宜展现领导力。", delta: 6 },
  西: { text: "落兑宫，是收获与欢愉之年。财运与社交活跃，注意别乐极生耗。", delta: 4 },
  东北: { text: "落艮宫，是变革之年。工作、住所或心境会有一次重组。", delta: -1 },
  南: { text: "落离宫，是聚光灯之年。才华被看见，名声上扬，也要防是非。", delta: 3 },
};

export interface KyuseiVisual {
  star: number;
  month: number;
  birthBoard: number[];
  yearBoard: number[];
  thisYear: number;
  thisYearCenter: number;
  palace: string;
}

export const kyusei: MethodFn<KyuseiVisual> = (chart) => {
  const t = chart.cnTime;
  const monthZhi: string = chart.eightChar.getMonthZhi();
  const lcYear = liChunYear(t.y, t.m, monthZhi);
  const star = yearStar(lcYear);
  const month = monthStar(star, (zhiIndex(monthZhi) - 2 + 12) % 12);
  const s = NINE_STARS[star - 1]!;
  const ms = NINE_STARS[month - 1]!;

  const now = new Date();
  const nowZhi: string = Solar.fromYmd(now.getFullYear(), now.getMonth() + 1, now.getDate()).getLunar().getMonthZhi();
  const thisYear = liChunYear(now.getFullYear(), now.getMonth() + 1, nowZhi);
  const thisYearCenter = yearStar(thisYear);
  const yearBoard = boardFor(thisYearCenter);
  const palace = LOSHU_DIRS[yearBoard.indexOf(star)]!;
  const py = PALACE_YEAR_TEXT[palace]!;

  return {
    id: "kyusei",
    name: "九星気学",
    intro: "源自中国洛书九宫，在日本发展为“九星気学”：以立春为界定出本命星与月命星，观一年方位吉凶。",
    origin: "日本",
    icon: "✺",
    headline: `本命星 · ${s.name}`,
    tagline: `月命星 ${ms.name} · ${s.title}`,
    keywords: s.keywords,
    scores: shiftScores(s.scores, { career: py.delta, wealth: py.delta }),
    element: s.element,
    lucky: profileLucky(s),
    facts: [
      { label: "立春年", value: `${lcYear} 年` },
      { label: "本命星", value: `${s.name}（${s.jp}）` },
      { label: "月命星", value: ms.name },
      { label: "卦象", value: s.trigram },
      { label: `${thisYear} 年盘`, value: `${NINE_STARS[thisYearCenter - 1]!.name}中宫 · 你在${palace}` },
    ],
    sections: [
      ...profileSections(s),
      { title: `月命星 · ${ms.name}`, body: MONTH_STAR_TEXT[month] ?? "" },
      { title: `${thisYear} 年运 · 本命星落${palace}`, body: py.text },
    ],
    caveats: ["九星以立春与各月“节入”为界，节气前后出生者请留意月命星的边界。"],
    visual: { star, month, birthBoard: boardFor(star), yearBoard, thisYear, thisYearCenter, palace },
  };
};
