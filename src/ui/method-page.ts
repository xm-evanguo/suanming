import { byWeight, periodName } from "../forecast/types";
import { type MethodId, originName, plainTitles } from "../methods/types";
import { chips, luckyRow, onlyPlain, onlyPro, scoreBars, sectionTitle, statement, topbar } from "./components";
import { h, reveal, typewrite } from "./dom";
import { birthLine } from "./hub";
import { getEnabledMethods, getForecast, result } from "./state";
import { VISUALS } from "./visuals";
import { dimName, DIMS } from "../methods/fusion";
import { t } from "../i18n";

/** Plain sections that most systems share: the same four questions, answered 10 times. They go into a fold. */
const genericTitles = () => new Set(Object.values(plainTitles()));

/** This system's reading of the current year, if it has a year rule. Computed after the first paint. */
function nowSlot(id: MethodId): HTMLElement {
  const slot = h("div", { class: "now-slot" });
  setTimeout(() => {
    const forecast = getForecast(id);
    const cur = forecast?.years[0];
    if (cur && cur.signals.length > 0) {
      const top = [...cur.signals].sort(byWeight).slice(0, 3);
      slot.append(
        sectionTitle(t(`现在 · ${cur.period.year} 年`, `Now · ${cur.period.year}`), t("这套方法眼下读到的信号", "What this method reads for now")),
        reveal(h("section", { class: "glass now-card" }, onlyPro(h("p", { class: "now-label" }, cur.label)), h("ul", { class: "stmts" }, ...top.map((s, i) => statement(s, periodName(cur.period), i))))),
      );
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
    topbar(["#/hub", t("← 星盘总览", "← Overview")], `${String(idx + 1).padStart(2, "0")} / ${order.length}`, ["#/summary", t("融合总结 ✦", "Summary ✦")]),
    h(
      "header",
      { class: `m-hero origin-${r.origin}` },
      h("div", { class: "m-icon" }, r.icon),
      h("span", { class: "origin-chip" }, originName(r.origin)),
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
  const generic_ = genericTitles();
  const specific = r.plain.sections.filter((s) => !generic_.has(s.title));
  const generic = r.plain.sections.filter((s) => generic_.has(s.title));
  view.append(
    onlyPro(
      sectionTitle(t("推演数据", "Chart data"), t("以下数值均由你的出生信息实时计算得出", "Every value below is computed from your birth data")),
      reveal(h("dl", { class: "facts" }, ...r.facts.flatMap((f) => [h("div", { class: "fact" }, h("dt", null, f.label), h("dd", null, f.value))]))),
    ),
    onlyPlain(sectionTitle(t("一句话说你", "You in a sentence"), t("通俗版：不用术语，说说这套方法看到了什么", "Plain reading: what this method sees, without jargon")), reveal(h("section", { class: "glass plain-summary" }, h("p", null, r.plain.summary)))),
    sectionTitle(t("五维能量", "Five areas"), DIMS.map(dimName).join(" · ")),
    scoreBars(r.scores),
    reveal(chips(r.keywords)),
    onlyPro(sectionTitle(t("命运解读", "The reading"), t("向下滑动，逐段揭示", "Scroll to reveal it part by part")), ...r.sections.map(article)),
    onlyPlain(
      sectionTitle(t("说给你听", "In plain words"), t("通俗版解读", "Plain reading")),
      ...specific.map(article),
      generic.length > 0 &&
        h(
          "details",
          { class: "more fold", open: specific.length === 0 },
          h("summary", null, t("性格与通用建议（与其他体系相近，展开查看）", "Personality and general advice (similar to other systems; open to read)")),
          ...generic.map((s, i) => article(s, specific.length + i)),
        ),
    ),
  );
  if (id === "tarot") view.append(reveal(h("a", { class: "glass tarot-go", href: "#/ask/tarot" }, h("b", null, t("去问事页亲手抽三张牌 →", "Draw three cards yourself on the Ask page →")), h("small", null, t("有具体问题时，洗牌，凭直觉抽三张。", "When you have a real question, shuffle and draw three by feel.")))));
  view.append(reveal(h("div", { class: "end-actions" }, h("a", { class: "btn btn-ghost", href: `#/ask/m/${id}` }, t("就这一页提问 →", "Ask about this page →")))));
  view.append(sectionTitle(t("开运指引", "Luck guide")), reveal(luckyRow(r.lucky)));
  if (r.caveats.length) view.append(onlyPro(reveal(h("aside", { class: "caveats" }, h("b", null, t("ⓘ 推算说明", "ⓘ Notes on the calculation")), ...r.caveats.map((c) => h("p", null, c))))));

  view.append(
    reveal(
      h(
        "nav",
        { class: "pager" },
        h("a", { href: `#/m/${prev.id}`, class: "pager-card glass" }, h("small", null, t("← 上一扇门", "← Previous door")), h("b", null, `${prev.icon} ${prev.name}`)),
        h("a", { href: `#/m/${next.id}`, class: "pager-card glass right" }, h("small", null, t("下一扇门 →", "Next door →")), h("b", null, `${next.icon} ${next.name}`)),
      ),
    ),
  );
}
