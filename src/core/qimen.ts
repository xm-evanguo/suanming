import { Solar } from "lunar-javascript";
import { GAN, ZHI, wxRelation } from "./ganzhi";
import type { WuXing } from "../data/types";
import { isEn, t } from "../i18n";
import { dirName, ganName, gzName, jieqiName } from "../data/en/terms";

/** Time charts: rotating plates, split terms, UTC+8, day change at 23:00. */
export const QIMEN_RULE = () =>
  t("时家奇门 · 转盘 · 拆补法 · 中五寄坤 · 天禽随天芮", "Hour Qimen · rotating plates · split method · centre lodged in Kun · Tianqin travels with Tianrui");
export const RING = [1, 8, 3, 4, 9, 2, 7, 6];
export const GRID = [4, 9, 2, 3, 5, 7, 8, 1, 6];
const STEMS = ["戊", "己", "庚", "辛", "壬", "癸", "丁", "丙", "乙"];
const HIDDEN = ["戊", "己", "庚", "辛", "壬", "癸"];
const STARS = ["天蓬", "天任", "天冲", "天辅", "天英", "天芮", "天柱", "天心"];
const DOORS = ["休门", "生门", "伤门", "杜门", "景门", "死门", "惊门", "开门"];
const GODS = ["值符", "螣蛇", "太阴", "六合", "白虎", "玄武", "九地", "九天"];
const TERMS = ["冬至", "小寒", "大寒", "立春", "雨水", "惊蛰", "春分", "清明", "谷雨", "立夏", "小满", "芒种", "夏至", "小暑", "大暑", "立秋", "处暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪"];
// Upper, middle and lower yuan, in solar-term order.
const JU = [174, 285, 396, 852, 963, 174, 396, 417, 528, 417, 528, 639, 936, 825, 714, 258, 147, 936, 714, 693, 582, 693, 582, 471];
const NAMES = ["", "坎一", "坤二", "震三", "巽四", "中五", "乾六", "兑七", "艮八", "离九"];
const DIRECTIONS = ["", "北", "西南", "东", "东南", "中", "西北", "西", "东北", "南"];
const ELEMENTS: WuXing[] = ["土", "水", "土", "木", "木", "土", "金", "金", "土", "火"];
const mod = (n: number, size: number) => ((n % size) + size) % size;
const outer = (n: number) => n === 5 ? 2 : n;

export interface QimenPalace {
  number: number;
  name: string;
  direction: string;
  earth: string;
  heaven: string;
  star: string;
  door: string;
  god: string;
  /** The centre stem travels with Tian Rui. */
  guest?: string;
}
export interface QimenChart {
  time: string;
  term: string;
  yang: boolean;
  yuan: string;
  ju: number;
  pillars: string[];
  fuHead: string;
  xun: string;
  hiddenStem: string;
  chiefStar: string;
  chiefDoor: string;
  starPalace: number;
  doorPalace: number;
  palaces: QimenPalace[];
  selfPalace: number;
  matterPalace: number;
}

const cycleIndex = (gz: string) => {
  const n = Array.from({ length: 60 }, (_, i) => `${GAN[i % 10]}${ZHI[i % 12]}`).indexOf(gz);
  if (n < 0) throw new Error(t("无法识别干支。", "Unknown stem-branch pair."));
  return n;
};

