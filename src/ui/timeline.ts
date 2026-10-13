import type { Dim } from "../data/types";
import { forecastPeriods, type Period, periodName, type PeriodReading, type Signal } from "../forecast/types";
import { dimName, DIMS } from "../methods/fusion";
import { MONTH_EN } from "../forecast/types";
import { periodScore } from "../methods/topics";
import type { MethodResult } from "../methods/types";
import { dimLabel, onlyPro, sectionTitle, statement, topbar } from "./components";
import { h, reveal, typewrite } from "./dom";
import { birthLine } from "./hub";
import { getForecasts, getState } from "./state";
import { t } from "../i18n";

type Filter = Dim | "all";
type Kind = "years" | "months";

interface Row {
  result: MethodResult;
  reading: PeriodReading;
}

const FILTER_KEY = "tianji.timeline.dim";

const key = (p: Period) => `${p.year}-${p.month ?? 0}`;

const byStrength = (a: { s: Signal }, b: { s: Signal }) => b.s.weight - a.s.weight;

export function renderTimeline(view: HTMLElement) {
  const { results } = getState();
  if (!results) return;
  const forecasts = getForecasts();
  const now = new Date();
  const periods = forecastPeriods(now);

  const withRules = results.filter((r) => {
    const f = forecasts[r.id];
    return f && (f.years.length > 0 || f.months.length > 0);
  });
  const yearly = withRules.filter((r) => forecasts[r.id]!.years.length > 0);
  const monthly = withRules.filter((r) => forecasts[r.id]!.months.length > 0);

  // Readings per period key, per system.
  const index = new Map<string, Row[]>();
  for (const r of withRules) {
    const f = forecasts[r.id]!;
    for (const reading of [...f.years, ...f.months]) {
      const k = key(reading.period);
      index.set(k, [...(index.get(k) ?? []), { result: r, reading }]);
    }
  }
  const rowsOf = (p: Period) => index.get(key(p)) ?? [];
  const signalsOf = (p: Period, filter: Filter) =>
    rowsOf(p).flatMap((row) => row.reading.signals.filter((s) => filter === "all" || s.dim === filter).map((s) => ({ s, row })));

  let filter: Filter = "all";
  try {
    const saved = localStorage.getItem(FILTER_KEY) as Filter | null;
    if (saved && (saved === "all" || DIMS.includes(saved))) filter = saved;
  } catch {
    // Storage unavailable: use the default.
  }
  const hasYears = yearly.length > 0;
  const hasMonths = monthly.length > 0;
  const hasAny = hasYears || hasMonths;
  let sel: { kind: Kind; idx: number } = { kind: hasMonths ? "months" : "years", idx: 0 };

  const guide = h("p", { class: "hub-guide" });
  view.append(
    topbar(["#/hub", t("← 星盘总览", "← Overview")], "TIMELINE", ["#/people", t("关系合盘 ❦", "Relationships ❦")]),
    h(
      "header",
      { class: "page-head" },
      h("p", { class: "eyebrow" }, t("TEMPUS · 流年流月", "TEMPUS · YEARS & MONTHS")),
      h("h1", { class: "title-glow small" }, t("未来运程", "Your outlook")),
      h("p", { class: "birth-line" }, birthLine()),
      guide,
    ),
  );
  typewrite(
    guide,
    t("选一个领域，查看接下来三年和十二个月的变化。", "Pick an area to see how the next three years and twelve months change."),
    28,
  );

  const chipsEl = h("div", { class: "dim-filter", role: "tablist", "aria-label": t("关注领域", "Area") });
  const yearsEl = h("div", { class: "year-cards" });
  const curveEl = h("div", { class: "mcurve" });
  const detailEl = h("section", { class: "period-detail glass", "aria-live": "polite" });

  view.append(
    hasAny ? reveal(chipsEl) : "",
    sectionTitle(t("三年大势", "Three-year trend"), hasYears ? t("点击一年查看详情", "Tap a year for details") : t("所选体系没有年运资料。", "The selected systems have no year forecasts.")),
    hasYears ? reveal(yearsEl) : "",
    sectionTitle(t("未来十二个月", "The next twelve months"), hasMonths ? t("点击月份查看详情", "Tap a month for details") : t("所选体系没有月运资料。", "The selected systems have no month forecasts.")),
    hasMonths ? reveal(h("div", { class: "glass curve-card" }, curveEl)) : "",
    hasAny ? detailEl : "",
  );

  function renderChips() {
    const opts: [Filter, string][] = [["all", t("全部领域", "All areas")], ...DIMS.map((d) => [d, dimLabel(d)] as [Filter, string])];
    chipsEl.replaceChildren(
      ...opts.map(([f, label]) =>
        h(
          "button",
          {
            type: "button",
            role: "tab",
            class: `dim-chip${f === filter ? " on" : ""}`,
            "aria-selected": String(f === filter),
            onclick: () => {
              filter = f;
              try {
                localStorage.setItem(FILTER_KEY, f);
              } catch {
                // Ignore.
              }
              update();
            },
          },
          label,
        ),
      ),
    );
  }

  function renderYears() {
    yearsEl.replaceChildren(
      ...periods.years.map((p, i) => {
        const sigs = signalsOf(p, filter);
        const v = periodScore(sigs.map((x) => x.s));
        const best = sigs.filter((x) => x.s.tone === "good").sort(byStrength)[0];
        const dims = DIMS.map((d) => periodScore(signalsOf(p, d).map((x) => x.s)));
        const on = sel.kind === "years" && sel.idx === i;
        return h(
          "button",
          {
            type: "button",
            class: `year-card glass${on ? " on" : ""}`,
            style: { "--i": i, "--v": v } as never,
            "aria-pressed": String(on),
            onclick: () => select("years", i),
          },
          h("span", { class: "yc-year" }, String(p.year)),
          h("small", { class: "yc-tag" }, i === 0 ? t("今年", "this year") : i === 1 ? t("明年", "next year") : t("后年", "in two years")),
          h("b", { class: "yc-score" }, String(v)),
          h("div", { class: "mini-bars" }, ...dims.map((d, j) => h("i", { style: { "--v": `${d}%` } as never, title: `${dimName(DIMS[j]!)} ${d}` }))),
          h("p", { class: "yc-line" }, best ? best.s.plain : t("各体系在这一领域没有明显信号。", "No system shows a clear signal in this area.")),
        );
      }),
    );
  }

  function renderCurve() {
    const vals = periods.months.map((p) => periodScore(signalsOf(p, filter).map((x) => x.s)));
    // Points at column centres in a 1200 x 100 box; y grows downward.
    const pts = vals.map((v, i) => [i * 100 + 50, 100 - v] as const);
    let line = `M${pts[0]![0]},${pts[0]![1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1]!;
      const [x1, y1] = pts[i]!;
      line += ` C${x0 + 50},${y0} ${x1 - 50},${y1} ${x1},${y1}`;
    }
    const area = `${line} L${pts.at(-1)![0]},100 L${pts[0]![0]},100 Z`;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 1200 100");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = `<defs><linearGradient id="mc-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f5c86b" stop-opacity="0.45"/><stop offset="1" stop-color="#8b5cf6" stop-opacity="0"/></linearGradient></defs><line x1="0" y1="50" x2="1200" y2="50" class="mc-mid"/><path d="${area}" class="mc-area"/><path d="${line}" class="mc-line" pathLength="1"/>`;
    curveEl.replaceChildren(
      svg,
      h(
        "div",
        { class: "mcols" },
        ...periods.months.map((p, i) => {
          const v = vals[i]!;
          const tone = v >= 58 ? "good" : v <= 42 ? "bad" : "mixed";
          const on = sel.kind === "months" && sel.idx === i;
          return h(
            "button",
            {
              type: "button",
              class: `mcol tone-${tone}${on ? " on" : ""}`,
              style: { "--v": v, "--i": i } as never,
              "aria-pressed": String(on),
              "aria-label": t(`${periodName(p)}，${v} 分`, `${periodName(p)}, ${v} points`),
              onclick: () => select("months", i),
            },
            h("i", { class: "mc-dot" }),
            h("b", null, String(v)),
            h("small", null, p.month === 1 || i === 0 ? `${String(p.year).slice(2)}/${p.month}` : t(`${p.month}月`, MONTH_EN[p.month! - 1]!.slice(0, 3))),
          );
        }),
      ),
    );
  }

  function renderDetail() {
    const p = sel.kind === "years" ? periods.years[sel.idx]! : periods.months[sel.idx]!;
    const sigs = signalsOf(p, filter);
    const v = periodScore(sigs.map((x) => x.s));
    const good = sigs.filter((x) => x.s.tone === "good").sort(byStrength);
    const bad = sigs.filter((x) => x.s.tone === "bad").sort(byStrength);
    const systems = (list: typeof sigs) => new Set(list.map((x) => x.row.result.id)).size;
    const isNow = sel.idx === 0;
    const rel =
      sel.kind === "months"
        ? sel.idx === 0 ? t("本月", "This month") : sel.idx === 1 ? t("下个月", "Next month") : ""
        : sel.idx === 0 ? t("今年", "This year") : sel.idx === 1 ? t("明年", "Next year") : t("后年", "In two years");

    const src = (row: Row) => h("span", null, `${row.result.icon} ${row.result.name}`, h("span", { class: "only-pro" }, ` · ${row.reading.label}`));
    const list = (items: typeof sigs, max: number) => {
      const shown = items.slice(0, max).map((x, i) => statement(x.s, src(x.row), i));
      const rest = items.slice(max).map((x, i) => statement(x.s, src(x.row), i));
      return [
        h("ul", { class: "stmts" }, ...shown),
        rest.length > 0 ? h("details", { class: "more" }, h("summary", null, t(`再看 ${rest.length} 条`, `${rest.length} more`)), h("ul", { class: "stmts" }, ...rest)) : "",
      ];
    };

    const groups: [Dim, typeof sigs][] =
      filter === "all"
        ? DIMS.map((d) => [d, sigs.filter((x) => x.s.dim === d).sort(byStrength)] as [Dim, typeof sigs]).filter(([, l]) => l.length > 0)
        : [[filter, [...sigs].sort(byStrength)]];

    detailEl.replaceChildren(
      h(
        "header",
        { class: "pd-head" },
        h("div", null, h("p", { class: "eyebrow" }, `${rel}${isNow ? " · NOW" : ""}`), h("h2", null, `${periodName(p)} · ${filter === "all" ? t("全部领域", "All areas") : dimName(filter)}`)),
        h("div", { class: "ring", style: { "--p": v } as never }, h("b", null, String(v)), h("small", null, t("运势指数", "Index"))),
      ),
      h(
        "p",
        { class: "pd-consensus" },
        sigs.length
          ? t(`${systems(good)} 个体系给出顺利的信号，${systems(bad)} 个体系提醒你注意。`, `${systems(good)} ${systems(good) === 1 ? "system gives" : "systems give"} a favourable signal; ${systems(bad)} ${systems(bad) === 1 ? "system warns" : "systems warn"} you to take care.`)
          : t("这一时段在所选领域没有信号。", "No signals in this area for this period."),
      ),
      good[0] ? h("div", { class: "pd-key good" }, h("small", null, t("✦ 最值得把握", "✦ Best to seize")), h("p", null, good[0].s.plain), h("small", { class: "stmt-src" }, src(good[0].row))) : "",
      bad[0] ? h("div", { class: "pd-key bad" }, h("small", null, t("☾ 最需要留意", "☾ Most to watch")), h("p", null, bad[0].s.plain), h("small", { class: "stmt-src" }, src(bad[0].row))) : "",
      ...groups.flatMap(([d, items]) => [
        h("h3", { class: "pd-dim" }, dimLabel(d), h("span", { class: "pd-dim-score" }, String(periodScore(items.map((x) => x.s))))),
        ...list(items, filter === "all" ? 3 : 8),
      ]),
      onlyPro(
        h(
          "details",
          { class: "more pd-rules" },
          h("summary", null, t("各体系的推算依据", "The rule behind each system")),
          h("ul", { class: "rule-list" }, ...rowsOf(p).map((row) => h("li", null, h("b", null, `${row.result.icon} ${row.result.name}`), h("span", null, row.reading.label)))),
        ),
      ),
    );
    detailEl.classList.remove("pd-flash");
    void detailEl.offsetWidth;
    detailEl.classList.add("pd-flash");
  }

  function select(kind: Kind, idx: number) {
    sel = { kind, idx };
    // Toggle classes instead of rebuilding, so the curve and cards do not replay their entrance animation.
    const mark = (els: Iterable<Element>, k: Kind) => {
      let i = 0;
      for (const el of els) {
        const on = sel.kind === k && sel.idx === i++;
        el.classList.toggle("on", on);
        el.setAttribute("aria-pressed", String(on));
      }
    };
    mark(yearsEl.children, "years");
    mark(curveEl.querySelectorAll(".mcol"), "months");
    renderDetail();
    detailEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function update() {
    if (!hasAny) return;
    renderChips();
    renderYears();
    renderCurve();
    renderDetail();
  }
  update();
}

