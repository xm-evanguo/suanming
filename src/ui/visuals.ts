import { ganWuXing, WUXING, ZODIAC_ANIMALS, zhiWuXing } from "../core/ganzhi";
import { DAY_SIGNS, TONES } from "../data/maya";
import { NAKSHATRAS } from "../data/nakshatra";
import { NINE_STARS } from "../data/kyusei";
import { ASPECTS, PLANETS } from "../data/planets";
import { SHENG_XIAO } from "../data/shengxiao";
import { RELATION, SHUKU } from "../data/sukuyo";
import { MAJOR_ARCANA } from "../data/tarot";
import { TRIGRAMS } from "../data/hexagrams";
import { ZODIAC } from "../data/zodiac";
import type { AstrologyVisual } from "../methods/astrology";
import type { BaziVisual } from "../methods/bazi";
import { type ChengguVisual, fmtLiang } from "../methods/chenggu";
import { type KyuseiVisual, LOSHU_DIRS } from "../methods/kyusei";
import type { MayaVisual } from "../methods/maya";
import type { HexView, MeihuaVisual } from "../methods/meihua";
import type { NumerologyVisual } from "../methods/numerology";
import type { ShengxiaoVisual } from "../methods/shengxiao";
import type { SukuyoVisual } from "../methods/sukuyo";
import type { TarotVisual } from "../methods/tarot";
import type { MethodId, MethodResult } from "../methods/types";
import { lordName, type VedicVisual } from "../methods/vedic";
import type { ZiweiVisual } from "../methods/ziwei";
import { caption, EL_COLOR, f, polar, sector } from "./svg-geom";
import { esc, h, svg, WX_COLOR } from "./dom";
import { ANCIENT_VISUALS } from "./visuals-ancient";
import { isEn, listJoin, t } from "../i18n";
import { animalName, dirName, ganName, gzName, nayinName, shishenName, wxName, zhiName } from "../data/en/terms";
import { taiSuiName } from "../methods/shengxiao";
import { brightName, mutagenName, palaceName, starName } from "../data/en/ziwei-terms";

// Each renderer narrows the visual payload of its own method.
// biome-ignore lint: heterogeneous visual payloads
type Renderer = (r: MethodResult<any>) => HTMLElement;

// ───────────────────────── 八字
function bazi(r: MethodResult<BaziVisual>): HTMLElement {
  const v = r.visual;
  const now = new Date().getFullYear();
  const pillars = h(
    "div",
    { class: "pillars" },
    ...v.pillars.map((p, i) =>
      h(
        "div",
        { class: `pillar${i === 2 ? " day" : ""}`, style: { "--i": i } as never },
        h("small", null, p.label),
        h("span", { class: "god" }, shishenName(p.ganGod)),
        h("b", { class: "gz", style: { color: WX_COLOR[ganWuXing(p.gan)] } }, p.gan),
        h("b", { class: "gz", style: { color: WX_COLOR[zhiWuXing(p.zhi)] } }, p.zhi),
        isEn() && h("small", { class: "gz-py" }, `${ganName(p.gan)} ${zhiName(p.zhi)}`),
        h("div", { class: "hidden-stems" }, ...p.hidden.map((x) => h("span", { style: { color: WX_COLOR[ganWuXing(x.gan)] }, title: isEn() ? `${ganName(x.gan)} · ${shishenName(x.god)}` : undefined }, isEn() ? ganName(x.gan) : `${x.gan}`, h("small", null, isEn() ? "" : x.god)))),
        h("small", { class: "nayin" }, nayinName(p.nayin)),
      ),
    ),
  );
  const wx = h(
    "div",
    { class: "wx-bars" },
    ...WUXING.map((w, i) =>
      h(
        "div",
        { class: `wx-bar${v.favorable.includes(w) ? " fav" : ""}`, style: { "--v": `${v.wuxing[w]}%`, "--c": WX_COLOR[w], "--i": i } as never },
        h("b", null, wxName(w)),
        h("div", { class: "track" }, h("i")),
        h("span", null, `${v.wuxing[w]}%`),
      ),
    ),
  );
  const yun = h(
    "div",
    { class: "dayun" },
    ...v.dayun.map((d, i) =>
      h(
        "div",
        { class: `yun${now >= d.startYear && now <= d.endYear ? " now" : ""}`, style: { "--i": i } as never },
        h("b", { class: isEn() ? "gz-en" : undefined }, gzName(d.ganzhi)),
        h("small", null, t(`${d.startAge} 岁`, `age ${d.startAge}`)),
        h("small", null, `${d.startYear}–${d.endYear}`),
      ),
    ),
  );
  return h(
    "div",
    { class: "v-bazi" },
    pillars,
    h("div", { class: "v-row" }, h("div", null, h("h4", null, t("五行能量", "Five elements")), wx, caption(t(`日主自身力量 ${v.selfShare}% · 喜用 ${v.favorable.join("、")}`, `Day Master's own strength ${v.selfShare}% · useful: ${listJoin(v.favorable.map(wxName))}`))), h("div", null, h("h4", null, t("大运长河", "Ten-year luck periods")), yun, caption(v.startYun))),
    h("h4", null, t("生肖与太岁", "Zodiac animal and Tai Sui")),
    zodiacWheel(v.zodiac),
  );
}

