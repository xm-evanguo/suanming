import { METHOD_ORDER } from "../methods";
import type { MethodId } from "../methods/types";
import { chips, luckyRow, scoreBars, sectionTitle } from "./components";
import { h, reveal, typewrite } from "./dom";
import { birthLine } from "./hub";
import { result } from "./state";
import { VISUALS } from "./visuals";

export function renderMethod(view: HTMLElement, id: MethodId) {
  const r = result(id);
  const idx = METHOD_ORDER.indexOf(id);
  const prev = result(METHOD_ORDER[(idx + METHOD_ORDER.length - 1) % METHOD_ORDER.length]!);
  const next = result(METHOD_ORDER[(idx + 1) % METHOD_ORDER.length]!);

  const headline = h("h2", { class: "m-headline" });
  view.append(
    h(
      "nav",
      { class: "topbar" },
      h("a", { href: "#/hub", class: "btn btn-ghost" }, "← 星盘总览"),
      h("span", { class: "topbar-count" }, `${String(idx + 1).padStart(2, "0")} / ${METHOD_ORDER.length}`),
      h("a", { href: "#/summary", class: "btn btn-ghost" }, "融合总结 ✦"),
    ),
    h(
      "header",
      { class: `m-hero origin-${r.origin}` },
      h("div", { class: "m-icon" }, r.icon),
      h("span", { class: "origin-chip" }, r.origin),
      h("h1", { class: "title-glow small" }, r.name),
      h("p", { class: "m-intro" }, r.intro),
      headline,
      h("p", { class: "m-tagline" }, r.tagline),
      h("p", { class: "birth-line" }, birthLine()),
    ),
  );
  setTimeout(() => typewrite(headline, r.headline, 55), 500);

  const visual = VISUALS[id](r);
  view.append(reveal(h("section", { class: "m-visual glass" }, visual)));

  view.append(
    sectionTitle("推演数据", "以下数值均由你的出生信息实时计算得出"),
    reveal(h("dl", { class: "facts" }, ...r.facts.flatMap((f) => [h("div", { class: "fact" }, h("dt", null, f.label), h("dd", null, f.value))]))),
    sectionTitle("五维能量", "事业 · 财富 · 感情 · 健康 · 智慧"),
    scoreBars(r.scores),
    reveal(chips(r.keywords)),
    sectionTitle("命运解读", "向下滑动，逐段揭示"),
  );
  r.sections.forEach((s, i) => {
    view.append(reveal(h("article", { class: "reading glass" }, h("span", { class: "reading-no" }, String(i + 1).padStart(2, "0")), h("h3", null, s.title), h("p", null, s.body)), 60));
  });
  view.append(sectionTitle("开运指引"), reveal(luckyRow(r.lucky)));
  if (r.caveats.length) view.append(reveal(h("aside", { class: "caveats" }, h("b", null, "ⓘ 推算说明"), ...r.caveats.map((c) => h("p", null, c)))));

  view.append(
    reveal(
      h(
        "nav",
        { class: "pager" },
        h("a", { href: `#/m/${prev.id}`, class: "pager-card glass" }, h("small", null, "← 上一扇门"), h("b", null, `${prev.icon} ${prev.name}`)),
        h("a", { href: `#/m/${next.id}`, class: "pager-card glass right" }, h("small", null, "下一扇门 →"), h("b", null, `${next.icon} ${next.name}`)),
      ),
    ),
  );
}
