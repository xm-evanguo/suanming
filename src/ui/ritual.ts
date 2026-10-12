import { rad } from "./svg-geom";
import { fmtOffset, fmtTime, inputTime } from "../core/chart";
import { GAN, ZHI, ganWuXing } from "../core/ganzhi";
import { ZODIAC } from "../data/zodiac";
import { PLANETS } from "../data/planets";
import type { BaziVisual } from "../methods/bazi";
import type { MeihuaVisual } from "../methods/meihua";
import { METHOD_ORDER } from "../methods";
import { cnNum } from "./components";
import { esc, h, reducedMotion, sleep } from "./dom";
import { getState, result } from "./state";

const JIEQI = ["春分", "清明", "谷雨", "立夏", "小满", "芒种", "夏至", "小暑", "大暑", "立秋", "处暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至", "小寒", "大寒", "立春", "雨水", "惊蛰"];
const PHASE_NAMES = ["新月", "娥眉月", "上弦月", "盈凸月", "满月", "亏凸月", "下弦月", "残月"];
const signOf = (lon: number) => ZODIAC[Math.floor(lon / 30)]!;
const deg = (lon: number) => `${Math.floor(lon % 30)}°${String(Math.floor(((lon % 30) % 1) * 60)).padStart(2, "0")}′`;

