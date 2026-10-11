import { norm360, PLANET_KEYS, type PlanetKey } from "../core/chart";
import { ASPECTS, type AspectKey, PLANET_IN_SIGN_HINT, PLANETS } from "../data/planets";
import { PLAIN_ASPECT, PLAIN_PLANET, PLAIN_WEST_LACK } from "../data/plain-astrology";
import { PLAIN_BODY, PLAIN_BODY_DEFAULT } from "../data/plain-common";
import { ZODIAC } from "../data/zodiac";
import { profileLucky } from "./profile";
import { type MethodFn, mixScores, shiftScores, UNKNOWN_TIME_NOTE } from "./types";

export const signOf = (lon: number) => Math.floor(norm360(lon) / 30);
export const degInSign = (lon: number) => {
  const d = norm360(lon) % 30;
  return `${Math.floor(d)}°${String(Math.floor((d % 1) * 60)).padStart(2, "0")}′`;
};

export interface AspectHit {
  a: PlanetKey;
  b: PlanetKey;
  type: AspectKey;
  orb: number;
}

export interface AstrologyVisual {
  planets: { key: PlanetKey; lon: number; sign: number; house: number; retro: boolean }[];
  asc: number;
  mc: number;
  aspects: AspectHit[];
  elements: Record<string, number>;
}

const ORB: Record<AspectKey, number> = { conjunction: 8, opposition: 8, trine: 7, square: 7, sextile: 5 };

export function findAspects(lons: Record<PlanetKey, number>): AspectHit[] {
  const hits: AspectHit[] = [];
  for (let i = 0; i < PLANET_KEYS.length; i++)
    for (let j = i + 1; j < PLANET_KEYS.length; j++) {
      const a = PLANET_KEYS[i]!;
      const b = PLANET_KEYS[j]!;
      let sep = Math.abs(lons[a] - lons[b]) % 360;
      if (sep > 180) sep = 360 - sep;
      for (const type of Object.keys(ASPECTS) as AspectKey[]) {
        const luminary = a === "sun" || a === "moon" || b === "sun" || b === "moon";
        const orb = Math.abs(sep - ASPECTS[type].angle);
        if (orb <= ORB[type] + (luminary ? 2 : 0)) hits.push({ a, b, type, orb });
      }
    }
  return hits.sort((x, y) => x.orb - y.orb);
}

