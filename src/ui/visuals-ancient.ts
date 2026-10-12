import { norm360 } from "../core/chart";
import { FIR_CYCLE, type FirPlanet } from "../data/firdaria";
import { CHALDEAN_ORDER, DIGNITY_NAME, HOUSES, TRAD_INFO, type Dignity, WEEKDAY_ZH } from "../data/hellenistic";
import { ZODIAC } from "../data/zodiac";
import type { ChaldeanVisual } from "../methods/chaldean";
import { type FirdariaVisual, firInfo } from "../methods/firdaria";
import type { HellenisticVisual } from "../methods/hellenistic";
import type { MethodId, MethodResult } from "../methods/types";
import { caption, EL_COLOR, f, polar, sector } from "./svg-geom";
import { esc, h, svg } from "./dom";

// Each renderer narrows the visual payload of its own method.
// biome-ignore lint: heterogeneous visual payloads
type Renderer = (r: MethodResult<any>) => HTMLElement;


const PCOLOR: Record<FirPlanet, string> = {
  sun: "#f5c86b",
  moon: "#cfd8ff",
  mercury: "#6ee0a8",
  venus: "#ff9bc4",
  mars: "#ff6a52",
  jupiter: "#6aa8ff",
  saturn: "#a9a0c8",
  northNode: "#b58bff",
  southNode: "#5ee0ff",
};
const DIG_CLASS: Record<Dignity, string> = { domicile: "dg-dom", exaltation: "dg-exa", detriment: "dg-det", fall: "dg-fal", peregrine: "dg-per" };
const glyph = (p: FirPlanet) => firInfo(p).glyph;
const zhOf = (p: FirPlanet) => firInfo(p).zh;

