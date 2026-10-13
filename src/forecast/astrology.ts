import * as Astro from "astronomy-engine";
import { DAY_MS, norm360, type PlanetKey } from "../core/chart";
import {
  HOUSES,
  JUPITER_STRONG_HOUSES,
  mercuryDirectSoon,
  mercuryRetro,
  MONTH_EVENTS,
  PLANET_TEMPLATES,
  SATURN_STRONG_HOUSES,
  SIGN_TEMPLATES,
  SIGN_THEMES,
  type TransitPlanet,
  YEAR_EVENTS,
} from "../data/forecast-astrology";
import { buildSignal, limitSignals, type Phrase, type Scope } from "../data/forecast-common";
import { PLANETS } from "../data/planets";
import { ZODIAC } from "../data/zodiac";
import { isEn, t } from "../i18n";
import { signOf } from "../methods/astrology";
import { wholeSignHouse } from "../methods/hellenistic";
import { type Forecast, type ForecastFn, forecastPeriods, MONTH_EN, type Period, type PeriodReading, periodInstant, type Signal } from "./types";

const BODY: Record<string, Astro.Body> = {
  sun: Astro.Body.Sun,
  mercury: Astro.Body.Mercury,
  venus: Astro.Body.Venus,
  mars: Astro.Body.Mars,
  jupiter: Astro.Body.Jupiter,
  saturn: Astro.Body.Saturn,
};

/** Tropical geocentric ecliptic longitude of date (same method as `computeChart`). */
function lonAt(key: string, t: Date): number {
  if (key === "sun") return Astro.SunPosition(t).elon;
  return Astro.Ecliptic(Astro.GeoVector(BODY[key]!, t, true)).elon;
}

const signed = (d: number) => ((norm360(d) + 180) % 360) - 180;

/** Dates at which `lons` (sampled at `dates`) cross `target`. */
function crossings(lons: number[], dates: Date[], target: number): Date[] {
  const out: Date[] = [];
  for (let i = 0; i + 1 < lons.length; i++) {
    const a = signed(lons[i]! - target);
    const b = signed(lons[i + 1]! - target);
    if (Math.abs(a) > 25 || Math.abs(b) > 25) continue;
    if ((a <= 0 && b > 0) || (a >= 0 && b < 0)) {
      const f = Math.abs(a) / (Math.abs(a) + Math.abs(b) || 1);
      out.push(new Date(dates[i]!.getTime() + f * (dates[i + 1]!.getTime() - dates[i]!.getTime())));
    }
  }
  return out;
}

function sample(key: string, from: number, to: number, stepDays: number): { dates: Date[]; lons: number[] } {
  const dates: Date[] = [];
  for (let t = from; t <= to; t += stepDays * DAY_MS) dates.push(new Date(t));
  return { dates, lons: dates.map((d) => lonAt(key, d)) };
}

interface Natal {
  known: boolean;
  ascSign: number;
  lon: Record<PlanetKey, number>;
  mc: number;
}

const houseOf = (n: Natal, lon: number) => wholeSignHouse(lon, n.ascSign);
const signName = (lon: number) => ZODIAC[signOf(lon)]!.name;

