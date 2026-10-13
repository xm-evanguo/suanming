import type { WuXing } from "../types";
import { getLang } from "../../i18n";

/**
 * English names for the Chinese calendar and its symbols.
 * Chinese characters stay the internal keys; these helpers only change what is shown.
 * Each helper returns the input unchanged in Chinese mode.
 */

const en = () => getLang() === "en";

export const GAN_EN: Record<string, string> = { 甲: "Jia", 乙: "Yi", 丙: "Bing", 丁: "Ding", 戊: "Wu", 己: "Ji", 庚: "Geng", 辛: "Xin", 壬: "Ren", 癸: "Gui" };
export const ZHI_EN: Record<string, string> = { 子: "Zi", 丑: "Chou", 寅: "Yin", 卯: "Mao", 辰: "Chen", 巳: "Si", 午: "Wu", 未: "Wei", 申: "Shen", 酉: "You", 戌: "Xu", 亥: "Hai" };
export const WX_EN: Record<WuXing, string> = { 木: "Wood", 火: "Fire", 土: "Earth", 金: "Metal", 水: "Water" };
/** Animal by its branch or its Chinese name. */
export const ANIMAL_EN: Record<string, string> = {
  鼠: "Rat", 牛: "Ox", 虎: "Tiger", 兔: "Rabbit", 龙: "Dragon", 蛇: "Snake", 马: "Horse", 羊: "Goat", 猴: "Monkey", 鸡: "Rooster", 狗: "Dog", 猪: "Pig",
  子: "Rat", 丑: "Ox", 寅: "Tiger", 卯: "Rabbit", 辰: "Dragon", 巳: "Snake", 午: "Horse", 未: "Goat", 申: "Monkey", 酉: "Rooster", 戌: "Dog", 亥: "Pig",
};
export const SHISHEN_EN: Record<string, string> = {
  比肩: "Friend", 劫财: "Rob Wealth", 食神: "Eating God", 伤官: "Hurting Officer", 偏财: "Indirect Wealth", 正财: "Direct Wealth",
  七杀: "Seven Killings", 偏官: "Seven Killings", 正官: "Direct Officer", 偏印: "Indirect Resource", 枭神: "Indirect Resource", 正印: "Direct Resource", 日主: "Day Master",
};
export const DIR_EN: Record<string, string> = {
  东: "East", 南: "South", 西: "West", 北: "North", 东南: "Southeast", 西南: "Southwest", 东北: "Northeast", 西北: "Northwest", 中: "Centre", 中宫: "Centre",
  正东: "East", 正南: "South", 正西: "West", 正北: "North",
};
export const JIEQI_EN: Record<string, string> = {
  立春: "Start of Spring", 雨水: "Rain Water", 惊蛰: "Awakening of Insects", 春分: "Spring Equinox", 清明: "Clear and Bright", 谷雨: "Grain Rain",
  立夏: "Start of Summer", 小满: "Grain Buds", 芒种: "Grain in Ear", 夏至: "Summer Solstice", 小暑: "Minor Heat", 大暑: "Major Heat",
  立秋: "Start of Autumn", 处暑: "End of Heat", 白露: "White Dew", 秋分: "Autumn Equinox", 寒露: "Cold Dew", 霜降: "Frost's Descent",
  立冬: "Start of Winter", 小雪: "Minor Snow", 大雪: "Major Snow", 冬至: "Winter Solstice", 小寒: "Minor Cold", 大寒: "Major Cold",
  DONG_ZHI: "Winter Solstice", XIAO_HAN: "Minor Cold", DA_HAN: "Major Cold", LI_CHUN: "Start of Spring", YU_SHUI: "Rain Water", JING_ZHE: "Awakening of Insects", DA_XUE: "Major Snow",
};
export const NAYIN_EN: Record<string, string> = {
  海中金: "Gold in the Sea", 炉中火: "Furnace Fire", 大林木: "Great Forest Wood", 路旁土: "Roadside Earth", 剑锋金: "Sword-Edge Metal", 山头火: "Mountain-Top Fire",
  涧下水: "Ravine Water", 城头土: "City-Wall Earth", 白蜡金: "White Wax Metal", 杨柳木: "Willow Wood", 泉中水: "Spring Water", 屋上土: "Rooftop Earth",
  霹雳火: "Thunderbolt Fire", 松柏木: "Pine and Cypress Wood", 长流水: "Long River Water", 沙中金: "Gold in the Sand", 砂中金: "Gold in the Sand", 山下火: "Fire Below the Mountain",
  平地木: "Flatland Wood", 壁上土: "Wall Earth", 金箔金: "Gold Leaf Metal", 覆灯火: "Lamp Fire", 佛灯火: "Lamp Fire", 天河水: "Heavenly River Water", 大驿土: "Highway Earth",
  钗钏金: "Hairpin Gold", 桑柘木: "Mulberry Wood", 大溪水: "Great Stream Water", 沙中土: "Sand Earth", 天上火: "Sky Fire", 石榴木: "Pomegranate Wood", 大海水: "Great Ocean Water",
};
const LUNAR_MONTH_EN: Record<string, string> = { 正: "1", 一: "1", 二: "2", 三: "3", 四: "4", 五: "5", 六: "6", 七: "7", 八: "8", 九: "9", 十: "10", 冬: "11", 十一: "11", 腊: "12", 十二: "12" };

