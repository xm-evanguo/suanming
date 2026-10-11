import { hash, pick } from "../data/forecast-common";
import { PERSONAL_MONTH_READINGS, PERSONAL_YEAR_READINGS } from "../data/forecast-numerology";
import { PERSONAL_YEAR } from "../data/numerology";
import { reduce } from "../methods/numerology";
import { type Forecast, type ForecastFn, forecastPeriods, type Period, type PeriodReading, type Signal } from "./types";

/** Personal year: birth month + birth day + calendar year, each reduced, then the sum reduced to 1-9. */
export function personalYear(month: number, day: number, year: number): number {
  return reduce(reduce(month, false) + reduce(day, false) + reduce(year, false), false);
}

/** Personal month: personal year + calendar month, reduced to 1-9. */
export function personalMonth(py: number, calendarMonth: number): number {
  return reduce(py + calendarMonth, false);
}

export const numerologyForecast: ForecastFn = (chart, now): Forecast => {
  const { month, day } = chart.input;
  const { years, months } = forecastPeriods(now);

  const yearReading = (p: Period): PeriodReading => {
    const py = personalYear(month, day, p.year);
    const proBase = `${p.year} 个人年数：${month} + ${day} + ${p.year} → ${py}`;
    const signals: Signal[] = PERSONAL_YEAR_READINGS[py]!.map((r, i) => ({
      dim: r.dim,
      tone: r.tone,
      weight: i === 0 ? 2 : 1,
      pro: `${proBase}（${PERSONAL_YEAR[py]!.name}）`,
      plain: pick(r.plain, hash(`num:${p.year}:${i}`)),
    }));
    return { period: p, label: PERSONAL_YEAR[py]!.name, signals };
  };

  const monthReading = (p: Period): PeriodReading => {
    const py = personalYear(month, day, p.year);
    const pm = personalMonth(py, p.month!);
    const signals: Signal[] = PERSONAL_MONTH_READINGS[pm]!.map((r, i) => ({
      dim: r.dim,
      tone: r.tone,
      weight: i === 0 ? 2 : 1,
      pro: `${p.year} 年 ${p.month} 月个人月数：个人年 ${py} + ${p.month} 月 → ${pm}`,
      plain: pick(r.plain, hash(`num:${p.year}-${p.month}:${i}`)),
    }));
    return { period: p, label: `个人年 ${py} · 个人月 ${pm}`, signals };
  };

  return { years: years.map(yearReading), months: months.map(monthReading) };
};
