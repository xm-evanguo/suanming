import { fmtTime } from "../core/chart";
import { DIMS } from "../methods/fusion";
import type { MethodResult, Origin } from "../methods/types";
import { countUp, h, reveal, tilt, typewrite } from "./dom";
import { getState } from "./state";

const ORIGIN_TITLE: Record<Origin, string> = {
  中国: "东方 · 华夏命理",
  日本: "东瀛 · 日本星术",
  西方: "西方 · 星与数",
  印度: "天竺 · 吠陀",
  玛雅: "中美洲 · 玛雅",
};

export function birthLine(): string {
  const { input, chart } = getState();
  if (!input || !chart) return "";
  const date = `${input.year}-${String(input.month).padStart(2, "0")}-${String(input.day).padStart(2, "0")}`;
  const time = input.timeKnown ? `${String(input.hour).padStart(2, "0")}:${String(input.minute).padStart(2, "0")}` : "时间不详";
  const solar = input.trueSolar && input.timeKnown ? ` · 真太阳时 ${fmtTime(chart.trueSolarTime).slice(11)}` : "";
  return `${date} ${time} · ${input.city.name}${solar} · ${input.gender === "male" ? "乾造" : "坤造"}`;
}

export function renderHub(view: HTMLElement) {
  const { results, fusion } = getState();
  if (!results || !fusion) return;

  const guide = h("p", { class: "hub-guide" });
  view.append(
    h(
      "header",
      { class: "page-head" },
      h("p", { class: "eyebrow" }, "THE CHART IS COMPLETE"),
      h("h1", { class: "title-glow small" }, "你的命盘已成"),
      h("p", { class: "birth-line" }, birthLine()),
      guide,
      h("a", { class: "btn btn-ghost", href: "#/new" }, "↺ 重新输入"),
    ),
  );
  typewrite(guide, "十二扇门已经为你打开。每一扇门后，都是一个古老文明看见的你。先逐一推开，或直接前往融合总结。", 32);

  const score = h("b", null, "0");
  const ring = h("div", { class: "ring", style: { "--p": fusion.overall } as never }, score, h("small", null, "综合星运"));
  const card = h(
    "a",
    { class: "summary-card glass", href: "#/summary" },
    ring,
    h(
      "div",
      null,
      h("p", { class: "eyebrow" }, "FUSION · 融合总结"),
      h("h2", null, "十二体系的命运全息图"),
      h("p", null, fusion.oracle[3] ?? ""),
      h("span", { class: "btn btn-primary" }, "查看融合总结 ✦"),
    ),
  );
  view.append(reveal(card));
  setTimeout(() => countUp(score, fusion.overall, 1600), 400);
  tilt(card, 4);

  const origins = [...new Set(results.map((r) => r.origin))];
  let n = 0;
  for (const o of origins) {
    view.append(reveal(h("h3", { class: "origin-title" }, ORIGIN_TITLE[o])));
    view.append(h("div", { class: "method-grid" }, ...results.filter((r) => r.origin === o).map((r) => methodCard(r, n++))));
  }
}

function methodCard(r: MethodResult, i: number): HTMLElement {
  const card = h(
    "a",
    { class: `method-card glass origin-${r.origin}`, href: `#/m/${r.id}` },
    h("div", { class: "mc-icon" }, r.icon),
    h("div", { class: "mc-top" }, h("span", { class: "mc-name" }, r.name), h("span", { class: "origin-chip" }, r.origin)),
    h("p", { class: "mc-headline" }, r.headline),
    h("p", { class: "mc-tagline" }, r.tagline),
    h("div", { class: "mini-bars" }, ...DIMS.map((d) => h("i", { style: { "--v": `${r.scores[d]}%` } as never }))),
    h("span", { class: "mc-go" }, "推开这扇门 →"),
  );
  tilt(card);
  return reveal(card, (i % 3) * 90);
}
