import * as Astro from "astronomy-engine";
import { DAY_MS, norm360 } from "../core/chart";
import { buildSignal, limitSignals, type Scope } from "../data/forecast-common";
import { GRAHA, JUPITER_GOCHARA, SADE_SATI, SUN_GOCHARA } from "../data/forecast-vedic";
import { DASHA, lahiri, vedic } from "../methods/vedic";
import { type Forecast, type ForecastFn, forecastPeriods, type Period, type PeriodReading, periodInstant, type Signal } from "./types";

const YEAR = 365.25 * DAY_MS;
const NAK_SPAN = 360 / 27;

interface Span {
  lord: string;
  start: number;
  end: number;
}

/** Split a span of `lord` into 9 sub-periods; the first belongs to the same lord (Vimshottari rule). */
function subPeriods(lord: string, start: number, end: number): Span[] {
  const li = DASHA.findIndex((d) => d.lord === lord);
  let cursor = start;
  return Array.from({ length: 9 }, (_, i) => {
    const d = DASHA[(li + i) % 9]!;
    const len = ((end - start) * d.years) / 120;
    const s = { lord: d.lord, start: cursor, end: cursor + len };
    cursor += len;
    return s;
  });
}

/** Mahadasha list starting at the beginning of the first (partly elapsed) dasha. */
function mahadashas(birth: number, nakshatra: number, moonSid: number): Span[] {
  const first = nakshatra % 9;
  const elapsed = (moonSid - nakshatra * NAK_SPAN) / NAK_SPAN;
  let cursor = birth - DASHA[first]!.years * elapsed * YEAR;
  const out: Span[] = [];
  for (let i = 0; i < 18; i++) {
    const d = DASHA[(first + i) % 9]!;
    out.push({ lord: d.lord, start: cursor, end: cursor + d.years * YEAR });
    cursor += d.years * YEAR;
  }
  return out;
}

const sidLon = (body: Astro.Body, t: Date) => norm360((body === Astro.Body.Sun ? Astro.SunPosition(t).elon : Astro.Ecliptic(Astro.GeoVector(body, t, true)).elon) - lahiri(t));
/** House counted from the Moon sign (1 = same sign). */
const fromMoon = (lon: number, moonSign: number) => ((Math.floor(lon / 30) - moonSign + 12) % 12) + 1;

const fmt = (ms: number) => {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
};

