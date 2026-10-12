import * as Astro from "astronomy-engine";
import { Solar } from "lunar-javascript";
import type { City } from "./cities";

export type Gender = "male" | "female";

export interface BirthInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  /** False when the user does not know the birth time. We then use 12:00 and flag hour-based results. */
  timeKnown: boolean;
  city: City;
  gender: Gender;
  /** Use true solar time (longitude + equation of time) for the Chinese methods. */
  trueSolar: boolean;
}

export type PlanetKey = "sun" | "moon" | "mercury" | "venus" | "mars" | "jupiter" | "saturn" | "uranus" | "neptune" | "pluto";

export const PLANET_KEYS: PlanetKey[] = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];

export interface PlanetPos {
  key: PlanetKey;
  /** Geocentric ecliptic longitude of date, degrees 0-360. */
  lon: number;
  retro: boolean;
}

export interface YMDHM {
  y: number;
  m: number;
  d: number;
  h: number;
  mi: number;
}

export interface Chart {
  input: BirthInput;
  utc: Date;
  /** Offset of the civil time zone from UTC at birth, minutes (includes DST). */
  tzOffset: number;
  isDst: boolean;
  /** Longitude correction from zone time to local mean time, minutes. */
  lonCorrection: number;
  /** Equation of time (apparent - mean solar time), minutes. */
  eot: number;
  /** Local apparent (true) solar time at the birth place. */
  trueSolarTime: YMDHM;
  /** Time used for the Chinese calendar methods: true solar time or civil time. */
  cnTime: YMDHM;
  // biome-ignore lint: lunar-javascript is untyped
  lunar: any;
  // biome-ignore lint: lunar-javascript is untyped
  eightChar: any;
  planets: Record<PlanetKey, PlanetPos>;
  /** Ascendant and Midheaven, tropical ecliptic longitudes. */
  asc: number;
  mc: number;
  /** Local apparent sidereal time, hours. */
  lst: number;
  /** Moon - Sun elongation, degrees 0-360 (0 new moon, 180 full moon). */
  moonPhase: number;
  /** Previous and next major solar terms around birth. */
  prevJieQi: { name: string; time: string };
  nextJieQi: { name: string; time: string };
  julianDay: number;
}

export const pad = (n: number) => String(n).padStart(2, "0");
/** "1990-05-15" and "14:30" for date and time inputs and birth lines. */
export const inputDate = (i: BirthInput) => `${i.year}-${pad(i.month)}-${pad(i.day)}`;
export const inputTime = (i: BirthInput) => `${pad(i.hour)}:${pad(i.minute)}`;

/** Offset (minutes) of a time zone from UTC at a given instant, read from the platform's tz database. */
export function tzOffsetMinutes(utcMs: number, tz: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const p: Record<string, number> = {};
  for (const part of dtf.formatToParts(new Date(utcMs))) if (part.type !== "literal") p[part.type] = Number(part.value);
  const asUtc = Date.UTC(p.year!, p.month! - 1, p.day!, p.hour!, p.minute!, p.second!);
  return Math.round((asUtc - utcMs) / 60000);
}

/** Convert a wall-clock time in an IANA zone to a UTC instant. Handles historical DST. */
export function zonedToUtc(t: YMDHM, tz: string): { utc: Date; offset: number } {
  const guess = Date.UTC(t.y, t.m - 1, t.d, t.h, t.mi);
  let offset = tzOffsetMinutes(guess, tz);
  let utc = guess - offset * 60000;
  const second = tzOffsetMinutes(utc, tz);
  if (second !== offset) {
    offset = second;
    utc = guess - offset * 60000;
  }
  return { utc: new Date(utc), offset };
}

function fromMs(ms: number): YMDHM {
  const d = new Date(ms);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), h: d.getUTCHours(), mi: d.getUTCMinutes() };
}

export const DAY_MS = 86_400_000;
export const YEAR_MS = 365.2425 * DAY_MS;
export const norm360 = (x: number) => ((x % 360) + 360) % 360;
const rad = Math.PI / 180;

function eclipticLon(body: Astro.Body, t: Date): number {
  if (body === Astro.Body.Sun) return Astro.SunPosition(t).elon;
  if (body === Astro.Body.Moon) return Astro.EclipticGeoMoon(t).lon;
  return Astro.Ecliptic(Astro.GeoVector(body, t, true)).elon;
}