// ───────────────────────── 希腊化占星：整宫制星盘
function hellenistic(r: MethodResult<HellenisticVisual>): HTMLElement {
  const v = r.visual;
  const C = 220;
  const relOf = (lon: number) => norm360(lon - v.ascSign * 30);
  const angRel = (rel: number) => 180 - rel;
  const at = (rel: number, rr: number) => polar(C, C, rr, angRel(rel));
  const prof = v.profection;

  // House sectors (rel 0-30 is house 1), going counter-clockwise from the left.
  const houses = Array.from({ length: 12 }, (_, i) => {
    const a1 = angRel(i * 30);
    const a0 = a1 - 30;
    const sign = (v.ascSign + i) % 12;
    const z = ZODIAC[sign]!;
    const gp = at(i * 30 + 15, 193);
    const np = at(i * 30 + 15, 92);
    const sp = at(i * 30 + 15, 109);
    const isProf = i + 1 === prof.house;
    return `<g class="hel-house${isProf ? " prof" : ""}" style="--i:${i}">
      <path d="${sector(C, C, 78, 176, a0, a1)}" class="hel-hpath"/>
      <path d="${sector(C, C, 176, 210, a0, a1)}" fill="${EL_COLOR[z.westElement]}22" class="hel-spath"/>
      <text x="${f(gp.x)}" y="${f(gp.y + 6)}" text-anchor="middle" class="zg" fill="${EL_COLOR[z.westElement]}">${esc(z.glyph)}</text>
      <text x="${f(np.x)}" y="${f(np.y + 4)}" text-anchor="middle" class="hel-hn">${i + 1}</text>
      <text x="${f(sp.x)}" y="${f(sp.y + 4)}" text-anchor="middle" class="hel-hs">${esc(HOUSES[i]!.short)}</text>
    </g>`;
  }).join("");

  // Bodies and lots, spread inside their house.
  type Item = { rel: number; label: string; cls: string; key: string; house: number };
  const items: Item[] = [
    ...v.planets.map((p) => ({ rel: relOf(p.lon), label: TRAD_INFO[p.key].glyph, cls: p.key === v.chartRuler ? "ruler" : "", key: p.key, house: p.house })),
    { rel: relOf(v.lots.fortune.lon), label: "⊗︎", cls: "lot", key: "fortune", house: v.lots.fortune.house },
    { rel: relOf(v.lots.spirit.lon), label: "⊕︎", cls: "lot", key: "spirit", house: v.lots.spirit.house },
  ];
  let order = 0;
  const bodies = Array.from({ length: 12 }, (_, i) => {
    const inHouse = items.filter((it) => it.house === i + 1).sort((a, b) => a.rel - b.rel);
    return inHouse
      .map((it, k) => {
        const rel = i * 30 + ((k + 1) * 30) / (inHouse.length + 1);
        const rr = inHouse.length > 3 ? 140 + (k % 2) * 22 : 150;
        const p = at(rel, rr);
        const t0 = at(it.rel, 176);
        const t1 = at(it.rel, 168);
        const g = `<g class="hel-body ${it.cls}" style="--i:${order++}"><line x1="${f(t0.x)}" y1="${f(t0.y)}" x2="${f(t1.x)}" y2="${f(t1.y)}" class="tick"/>${it.cls === "ruler" ? `<circle cx="${f(p.x)}" cy="${f(p.y - 6)}" r="13" class="hel-halo"/>` : ""}<text x="${f(p.x)}" y="${f(p.y)}" text-anchor="middle" class="pg">${esc(it.label)}</text></g>`;
        return g;
      })
      .join("");
  }).join("");

  // The ascendant at its true degree.
  const a0 = at(relOf(v.asc), 78);
  const a1 = at(relOf(v.asc), 214);
  const lab = at(relOf(v.asc), 226);
  const profHouse = v.profection.house - 1;
  const profRing = `<path d="${sector(C, C, 78, 210, angRel(profHouse * 30) - 30, angRel(profHouse * 30))}" class="hel-profring"/>`;

  const L = TRAD_INFO[prof.lord];
  const wheel = svg(
    "-10 0 460 440",
    `<circle cx="${C}" cy="${C}" r="211" class="rim"/>${houses}${profRing}
     <circle cx="${C}" cy="${C}" r="176" class="rim faint"/>
     <line x1="${f(a0.x)}" y1="${f(a0.y)}" x2="${f(a1.x)}" y2="${f(a1.y)}" class="axis hel-asc"/><text x="${f(lab.x)}" y="${f(lab.y + 4)}" text-anchor="end" class="axis-l">ASC</text>
     ${bodies}
     <circle cx="${C}" cy="${C}" r="72" class="hel-hub"/>
     <text x="${C}" y="${C - 18}" text-anchor="middle" class="hel-hub-sm">${v.day ? "日间盘" : "夜间盘"}</text>
     <text x="${C}" y="${C + 6}" text-anchor="middle" class="hel-hub-big">第${prof.house}宫</text>
     <text x="${C}" y="${C + 26}" text-anchor="middle" class="hel-hub-sm">${esc(L.glyph)} 年主星${esc(L.zh)}</text>
     <text x="${C}" y="${C + 44}" text-anchor="middle" class="hel-hub-xs">${prof.age} 岁小限</text>`,
    "natal hel-wheel",
  );

  const rows = [
    ...v.planets.map((p) =>
      h(
        "tr",
        { class: p.key === v.chartRuler ? "ruler" : "" },
        h("td", null, TRAD_INFO[p.key].glyph),
        h("td", null, TRAD_INFO[p.key].zh),
        h("td", null, `${ZODIAC[p.sign]!.name} ${Math.floor(p.lon % 30)}°`),
        h("td", null, `第${p.house}宫`),
        h("td", null, h("span", { class: `dg ${DIG_CLASS[p.dignity]}` }, DIGNITY_NAME[p.dignity]), p.retro ? h("em", { class: "retro-tag" }, " ℞") : null),
      ),
    ),
    ...(["fortune", "spirit"] as const).map((k) =>
      h("tr", { class: "lot" }, h("td", null, k === "fortune" ? "⊗︎" : "⊕︎"), h("td", null, k === "fortune" ? "福点" : "精神点"), h("td", null, `${ZODIAC[v.lots[k].sign]!.name} ${Math.floor(v.lots[k].lon % 30)}°`), h("td", null, `第${v.lots[k].house}宫`), h("td", null, "")),
    ),
  ];

  return h(
    "div",
    { class: "v-hellenistic" },
    h(
      "div",
      { class: "v-row" },
      wheel,
      h(
        "div",
        null,
        h("h4", null, `${v.day ? "日间盘" : "夜间盘"} · 整宫制`),
        h("table", { class: "planet-table hel-table" }, h("tbody", null, ...rows)),
        h("ul", { class: "legend" }, h("li", { style: { "--c": "var(--gold)" } as never }, "金框 = 本年小限所在宫"), h("li", { style: { "--c": "#ffe7a8" } as never }, "光圈 = 命主星"), h("li", { style: { "--c": "#5ee0ff" } as never }, "⊗ 福点 · ⊕ 精神点")),
      ),
    ),
    caption(`整宫制：上升${ZODIAC[v.ascSign]!.name}整个星座为第 1 宫，逆时针依次排列。${v.unknownTime ? "未提供出生时间，上升与宫位仅供参考。" : ""}`),
  );
}