// ───────────────────────── 紫微
const ZW_POS: Record<string, [number, number]> = {
  巳: [1, 1], 午: [1, 2], 未: [1, 3], 申: [1, 4], 酉: [2, 4], 戌: [3, 4], 亥: [4, 4], 子: [4, 3], 丑: [4, 2], 寅: [4, 1], 卯: [3, 1], 辰: [2, 1],
};
function ziwei(r: MethodResult<ZiweiVisual>): HTMLElement {
  const v = r.visual;
  const cells = v.palaces.map((p, i) => {
    const [row, col] = ZW_POS[p.branch]!;
    return h(
      "div",
      { class: `zw-cell${p.name === "命宫" ? " soul" : ""}`, style: { gridRow: String(row), gridColumn: String(col), "--i": i } as never },
      h("div", { class: "zw-stars" }, ...p.major.map((s) => h("b", { title: isEn() && s.brightness ? brightName(s.brightness) : undefined }, starName(s.name), !isEn() && s.brightness && h("small", null, s.brightness), s.mutagen && h("em", { class: `mut-${s.mutagen}` }, mutagenName(s.mutagen))))),
      h("div", { class: "zw-minor" }, p.minor.slice(0, 4).map(starName).join(isEn() ? " · " : " ")),
      h("div", { class: "zw-foot" }, h("span", null, isEn() ? gzName(p.stem + p.branch) : `${p.stem}${p.branch}`), h("b", null, palaceName(p.name), p.isBody && h("em", { class: "body" }, t("身", "Body"))), h("small", null, p.decadal)),
    );
  });
  const center = h("div", { class: "zw-center" }, h("p", { class: "zw-logo" }, t("紫微斗数", "Zi Wei Dou Shu")), ...v.center.map((c) => h("p", null, h("small", null, c.label), " ", c.value)));
  return h("div", { class: "v-ziwei" }, h("div", { class: "zw-grid" }, ...cells, center), caption(t("命宫以金色标出。“禄权科忌”为生年四化，括号内为星曜庙旺利陷。", "The Life palace is marked in gold. Lu, Quan, Ke and Ji are the Four Transformations of the birth year. Hover over a star for its brightness.")));
}

// ───────────────────────── 称骨
function chenggu(r: MethodResult<ChengguVisual>): HTMLElement {
  const v = r.visual;
  const tilt = Math.max(-12, Math.min(12, (v.total - 45) / 2));
  const weights = v.parts
    .map((p, i) => {
      const w = 26 + p.weight * 1.6;
      return `<g class="weight" style="--i:${i}"><rect x="${88 + i * 34 - w / 2 + 17}" y="${208 - 18}" width="${w}" height="18" rx="4"/><text x="${88 + i * 34 + 17}" y="${208 - 5}" text-anchor="middle">${esc(isEn() ? (p.weight / 10).toFixed(1) : fmtLiang(p.weight))}</text></g>`;
    })
    .join("");
  const scale = svg(
    "0 0 480 320",
    `<line x1="240" y1="60" x2="240" y2="290" class="post"/><path d="M200 300h80l-12-14h-56z" class="base"/>
     <g class="beam" style="--tilt:${-tilt}deg">
       <line x1="80" y1="70" x2="400" y2="70" class="bar"/><circle cx="240" cy="70" r="7" class="hub"/>
       <g class="pan"><line x1="100" y1="70" x2="70" y2="210"/><line x1="100" y1="70" x2="230" y2="210"/><path d="M60 208h180a90 20 0 0 1-180 0z"/>${weights}</g>
       <g class="pan right"><line x1="380" y1="70" x2="330" y2="200"/><line x1="380" y1="70" x2="430" y2="200"/><path d="M320 198h120a60 16 0 0 1-120 0z"/><text x="380" y="190" text-anchor="middle" class="fate${isEn() ? " en" : ""}">${t("命", "fate")}</text></g>
     </g>`,
    "scale",
  );
  const pct = ((v.total - 21) / (71 - 21)) * 100;
  return h(
    "div",
    { class: "v-chenggu" },
    scale,
    h("div", { class: "cg-total" }, h("small", null, t("骨重合计", "Total bone weight")), h("b", null, fmtLiang(v.total))),
    h("div", { class: "cg-gauge", style: { "--pos": `${pct}%` } as never }, h("i"), h("span", null, t("二两一", "2.1 liang")), h("span", null, t("七两一", "7.1 liang"))),
    caption(v.parts.map((p) => (isEn() ? `${p.label} (${p.key}) ${fmtLiang(p.weight)}` : `${p.label}${p.key} ${fmtLiang(p.weight)}`)).join(" ＋ ")),
  );
}

