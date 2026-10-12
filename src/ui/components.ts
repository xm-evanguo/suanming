import type { Dim, Scores } from "../data/types";
import { DIM_NAMES, DIMS } from "../methods/fusion";
import { colorHex, countUp, h, reveal } from "./dom";

const DIM_ICON = { career: "⚔", wealth: "◈", love: "❦", health: "✚", wisdom: "✧" } as const;
/** Mark `btn` as the one pressed choice among its siblings. */
export function pressOnly(btn: Element) {
  for (const b of btn.parentElement!.children) {
    b.classList.toggle("on", b === btn);
    b.setAttribute("aria-pressed", String(b === btn));
  }
}

/** "⚔ 事业": the icon and name of a life dimension. */
export const dimLabel = (d: Dim) => `${DIM_ICON[d]} ${DIM_NAMES[d]}`;

/** Animated horizontal bars for the five life dimensions. */
export function scoreBars(scores: Scores): HTMLElement {
  const el = h(
    "div",
    { class: "bars" },
    ...DIMS.map((d, i) => {
      const num = h("b", null, "0");
      const row = h(
        "div",
        { class: `bar dim-${d}`, style: { "--v": `${scores[d]}%`, "--i": i } as never },
        h("span", null, dimLabel(d)),
        h("div", { class: "track" }, h("i")),
        num,
      );
      row.dataset.v = String(scores[d]);
      return row;
    }),
  );
  reveal(el);
  const io = new IntersectionObserver((es) => {
    if (!es.some((e) => e.isIntersecting)) return;
    io.disconnect();
    for (const row of el.querySelectorAll<HTMLElement>(".bar")) countUp(row.querySelector("b")!, Number(row.dataset.v), 1400);
  });
  io.observe(el);
  return el;
}

export function chips(words: string[], cls = "chip"): HTMLElement {
  return h("div", { class: "chips" }, ...words.map((w, i) => h("span", { class: cls, style: { "--i": i } as never }, w)));
}

export function luckyRow(l: { colors: string[]; numbers: number[]; directions: string[] }): HTMLElement {
  const item = (label: string, ...content: (Node | string)[]) => h("div", { class: "lucky-item" }, h("small", null, label), h("div", null, ...content));
  return h(
    "div",
    { class: "lucky" },
    l.colors.length > 0 &&
      item("幸运色", ...l.colors.map((c) => h("span", { class: "swatch" }, h("i", { style: { background: colorHex(c) } }), c))),
    l.numbers.length > 0 && item("幸运数字", ...l.numbers.map((n) => h("span", { class: "lucky-num" }, String(n)))),
    l.directions.length > 0 && item("吉方位", ...l.directions.map((d) => h("span", { class: "lucky-dir" }, `🧭 ${d}`))),
  );
}

type NavLink = [href: string, label: string];

/** Page top bar: a back link, a page label, and an optional forward link. */
export function topbar(back: NavLink, label: string, next?: NavLink): HTMLElement {
  const link = ([href, text]: NavLink) => h("a", { href, class: "btn btn-ghost" }, text);
  return h("nav", { class: "topbar" }, link(back), h("span", { class: "topbar-count" }, label), next && link(next));
}

export function sectionTitle(text: string, sub?: string): HTMLElement {
  return reveal(h("div", { class: "sec-title" }, h("h2", null, text), sub && h("p", null, sub)));
}

/** Chinese numeral for small counts (1-99), e.g. 14 → 十四. */
export function cnNum(n: number): string {
  const D = "零一二三四五六七八九";
  if (n < 10) return D[n]!;
  const t = Math.floor(n / 10);
  return `${t > 1 ? D[t] : ""}十${n % 10 ? D[n % 10] : ""}`;
}

/** Content shown only in one reading mode. body[data-mode] switches it with CSS, so no re-render is needed. */
export const onlyPro = (...children: (Node | string | false | null | undefined)[]) => h("div", { class: "only-pro" }, ...children);
export const onlyPlain = (...children: (Node | string | false | null | undefined)[]) => h("div", { class: "only-plain" }, ...children);

export const TONE_MARK = { good: "▲", bad: "▼", mixed: "◆" } as const;
export const TONE_NAME = { good: "顺", bad: "慎", mixed: "平" } as const;

/**
 * One statement from one system. Pro mode shows the rule and the everyday sentence;
 * plain mode shows only the everyday sentence.
 */
export function statement(s: { tone: keyof typeof TONE_MARK; weight: number; pro: string; plain: string }, source: string | Node, i = 0): HTMLElement {
  return h(
    "li",
    { class: `stmt tone-${s.tone} w${s.weight}`, style: { "--i": i } as never },
    h("i", { class: "stmt-mark", "aria-label": TONE_NAME[s.tone] }, TONE_MARK[s.tone]),
    h("div", null, h("p", { class: "stmt-plain" }, s.plain), h("p", { class: "stmt-pro only-pro" }, s.pro), h("small", { class: "stmt-src" }, source)),
  );
}