// ───────────────────────── 迦勒底七曜：行星时环
function chaldean(r: MethodResult<ChaldeanVisual>): HTMLElement {
  const v = r.visual;
  const C = 220;
  const aOf = (frac: number) => 180 + 360 * frac;
  const sunsetFrac = v.hours[12]!.f0;

  const segs = v.hours
    .map((x) => {
      const a0 = aOf(x.f0) + 0.4;
      const a1 = aOf(x.f1) - 0.4;
      const mid = polar(C, C, 158, (a0 + a1) / 2);
      const col = PCOLOR[x.ruler];
      const me = x.index === v.birthHour;
      return `<g class="ch-seg${me ? " me" : ""}${x.isDay ? " day" : " night"}" style="--i:${x.index}"><title>${esc(`${x.isDay ? "白天" : "夜晚"}第${(x.index % 12) + 1}时 ${zhOf(x.ruler)} ${x.start}–${x.end}`)}</title><path d="${sector(C, C, 128, 190, a0, a1)}" fill="${col}" fill-opacity="${x.isDay ? 0.34 : 0.2}" stroke="rgba(5,4,15,.7)"/><text x="${f(mid.x)}" y="${f(mid.y + 6)}" text-anchor="middle" class="ch-g">${esc(glyph(x.ruler))}</text></g>`;
    })
    .join("");

  const bandDay = sector(C, C, 194, 202, aOf(0), aOf(sunsetFrac));
  const bandNight = sector(C, C, 194, 202, aOf(sunsetFrac), aOf(1));
  const rise = polar(C, C, 208, 180);
  const set = polar(C, C, 208, aOf(sunsetFrac));
  const sunset0 = polar(C, C, 128, aOf(sunsetFrac));
  const sunset1 = polar(C, C, 206, aOf(sunsetFrac));

  // Heptagram: the seven planets in Chaldean order; every third point is joined to give the weekday order.
  const nodes = CHALDEAN_ORDER.map((p, k) => ({ p, ...polar(C, C, 84, -90 + (k * 360) / 7) }));
  const star = nodes
    .map((n, k) => {
      const m = nodes[(k + 3) % 7]!;
      return `<line x1="${f(n.x)}" y1="${f(n.y)}" x2="${f(m.x)}" y2="${f(m.y)}" class="ch-star" style="--i:${k}"/>`;
    })
    .join("");
  const planetsSvg = nodes
    .map((n, k) => `<g class="ch-node${n.p === v.dayRuler ? " day-ruler" : ""}" style="--i:${k}"><circle cx="${f(n.x)}" cy="${f(n.y)}" r="15" fill="${PCOLOR[n.p]}" fill-opacity=".22" stroke="${PCOLOR[n.p]}"/><text x="${f(n.x)}" y="${f(n.y + 6)}" text-anchor="middle" class="ch-ng">${esc(glyph(n.p))}</text></g>`)
    .join("");

  const needle = polar(C, C, 192, aOf(v.birthFrac));
  const needleDot = polar(C, C, 197, aOf(v.birthFrac));
  const wheel = svg(
    "-70 -4 560 448",
    `${segs}<path d="${bandDay}" class="ch-band-day"/><path d="${bandNight}" class="ch-band-night"/>
     <circle cx="${C}" cy="${C}" r="126" class="rim faint"/>${star}${planetsSvg}
     <circle cx="${C}" cy="${C}" r="40" class="ch-hub"/>
     <text x="${C}" y="${C - 2}" text-anchor="middle" class="ch-hub-big">${esc(glyph(v.dayRuler))}</text>
     <text x="${C}" y="${C + 22}" text-anchor="middle" class="ch-hub-sm">${esc(WEEKDAY_ZH[v.weekday]!)}</text>
     <line x1="${C}" y1="${C}" x2="${f(needle.x)}" y2="${f(needle.y)}" class="ch-needle${v.unknownTime ? " dim" : ""}"/><circle cx="${f(needleDot.x)}" cy="${f(needleDot.y)}" r="5" class="ch-needle-dot${v.unknownTime ? " dim" : ""}"/>
     <line x1="${f(sunset0.x)}" y1="${f(sunset0.y)}" x2="${f(sunset1.x)}" y2="${f(sunset1.y)}" class="ch-edge"/><line x1="${C - 126}" y1="${C}" x2="${C - 206}" y2="${C}" class="ch-edge"/>
     <text x="${f(rise.x - 4)}" y="${f(rise.y - 8)}" text-anchor="end" class="ch-edge-l">日出 ${esc(v.sunrise)}</text>
     <text x="${f(set.x + (set.x > C ? 6 : -6))}" y="${f(set.y + 14)}" text-anchor="${set.x > C ? "start" : "end"}" class="ch-edge-l">日落 ${esc(v.sunset)}</text>`,
    "ch-wheel",
  );

  const chip = (x: ChaldeanVisual["hours"][number]) =>
    h(
      "div",
      { class: `ch-chip${x.index === v.birthHour ? " me" : ""}${x.ruler === v.dayRuler ? " ruler" : ""}`, style: { "--c": PCOLOR[x.ruler], "--i": x.index } as never },
      h("small", null, String((x.index % 12) + 1)),
      h("b", null, glyph(x.ruler)),
      h("span", null, x.start),
    );
  const dec = ZODIAC[v.decan.sign]!;
  return h(
    "div",
    { class: "v-chaldean" },
    h(
      "div",
      { class: "v-row" },
      wheel,
      h(
        "div",
        null,
        h("h4", null, `白天 12 时 · 日出 ${v.sunrise}`),
        h("div", { class: "ch-chips" }, ...v.hours.filter((x) => x.isDay).map(chip)),
        h("h4", null, `夜晚 12 时 · 日落 ${v.sunset}`),
        h("div", { class: "ch-chips night" }, ...v.hours.filter((x) => !x.isDay).map(chip)),
        h("div", { class: "ch-decan" }, h("small", null, "太阳十度区"), h("b", null, `${dec.glyph} ${dec.name}第 ${v.decan.number} 旬`), h("span", { style: { color: PCOLOR[v.decan.ruler] } as never }, `${glyph(v.decan.ruler)} ${zhOf(v.decan.ruler)}之面`)),
      ),
    ),
    caption(`外环 24 段是行星时：日出到日落分 12 份，日落到次日日出分 12 份，所以“小时”长短不一。中间的七角星按迦勒底序排列，隔二点连线，连出一周七天的顺序。金色指针是你出生的时刻${v.unknownTime ? "（未提供出生时间，仅供参考）" : ""}。`),
  );
}

