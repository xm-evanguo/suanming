import type { Chart } from "../core/chart";
import type { MethodId } from "../methods/types";
import { astrologyForecast } from "./astrology";
import { baziForecast } from "./bazi";
import { firdariaForecast } from "./firdaria";
import { hellenisticForecast } from "./hellenistic";
import { kyuseiForecast } from "./kyusei";
import { numerologyForecast } from "./numerology";
import { tarotForecast } from "./tarot";
import type { Forecast, ForecastFn, ForecastRegistry } from "./types";
import { vedicForecast } from "./vedic";
import { ziweiForecast } from "./ziwei";

/**
 * 宿曜 has a yearly 九曜 cycle by 数え年 in 宿曜道, but its table differs by source and by sex,
 * and I could not confirm it from a reliable source. This site reads 宿曜 as a natal and daily system only.
 */
const sukuyoForecast: ForecastFn = () => ({
  years: [],
  months: [],
  note: "本站的宿曜只按本命宿和每日运势来读，没有可靠的年运、月运推算规则，所以不给出年度和月度预测。",
});

/** Systems that have a period forecast. 称骨, 梅花易数, 迦勒底七曜 and 玛雅历 are natal or moment readings only. */
export const FORECASTS: ForecastRegistry = {
  bazi: baziForecast,
  ziwei: ziweiForecast,
  kyusei: kyuseiForecast,
  sukuyo: sukuyoForecast,
  astrology: astrologyForecast,
  hellenistic: hellenisticForecast,
  firdaria: firdariaForecast,
  tarot: tarotForecast,
  numerology: numerologyForecast,
  vedic: vedicForecast,
};

/** Run every registered forecast for `chart`. `now` is passed in so that tests are deterministic. */
export function runForecasts(chart: Chart, now: Date): Partial<Record<MethodId, Forecast>> {
  const out: Partial<Record<MethodId, Forecast>> = {};
  for (const [id, fn] of Object.entries(FORECASTS) as [MethodId, ForecastFn][]) out[id] = fn(chart, now);
  return out;
}