// ───────────────────────── 梅花易数
function hexagram(hx: HexView, label: string, moving: number | null, delay: number): HTMLElement {
  const up = TRIGRAMS[hx.upper]!;
  const lo = TRIGRAMS[hx.lower]!;
  return h(
    "div",
    { class: "hexa" },
    h("small", null, label),
    h(
      "div",
      { class: "hexa-lines" },
      ...[...hx.lines]
        .map((l, i) => ({ l, i }))
        .reverse()
        .map(({ l, i }) => h("div", { class: `yao ${l ? "yang" : "yin"}${moving === i + 1 ? " moving" : ""}`, style: { "--i": i + delay } as never }, h("i"), h("i"))),
    ),
    h("b", null, hx.fullName),
    h("span", null, t(`${up.symbol} ${up.nature} 上 · ${lo.symbol} ${lo.nature} 下`, `${up.symbol} ${up.nature} above · ${lo.symbol} ${lo.nature} below`)),
  );
}
function meihua(r: MethodResult<MeihuaVisual>): HTMLElement {
  const v = r.visual;
  const n = v.numbers;
  return h(
    "div",
    { class: "v-meihua" },
    h("div", { class: "hexa-row" }, hexagram(v.ben, t("本卦 · 现状", "Main · now"), v.moving, 0), h("i", { class: "arrow" }, "→"), hexagram(v.hu, t("互卦 · 过程", "Inner · process"), null, 6), h("i", { class: "arrow" }, "→"), hexagram(v.bian, t("变卦 · 结果", "Changed · outcome"), v.moving, 12)),
    caption(t(`农历起卦：年支 ${n.year}、月 ${n.month}、日 ${n.day}、时支 ${n.hour}。上卦 =（年+月+日）÷ 8 取余，下卦 = 再加时数 ÷ 8 取余，动爻 = 总数 ÷ 6 取余，即第 ${v.moving} 爻（发光者）。`, `Cast from the lunar date: year branch ${n.year}, month ${n.month}, day ${n.day}, hour branch ${n.hour}. Upper trigram = (year + month + day) mod 8; lower trigram = that plus the hour, mod 8; moving line = the total mod 6, here line ${v.moving} (the glowing one).`)),
  );
}

