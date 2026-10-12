import { fmtTime } from "../core/chart";
import { DIMS } from "../methods/fusion";
import type { MethodResult, Origin } from "../methods/types";
import { cnNum } from "./components";
import { countUp, h, reveal, tilt, typewrite } from "./dom";
import { getState, listPeople } from "./state";

const ORIGIN_TITLE: Record<Origin, string> = {
  中国: "东方 · 华夏命理",
  日本: "东瀛 · 日本星术",
  西方: "西方 · 星与数",
  古希腊: "古希腊 · 希腊化占星",
  古罗马: "古罗马 · 迦勒底七曜",
  波斯: "波斯 · 法达星限",
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
  typewrite(guide, `${cnNum(results.length)}扇门已经为你打开。每一扇门后，都是一个古老文明看见的你。先逐一推开，或直接前往融合总结。`, 32);

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
      h("h2", null, `${cnNum(results.length)}体系的命运全息图`),
      h("p", null, fusion.oracle[3] ?? ""),
      h("span", { class: "btn btn-primary" }, "查看融合总结 ✦"),
    ),
  );
  view.append(reveal(card));
  setTimeout(() => countUp(score, fusion.overall, 1600), 400);
  tilt(card, 4);

  const people = listPeople().length;
  const feature = (href: string, glyph: string, eyebrow: string, title: string, text: string, go: string) => {
    const el = h("a", { class: "feature-card glass", href }, h("span", { class: "fc-glyph", "aria-hidden": "true" }, glyph), h("p", { class: "eyebrow" }, eyebrow), h("h3", null, title), h("p", null, text), h("span", { class: "mc-go" }, go));
    tilt(el, 6);
    return el;
  };
  view.append(
    reveal(
      h(
        "div",
        { class: "feature-row" },
        feature("#/ask", "✦", "QUAESTIO · 问事", "问事", "带着一个具体问题来：换工作、感情、搬家……按你的处境，综合各体系回答。", "去提问 →"),
        feature("#/timeline", "☽", "TEMPUS · 流年流月", "未来运程", "今年起三年、未来十二个月。按事业、财富、感情等领域，看各体系说了什么。", "查看时间轴 →"),
        feature("#/people", "❦", "CONIUNCTIO · 关系合盘", "你与身边的人", people ? `已添加 ${people} 人。看缘分、相处，以及谁能在事业上帮你。` : "加入伴侣、父母或朋友的生日，看缘分、相处，以及谁能在事业上帮你。", people ? "查看合盘 →" : "添加一个人 →"),
      ),
    ),
  );

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
    h("p", { class: "mc-tagline only-pro" }, r.tagline),
    r.plain && h("p", { class: "mc-tagline only-plain" }, r.plain.summary.split(/(?<=。)/)[0]),
    h("div", { class: "mini-bars" }, ...DIMS.map((d) => h("i", { style: { "--v": `${r.scores[d]}%` } as never }))),
    h("span", { class: "mc-go" }, "推开这扇门 →"),
  );
  tilt(card);
  return reveal(card, (i % 3) * 90);
}