/** The "calculating" ceremony: every number shown is the real computed value. Returns a cleanup function. */
export function renderRitual(view: HTMLElement, setWarp: (on: boolean) => void): () => void {
  const { chart, results } = getState();
  if (!chart || !results) return () => {};
  let alive = true;
  const go = () => {
    if (!alive) return;
    alive = false;
    location.hash = "#/hub";
  };

  const stage = h("div", { class: "ritual-stage" });
  const title = h("h2", { class: "ritual-title" });
  const sub = h("p", { class: "ritual-sub" });
  const log = h("ol", { class: "ritual-log", "aria-live": "polite" });
  const filtered = results.length !== METHOD_ORDER.length;
  const steps = filtered ? ["已启用体系"] : ["定位", "真太阳时", "太阳黄经", "四柱", "行星", "起卦", "融合"];
  const progress = h("ol", { class: "ritual-progress" }, ...steps.map((s) => h("li", null, h("i"), h("span", null, s))));
  const flash = h("div", { class: "flash" });
  view.classList.add("ritual");
  view.append(
    h("button", { class: "btn btn-ghost skip", onclick: go }, "跳过动画 ⏭"),
    h("div", { class: "ritual-grid" }, stage, h("div", { class: "ritual-text" }, title, sub, log)),
    progress,
    flash,
  );
  setWarp(true);

  const line = async (label: string, value: string, wait = 260) => {
    if (!alive) return;
    log.append(h("li", null, h("span", null, label), h("b", null, value)));
    while (log.children.length > 7) log.firstElementChild?.remove();
    await sleep(wait);
  };
  const phase = async (i: number, t: string, s: string, visual: HTMLElement) => {
    if (!alive) return;
    [...progress.children].forEach((li, j) => {
      li.classList.toggle("done", j < i);
      li.classList.toggle("now", j === i);
    });
    title.textContent = t;
    sub.textContent = s;
    title.classList.remove("in");
    void title.offsetWidth;
    title.classList.add("in");
    log.replaceChildren();
    stage.replaceChildren(visual);
    await sleep(500);
  };

  (async () => {
    if (filtered) {
      const visual = fusionVisual(results.map((r) => r.icon));
      await phase(0, `${cnNum(results.length)}体系 · 汇集画像`, "只展示你在 Profile 中启用的体系", visual.el);
      for (const r of results) await line(r.name, r.headline, 120);
      visual.converge();
      await sleep(1600);
      go();
      return;
    }
    const { input } = chart;
    const city = input.city;

    // 1. Geolocation
    const globe = h("div", { class: "globe-wrap" });
    await phase(0, "锁定出生坐标", "在地球上找到你降生的那一个点", globe);
    spinGlobe(globe, city.lat, city.lon);
    await line("出生地", city.name);
    await line("纬度", `${Math.abs(city.lat).toFixed(4)}° ${city.lat >= 0 ? "N" : "S"}`);
    await line("经度", `${Math.abs(city.lon).toFixed(4)}° ${city.lon >= 0 ? "E" : "W"}`);
    await line("时区", `${city.tz} · ${fmtOffset(chart.tzOffset)}`);
    await line("夏令时", chart.isDst ? "当时正在实行 ✓ 已扣除" : "未实行");
    await line("世界时 UTC", chart.utc.toISOString().slice(0, 16).replace("T", " "), 700);

    // 2. True solar time
    const clock = clockVisual(input.hour, input.minute, chart.trueSolarTime.h, chart.trueSolarTime.mi);
    await phase(1, "校正真太阳时", "钟表的时间属于时区，太阳的时间属于你出生的地方", clock);
    await line("钟表时间", `${inputTime(input)}${input.timeKnown ? "" : "（时间不详）"}`);
    await line("时区经度差", `${chart.lonCorrection >= 0 ? "+" : ""}${chart.lonCorrection.toFixed(1)} 分钟`);
    await line("均时差 EoT", `${chart.eot >= 0 ? "+" : ""}${chart.eot.toFixed(1)} 分钟`);
    await line("真太阳时", fmtTime(chart.trueSolarTime));
    await line("排盘采用", input.trueSolar ? "真太阳时" : "钟表时间", 800);

    // 3. Sun longitude & solar terms
    const sunLon = chart.planets.sun.lon;
    await phase(2, "测算太阳黄经", "太阳每走 15°，就跨过一个节气", eclipticVisual(sunLon));
    await line("儒略日", `JD ${chart.julianDay.toFixed(4)}`);
    await line("太阳视黄经", `${sunLon.toFixed(4)}°`);
    await line("太阳星座", `${signOf(sunLon).name} ${deg(sunLon)}`);
    await line("上一节", `${chart.prevJieQi.name} ${chart.prevJieQi.time.slice(0, 16)}`);
    await line("下一节", `${chart.nextJieQi.name} ${chart.nextJieQi.time.slice(0, 16)}`, 900);

    // 4. Four pillars
    const bz = result<BaziVisual>("bazi").visual;
    const reels = reelsVisual(bz.pillars.map((p) => p.gan + p.zhi));
    await phase(3, "排定四柱八字", "天干地支六十轮转，停在你出生的那一刻", reels.el);
    reels.spin();
    await sleep(1500);
    for (const p of bz.pillars) await line(p.label, `${p.gan}${p.zhi} · 纳音${p.nayin}`, 220);
    await line("日主", `${bz.dayGan}${ganWuXing(bz.dayGan)} · ${bz.strong ? "身强" : "身弱"}`, 800);

    // 5. Moon & planets
    await phase(4, "推演月亮与行星", "十颗行星，各自停在黄道的某一度", planetsVisual(chart.planets));
    await sleep(1200);
    const moon = chart.planets.moon.lon;
    await line("月亮", `${signOf(moon).name} ${deg(moon)}`);
    await line("月相", `${PHASE_NAMES[Math.floor(((chart.moonPhase + 22.5) % 360) / 45)]} · ${chart.moonPhase.toFixed(1)}°`);
    await line("上升点 ASC", input.timeKnown ? `${signOf(chart.asc).name} ${deg(chart.asc)}` : "时间不详");
    await line("天顶 MC", `${signOf(chart.mc).name} ${deg(chart.mc)}`);
    const retro = (Object.keys(chart.planets) as (keyof typeof chart.planets)[]).filter((k) => chart.planets[k].retro).map((k) => PLANETS[k].zh);
    await line("逆行", retro.length ? retro.join("、") : "无", 800);

    // 6. Divination draws
    const mh = result<MeihuaVisual>("meihua").visual;
    await phase(5, "起卦 · 洗牌 · 化数", "让数字与符号替你开口", castVisual(mh.ben.lines, mh.moving));
    await line("梅花起数", `年${mh.numbers.year} 月${mh.numbers.month} 日${mh.numbers.day} 时${mh.numbers.hour}`);
    await line("本卦 → 变卦", `${mh.ben.fullName} → ${mh.bian.fullName}`);
    await line("塔罗生命牌", result("tarot").headline.replace(/^.*?·\s*/, ""));
    await line("生命灵数", result("numerology").headline.replace(/\D/g, ""));
    await line("卓尔金历", result("maya").headline, 800);

    // 7. Fusion
    const fuse = fusionVisual(results.map((r) => r.icon));
    await phase(6, `${cnNum(results.length)}体系 · 融为一图`, "华夏、东瀛、希腊、罗马、波斯、天竺、玛雅，汇于一处", fuse.el);
    for (const r of results) await line(r.name, r.headline, 120);
    fuse.converge();
    await sleep(1600);
    if (!alive) return;
    flash.classList.add("on");
    setWarp(false);
    await sleep(700);
    go();
  })();

  return () => {
    alive = false;
    setWarp(false);
  };
}