/** `at` is an absolute instant. Calendar and term lookup use Beijing civil time. */
export function qimenChart(at: Date): QimenChart {
  if (!Number.isFinite(at.getTime())) throw new Error(t("请选择有效的起局时间。", "Choose a valid time for the chart."));
  const b = new Date(at.getTime() + 8 * 3600_000);
  if (b.getUTCFullYear() < 1900 || b.getUTCFullYear() > 2100) throw new Error(t("起局时间须在 1900–2100 年之间。", "The chart time must be between 1900 and 2100."));
  const solar = Solar.fromYmdHms(b.getUTCFullYear(), b.getUTCMonth() + 1, b.getUTCDate(), b.getUTCHours(), b.getUTCMinutes(), b.getUTCSeconds());
  const l = solar.getLunar();
  const term: string = l.getPrevJieQi(false).getName();
  const termIndex = TERMS.indexOf(term);
  if (termIndex < 0) throw new Error(t("无法确定当前节气。", "Could not find the current solar term."));
  const yang = termIndex < 12;
  const direction = yang ? 1 : -1;
  const day: string = l.getDayInGanZhiExact();
  const hour: string = l.getTimeInGanZhi();
  const dayIndex = cycleIndex(day);
  const fuIndex = dayIndex - dayIndex % 5;
  const fuBranch = fuIndex % 12;
  const yuanIndex = fuBranch % 3 === 0 ? 0 : fuBranch % 3 === 2 ? 1 : 2;
  const ju = Number(String(JU[termIndex])[yuanIndex]);
  const earth: Record<number, string> = {};
  STEMS.forEach((stem, i) => { earth[mod(ju - 1 + direction * i, 9) + 1] = stem; });
  const hourIndex = cycleIndex(hour);
  const xunIndex = Math.floor(hourIndex / 10);
  const hiddenStem = HIDDEN[xunIndex]!;
  const findEarth = (stem: string) => Number(Object.keys(earth).find((k) => earth[Number(k)] === stem));
  const chiefOrigin = findEarth(hiddenStem);
  const origin = RING.indexOf(outer(chiefOrigin));
  const starPalace = outer(findEarth(hour[0] === "甲" ? hiddenStem : hour[0]!));
  const doorPalace = outer(mod(chiefOrigin - 1 + direction * (hourIndex % 10), 9) + 1);
  const starShift = RING.indexOf(starPalace) - origin;
  const doorShift = RING.indexOf(doorPalace) - origin;
  const palaces = Array.from({ length: 9 }, (_, i): QimenPalace => {
    const number = i + 1;
    const ringIndex = RING.indexOf(number);
    if (number === 5) return { number, name: NAMES[number]!, direction: "中", earth: earth[5]!, heaven: "", star: "天禽寄坤", door: "", god: "" };
    const source = mod(ringIndex - starShift, 8);
    return {
      number, name: NAMES[number]!, direction: DIRECTIONS[number]!, earth: earth[number]!,
      heaven: earth[RING[source]!]!, star: STARS[source]!,
      door: DOORS[mod(ringIndex - doorShift, 8)]!,
      god: GODS[mod(direction * (ringIndex - RING.indexOf(starPalace)), 8)]!,
      ...(RING[source] === 2 ? { guest: earth[5] } : {}),
    };
  });
  const findHeaven = (stem: string) => palaces.find((p) => p.heaven === stem || p.guest === stem)!.number;
  return {
    time: t(`${solar.toYmdHms()}（北京时间 UTC+8）`, `${solar.toYmdHms()} (Beijing time, UTC+8)`), term, yang, yuan: ["上元", "中元", "下元"][yuanIndex]!, ju,
    pillars: [l.getYearInGanZhiExact(), l.getMonthInGanZhiExact(), day, hour],
    fuHead: `${GAN[fuIndex % 10]}${ZHI[fuBranch]}`, xun: `${GAN[0]}${ZHI[xunIndex * 10 % 12]}`,
    hiddenStem, chiefStar: chiefOrigin === 5 ? "天禽" : STARS[origin]!, chiefDoor: DOORS[origin]!, starPalace, doorPalace, palaces,
    selfPalace: findHeaven(day[0] === "甲" ? HIDDEN[Math.floor(dayIndex / 10)]! : day[0]!),
    matterPalace: findHeaven(hour[0] === "甲" ? hiddenStem : hour[0]!),
  };
}

const QIMEN_EN: Record<string, string> = {
  天蓬: "Tianpeng", 天任: "Tianren", 天冲: "Tianchong", 天辅: "Tianfu", 天英: "Tianying", 天芮: "Tianrui", 天柱: "Tianzhu", 天心: "Tianxin", 天禽: "Tianqin",
  天禽寄坤: "Tianqin (lodged in Kun)",
  休门: "Rest Door", 生门: "Life Door", 伤门: "Harm Door", 杜门: "Block Door", 景门: "View Door", 死门: "Death Door", 惊门: "Alarm Door", 开门: "Open Door",
  值符: "Chief", 螣蛇: "Serpent", 太阴: "Great Yin", 六合: "Six Harmony", 白虎: "White Tiger", 玄武: "Black Tortoise", 九地: "Nine Earth", 九天: "Nine Heaven",
  坎一: "Kan 1", 坤二: "Kun 2", 震三: "Zhen 3", 巽四: "Xun 4", 中五: "Centre 5", 乾六: "Qian 6", 兑七: "Dui 7", 艮八: "Gen 8", 离九: "Li 9",
  上元: "upper yuan", 中元: "middle yuan", 下元: "lower yuan",
};

/** A Qimen star, door, god, palace or yuan name in the current language. Chart fields stay Chinese. */
/** "甲子" → "Jia-Zi", "戊" → "Wu" in English. */
export const qimenStem = (s: string) => (s.length === 2 ? gzName(s) : ganName(s));

export const qimenName = (s: string) => (isEn() ? (QIMEN_EN[s] ?? jieqiName(s)) : s);