// ───────────────────────── 生肖
/** 生肖 wheel with 三合 / 六合 / 冲 / 害 lines. Shown on the 八字 page. */
function zodiacWheel(v: ShengxiaoVisual): HTMLElement {
  const pos = (i: number, rr = 150) => polar(200, 200, rr, i * 30 - 90);
  const ln = (a: number, b: number, cls: string) => {
    const p = pos(a, 132);
    const q = pos(b, 132);
    return `<line x1="${f(p.x)}" y1="${f(p.y)}" x2="${f(q.x)}" y2="${f(q.y)}" class="${cls}"/>`;
  };
  const [a, b, c] = v.sanhe as [number, number, number];
  const lines = ln(a, b, "sanhe") + ln(b, c, "sanhe") + ln(c, a, "sanhe") + ln(v.index, v.liuhe, "liuhe") + ln(v.index, v.chong, "chong") + ln(v.index, v.hai, "hai");
  const animals = SHENG_XIAO.map((s, i) => {
    const p = pos(i);
    const cls = i === v.index ? "me" : i === v.thisYear.index ? "year" : "";
    return `<g class="sx ${cls}" style="--i:${i}"><circle cx="${f(p.x)}" cy="${f(p.y)}" r="${i === v.index ? 30 : 23}"/><text x="${f(p.x)}" y="${f(p.y + 8)}" text-anchor="middle" class="emoji">${s.emoji}</text><text x="${f(p.x)}" y="${f(p.y + (i === v.index ? 46 : 38))}" text-anchor="middle" class="zl">${isEn() ? animalName(s.zhi) : `${s.zhi}${ZODIAC_ANIMALS[i]}`}</text></g>`;
  }).join("");
  const me = SHENG_XIAO[v.index]!;
  return h(
    "div",
    { class: "v-shengxiao" },
    svg("0 0 400 400", `<circle cx="200" cy="200" r="178" class="ring"/>${lines}${animals}<text x="200" y="215" text-anchor="middle" class="big-emoji">${me.emoji}</text>`),
    h(
      "ul",
      { class: "legend" },
      h("li", { class: "sanhe" }, t(`三合 ${v.sanhe.map((i) => ZODIAC_ANIMALS[i]).join("")}`, `Three Harmony ${v.sanhe.map((i) => animalName(ZODIAC_ANIMALS[i]!)).join(" ")}`)),
      h("li", { class: "liuhe" }, t(`六合 ${ZODIAC_ANIMALS[v.liuhe]}`, `Six Harmony ${animalName(ZODIAC_ANIMALS[v.liuhe]!)}`)),
      h("li", { class: "chong" }, t(`相冲 ${ZODIAC_ANIMALS[v.chong]}`, `Clash ${animalName(ZODIAC_ANIMALS[v.chong]!)}`)),
      h("li", { class: "hai" }, t(`相害 ${ZODIAC_ANIMALS[v.hai]}`, `Harm ${animalName(ZODIAC_ANIMALS[v.hai]!)}`)),
      h("li", { class: "year" }, t(`${v.thisYear.year} ${v.thisYear.ganzhi}年 · ${v.thisYear.relation}`, `${v.thisYear.year} ${gzName(v.thisYear.ganzhi)} year · ${taiSuiName(v.thisYear.relation)}`)),
    ),
  );
}

// ───────────────────────── 九星
const STAR_COLOR = ["", "#f4f6ff", "#3a3a48", "#3aa0ff", "#3fcf7a", "#f5c84b", "#f4f6ff", "#ff5a5a", "#f4f6ff", "#b46bff"];
const DIR_ABBR: Record<string, string> = { 东: "E", 南: "S", 西: "W", 北: "N", 东南: "SE", 西南: "SW", 东北: "NE", 西北: "NW" };
const dirAbbr = (d: string) => DIR_ABBR[d] ?? d;
function board(nums: number[], mine: number, title: string): HTMLElement {
  return h(
    "div",
    { class: "ky-board" },
    h("h4", null, title),
    h(
      "div",
      { class: "ky-grid" },
      ...nums.map((n, i) =>
        h(
          "div",
          { class: `ky-cell${n === mine ? " me" : ""}${i === 4 ? " center" : ""}`, style: { "--c": STAR_COLOR[n], "--i": i } as never },
          h("small", null, isEn() ? (i === 4 ? "Centre" : dirAbbr(LOSHU_DIRS[i]!)) : LOSHU_DIRS[i]),
          h("b", null, String(n)),
          h("span", null, isEn() ? NINE_STARS[n - 1]!.name.replace(/^\d /, "") : NINE_STARS[n - 1]!.name.slice(0, 2)),
        ),
      ),
    ),
  );
}
function kyusei(r: MethodResult<KyuseiVisual>): HTMLElement {
  const v = r.visual;
  return h(
    "div",
    { class: "v-kyusei" },
    h("div", { class: "v-row" }, board(v.birthBoard, v.star, t("出生年 · 年盘", "Birth year chart")), board(v.yearBoard, v.star, t(`${v.thisYear} 年 · 年盘`, `${v.thisYear} year chart`))),
    caption(
      t(
        `洛书九宫以南为上。你的本命星 ${NINE_STARS[v.star - 1]!.name} 在 ${v.thisYear} 年飞临「${v.palace === "中宫" ? "中宫" : `${v.palace}宫`}」（中宫为 ${NINE_STARS[v.thisYearCenter - 1]!.name}）。`,
        `The Lo Shu grid has south at the top. In ${v.thisYear} your natal star ${NINE_STARS[v.star - 1]!.name} flies to ${v.palace === "中宫" ? "the centre" : `the ${dirName(v.palace)}`} (${NINE_STARS[v.thisYearCenter - 1]!.name} is in the centre).`,
      ),
    ),
  );
}