const BODY: Record<PlanetKey, Astro.Body> = {
  sun: Astro.Body.Sun,
  moon: Astro.Body.Moon,
  mercury: Astro.Body.Mercury,
  venus: Astro.Body.Venus,
  mars: Astro.Body.Mars,
  jupiter: Astro.Body.Jupiter,
  saturn: Astro.Body.Saturn,
  uranus: Astro.Body.Uranus,
  neptune: Astro.Body.Neptune,
  pluto: Astro.Body.Pluto,
};

/** Mean obliquity of the ecliptic (degrees) for a date. */
function obliquity(t: Date): number {
  const T = Astro.MakeTime(t).tt / 36525;
  return 23.439291 - 0.0130042 * T;
}

/** Ascendant and MC from local sidereal time (hours), latitude and obliquity. */
export function ascMc(lstHours: number, lat: number, eps: number): { asc: number; mc: number } {
  const ramc = lstHours * 15 * rad;
  const e = eps * rad;
  const mc = norm360(Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(e)) / rad);
  const asc = norm360(Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(e) + Math.tan(lat * rad) * Math.sin(e))) / rad);
  return { asc, mc };
}

export function computeChart(input: BirthInput): Chart {
  const civil: YMDHM = { y: input.year, m: input.month, d: input.day, h: input.hour, mi: input.minute };
  const { utc, offset } = zonedToUtc(civil, input.city.tz);
  const jan = tzOffsetMinutes(Date.UTC(input.year, 0, 1), input.city.tz);
  const jul = tzOffsetMinutes(Date.UTC(input.year, 6, 1), input.city.tz);
  const isDst = offset > Math.min(jan, jul);

  // Apparent solar time = Sun hour angle + 12h. The equation of time is its difference from mean solar time.
  const observer = new Astro.Observer(input.city.lat, input.city.lon, 0);
  const hourAngle = Astro.HourAngle(Astro.Body.Sun, utc, observer);
  const meanSolarMs = utc.getTime() + input.city.lon * 240000;
  const meanSolarHours = (((meanSolarMs / 3600000) % 24) + 24) % 24;
  let eotHours = (hourAngle + 12) % 24 - meanSolarHours;
  if (eotHours > 12) eotHours -= 24;
  if (eotHours < -12) eotHours += 24;
  const eot = eotHours * 60;
  const lonCorrection = input.city.lon * 4 - offset;
  const trueSolarMs = meanSolarMs + eot * 60000;
  const trueSolarTime = fromMs(trueSolarMs);
  const cnTime = input.trueSolar ? trueSolarTime : civil;

  const solar = Solar.fromYmdHms(cnTime.y, cnTime.m, cnTime.d, cnTime.h, cnTime.mi, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  const prev = lunar.getPrevJieQi(true);
  const next = lunar.getNextJieQi(true);

  const dayLater = new Date(utc.getTime() + DAY_MS);
  const planets = {} as Record<PlanetKey, PlanetPos>;
  for (const key of PLANET_KEYS) {
    const lon = eclipticLon(BODY[key], utc);
    const lon2 = eclipticLon(BODY[key], dayLater);
    const delta = ((lon2 - lon + 540) % 360) - 180;
    planets[key] = { key, lon, retro: key !== "sun" && key !== "moon" && delta < 0 };
  }

  const gast = Astro.SiderealTime(utc);
  const lst = (((gast + input.city.lon / 15) % 24) + 24) % 24;
  const { asc, mc } = ascMc(lst, input.city.lat, obliquity(utc));

  return {
    input,
    utc,
    tzOffset: offset,
    isDst,
    lonCorrection,
    eot,
    trueSolarTime,
    cnTime,
    lunar,
    eightChar,
    planets,
    asc,
    mc,
    lst,
    moonPhase: norm360(planets.moon.lon - planets.sun.lon),
    prevJieQi: { name: prev.getName(), time: prev.getSolar().toYmdHms() },
    nextJieQi: { name: next.getName(), time: next.getSolar().toYmdHms() },
    julianDay: Astro.MakeTime(utc).ut + 2451545.0,
  };
}

export const fmtTime = (t: YMDHM) => `${t.y}-${pad(t.m)}-${pad(t.d)} ${pad(t.h)}:${pad(t.mi)}`;

export const fmtOffset = (min: number) => {
  const s = min >= 0 ? "+" : "-";
  const a = Math.abs(min);
  return `UTC${s}${pad(Math.floor(a / 60))}:${pad(a % 60)}`;
};
