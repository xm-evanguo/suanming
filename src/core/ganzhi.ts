import type { WuXing } from "../data/types";

export const GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
export const ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;
export const WUXING: WuXing[] = ["木", "火", "土", "金", "水"];

const GAN_WX: WuXing[] = ["木", "木", "火", "火", "土", "土", "金", "金", "水", "水"];
const ZHI_WX: WuXing[] = ["水", "土", "木", "木", "土", "火", "火", "土", "金", "金", "土", "水"];

export const ganWuXing = (g: string): WuXing => GAN_WX[GAN.indexOf(g as (typeof GAN)[number])]!;
export const zhiWuXing = (z: string): WuXing => ZHI_WX[ZHI.indexOf(z as (typeof ZHI)[number])]!;
export const zhiIndex = (z: string) => ZHI.indexOf(z as (typeof ZHI)[number]);

/** The element that `wx` generates (木→火→土→金→水→木). */
export const generates = (wx: WuXing): WuXing => WUXING[(WUXING.indexOf(wx) + 1) % 5]!;
/** The element that generates `wx`. */
export const generatedBy = (wx: WuXing): WuXing => WUXING[(WUXING.indexOf(wx) + 4) % 5]!;
/** The element that `wx` controls (木克土, 火克金, 土克水, 金克木, 水克火). */
export const controls = (wx: WuXing): WuXing => WUXING[(WUXING.indexOf(wx) + 2) % 5]!;
/** The element that controls `wx`. */
export const controlledBy = (wx: WuXing): WuXing => WUXING[(WUXING.indexOf(wx) + 3) % 5]!;

export type WxRelation = "同" | "生我" | "我生" | "我克" | "克我";

/** Relation of `other` to `self`. */
export function wxRelation(self: WuXing, other: WuXing): WxRelation {
  if (self === other) return "同";
  if (generates(other) === self) return "生我";
  if (generates(self) === other) return "我生";
  if (controls(self) === other) return "我克";
  return "克我";
}

export const ZODIAC_ANIMALS = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];

/** 六合 partner of each branch index. */
export const LIU_HE = [1, 0, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
/** 相害 partner of each branch index. */
export const XIANG_HAI = [7, 6, 5, 4, 3, 2, 1, 0, 11, 10, 9, 8];
/** 三合 group members of each branch index. */
export const SAN_HE = (i: number) => [i, (i + 4) % 12, (i + 8) % 12];
export const CHONG = (i: number) => (i + 6) % 12;

export const digitSum = (n: number) =>
  String(Math.abs(n))
    .split("")
    .reduce((s, ch) => s + Number(ch), 0);