const DOOR_TEXT_EN: Record<string, string> = {
  休门: "Traditionally it leans toward rest, talks and waiting. Talk through what each side needs and leave time to prepare.",
  生门: "Traditionally it leans toward growth and resources. Check what resources are really available, then move step by step.",
  开门: "Traditionally it leans toward openings, work and open talk. Say the terms clearly and agree on the next step.",
  伤门: "Traditionally it leans toward competition and conflict. Look at the points in dispute first and do not rush to take a side.",
  杜门: "Traditionally it leans toward blockage, secrecy and research. Fill in the missing information and find where things are stuck.",
  景门: "Traditionally it leans toward display, documents and information. Check that your wording and papers are clear.",
  死门: "Traditionally it leans toward standstill and endings; it does not mean death. Deal with loose ends first and check your exit terms.",
  惊门: "Traditionally it leans toward alarm, quarrels and news. Check the news before you respond.",
};

const DOOR_TEXT: Record<string, string> = {
  休门: "传统取象偏向休整、沟通与等待。可以先沟通需求，留出准备时间。",
  生门: "传统取象偏向增长和资源。可以先核实可用资源，再分步推进。",
  开门: "传统取象偏向开启、工作与公开沟通。可以把条件说清，确认下一步。",
  伤门: "传统取象偏向竞争与冲突。可以先检查争议点，避免急于表态。",
  杜门: "传统取象偏向阻隔、保密与研究。可以先补齐资料，弄清卡在哪里。",
  景门: "传统取象偏向展示、文书与信息。可以检查表达和文件是否清楚。",
  死门: "传统取象偏向停滞与收尾，不代表死亡。可以先处理遗留问题，检查退出条件。",
  惊门: "传统取象偏向惊扰、口舌与消息。可以先核实消息，再作回应。",
};

/** Basic symbol reading only. No score or claim about a future month. */
export function qimenReading(chart: QimenChart): { title: string; text: string; rule: string }[] {
  const self = chart.palaces[chart.selfPalace - 1]!;
  const matter = chart.palaces[chart.matterPalace - 1]!;
  const relation = wxRelation(ELEMENTS[self.number]!, ELEMENTS[matter.number]!);
  const relationTextEn = {
    同: "Both palaces share the same element: traditionally the same kind and direction. Still check that both sides want the same thing.",
    生我: "The matter's palace feeds yours: traditionally a sign of support. Check which help is really available.",
    我生: "Your palace feeds the matter's: traditionally a sign of investment. First make sure you have enough time and resources.",
    我克: "Your palace controls the matter's: traditionally a sign that you can steer it. Sort out which terms you decide.",
    克我: "The matter's palace controls yours: traditionally a sign of pressure. Check the limits and how you would handle them.",
  };
  const relationEn = { 同: "same element", 生我: "it feeds you", 我生: "you feed it", 我克: "you control it", 克我: "it controls you" };
  if (isEn()) {
    const pal = (p: QimenPalace) => qimenName(p.name);
    return [
      { title: "You and the matter", text: relationTextEn[relation], rule: `Day stem in ${pal(self)}, hour stem in ${pal(matter)}; matter to you: ${relationEn[relation]}` },
      { title: `The matter's palace · ${qimenName(matter.door)}`, text: DOOR_TEXT_EN[matter.door]!, rule: `Hour stem on the heaven plate in ${pal(matter)} (${dirName(matter.direction)}), with ${qimenName(matter.star)}, ${qimenName(matter.door)} and ${qimenName(matter.god)}` },
      { title: "The chart's chief door", text: DOOR_TEXT_EN[chart.chiefDoor]!, rule: `Chief door ${qimenName(chart.chiefDoor)} in ${qimenName(NAMES[chart.doorPalace]!)}` },
    ];
  }
  const relationText = {
    同: "人和事落宫的五行相同，传统取象是同类、同向；仍需确认双方目标是否一致。",
    生我: "事情落宫的五行生扶你所在的宫，传统取象偏向支持；可以核实哪些帮助确实可用。",
    我生: "你所在宫的五行生事情所在宫，传统取象偏向投入；先确认时间和资源是否足够。",
    我克: "你所在宫的五行克事情所在宫，传统取象偏向主动控制；先分清哪些条件由你决定。",
    克我: "事情所在宫的五行克你所在宫，传统取象偏向压力；先核实限制和应对办法。",
  };
  return [
    { title: "你与所问之事", text: relationText[relation], rule: `日干落${self.name}宫，时干落${matter.name}宫；事宫对人宫：${relation}` },
    { title: `事情落宫 · ${matter.door}`, text: DOOR_TEXT[matter.door]!, rule: `时干在天盘落${matter.name}宫（${matter.direction}），临${matter.star}、${matter.door}、${matter.god}` },
    { title: "本局的主门", text: DOOR_TEXT[chart.chiefDoor]!, rule: `值使${chart.chiefDoor}落${NAMES[chart.doorPalace]}宫` },
  ];
}
