import type { Scores } from "../data/types";
import { DIM_NAMES, DIMS } from "../methods/fusion";
import { colorHex, countUp, h, reveal } from "./dom";

const DIM_ICON = { career: "⚔", wealth: "◈", love: "❦", health: "✚", wisdom: "✧" } as const;

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
        h("span", null, `${DIM_ICON[d]} ${DIM_NAMES[d]}`),
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

export function sectionTitle(text: string, sub?: string): HTMLElement {
  return reveal(h("div", { class: "sec-title" }, h("h2", null, text), sub && h("p", null, sub)));
}