// ───────────────────────── 27 宿轮（宿曜 / 吠陀共用）
function wheel27(labels: string[], fills: string[], me: number, extra = ""): HTMLElement {
  const step = 360 / 27;
  const rot = -90 - (me + 0.5) * step;
  const segs = labels
    .map((l, i) => {
      const a0 = rot + i * step;
      const mid = polar(200, 200, 160, a0 + step / 2);
      return `<g class="seg${i === me ? " me" : ""}" style="--i:${i}"><path d="${sector(200, 200, 120, 190, a0 + 0.4, a0 + step - 0.4)}" fill="${fills[i]}"/><text x="${f(mid.x)}" y="${f(mid.y + 5)}" text-anchor="middle" transform="rotate(${f(a0 + step / 2 + 90)} ${f(mid.x)} ${f(mid.y)})">${esc(l)}</text></g>`;
    })
    .join("");
  return svg("0 0 400 400", `${segs}<circle cx="200" cy="200" r="112" class="hub-ring"/>${extra}`, "wheel27");
}
const REL_COLOR: Record<string, string> = { 命: "#f5c86b", 业胎: "#b46bff", 荣亲: "#3fcf7a", 友衰: "#3ab8ff", 安坏: "#ff5a6a", 危成: "#ff9b3a" };
function sukuyo(r: MethodResult<SukuyoVisual>): HTMLElement {
  const v = r.visual;
  const me = SHUKU[v.index]!;
  const fills = v.relations.map((rel) => `${REL_COLOR[rel]}55`);
  return h(
    "div",
    { class: "v-wheel" },
    wheel27(
      SHUKU.map((s) => (isEn() ? s.name.slice(0, 5) : s.name.charAt(0))),
      fills,
      v.index,
      `<text x="200" y="196" text-anchor="middle" class="w-big${isEn() ? " en" : ""}">${esc(me.name)}</text><text x="200" y="224" text-anchor="middle" class="w-small">${esc(me.jp)}</text>`,
    ),
    h("ul", { class: "legend" }, ...Object.entries(REL_COLOR).map(([k, c]) => h("li", { style: { "--c": c } as never }, RELATION[k as keyof typeof RELATION].name))),
    caption(t("颜色表示其他二十六宿与你的“三九秘法”关系，可用来观察你与他人的缘分类型。", "Colours show how each of the other 26 mansions relates to yours in the Three-Nine method, a way to see what kind of bond you have with others.")),
  );
}
function vedic(r: MethodResult<VedicVisual>): HTMLElement {
  const v = r.visual;
  const step = 360 / 27;
  const rot = -90 - (v.nakshatra + 0.5) * step;
  const moonA = rot + (v.moonSid / 360) * 360;
  const m = polar(200, 200, 100, moonA);
  const fills = NAKSHATRAS.map((_, i) => (i % 9 === v.nakshatra % 9 ? "#f5c86b44" : `hsla(${250 + (i % 9) * 12},60%,55%,.25)`));
  const wheel = wheel27(
    NAKSHATRAS.map((n) => n.sanskrit.slice(0, 5)),
    fills,
    v.nakshatra,
    `<line x1="200" y1="200" x2="${f(m.x)}" y2="${f(m.y)}" class="moon-ray"/><text x="${f(m.x)}" y="${f(m.y + 6)}" text-anchor="middle" class="moon">☽</text><text x="200" y="196" text-anchor="middle" class="w-big">${esc(NAKSHATRAS[v.nakshatra]!.sanskrit)}</text><text x="200" y="222" text-anchor="middle" class="w-small">${t(`第 ${v.pada} 足`, `pada ${v.pada}`)}</text>`,
  );
  const span0 = v.dashas[0]!.start;
  const span1 = v.dashas[v.dashas.length - 1]!.end;
  const now = new Date().getFullYear() + new Date().getMonth() / 12;
  const dasha = h(
    "div",
    { class: "dasha" },
    ...v.dashas.map((d, i) =>
      h(
        "div",
        { class: `dasha-seg${now >= d.start && now < d.end ? " now" : ""}`, style: { flex: String(d.end - d.start), "--i": i } as never, title: `${lordName(d.lord)} ${Math.floor(d.start)}–${Math.floor(d.end)}` },
        h("b", null, lordName(d.lord)),
        h("small", null, String(Math.floor(d.start))),
      ),
    ),
    h("i", { class: "dasha-now", style: { left: `${((now - span0) / (span1 - span0)) * 100}%` } }),
  );
  return h("div", { class: "v-wheel" }, wheel, h("h4", null, t("Vimshottari 大运（120 年）", "Vimshottari dasha (120 years)")), dasha, caption(t(`同一守护星的三个月宿以金色标出。月亮恒星黄经 ${v.moonSid.toFixed(2)}°，岁差 ${v.ayanamsa.toFixed(2)}°。`, `The three nakshatras with the same ruling planet are marked in gold. The Moon's sidereal longitude is ${v.moonSid.toFixed(2)}° and the ayanamsa is ${v.ayanamsa.toFixed(2)}°.`)));
}

