import type { Chart } from "../core/chart";
import type { Dim } from "../data/types";
import type { MethodId } from "../methods/types";

export type Tone = "good" | "bad" | "mixed";

/** One concrete statement about one life area in one period. */
export interface Signal {
  dim: Dim;
  tone: Tone;
  /** 1 = minor hint, 2 = clear sign, 3 = strong sign in this system. */
  weight: 1 | 2 | 3;
  /** Technical statement that names the rule, e.g. "流月甲申：申为日主天乙贵人". */
  pro: string;
  /**
   * Plain, specific, everyday statement in the second person, e.g.
   * "这个月容易遇到愿意拉你一把的人。有想推进的事，主动找前辈或上司聊一聊。"
   * Do not give medical, legal or investment instructions.
   */
  plain: string;
}

/** A Gregorian year, or a Gregorian month when `month` is set (1-12). */
export interface Period {
  year: number;
  month?: number;
}

export interface PeriodReading {
  period: Period;
  /** What rules this period in this system, e.g. "流年丁未 · 伤官", "小限第10宫 · 年主星火星". */
  label: string;
  signals: Signal[];
}

export interface Forecast {
  /** Readings for this year and the next two years (3 items), or empty. */
  years: PeriodReading[];
  /** Readings for the current month and the next 11 months (12 items), or empty. */
  months: PeriodReading[];
  /** Short note when the system has no year or month rule. */
  note?: string;
}

/** `now` is passed in so that tests are deterministic. */
export type ForecastFn = (chart: Chart, now: Date) => Forecast;

export type ForecastRegistry = Partial<Record<MethodId, ForecastFn>>;

/** The 3 years and 12 months that every forecast covers. */
export function forecastPeriods(now: Date): { years: Period[]; months: Period[] } {
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const years = [0, 1, 2].map((i) => ({ year: y + i }));
  const months = Array.from({ length: 12 }, (_, i) => {
    const k = m - 1 + i;
    return { year: y + Math.floor(k / 12), month: (k % 12) + 1 };
  });
  return { years, months };
}

/**
 * A representative instant for a period: the 15th of the month at 12:00 UTC, or 1 July for a year.
 * Systems with solar-term months (八字, 九星) use the term month that contains this instant.
 */
export function periodInstant(p: Period): Date {
  return p.month ? new Date(Date.UTC(p.year, p.month - 1, 15, 12)) : new Date(Date.UTC(p.year, 6, 1, 12));
}