export const vedicForecast: ForecastFn = (chart, now): Forecast => {
  const v = vedic(chart).visual;
  const moonSign = Math.floor(v.moonSid / 30);
  const maha = mahadashas(chart.utc.getTime(), v.nakshatra, v.moonSid);
  const at = (spans: Span[], t: number) => spans.find((s) => t >= s.start && t < s.end)!;
  const levels = (t: number) => {
    const m = at(maha, t);
    const a = at(subPeriods(m.lord, m.start, m.end), t);
    const p = at(subPeriods(a.lord, a.start, a.end), t);
    return { m, a, p };
  };
  const { years, months } = forecastPeriods(now);

  const yearReading = (p: Period): PeriodReading => {
    const scope: Scope = "year";
    const key = (r: string) => `vedic:year:${p.year}:${r}`;
    const mid = periodInstant(p).getTime();
    const from = Date.UTC(p.year, 0, 1);
    const to = Date.UTC(p.year + 1, 0, 1);
    const out: Signal[] = [];
    const { m } = levels(mid);
    const g = GRAHA[m.lord]!;
    out.push(
      buildSignal({
        key: key("maha"),
        scope,
        dim: g.dim,
        tone: g.tone,
        weight: 2,
        pro: `Vimshottari 大运：${m.lord}大运（${fmt(m.start)} 至 ${fmt(m.end)}）`,
        phrase: { what: g.maha },
      }),
    );

    const antars = subPeriods(m.lord, m.start, m.end).filter((a) => a.end > from && a.start < to);
    const ranked = antars.map((a) => ({ a, overlap: Math.min(a.end, to) - Math.max(a.start, from) })).sort((x, y) => y.overlap - x.overlap).slice(0, 2);
    for (const { a } of ranked) {
      const ag = GRAHA[a.lord]!;
      const starts = a.start > from;
      const startMonth = new Date(a.start).getUTCMonth() + 1;
      const endMonth = new Date(a.end).getUTCMonth() + 1;
      const lead = starts ? `大约从 ${startMonth} 月起，进入新的阶段。` : a.end < to ? `大约到 ${endMonth} 月为止，` : "";
      out.push(
        buildSignal({
          key: key(`antar:${a.lord}`),
          scope,
          dim: ag.dim,
          tone: ag.tone,
          weight: a === ranked[0]!.a ? 2 : 1,
          pro: `${m.lord}大运·${a.lord}小运（${fmt(a.start)} 至 ${fmt(a.end)}）`,
          phrase: { what: ag.antar.map((w) => lead + w) },
        }),
      );
    }

    // 七年半土星期: Saturn in the 12th, 1st or 2nd sign from the natal Moon sign.
    const houses = [from, mid, to - DAY_MS].map((t) => fromMoon(sidLon(Astro.Body.Saturn, new Date(t)), moonSign));
    const stage = houses.includes(1) ? "peak" : houses.includes(12) ? "rising" : houses.includes(2) ? "setting" : undefined;
    if (stage) {
      const s = SADE_SATI[stage];
      out.push(buildSignal({ key: key("sadesati"), scope, dim: "health", tone: "mixed", weight: s.weight, pro: `${p.year} 年：${s.label}（土星距月亮星座第 ${houses.join("、")} 宫）`, phrase: s.phrase }));
    }

    const jh = fromMoon(sidLon(Astro.Body.Jupiter, new Date(mid)), moonSign);
    const jg = JUPITER_GOCHARA[jh];
    if (jg) out.push(buildSignal({ key: key("jupiter"), scope, dim: jg.dim, tone: jg.tone, weight: jg.weight, pro: `${p.year} 年中：木星（恒星黄道）距月亮星座第 ${jh} 宫`, phrase: jg.phrase }));

    const a = levels(mid).a;
    return { period: p, label: `${m.lord}大运 · ${a.lord}小运${stage ? " · 七年半土星期" : ""}`, signals: limitSignals(out) };
  };

  const monthReading = (p: Period): PeriodReading => {
    const scope: Scope = "month";
    const key = (r: string) => `vedic:month:${p.year}-${p.month}:${r}`;
    const mid = periodInstant(p).getTime();
    const from = Date.UTC(p.year, p.month! - 1, 1);
    const to = Date.UTC(p.year, p.month!, 1);
    const { m, a, p: pr } = levels(mid);
    const out: Signal[] = [];

    // Antardasha: a change inside the month is a stronger signal.
    const changeAt = [a.start, a.end].find((t) => t > from && t < to);
    const ag = GRAHA[a.lord]!;
    const next = changeAt && changeAt === a.end ? levels(a.end + DAY_MS).a : undefined;
    const target = next ?? a;
    const tg = GRAHA[target.lord]!;
    const when = changeAt ? `约在 ${new Date(changeAt).getUTCDate()} 日，` : "";
    out.push(
      buildSignal({
        key: key("antar"),
        scope,
        dim: tg.dim,
        tone: tg.tone,
        weight: changeAt ? 2 : 1,
        pro: changeAt
          ? `${m.lord}大运内小运换主：${a.lord}小运${changeAt === a.end ? `结束，进入${target.lord}小运` : "开始"}（${fmt(changeAt)}）`
          : `${m.lord}大运·${a.lord}小运（${fmt(a.start)} 至 ${fmt(a.end)}）`,
        phrase: { what: (changeAt ? tg.antar.map((w) => `{T}${when}换成${target.lord}主事。${w}`) : ag.antar) },
      }),
    );

    const pg = GRAHA[pr.lord]!;
    out.push(
      buildSignal({
        key: key("praty"),
        scope,
        dim: pg.dim,
        tone: pg.tone,
        weight: 1,
        pro: `${m.lord}大运·${a.lord}小运·${pr.lord}细运（${fmt(pr.start)} 起约 ${Math.max(1, Math.round((pr.end - pr.start) / DAY_MS))} 天）`,
        phrase: { what: pg.praty },
      }),
    );

    const sh = fromMoon(sidLon(Astro.Body.Sun, new Date(mid)), moonSign);
    const sg = SUN_GOCHARA[sh];
    if (sg) out.push(buildSignal({ key: key("sun"), scope, dim: sg.dim, tone: "good", weight: 1, pro: `${p.year} 年 ${p.month} 月：太阳（恒星黄道）距月亮星座第 ${sh} 宫（吉位 3、6、10、11）`, phrase: sg.phrase }));

    return { period: p, label: `${m.lord}大运 · ${(next ?? a).lord}小运 · ${pr.lord}细运`, signals: limitSignals(out) };
  };

  return {
    years: years.map(yearReading),
    months: months.map(monthReading),
    ...(chart.input.timeKnown ? {} : { note: "出生时间未知，月亮位置有半天左右的误差，大运交接的年份可能偏差数年，仅供参考。" }),
  };
};