// ───────────────────────── 西洋占星
function astrology(r: MethodResult<AstrologyVisual>): HTMLElement {
  const v = r.visual;
  const C = 220;
  // Ascendant on the left; longitudes increase counter-clockwise.
  const ang = (lon: number) => 180 - (lon - v.asc);
  const pt = (lon: number, rr: number) => polar(C, C, rr, ang(lon));
  const signs = ZODIAC.map((z, i) => {
    const a0 = ang((i + 1) * 30);
    const mid = pt(i * 30 + 15, 192);
    return `<path d="${sector(C, C, 175, 210, a0, a0 + 30)}" fill="${EL_COLOR[z.westElement]}22" stroke="rgba(245,200,107,.35)"/><text x="${f(mid.x)}" y="${f(mid.y + 6)}" text-anchor="middle" class="zg" fill="${EL_COLOR[z.westElement]}">${esc(z.glyph)}</text>`;
  }).join("");
  const ascSign = Math.floor(v.asc / 30);
  const houses = Array.from({ length: 12 }, (_, i) => {
    const lon = ((ascSign + i) % 12) * 30;
    const a = pt(lon, 175);
    const b = pt(lon, 60);
    const label = pt(lon + 15, 72);
    return `<line x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}" class="house"/><text x="${f(label.x)}" y="${f(label.y + 4)}" text-anchor="middle" class="hn">${i + 1}</text>`;
  }).join("");
  // Spread planet glyphs so that they do not overlap.
  const sorted = [...v.planets].sort((a, b) => a.lon - b.lon);
  const disp = sorted.map((p) => p.lon);
  for (let pass = 0; pass < 4; pass++)
    for (let i = 1; i < disp.length; i++) if (disp[i]! - disp[i - 1]! < 8) disp[i] = disp[i - 1]! + 8;
  const bodies = sorted
    .map((p, i) => {
      const g = pt(disp[i]!, 150);
      const t0 = pt(p.lon, 175);
      const t1 = pt(p.lon, 166);
      return `<g class="body" style="--i:${i}"><line x1="${f(t0.x)}" y1="${f(t0.y)}" x2="${f(t1.x)}" y2="${f(t1.y)}" class="tick"/><text x="${f(g.x)}" y="${f(g.y + 6)}" text-anchor="middle" class="pg">${esc(PLANETS[p.key].glyph)}</text>${p.retro ? `<text x="${f(g.x + 10)}" y="${f(g.y + 14)}" class="retro">℞</text>` : ""}</g>`;
    })
    .join("");
  const lonOf = Object.fromEntries(v.planets.map((p) => [p.key, p.lon]));
  const aspects = v.aspects
    .map((a, i) => {
      const p = pt(lonOf[a.a]!, 128);
      const q = pt(lonOf[a.b]!, 128);
      const hm = ASPECTS[a.type].harmony;
      return `<line x1="${f(p.x)}" y1="${f(p.y)}" x2="${f(q.x)}" y2="${f(q.y)}" class="aspect ${hm > 0 ? "good" : hm < 0 ? "hard" : "conj"}" style="--i:${i}"/>`;
    })
    .join("");
  const ascA = pt(v.asc, 214);
  const ascB = pt(v.asc + 180, 214);
  const mcA = pt(v.mc, 214);
  const mcB = pt(v.mc + 180, 214);
  const wheel = svg(
    "0 0 440 440",
    `<circle cx="${C}" cy="${C}" r="210" class="rim"/>${signs}<circle cx="${C}" cy="${C}" r="175" class="rim"/><circle cx="${C}" cy="${C}" r="128" class="rim faint"/>${houses}${aspects}
     <line x1="${f(ascA.x)}" y1="${f(ascA.y)}" x2="${f(ascB.x)}" y2="${f(ascB.y)}" class="axis"/><line x1="${f(mcA.x)}" y1="${f(mcA.y)}" x2="${f(mcB.x)}" y2="${f(mcB.y)}" class="axis"/>
     <text x="${f(ascA.x - 4)}" y="${f(ascA.y - 6)}" class="axis-l" text-anchor="end">ASC</text><text x="${f(mcA.x)}" y="${f(mcA.y - 8)}" class="axis-l" text-anchor="middle">MC</text>${bodies}`,
    "natal",
  );
  const table = h(
    "table",
    { class: "planet-table" },
    h("tbody", null, ...v.planets.map((p) => h("tr", null, h("td", null, PLANETS[p.key].glyph), h("td", null, PLANETS[p.key].zh), h("td", null, `${ZODIAC[p.sign]!.name} ${Math.floor(p.lon % 30)}°`), h("td", null, t(`第${p.house}宫`, `House ${p.house}`)), h("td", null, p.retro ? t("℞ 逆行", "℞ retrograde") : "")))),
  );
  const total = Object.values(v.elements).reduce((a, b) => a + b, 0) || 1;
  const els = h(
    "div",
    { class: "wx-bars" },
    ...Object.entries(v.elements).map(([k, n], i) =>
      h("div", { class: "wx-bar", style: { "--v": `${(n / total) * 100}%`, "--c": EL_COLOR[k], "--i": i } as never }, h("b", null, isEn() ? ({ 火: "Fire", 土: "Earth", 风: "Air", 水: "Water" } as Record<string, string>)[k] ?? k : k), h("div", { class: "track" }, h("i")), h("span", null, String(n))),
    ),
  );
  return h(
    "div",
    { class: "v-astro" },
    h("div", { class: "v-row" }, wheel, h("div", null, h("h4", null, t("行星位置（整宫制）", "Planet positions (whole-sign houses)")), table, h("h4", null, t("四元素", "Four elements")), els)),
    caption(t("蓝线为和谐相位（三分、六分），红线为紧张相位（刑、冲），金线为合相。", "Blue lines are harmonious aspects (trine, sextile), red lines are tense aspects (square, opposition), and gold lines are conjunctions.")),
  );
}

