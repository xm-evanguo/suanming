import type { Chart } from "../core/chart";
import { Solar } from "lunar-javascript";
import { zhiIndex } from "../core/ganzhi";
import { MONTH_STAR_TEXT, NINE_STARS } from "../data/kyusei";
import { PLAIN_KYUSEI_THEME, PLAIN_KYUSEI_YEAR } from "../data/plain-kyusei";
import { plainProfileSections, profileLucky, profileSections } from "./profile";
import { type MethodFn, plainTitles, shiftScores } from "./types";
import { isEn, t } from "../i18n";
import { methodName } from "./names";
import { MONTH_STAR_TEXT_EN, PALACE_YEAR_TEXT_EN } from "../data/en/kyusei";
import { dirName } from "../data/en/terms";
import { TRIGRAM_NAME_EN } from "../data/en/meihua";

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

/** 本命星 and 月命星 of a natal chart. */
export function natalStars(c: Chart): { lcYear: number; star: number; month: number } {
  const t = c.cnTime;
  const monthZhi: string = c.eightChar.getMonthZhi();
  const lcYear = liChunYear(t.y, t.m, monthZhi);
  const star = yearStar(lcYear);
  return { lcYear, star, month: monthStar(star, (zhiIndex(monthZhi) - 2 + 12) % 12) };
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
  const { lcYear, star, month } = natalStars(chart);
  const s = NINE_STARS[star - 1]!;
  const ms = NINE_STARS[month - 1]!;

  const now = new Date();
  const nowZhi: string = Solar.fromYmd(now.getFullYear(), now.getMonth() + 1, now.getDate()).getLunar().getMonthZhi();
  const thisYear = liChunYear(now.getFullYear(), now.getMonth() + 1, nowZhi);
  const thisYearCenter = yearStar(thisYear);
  const yearBoard = boardFor(thisYearCenter);
  const palace = LOSHU_DIRS[yearBoard.indexOf(star)]!;
  const py = isEn() ? { ...PALACE_YEAR_TEXT[palace]!, text: PALACE_YEAR_TEXT_EN[palace]! } : PALACE_YEAR_TEXT[palace]!;

  if (isEn()) {
    const where = palace === "中宫" ? "the centre" : `the ${dirName(palace)}`;
    const plainBase = plainProfileSections(s, `By your birth year, you belong to ${s.name} in Nine Star Ki, the \"${s.title.toLowerCase()}\" type (Nine Star Ki sorts people into nine types).`);
    return {
      id: "kyusei",
      name: methodName("kyusei"),
      intro: "Born from the Lo Shu nine palaces of China and developed in Japan as Nine Star Ki: the year and month stars are set from the Start of Spring, and each year's directions are read for good and bad.",
      origin: "日本",
      icon: "✺",
      headline: `Year star · ${s.name}`,
      tagline: `Month star ${ms.name} · ${s.title}`,
      keywords: s.keywords,
      scores: shiftScores(s.scores, { career: py.delta, wealth: py.delta }),
      element: s.element,
      lucky: profileLucky(s),
      facts: [
        { label: "Solar year", value: `${lcYear} (from Start of Spring)` },
        { label: "Year star", value: `${s.name} (${s.jp})` },
        { label: "Month star", value: ms.name },
        { label: "Trigram", value: TRIGRAM_NAME_EN[s.trigram] ?? s.trigram },
        { label: `${thisYear} Year chart`, value: `${NINE_STARS[thisYearCenter - 1]!.name} in the centre · you are in ${where}` },
      ],
      sections: [
        ...profileSections(s),
        { title: `Month star · ${ms.name}`, body: `Your month star is ${ms.name}: ${MONTH_STAR_TEXT_EN[month] ?? ""}` },
        { title: `${thisYear} · your star in ${where}`, body: py.text },
      ],
      plain: {
        summary: `You are the \"${s.title.toLowerCase()}\" type: ${s.summary} The keyword for ${thisYear} is \"${PLAIN_KYUSEI_THEME[palace]}\".`,
        sections: [
          { ...plainBase[0]!, body: `${plainBase[0]!.body} Your month star adds this: ${MONTH_STAR_TEXT_EN[month] ?? ""}` },
          plainBase[1]!,
          plainBase[2]!,
          plainBase[3]!,
          { title: `The rhythm of ${thisYear}`, body: PLAIN_KYUSEI_YEAR[palace]! },
          {
            title: plainTitles().how,
            body: "Nine Star Ki pairs each of the numbers one to nine with a \"star\", nine types in all. Counting the year from the Start of Spring, it finds your type from your birth year and your inner type from your birth month, then looks at how the nine types move around the nine-square grid this year and which square you land in.",
          },
        ],
      },
      caveats: ["Nine Star Ki uses the Start of Spring and the start of each solar month as boundaries; if you were born near one, check the month star boundary."],
      visual: { star, month, birthBoard: boardFor(star), yearBoard, thisYear, thisYearCenter, palace },
    };
  }

  // Month star text starts with "月命星为X，"; drop that prefix for the plain reading.
  const inner = (MONTH_STAR_TEXT[month] ?? "").replace(/^月命星为[^，]*，/, "");
  const plainBase = plainProfileSections(
    s,
    `按你的出生年份，你属于九星里的「${s.name}」，也就是「${s.title}」这一类人（九星气学把人分成九种类型）。`,
    "",
  );

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
    plain: {
      summary: `你是「${s.title}」型的人：${s.summary.replace(/^如/, "像")}${thisYear} 年的关键词是「${PLAIN_KYUSEI_THEME[palace]}」。`,
      sections: [
        { ...plainBase[0]!, body: `${plainBase[0]!.body}另外，${inner}` },
        plainBase[1]!,
        plainBase[2]!,
        plainBase[3]!,
        { title: `${thisYear} 年的节奏`, body: PLAIN_KYUSEI_YEAR[palace]! },
        {
          title: "这套方法怎么算的",
          body: "九星气学把一到九这九个数字，各配上一种“星”（九种类型）。它用立春作一年的起点，由出生年算出你的类型，再由出生月算出你的内心类型，最后看今年九种类型在九宫格里怎么移动，你落在哪一格。",
        },
      ],
    },
    caveats: ["九星以立春与各月“节入”为界，节气前后出生者请留意月命星的边界。"],
    visual: { star, month, birthBoard: boardFor(star), yearBoard, thisYear, thisYearCenter, palace },
  };
};