/** Orthographic globe that rotates to the birth longitude, then pins the location. */
function spinGlobe(wrap: HTMLElement, lat: number, lon: number) {
  const R = 150;
  const lat0 = rad(Math.max(-50, Math.min(50, lat)) * 0.6);
  const draw = (lon0: number, pin: boolean) => {
    const proj = (la: number, lo: number) => {
      const φ = rad(la);
      const dλ = rad(lo - lon0);
      const vis = Math.sin(lat0) * Math.sin(φ) + Math.cos(lat0) * Math.cos(φ) * Math.cos(dλ);
      return { x: 180 + R * Math.cos(φ) * Math.sin(dλ), y: 180 - R * (Math.cos(lat0) * Math.sin(φ) - Math.sin(lat0) * Math.cos(φ) * Math.cos(dλ)), vis };
    };
    const path = (pts: { x: number; y: number; vis: number }[]) => {
      let d = "";
      let pen = false;
      for (const p of pts) {
        if (p.vis < 0) pen = false;
        else {
          d += `${pen ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`;
          pen = true;
        }
      }
      return d;
    };
    let d = "";
    for (let lo = -180; lo < 180; lo += 20) d += path(Array.from({ length: 37 }, (_, i) => proj(-90 + i * 5, lo)));
    for (let la = -60; la <= 60; la += 30) d += path(Array.from({ length: 73 }, (_, i) => proj(la, -180 + i * 5)));
    const p = proj(lat, lon);
    wrap.innerHTML = `<svg viewBox="0 0 360 360"><defs><radialGradient id="gl" cx="40%" cy="35%"><stop offset="0" stop-color="#3b3a8f"/><stop offset="1" stop-color="#0a0a24"/></radialGradient></defs>
      <circle cx="180" cy="180" r="${R + 14}" fill="none" stroke="rgba(245,200,107,.15)" stroke-dasharray="2 6"/>
      <circle cx="180" cy="180" r="${R}" fill="url(#gl)" stroke="rgba(160,170,255,.5)"/>
      <path d="${d}" fill="none" stroke="rgba(160,180,255,.35)" stroke-width=".8"/>
      ${pin ? `<g class="pin"><line x1="${p.x}" y1="0" x2="${p.x}" y2="360" /><line x1="0" y1="${p.y}" x2="360" y2="${p.y}" /><circle cx="${p.x}" cy="${p.y}" r="16" class="pulse"/><circle cx="${p.x}" cy="${p.y}" r="5" fill="#f5c86b"/></g>` : ""}
    </svg>`;
  };
  const start = performance.now();
  const dur = reducedMotion() ? 1 : 1700;
  const tick = (now: number) => {
    if (!wrap.isConnected) return;
    const t = Math.min(1, (now - start) / dur);
    const e = 1 - (1 - t) ** 3;
    draw(lon - 200 * (1 - e), t >= 1);
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function clockVisual(h1: number, m1: number, h2: number, m2: number): HTMLElement {
  // 24-hour dial: 子 at the top, 15° per hour.
  const ang = (hh: number, mm: number) => (hh + mm / 60) * 15;
  const angM = (mm: number) => mm * 6;
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const a = rad(i * 6);
    const r1 = i % 5 ? 140 : 128;
    return `<line x1="${180 + r1 * Math.sin(a)}" y1="${180 - r1 * Math.cos(a)}" x2="${180 + 148 * Math.sin(a)}" y2="${180 - 148 * Math.cos(a)}" stroke="rgba(245,200,107,${i % 5 ? 0.3 : 0.9})" stroke-width="${i % 5 ? 1 : 2.5}"/>`;
  }).join("");
  const zhi = ZHI.map((z, i) => {
    const a = rad(i * 30);
    return `<text x="${180 + 108 * Math.sin(a)}" y="${180 - 108 * Math.cos(a) + 6}" text-anchor="middle" class="clock-zhi">${z}</text>`;
  }).join("");
  const wrap = h("div", { class: "clock-wrap" });
  wrap.innerHTML = `<svg viewBox="0 0 360 360">
    <circle cx="180" cy="180" r="160" fill="rgba(12,10,40,.6)" stroke="rgba(245,200,107,.4)"/>${ticks}${zhi}
    <g class="hand-h" style="--from:${ang(h1, m1)}deg;--to:${ang(h2, m2)}deg"><line x1="180" y1="180" x2="180" y2="95" stroke="#f5c86b" stroke-width="6" stroke-linecap="round"/></g>
    <g class="hand-m" style="--from:${angM(m1)}deg;--to:${angM(m2) + (h2 * 60 + m2 < h1 * 60 + m1 ? -360 : 0)}deg"><line x1="180" y1="180" x2="180" y2="55" stroke="#9fb4ff" stroke-width="3" stroke-linecap="round"/></g>
    <circle cx="180" cy="180" r="7" fill="#f5c86b"/>
    <text x="180" y="245" text-anchor="middle" class="clock-label">☀ 真太阳时</text>
  </svg>`;
  return wrap;
}