/** "1st", "2nd", "13th" for a day of the month. */
function ordinal(n: number): string {
  if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`;
  return `${n}${({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th"}`;
}

/** Fill a template with the topic and one scene of house `h`. */
function houseText(tpl: string, h: number, seed: number): string {
  const house = HOUSES[h - 1]!;
  return tpl.replaceAll("{topic}", house.topic).replaceAll("{scene}", house.scenes[seed % house.scenes.length]!);
}

function signText(tpl: string, sign: number): string {
  const s = SIGN_THEMES[sign]!;
  return tpl.replaceAll("{sign}", ZODIAC[sign]!.name).replaceAll("{theme}", s.theme).replaceAll("{scene}", s.scene);
}

/** Transit of one slow planet through a house (or a sign when the birth time is unknown). */
function transitSignal(n: Natal, planet: "jupiter" | "saturn" | TransitPlanet, lon: number, retro: boolean, scope: Scope, key: string, weightYear: 1 | 2 | 3): Signal {
  const tpl = PLANET_TEMPLATES[planet];
  const sign = signOf(lon);
  const seed = sign + Math.floor(lon);
  if (!n.known && (planet === "jupiter" || planet === "saturn")) {
    const th = SIGN_THEMES[sign]!;
    const what = SIGN_TEMPLATES[planet].map((t) => signText(t, sign));
    return buildSignal({
      key,
      scope,
      dim: th.dim,
      tone: tpl.tone,
      weight: scope === "year" ? 2 : 1,
      pro: t(`${PLANET_ZH[planet]}在${ZODIAC[sign]!.name}（出生时间未知，仅按星座）`, `${PLANETS[planet].zh} in ${ZODIAC[sign]!.name} (birth time unknown, sign only)`),
      phrase: { what },
    });
  }
  const h = houseOf(n, lon);
  const house = HOUSES[h - 1]!;
  const pool = retro && tpl.retro ? tpl.retro : tpl.direct;
  return buildSignal({
    key,
    scope,
    dim: house.dim,
    tone: tpl.tone,
    weight: scope === "year" ? weightYear : 1,
    pro: t(`${PLANET_ZH[planet]}${retro ? "逆行" : ""}过境${ZODIAC[sign]!.name}，落本命第 ${h} 宫（整宫制）：${house.topic}`, `${PLANETS[planet].zh}${retro ? " (retrograde)" : ""} transiting ${ZODIAC[sign]!.name}, in natal house ${h} (whole-sign): ${house.topic}`),
    phrase: { what: pool.map((t, i) => houseText(t, h, seed + i)) },
  });
}

const PLANET_ZH: Record<string, string> = { sun: "太阳", mercury: "水星", venus: "金星", mars: "火星", jupiter: "木星", saturn: "土星" };
/** How a transit angle reads in English: 0 conjunct, 90 square, 180 opposite. */
const ASPECT_EN: Record<string, string> = { "0": "conjunct", "90": "square", "180": "opposite" };

function isRetro(key: string, t: Date): boolean {
  let d = lonAt(key, new Date(t.getTime() + DAY_MS)) - lonAt(key, t);
  d = signed(d);
  return d < 0;
}

function yearReading(n: Natal, p: Period): PeriodReading {
  const key = (r: string) => `astrology:year:${p.year}:${r}`;
  const mid = periodInstant(p);
  const jLon = lonAt("jupiter", mid);
  const sLon = lonAt("saturn", mid);
  const out: Signal[] = [];

  const jh = houseOf(n, jLon);
  const sh = houseOf(n, sLon);
  out.push(transitSignal(n, "jupiter", jLon, false, "year", key("jupiter"), n.known && JUPITER_STRONG_HOUSES.includes(jh) ? 3 : 2));
  out.push(transitSignal(n, "saturn", sLon, false, "year", key("saturn"), n.known && SATURN_STRONG_HOUSES.includes(sh) ? 3 : 2));

  const from = Date.UTC(p.year, 0, 1, 12);
  const to = Date.UTC(p.year, 11, 31, 12);
  const jup = sample("jupiter", from, to, 5);
  const sat = sample("saturn", from, to, 7);
  const natal = n.lon;
  const add = (ev: string, pro: string) => {
    const e = YEAR_EVENTS[ev]!;
    out.push(buildSignal({ key: key(ev), scope: "year", dim: e.dim, tone: e.tone, weight: e.weight, pro: t(`${p.year} 年：${pro}（${e.label}）`, `${p.year}: ${pro} (${e.label})`), phrase: e.phrase }));
  };
  if (crossings(jup.lons, jup.dates, natal.jupiter).length) add("jupiter-return", t(`行运木星回到本命木星位置（${signName(natal.jupiter)}）`, `transiting Jupiter returns to natal Jupiter (${signName(natal.jupiter)})`));
  if (crossings(sat.lons, sat.dates, natal.saturn).length) add("saturn-return", t(`行运土星回到本命土星位置（${signName(natal.saturn)}）`, `transiting Saturn returns to natal Saturn (${signName(natal.saturn)})`));
  const satAngles: [string, number[]][] = [["0", [0]], ["90", [90, -90]], ["180", [180]]];
  for (const [name, offs] of satAngles) {
    if (offs.some((o) => crossings(sat.lons, sat.dates, norm360(natal.sun + o)).length)) add(`saturn-sun-${name}`, t(`行运土星${name === "0" ? "合" : name === "90" ? "刑" : "冲"}本命太阳（${signName(natal.sun)}）`, `transiting Saturn ${ASPECT_EN[name]} natal Sun (${signName(natal.sun)})`));
    if (n.known && offs.some((o) => crossings(sat.lons, sat.dates, norm360(natal.moon + o)).length)) add(`saturn-moon-${name}`, t(`行运土星${name === "0" ? "合" : name === "90" ? "刑" : "冲"}本命月亮（${signName(natal.moon)}）`, `transiting Saturn ${ASPECT_EN[name]} natal Moon (${signName(natal.moon)})`));
  }
  if (crossings(jup.lons, jup.dates, natal.sun).length) add("jupiter-sun-0", t(`行运木星合本命太阳（${signName(natal.sun)}）`, `transiting Jupiter conjunct natal Sun (${signName(natal.sun)})`));
  if (n.known && crossings(jup.lons, jup.dates, natal.moon).length) add("jupiter-moon-0", t(`行运木星合本命月亮（${signName(natal.moon)}）`, `transiting Jupiter conjunct natal Moon (${signName(natal.moon)})`));

  const label = n.known
    ? t(`木星${signName(jLon)}（第 ${jh} 宫）· 土星${signName(sLon)}（第 ${sh} 宫）`, `Jupiter in ${signName(jLon)} (house ${jh}) · Saturn in ${signName(sLon)} (house ${sh})`)
    : t(`木星${signName(jLon)} · 土星${signName(sLon)}`, `Jupiter in ${signName(jLon)} · Saturn in ${signName(sLon)}`);
  return { period: p, label, signals: limitSignals(out) };
}

const dayCount = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();

function monthReading(n: Natal, p: Period, prev: { jh: number; jr: boolean; sh: number; sr: boolean }, i: number): { r: PeriodReading; state: typeof prev } {
  const key = (r: string) => `astrology:month:${p.year}-${p.month}:${r}`;
  const mid = periodInstant(p);
  const out: Signal[] = [];
  const lonOf = (k: string) => lonAt(k, mid);
  const jLon = lonOf("jupiter");
  const sLon = lonOf("saturn");
  const jr = isRetro("jupiter", mid);
  const sr = isRetro("saturn", mid);
  const jh = n.known ? houseOf(n, jLon) : signOf(jLon);
  const sh = n.known ? houseOf(n, sLon) : signOf(sLon);
  const state = { jh, jr, sh, sr };

  // Jupiter and Saturn change slowly, so show each one when it changed, and otherwise take turns.
  if (jh !== prev.jh || jr !== prev.jr || i % 2 === 0) out.push(transitSignal(n, "jupiter", jLon, jr, "month", key("jupiter"), 1));
  if (sh !== prev.sh || sr !== prev.sr || i % 2 === 1) out.push(transitSignal(n, "saturn", sLon, sr, "month", key("saturn"), 1));

  const sunLon = lonOf("sun");
  if (n.known) {
    for (const k of ["sun", "mars", "venus"] as const) {
      const lon = lonOf(k);
      out.push(transitSignal(n, k, lon, false, "month", key(k), 1));
    }
  }

  if (!n.known) {
    // Without houses, the Sun's sign still sets the mood of the month.
    const sg = signOf(sunLon);
    out.push(
      buildSignal({
        key: key("sun"),
        scope: "month",
        dim: SIGN_THEMES[sg]!.dim,
        tone: "mixed",
        weight: 1,
        pro: t(`太阳过境${ZODIAC[sg]!.name}（出生时间未知，仅按星座）`, `Sun transiting ${ZODIAC[sg]!.name} (birth time unknown, sign only)`),
        phrase: { what: SIGN_TEMPLATES.sun.map((t) => signText(t, sg)) },
      }),
    );
  }

  // Daily scan of the calendar month for exact conjunctions and oppositions to natal points.
  const days = dayCount(p.year, p.month!);
  const start = Date.UTC(p.year, p.month! - 1, 1, 12) - DAY_MS;
  const fast: Record<string, { dates: Date[]; lons: number[] }> = {};
  for (const k of ["sun", "venus", "mars", "mercury"]) fast[k] = sample(k, start, start + (days + 1) * DAY_MS, 1);
  const targets: Record<string, number | undefined> = { sun: n.lon.sun, venus: n.lon.venus, moon: n.known ? n.lon.moon : undefined, mc: n.known ? n.mc : undefined };
  const inMonth = (d: Date) => d.getUTCMonth() === p.month! - 1;
  const events: { id: string; day: number }[] = [];
  for (const planet of ["venus", "mars", "sun"] as const)
    for (const [tname, tlon] of Object.entries(targets)) {
      if (tlon === undefined) continue;
      for (const angle of [0, 180]) {
        const id = `${planet}-${tname}-${angle}`;
        if (!MONTH_EVENTS[id]) continue;
        const hit = crossings(fast[planet]!.lons, fast[planet]!.dates, norm360(tlon + angle)).find(inMonth);
        if (hit) events.push({ id, day: hit.getUTCDate() });
      }
    }
  for (const ev of events) {
    const e = MONTH_EVENTS[ev.id]!;
    const [planet, tname, angle] = ev.id.split("-") as [string, string, string];
    const tz = t({ sun: "本命太阳", venus: "本命金星", moon: "本命月亮", mc: "本命天顶" }[tname]!, { sun: "natal Sun", venus: "natal Venus", moon: "natal Moon", mc: "natal Midheaven" }[tname]!);
    out.push(
      buildSignal({
        key: key(ev.id),
        scope: "month",
        dim: e.dim,
        tone: e.tone,
        weight: e.weight,
        pro: t(`${p.year} 年 ${p.month} 月 ${ev.day} 日前后：行运${PLANET_ZH[planet]}${angle === "0" ? "合" : "冲"}${tz}`, `Around ${MONTH_EN[p.month! - 1]} ${ev.day}, ${p.year}: transiting ${PLANETS[planet as PlanetKey].zh} ${angle === "0" ? "conjunct" : "opposite"} ${tz}`),
        phrase: { what: e.what.map((w) => w.replaceAll("{day}", isEn() ? ordinal(ev.day) : `${ev.day}日`)) },
      }),
    );
  }

  // Mercury retrograde: use the daily longitudes already sampled.
  const mer = fast.mercury!;
  const retroDays: number[] = [];
  for (let d = 1; d <= days; d++) {
    const idx = d; // index 0 is the day before the 1st
    if (signed(mer.lons[idx + 1]! - mer.lons[idx]!) < 0) retroDays.push(d);
  }
  if (retroDays.length) {
    const first = retroDays[0]!;
    const last = retroDays[retroDays.length - 1]!;
    const endsThisMonth = last < days;
    const startsEarlier = first === 1;
    const range = first === last ? `${first}日` : `${first}日–${last}日`;
    const rangeEn = first === last ? `${MONTH_EN[p.month! - 1]} ${first}` : `${MONTH_EN[p.month! - 1]} ${first}–${last}`;
    let phrase: Phrase = mercuryRetro();
    let rangeText = isEn() ? (first === last ? `the ${ordinal(first)}` : `the ${ordinal(first)} to the ${ordinal(last)}`) : range;
    if (startsEarlier && endsThisMonth) {
      phrase = mercuryDirectSoon();
      rangeText = isEn() ? `the ${ordinal(last + 1)}` : `${last + 1}日`;
    }
    out.push(
      buildSignal({
        key: key("mercury"),
        scope: "month",
        dim: "wisdom",
        tone: "mixed",
        weight: retroDays.length >= 7 ? 2 : 1,
        pro: t(`${p.year} 年 ${p.month} 月：水星逆行 ${range}（按逐日黄经推算）`, `${MONTH_EN[p.month! - 1]} ${p.year}: Mercury retrograde ${rangeEn} (from daily longitudes)`),
        phrase: { ...phrase, what: phrase.what.map((w) => w.replaceAll("{range}", rangeText)) },
      }),
    );
  }

  const retroNote = retroDays.length ? t(" · 水星逆行", " · Mercury retrograde") : "";
  const label = t(
    `太阳${signName(sunLon)}${n.known ? `（第 ${houseOf(n, sunLon)} 宫）` : ""} · 木星${signName(jLon)}${jr ? "逆行" : ""}${retroNote}`,
    `Sun in ${signName(sunLon)}${n.known ? ` (house ${houseOf(n, sunLon)})` : ""} · Jupiter in ${signName(jLon)}${jr ? " retrograde" : ""}${retroNote}`,
  );
  return { r: { period: p, label, signals: limitSignals(out) }, state };
}

export const astrologyForecast: ForecastFn = (chart, now): Forecast => {
  const lon = Object.fromEntries(Object.entries(chart.planets).map(([k, v]) => [k, v.lon])) as Record<PlanetKey, number>;
  const n: Natal = { known: chart.input.timeKnown, ascSign: signOf(chart.asc), lon, mc: chart.mc };
  const { years, months } = forecastPeriods(now);

  // State of the month before the first one, so that the first month shows what has changed.
  const first = months[0]!;
  const before = periodInstant({ year: first.month === 1 ? first.year - 1 : first.year, month: first.month === 1 ? 12 : first.month! - 1 });
  const bj = lonAt("jupiter", before);
  const bs = lonAt("saturn", before);
  let prev = {
    jh: n.known ? houseOf(n, bj) : signOf(bj),
    jr: isRetro("jupiter", before),
    sh: n.known ? houseOf(n, bs) : signOf(bs),
    sr: isRetro("saturn", before),
  };
  const monthReadings: PeriodReading[] = [];
  months.forEach((p, i) => {
    const res = monthReading(n, p, prev, i);
    prev = res.state;
    monthReadings.push(res.r);
  });

  return {
    years: years.map((p) => yearReading(n, p)),
    months: monthReadings,
    ...(n.known ? {} : { note: t("出生时间未知，宫位无法确定，这里只使用木星、土星所在的星座和它们与本命太阳的关系，没有宫位判断。", "Your birth time is unknown, so the houses cannot be fixed. This reading uses only the signs Jupiter and Saturn are in and how they relate to your natal Sun, with no house readings.") }),
  };
};