// ───────────────────────── 塔罗
const ROMAN = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"];
function card(num: number, label: string, i: number, reversed = false): HTMLElement {
  const c = MAJOR_ARCANA[num]!;
  const el = h(
    "button",
    { class: "tcard", style: { "--i": i } as never, "aria-label": `${label}${t("：", ": ")}${c.name}${reversed ? t("（逆位）", " (reversed)") : ""}`, onclick: (e: Event) => (e.currentTarget as HTMLElement).classList.toggle("open") },
    h("div", { class: "tcard-inner" }, h("div", { class: "tcard-back" }, h("i", null, "✦")), h("div", { class: `tcard-front${reversed ? " reversed" : ""}` }, h("small", null, ROMAN[num]), h("span", { class: "tsym" }, c.symbol), h("b", null, c.name), !isEn() && h("small", null, c.en))),
  );
  return h("figure", { class: "tslot" }, el, h("figcaption", null, label, reversed && h("em", null, t(" 逆位", " reversed"))));
}
function tarot(r: MethodResult<TarotVisual>): HTMLElement {
  const v = r.visual;
  const year = new Date().getFullYear();
  const life = [card(v.personality, t("人格牌", "Personality card"), 0), ...(v.soul !== v.personality ? [card(v.soul, t("灵魂牌", "Soul card"), 1)] : []), card(v.yearCard, t(`${year} 年度牌`, `${year} year card`), 2)];
  const root = h(
    "div",
    { class: "v-tarot" },
    h("h4", null, t("生命牌", "Birth cards")),
    h("div", { class: "tarot-row" }, ...life),
    caption(t("生命牌由生日数字算出，一生不变；年度牌每年更换。点击卡牌可以翻回去再看一次。", "Birth cards come from your birthday numbers and never change; the year card changes every year. Tap a card to turn it over and look again.")),
  );
  const io = new IntersectionObserver((es) => {
    if (!es.some((e) => e.isIntersecting)) return;
    io.disconnect();
    root.querySelectorAll(".tcard").forEach((c, i) => setTimeout(() => c.classList.add("open"), 500 + i * 380));
  });
  io.observe(root);
  return root;
}