function eclipticVisual(sunLon: number): HTMLElement {
  const pt = (lon: number, r: number) => ({ x: 180 + r * Math.cos(rad(-lon)), y: 180 + r * Math.sin(rad(-lon)) });
  const terms = JIEQI.map((n, i) => {
    const a = pt(i * 15, 150);
    const b = pt(i * 15, i % 2 ? 140 : 132);
    const t = pt(i * 15, 116);
    return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="rgba(245,200,107,.6)"/>${i % 2 ? "" : `<text x="${t.x}" y="${t.y + 4}" text-anchor="middle" class="jq">${n}</text>`}`;
  }).join("");
  const wrap = h("div", { class: "ecliptic-wrap" });
  wrap.innerHTML = `<svg viewBox="0 0 360 360">
    <circle cx="180" cy="180" r="150" fill="none" stroke="rgba(245,200,107,.35)"/>
    <circle cx="180" cy="180" r="90" fill="none" stroke="rgba(120,140,255,.2)" stroke-dasharray="3 5"/>
    ${terms}
    <circle cx="180" cy="180" r="10" fill="#4a9bff"/><text x="180" y="205" text-anchor="middle" class="jq">地球</text>
    <g class="sun-orbit" style="--to:${-sunLon}deg"><circle cx="330" cy="180" r="13" fill="#ffcf5a" class="sun-glow"/><line x1="180" y1="180" x2="317" y2="180" stroke="rgba(255,207,90,.5)" stroke-dasharray="4 4"/></g>
  </svg>`;
  return wrap;
}

function reelsVisual(pillars: string[]) {
  const labels = ["年", "月", "日", "时"];
  const cells = Array.from({ length: 60 }, (_, i) => GAN[i % 10]! + ZHI[i % 12]!);
  const reels = pillars.map((final, i) => {
    const seq = Array.from({ length: 24 }, (_, k) => cells[(k * 7 + i * 13) % 60]!);
    seq.push(final);
    const strip = h("div", { class: "reel-strip", style: { "--n": seq.length - 1, "--i": i } as never }, ...seq.map((s) => h("div", { class: "reel-cell" }, h("span", null, s[0]), h("span", null, s[1]))));
    return h("div", { class: "reel" }, h("small", null, `${labels[i]}柱`), h("div", { class: "reel-window" }, strip));
  });
  const el = h("div", { class: "reels" }, ...reels);
  return { el, spin: () => requestAnimationFrame(() => el.classList.add("spin")) };
}

function planetsVisual(planets: Record<string, { lon: number; retro: boolean }>): HTMLElement {
  const keys = Object.keys(planets);
  const rings = keys.map((_, i) => `<circle cx="180" cy="180" r="${40 + i * 13}" fill="none" stroke="rgba(150,160,255,.12)"/>`).join("");
  const bodies = keys
    .map((k, i) => {
      const r = 40 + i * 13;
      const p = PLANETS[k as keyof typeof PLANETS];
      return `<g class="orbiter" style="--to:${-planets[k]!.lon}deg;--d:${i * 90}ms"><circle cx="${180 + r}" cy="180" r="7" fill="rgba(10,8,30,.9)" stroke="${i === 0 ? "#ffcf5a" : i === 1 ? "#dfe6ff" : "#9fb4ff"}"/><text x="${180 + r}" y="184" text-anchor="middle" class="pg" transform="rotate(${planets[k]!.lon} ${180 + r} 180)">${esc(p.glyph)}</text></g>`;
    })
    .join("");
  const signs = ZODIAC.map((z, i) => {
    const a = rad(-(i * 30 + 15));
    return `<text x="${180 + 170 * Math.cos(a)}" y="${180 + 170 * Math.sin(a) + 5}" text-anchor="middle" class="zg">${esc(z.glyph)}</text>`;
  }).join("");
  const wrap = h("div", { class: "planets-wrap" });
  wrap.innerHTML = `<svg viewBox="0 0 360 360">${rings}<circle cx="180" cy="180" r="160" fill="none" stroke="rgba(245,200,107,.3)"/>${signs}${bodies}<circle cx="180" cy="180" r="6" fill="#4a9bff"/></svg>`;
  return wrap;
}

function castVisual(lines: number[], moving: number): HTMLElement {
  const hex = h(
    "div",
    { class: "cast-hex" },
    ...[...lines].reverse().map((l, i) => h("div", { class: `yao ${l ? "yang" : "yin"}${6 - i === moving ? " moving" : ""}`, style: { "--i": 5 - i } as never }, h("i"), h("i"))),
  );
  const cards = h("div", { class: "cast-cards" }, ...Array.from({ length: 7 }, (_, i) => h("div", { class: "mini-card", style: { "--i": i } as never })));
  return h("div", { class: "cast-wrap" }, hex, cards);
}

function fusionVisual(icons: string[]) {
  const el = h(
    "div",
    { class: "fusion-wrap" },
    ...icons.map((ic, i) => h("span", { class: "fusion-icon", style: { "--a": `${(i * 360) / icons.length}deg`, "--i": i } as never }, ic)),
    h("div", { class: "fusion-core" }, "命"),
  );
  return { el, converge: () => el.classList.add("converge") };
}
