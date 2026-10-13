import type { Chart } from "../core/chart";
import { astrology } from "./astrology";
import { bazi } from "./bazi";
import { chaldean } from "./chaldean";
import { chenggu } from "./chenggu";
import { firdaria } from "./firdaria";
import { hellenistic } from "./hellenistic";
import { kyusei } from "./kyusei";
import { maya } from "./maya";
import { meihua } from "./meihua";
import { numerology } from "./numerology";
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
  kyusei,
  sukuyo,
  astrology,
  hellenistic,
  chaldean,
  firdaria,
  tarot,
  numerology,
  vedic,
  maya,
};

export const METHOD_ORDER = Object.keys(METHODS) as MethodId[];

export { METHOD_NAMES, METHOD_NAMES_EN, methodName } from "./names";

export function runAll(chart: Chart): MethodResult[] {
  return METHOD_ORDER.map((id) => METHODS[id](chart));
}
