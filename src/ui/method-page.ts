import { byWeight } from "../forecast/types";
import type { MethodId } from "../methods/types";
import { chips, luckyRow, onlyPlain, onlyPro, scoreBars, sectionTitle, statement, topbar } from "./components";
import { h, reveal, typewrite } from "./dom";
import { birthLine } from "./hub";
import { getEnabledMethods, getForecast, result } from "./state";
import { VISUALS } from "./visuals";

/** Plain sections that most systems share: the same four questions, answered 10 times. They go into a fold. */
const GENERIC_TITLES = new Set(["你是怎样的人", "适合做什么", "感情里的你", "给你的建议", "这套方法怎么算的"]);

/** This system's reading of the current year, or its note when it has no year rule. Computed after the first paint. */
function nowSlot(id: MethodId): HTMLElement {
  const slot = h("div", { class: "now-slot" });
  setTimeout(() => {
    const forecast = getForecast(id);
    const cur = forecast?.years[0];
    if (cur && cur.signals.length > 0) {
      const top = [...cur.signals].sort(byWeight).slice(0, 3);
      slot.append(
        sectionTitle(`现在 · ${cur.period.year} 年`, "这套方法眼下读到的信号"),
        reveal(h("section", { class: "glass now-card" }, onlyPro(h("p", { class: "now-label" }, cur.label)), h("ul", { class: "stmts" }, ...top.map((s, i) => statement(s, `${cur.period.year} 年`, i))))),
      );
    } else if (forecast?.note) {
      slot.append(sectionTitle("现在"), reveal(h("p", { class: "v-caption" }, forecast.note)));
    }
  }, 0);
  return slot;
}

export function renderMethod(view: HTMLElement, id: MethodId) {
  const r = result(id);
  const order = getEnabledMethods();
  const idx = order.indexOf(id);
  const prev = result(order[(idx + order.length - 1) % order.length]!);
  const next = result(order[(idx + 1) % order.length]!);

  const headline = h("h2", { class: "m-headline" });
  view.append(
    topbar(["#/hub", "← 星盘总览"], `${String(idx + 1).padStart(2, "0")} / ${order.length}`, ["#/summary", "融合总结 ✦"]),
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

  const render = VISUALS[id];
  if (render) view.append(reveal(h("section", { class: "m-visual glass" }, render(r))));
  view.append(nowSlot(id));

  const article = (s: { title: string; body: string }, i: number) =>
    reveal(h("article", { class: "reading glass" }, h("span", { class: "reading-no" }, String(i + 1).padStart(2, "0")), h("h3", null, s.title), h("p", null, s.body)), 60);
  const specific = r.plain.sections.filter((s) => !GENERIC_TITLES.has(s.title));
  const generic = r.plain.sections.filter((s) => GENERIC_TITLES.has(s.title));
  view.append(
    onlyPro(
      sectionTitle("推演数据", "以下数值均由你的出生信息实时计算得出"),
      reveal(h("dl", { class: "facts" }, ...r.facts.flatMap((f) => [h("div", { class: "fact" }, h("dt", null, f.label), h("dd", null, f.value))]))),
    ),
    onlyPlain(sectionTitle("一句话说你", "通俗版：不用术语，说说这套方法看到了什么"), reveal(h("section", { class: "glass plain-summary" }, h("p", null, r.plain.summary)))),
    sectionTitle("五维能量", "事业 · 财富 · 感情 · 健康 · 智慧"),
    scoreBars(r.scores),
    reveal(chips(r.keywords)),
    onlyPro(sectionTitle("命运解读", "向下滑动，逐段揭示"), ...r.sections.map(article)),
    onlyPlain(
      sectionTitle("说给你听", "通俗版解读"),
      ...specific.map(article),
      generic.length > 0 &&
        h(
          "details",
          { class: "more fold", open: specific.length === 0 },
          h("summary", null, "性格与通用建议（与其他体系相近，展开查看）"),
          ...generic.map((s, i) => article(s, specific.length + i)),
        ),
    ),
  );
  if (id === "tarot") view.append(reveal(h("a", { class: "glass tarot-go", href: "#/ask/tarot" }, h("b", null, "去问事页亲手抽三张牌 →"), h("small", null, "有具体问题时，用传统的方式问一问：洗牌、凭直觉抽牌，还可以请 AI 结合问题解读。"))));
  view.append(reveal(h("div", { class: "end-actions" }, h("a", { class: "btn btn-ghost", href: `#/ask/m/${id}` }, "就这一页提问 →"))));
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
