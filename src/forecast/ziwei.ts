import { buildSignal, limitSignals, type Phrase, type Scope } from "../data/forecast-common";
import { AREAS, FOCUS_TEMPLATES, HELPER_PHRASES, MUTAGEN_TEMPLATES } from "../data/forecast-ziwei";
import type { Dim } from "../data/types";
import { ziweiAstrolabe, type ZiweiAstrolabe as Natal } from "../methods/ziwei";
import { type Forecast, type ForecastFn, forecastPeriods, type Period, type PeriodReading, type Signal, type Tone } from "./types";

type Mutagen = "禄" | "权" | "科" | "忌";
const MUTAGENS: Mutagen[] = ["禄", "权", "科", "忌"];
const MUTAGEN_TONE: Record<Mutagen, Tone> = { 禄: "good", 权: "good", 科: "good", 忌: "bad" };
/** Natal palaces where a strong 化禄 or 化忌 weighs most. */
const KEY_AREAS = new Set(["命宫", "官禄", "财帛"]);

type Horoscope = ReturnType<Natal["horoscope"]>;
type Layer = Horoscope["monthly"];

const palaceName = (area: string) => (area === "命宫" ? area : `${area}宫`);

const fillArea = (tpl: string, area: string, seed: number) => {
  const a = AREAS[area]!;
  return tpl.replaceAll("{topic}", a.topic).replaceAll("{scene}", a.scenes[seed % a.scenes.length]!);
};

function readPeriod(natal: Natal, layer: Layer, p: Period, scope: Scope): PeriodReading {
  const tag = scope === "year" ? "流年" : "流月";
  const head = `${tag}${layer.heavenlyStem}${layer.earthlyBranch}`;
  const key = (rule: string) => `ziwei:${scope}:${p.year}-${p.month ?? 0}:${rule}`;
  const roles = layer.palaceNames as string[];
  const natalNames = natal.palaces.map((x) => x.name);
  const out: Signal[] = [];

  // The period's life palace sits on one natal palace: that area becomes the focus.
  const lifeIdx = roles.indexOf("命宫");
  const focusArea = natalNames[lifeIdx]!;
  const focus = AREAS[focusArea]!;
  const seed = lifeIdx + p.year + (p.month ?? 0);
  const focusPhrase: Phrase = { what: FOCUS_TEMPLATES.map((t, i) => fillArea(t, focusArea, seed + i)) };
  out.push(
    buildSignal({
      key: key("focus"),
      scope,
      dim: focus.dim,
      tone: "mixed",
      weight: 1,
      pro: `${head}：${tag}命宫落本命${palaceName(focusArea)}，当期重心在${focus.topic}`,
      phrase: focusPhrase,
    }),
  );

  // Transformations: the star sits in a natal palace, which names the life area.
  MUTAGENS.forEach((m, i) => {
    const star = layer.mutagen[i];
    if (!star) return;
    const idx = natal.palaces.findIndex((x) => [...x.majorStars, ...x.minorStars].some((s) => s.name === star));
    if (idx < 0) return;
    const area = natalNames[idx]!;
    const a = AREAS[area]!;
    const tone = MUTAGEN_TONE[m];
    let weight: 1 | 2 | 3 = m === "科" || m === "权" ? (scope === "year" ? 2 : 1) : 2;
    if (scope === "year" && KEY_AREAS.has(area) && (m === "禄" || m === "忌")) weight = 3;
    const phrase: Phrase = { what: MUTAGEN_TEMPLATES[m].map((t, k) => fillArea(t, area, seed + i + k)) };
    out.push(
      buildSignal({
        key: key(`化${m}`),
        scope,
        dim: a.dim,
        tone,
        weight,
        pro: `${head}：${star}化${m}入本命${palaceName(area)}（${tag}四化）`,
        phrase,
      }),
    );
  });

  // Helper stars by the period's palace roles.
  const starsAt = (names: string[]) => {
    const hits: { name: string; role: string; natal: string }[] = [];
    (layer.stars ?? []).forEach((list, i) => {
      for (const s of list) if (names.includes(s.name)) hits.push({ name: s.name, role: roles[i]!, natal: natalNames[i]! });
    });
    return hits;
  };
  const pre = scope === "year" ? "流" : "月";
  const add = (rule: string, dim: Dim, tone: Tone, weight: 1 | 2 | 3, pro: string) =>
    out.push(buildSignal({ key: key(rule), scope, dim, tone, weight, pro: `${head}：${pro}`, phrase: HELPER_PHRASES[rule]! }));

  const nobles = starsAt([`${pre}魁`, `${pre}钺`]).filter((h) => ["命宫", "官禄", "财帛"].includes(h.role));
  const nobleNames = new Set(nobles.map((h) => h.name));
  for (const role of ["命宫", "官禄", "财帛"]) {
    const hit = nobles.filter((h) => h.role === role);
    if (!hit.length) continue;
    const rule = role === "命宫" ? "贵人命" : role === "官禄" ? "贵人官" : "贵人财";
    add(rule, role === "财帛" ? "wealth" : "career", "good", nobleNames.size === 2 ? 3 : 2, `${hit.map((h) => h.name).join("、")}入${tag}${role}（本命${palaceName(hit[0]!.natal)}），为贵人星`);
  }
  for (const h of starsAt([`${pre}禄`])) {
    if (h.role === "财帛") add("禄财", "wealth", "good", 2, `${h.name}入${tag}财帛（本命${palaceName(h.natal)}）`);
    else if (h.role === "官禄") add("禄官", "career", "good", 2, `${h.name}入${tag}官禄（本命${palaceName(h.natal)}）`);
  }
  for (const h of starsAt([`${pre}鸾`, `${pre}喜`])) {
    if (h.role === "夫妻") add("喜夫妻", "love", "good", 2, `${h.name}入${tag}夫妻（本命${palaceName(h.natal)}），桃花喜庆`);
    else if (h.role === "命宫") add("喜命", "love", "good", 1, `${h.name}入${tag}命宫`);
  }
  const ma = starsAt([`${pre}马`]).find((h) => h.role === "迁移" || h.role === "命宫");
  if (ma) add("马迁移", "career", "mixed", 1, `${ma.name}入${tag}${ma.role}，主奔波变动`);
  const yt = starsAt([`${pre}羊`, `${pre}陀`]).filter((h) => h.role === "命宫" || h.role === "疾厄");
  if (yt.length) add("羊陀", "health", "mixed", 1, `${yt.map((h) => `${h.name}入${tag}${h.role}`).join("、")}，主急躁与拖滞`);

  const mut = MUTAGENS.map((m, i) => (layer.mutagen[i] ? `${layer.mutagen[i]}化${m}` : "")).filter(Boolean);
  return { period: p, label: `${head} · 命宫落本命${palaceName(focusArea)} · ${mut.slice(0, 4).join(" ")}`, signals: limitSignals(out) };
}

export const ziweiForecast: ForecastFn = (chart, now): Forecast => {
  const natal = ziweiAstrolabe(chart);
  const { years, months } = forecastPeriods(now);
  return {
    years: years.map((p) => readPeriod(natal, natal.horoscope(`${p.year}-7-1`).yearly as Layer, p, "year")),
    months: months.map((p) => readPeriod(natal, natal.horoscope(`${p.year}-${p.month}-15`).monthly, p, "month")),
    ...(chart.input.timeKnown ? {} : { note: "出生时间未知，命盘按正午排，流年流月落在哪一宫会受时辰影响，仅供参考。" }),
  };
};