// ───────────────────────── 生命灵数
const LOSHU = [4, 9, 2, 3, 5, 7, 8, 1, 6];
function numerology(r: MethodResult<NumerologyVisual>): HTMLElement {
  const v = r.visual;
  const cellXY = (n: number) => {
    const i = LOSHU.indexOf(n);
    return { x: (i % 3) * 100 + 50, y: Math.floor(i / 3) * 100 + 50 };
  };
  const lines = v.lines
    .map((name, i) => {
      const [a, , c] = name.split(" ")[0]!.split("-").map(Number) as [number, number, number];
      const p = cellXY(a);
      const q = cellXY(c);
      return `<line x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}" style="--i:${i}"/>`;
    })
    .join("");
  const grid = h(
    "div",
    { class: "ls-wrap" },
    h("div", { class: "ls-grid" }, ...LOSHU.map((n, i) => h("div", { class: `ls-cell${v.grid[n] ? " on" : ""}`, style: { "--i": i } as never }, v.grid[n] ? String(n).repeat(v.grid[n]!) : String(n)))),
    svg("0 0 300 300", lines, "ls-lines"),
  );
  return h(
    "div",
    { class: "v-numerology" },
    h("div", { class: "digits" }, ...[...v.digits].map((d, i) => h("span", { style: { "--i": i } as never }, d))),
    h("div", { class: "reduce" }, r.facts[0]?.value ?? ""),
    h("div", { class: "v-row" }, h("div", { class: "lp" }, h("small", null, t("生命灵数", "Life path")), h("b", null, String(v.lifePath)), h("span", null, t(`生日数 ${v.birthday} · 流年 ${v.personalYear}`, `Birthday ${v.birthday} · year ${v.personalYear}`))), h("div", null, h("h4", null, t("九宫格 · 连线", "Nine-square grid · lines")), grid)),
  );
}

// ───────────────────────── 玛雅
function barDot(n: number): HTMLElement {
  return h("div", { class: "bardot" }, h("div", { class: "dots" }, ...Array.from({ length: n % 5 }, () => h("i"))), ...Array.from({ length: Math.floor(n / 5) }, () => h("b")));
}
function maya(r: MethodResult<MayaVisual>): HTMLElement {
  const v = r.visual;
  const s = DAY_SIGNS[v.sign]!;
  const cells = Array.from({ length: 260 }, (_, k) => {
    const kin = k + 1;
    const col = Math.floor(k / 20);
    const row = k % 20;
    const me = kin === v.kin;
    return h("i", { class: `tz${me ? " me" : row === v.sign ? " row" : ""}`, style: { gridColumn: String(col + 1), gridRow: String(row + 1), "--i": col + row } as never, title: `Kin ${kin}` });
  });
  return h(
    "div",
    { class: "v-maya" },
    h(
      "div",
      { class: "v-row" },
      h("div", { class: "maya-sign" }, barDot(v.tone), h("span", { class: "maya-glyph" }, s.glyph), h("b", null, `${v.tone} ${s.maya}`), h("small", null, `${s.name} · ${TONES[v.tone - 1]!.name}`), h("div", { class: "longcount" }, ...v.longCount.map((n) => h("span", null, String(n))))),
      h("div", null, h("h4", null, t("卓尔金 260 日神圣历", "Tzolk'in · the 260-day sacred calendar")), h("div", { class: "tz-grid" }, ...cells), caption(t(`列为 13 天一组的“波”，行为 20 个太阳印记。你的 Kin ${v.kin} 正在闪烁。`, `Each column is a \"wave\" of 13 days; each row is one of the 20 solar signs. Your Kin ${v.kin} is the one blinking.`))),
    ),
  );
}

export const VISUALS: Partial<Record<MethodId, Renderer>> = {
  bazi,
  ziwei,
  chenggu,
  meihua,
  kyusei,
  sukuyo,
  astrology,
  tarot,
  numerology,
  vedic,
  maya,
  ...ANCIENT_VISUALS,
};
