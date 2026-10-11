import type { Chart } from "../core/chart";
import { astrology } from "./astrology";
import { bazi } from "./bazi";
import { chenggu } from "./chenggu";
import { kyusei } from "./kyusei";
import { maya } from "./maya";
import { meihua } from "./meihua";
import { numerology } from "./numerology";
import { shengxiao } from "./shengxiao";
import { sukuyo } from "./sukuyo";
import { tarot } from "./tarot";
import type { MethodFn, MethodId, MethodResult } from "./types";
import { vedic } from "./vedic";
import { ziwei } from "./ziwei";

export const METHODS: Record<MethodId, MethodFn> = {
  bazi,
  ziwei,
  chenggu,
  meihua,
  shengxiao,
  kyusei,
  sukuyo,
  astrology,
  tarot,
  numerology,
  vedic,
  maya,
} as Record<MethodId, MethodFn>;

export const METHOD_ORDER = Object.keys(METHODS) as MethodId[];

export function runAll(chart: Chart): MethodResult[] {
  return METHOD_ORDER.map((id) => METHODS[id](chart));
}