const word = (table: Record<string, string>) => (s: string) => (en() ? (table[s] ?? s) : s);

/** "木" → "Wood" in English. */
export const wxName = word(WX_EN) as (w: string) => string;
export const ganName = word(GAN_EN);
export const zhiName = word(ZHI_EN);
export const animalName = word(ANIMAL_EN);
export const shishenName = word(SHISHEN_EN);
export const dirName = word(DIR_EN);
export const jieqiName = word(JIEQI_EN);
export const nayinName = word(NAYIN_EN);

/** "甲子" → "Jia-Zi" in English. */
export function gzName(gz: string): string {
  if (!en()) return gz;
  return [...gz].map((c) => GAN_EN[c] ?? ZHI_EN[c] ?? c).join("-");
}

/** "壬" → "Ren Water" in English, "壬水" in Chinese. */
export function ganWx(gan: string, wx: string): string {
  return en() ? `${GAN_EN[gan] ?? gan} ${WX_EN[wx as WuXing] ?? wx}` : `${gan}${wx}`;
}

/** Lunar month and day from lunar-javascript ("五", "十五") as "month 5, day 15". */
export function lunarDate(monthCn: string, dayCn: string): string {
  if (!en()) return `${monthCn}月${dayCn}`;
  const leap = monthCn.startsWith("闰");
  const m = monthCn.replace(/^闰/, "");
  return `${leap ? "leap " : ""}month ${LUNAR_MONTH_EN[m] ?? m}, day ${cnDayNum(dayCn)}`;
}

/** "初五" → 5, "廿三" → 23, "三十" → 30. */
export function cnDayNum(d: string): number {
  const D = "一二三四五六七八九";
  const digit = (c: string) => D.indexOf(c) + 1;
  if (d.startsWith("初")) return d[1] === "十" ? 10 : digit(d[1]!);
  if (d.startsWith("廿")) return 20 + (d.length > 1 ? digit(d[1]!) : 0);
  if (d === "二十") return 20;
  if (d === "三十") return 30;
  if (d.startsWith("十")) return 10 + (d.length > 1 ? digit(d[1]!) : 0);
  return digit(d[0]!);
}

/** A list of directions, e.g. "东南" or ["东","西"], for display. */
export const dirList = (ds: string[]) => ds.map(dirName);

export const SIGN_EN: Record<string, string> = {
  白羊座: "Aries", 金牛座: "Taurus", 双子座: "Gemini", 巨蟹座: "Cancer", 狮子座: "Leo", 处女座: "Virgo",
  天秤座: "Libra", 天蝎座: "Scorpio", 射手座: "Sagittarius", 摩羯座: "Capricorn", 水瓶座: "Aquarius", 双鱼座: "Pisces",
};
/** "双子座" (or "双子") → "Gemini" in English. */
export const signName = (s: string) => (en() ? (SIGN_EN[s] ?? SIGN_EN[`${s}座`] ?? s) : s);