export const astrology: MethodFn<AstrologyVisual> = (chart) => {
  const P = chart.planets;
  const ascSign = signOf(chart.asc);
  const planets = PLANET_KEYS.map((key) => {
    const sign = signOf(P[key].lon);
    return { key, lon: P[key].lon, sign, house: ((sign - ascSign + 12) % 12) + 1, retro: P[key].retro };
  });
  const sun = ZODIAC[signOf(P.sun.lon)]!;
  const moon = ZODIAC[signOf(P.moon.lon)]!;
  const asc = ZODIAC[ascSign]!;
  const lons = Object.fromEntries(PLANET_KEYS.map((k) => [k, P[k].lon])) as Record<PlanetKey, number>;
  const aspects = findAspects(lons);

  // Element balance: Sun, Moon, ASC count double.
  const elements: Record<string, number> = { 火: 0, 土: 0, 风: 0, 水: 0 };
  for (const p of planets) elements[ZODIAC[p.sign]!.westElement]! += p.key === "sun" || p.key === "moon" ? 2 : 1;
  elements[asc.westElement]! += 2;
  const harmony = aspects.reduce((s, a) => s + ASPECTS[a.type].harmony, 0);

  const known = chart.input.timeKnown;
  const scores = shiftScores(
    mixScores(known ? [[sun.scores, 2], [moon.scores, 1], [asc.scores, 1]] : [[sun.scores, 2], [moon.scores, 1]]),
    { love: Math.sign(harmony) * 3, health: Math.sign(harmony) * 2 },
  );
  const retros = planets.filter((p) => p.retro).map((p) => PLANETS[p.key].zh);
  const top = aspects.slice(0, 4);
  const signLine = (k: "mercury" | "venus" | "mars") => `${PLANET_IN_SIGN_HINT[k]}${ZODIAC[signOf(P[k].lon)]!.name}的色彩。`;

  // Plain reading: drop the jargon prefixes of the moon and ascendant texts.
  const moonLine = moon.moonText.replace(/^月亮落在[^，]*，/, "");
  const ascLine = asc.ascText.replace(/^上升[^，]*的你，/, "");
  const planetAspects = aspects.filter((h) => h.a !== "uranus" && h.b !== "uranus" && h.a !== "neptune" && h.b !== "neptune" && h.a !== "pluto" && h.b !== "pluto");
  const plainAspects = (planetAspects.length >= 2 ? planetAspects : aspects)
    .slice(0, 2)
    .map((h, i) => `${i ? "另外，" : ""}你的「${PLAIN_PLANET[h.a]}」和「${PLAIN_PLANET[h.b]}」${PLAIN_ASPECT[h.type]}。`)
    .join("");
  const weakest = Object.entries(elements).sort((a, b) => a[1] - b[1])[0]![0];

  return {
    id: "astrology",
    name: "西洋占星",
    intro: "以出生瞬间太阳系各行星在黄道上的位置绘制本命盘，太阳、月亮、上升为三大核心。",
    origin: "西方",
    icon: sun.glyph,
    headline: `太阳${sun.name} · 月亮${moon.name}${known ? ` · 上升${asc.name}` : ""}`,
    tagline: sun.title,
    keywords: sun.keywords,
    scores,
    element: sun.element,
    lucky: profileLucky(sun),
    facts: [
      { label: "☉ 太阳", value: `${sun.name} ${degInSign(P.sun.lon)}` },
      { label: "☽ 月亮", value: `${moon.name} ${degInSign(P.moon.lon)}` },
      { label: "ASC 上升", value: `${asc.name} ${degInSign(chart.asc)}` },
      { label: "MC 天顶", value: `${ZODIAC[signOf(chart.mc)]!.name} ${degInSign(chart.mc)}` },
      { label: "逆行", value: retros.join("、") || "无" },
    ],
    sections: [
      { title: `太阳${sun.name} · 核心自我`, body: `${sun.summary}${sun.personality}` },
      { title: `月亮${moon.name} · 情感需求`, body: moon.moonText },
      ...(known ? [{ title: `上升${asc.name} · 外在形象`, body: asc.ascText }] : []),
      { title: "水金火 · 个人行星", body: `${signLine("mercury")}${signLine("venus")}${signLine("mars")}` },
      {
        title: "关键相位",
        body: top
          .map((h) => `${PLANETS[h.a].zh}${ASPECTS[h.type].glyph}${PLANETS[h.b].zh}（${ASPECTS[h.type].name}，容许度 ${h.orb.toFixed(1)}°）：${ASPECTS[h.type].text}`)
          .join(""),
      },
      {
        title: "元素平衡",
        body: `火 ${elements.火} · 土 ${elements.土} · 风 ${elements.风} · 水 ${elements.水}。${(() => {
          const max = Object.entries(elements).sort((a, b) => b[1] - a[1])[0]![0];
          const min = Object.entries(elements).sort((a, b) => a[1] - b[1])[0]![0];
          return `「${max}」象最强，「${min}」象最弱——${{ 火: "热情与行动", 土: "务实与耐心", 风: "思考与沟通", 水: "感受与共情" }[min]}是你可以有意识去补足的能量。`;
        })()}`,
      },
      { title: "事业财运", body: sun.career },
      { title: "感情人际", body: sun.love },
      { title: "星语箴言", body: sun.advice },
    ],
    plain: {
      summary: `你出生时太阳在${sun.name}，月亮在${moon.name}${known ? `，上升在${asc.name}` : ""}。${sun.title}，是你最容易被认出来的样子。`,
      sections: [
        {
          title: "你是怎样的人",
          body: `你的太阳星座是${sun.name}（出生时太阳所在的星座，代表你的核心性格）。${sun.personality}${known ? `你的上升星座是${asc.name}（别人第一眼看到的你）。${ascLine}` : ""}`,
        },
        { title: "内心需要什么", body: `你的月亮星座是${moon.name}（代表你的情绪和安全感）。${moonLine}` },
        { title: "适合做什么", body: `${sun.career}` },
        { title: "感情里的你", body: `${sun.love}${signLine("venus")}` },
        {
          title: "给你的建议",
          body: `${plainAspects}${PLAIN_WEST_LACK[weakest] ?? ""}${sun.advice}${sun.element ? PLAIN_BODY[sun.element] : PLAIN_BODY_DEFAULT}`,
        },
        {
          title: "这套方法怎么算的",
          body: "西洋占星看你出生那一刻，太阳、月亮和各大行星在天上的位置。它们落在十二星座的哪一个，决定你各方面的风格；两颗星之间的角度，则说明这两种特点是互相帮忙，还是互相拉扯。",
        },
      ],
    },
    caveats: [...(known ? [] : [UNKNOWN_TIME_NOTE, "未知出生时间时不显示上升星座与宫位。"]), "宫位采用整宫制；行星位置为地心视黄经（当日春分点）。"],
    visual: { planets, asc: chart.asc, mc: chart.mc, aspects, elements },
  };
};