// ───────────────────────── 波斯法达：75 年时间轴
function firdaria(r: MethodResult<FirdariaVisual>): HTMLElement {
  const v = r.visual;
  const base = v.cycle * FIR_CYCLE;
  const total = FIR_CYCLE;
  const major = v.periods[v.majorIndex]!;
  const nowPct = Math.max(0, Math.min(100, ((v.ageNow - base) / total) * 100));

  const segs = v.periods.map((p, i) =>
    h(
      "div",
      { class: `fir-seg${i === v.majorIndex ? " now" : ""}`, style: { flex: String(p.years), "--c": PCOLOR[p.planet], "--i": i } as never, title: `${zhOf(p.planet)} ${p.startAge}–${p.endAge} 岁（${p.startYear}–${p.endYear}）` },
      h("b", null, glyph(p.planet)),
      h("small", null, `${p.years}`),
    ),
  );
  const ticks = h(
    "div",
    { class: "fir-axis" },
    ...v.periods.map((p) => h("span", { class: p.years < 3 ? "short" : "", style: { flex: String(p.years) } as never }, h("i", null, String(p.startAge)))),
    h("em", null, String(base + total)),
  );
  const bar = h("div", { class: "fir-bar" }, h("div", { class: "fir-track" }, ...segs, h("i", { class: "fir-now-marker", style: { "--pos": `${nowPct}%` } as never }, h("b", null, `现在 ${Math.floor(v.ageNow)} 岁`))), ticks);

  const subs = major.subs.length
    ? h(
        "div",
        { class: "fir-subs" },
        ...major.subs.map((s, i) =>
          h(
            "div",
            { class: `fir-sub${i === v.subIndex ? " now" : ""}`, style: { "--c": PCOLOR[s.planet], "--i": i } as never, title: `${zhOf(s.planet)} ${s.startAge.toFixed(1)}–${s.endAge.toFixed(1)} 岁` },
            h("b", null, glyph(s.planet)),
            h("small", null, zhOf(s.planet)),
            h("span", null, `${(s.startAge).toFixed(1)}岁`),
          ),
        ),
      )
    : h("p", { class: "fir-nosub" }, `${zhOf(major.planet)}大限只有 ${major.years} 年，传统上不再细分小限。`);

  const legend = h(
    "ul",
    { class: "fir-legend" },
    ...v.periods.map((p, i) =>
      h("li", { class: i === v.majorIndex ? "now" : "", style: { "--c": PCOLOR[p.planet], "--i": i } as never }, h("b", null, `${glyph(p.planet)} ${zhOf(p.planet)}`), h("span", null, `${p.startAge}–${p.endAge} 岁`), h("small", null, `${p.startYear}–${p.endYear}`)),
    ),
  );

  return h(
    "div",
    { class: "v-firdaria" },
    h("h4", null, `${v.day ? "日间" : "夜间"}序列 · 75 年大限${v.cycle > 0 ? `（第 ${v.cycle + 1} 轮）` : ""}`),
    bar,
    h("h4", null, `${zhOf(major.planet)}大限 · 7 个小限`),
    subs,
    legend,
    caption("色块宽度 = 该大限的年数，白色指针是你现在所处的位置。大限里每个小限等长，第一个由大限星自己主管，其后按迦勒底序轮换。"),
  );
}

export const ANCIENT_VISUALS: Partial<Record<MethodId, Renderer>> = { hellenistic, chaldean, firdaria };
