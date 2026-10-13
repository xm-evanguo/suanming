import { f } from "./svg-geom";
import { WU_XING } from "../data/bazi";
import { periodName } from "../forecast/types";
import type { WuXing } from "../data/types";
import { dimName, DIMS } from "../methods/fusion";
import { isEn, t } from "../i18n";
import { wxName } from "../data/en/terms";
import { consensusText, strongestSignals, type TopicStatement, type TopicView, topicViews } from "../methods/topics";
import type { MethodResult } from "../methods/types";
import { cnNum, luckyRow, onlyPlain, onlyPro, scoreBars, sectionTitle, statement, topbar } from "./components";
import { countUp, h, reveal, sleep, svg, typewrite, WX_COLOR } from "./dom";
import { birthLine } from "./hub";
import { getForecasts, getState } from "./state";


/** Up to `n` statements: the most distinctive one, then one from the other side of the mean, then the next most distinctive. */
function pickStatements(v: TopicView, n: number): TopicStatement[] {
  const [first, ...rest] = v.statements;
  if (!first) return [];
  const opposite = rest.find((s) => s.score < v.avg !== first.score < v.avg);
  const picked = opposite ? [first, opposite] : [first];
  for (const s of rest) if (picked.length < n && !picked.includes(s)) picked.push(s);
  return picked.slice(0, n);
}

/** "较顺：2027 年 3 月 · 需留意：2026 年 12 月", only for months that have signals and lean one way. */
export function monthsLine(v: TopicView): string {
  const withSignals = v.months.filter((m) => m.signals.length > 0);
  if (withSignals.length === 0) return "";
  const best = withSignals.reduce((a, b) => (b.score > a.score ? b : a));
  const worst = withSignals.reduce((a, b) => (b.score < a.score ? b : a));
  return [best.score > 50 ? t(`较顺：${periodName(best.period)}`, `Smoother: ${periodName(best.period)}`) : "", worst.score < 50 ? t(`需留意：${periodName(worst.period)}`, `Take care: ${periodName(worst.period)}`) : ""].filter(Boolean).join(" · ");
}

function topicCard(v: TopicView, total: number, hidden: boolean): HTMLElement {
  const picks = v.thisYear ? strongestSignals(v.thisYear, 2) : [];
  const line = monthsLine(v);
  return h(
    "section",
    { class: "glass topic-card", role: "tabpanel", hidden },
    h("div", { class: "tp-head" }, h("h3", null, v.name), h("span", { class: "tp-avg" }, t("出生画像 · ", "Birth profile · "), h("b", null, String(Math.round(v.avg))), t(" 分", ""))),
    h("p", { class: "tp-consensus" }, consensusText(v, total)),
    h(
      "ul",
      { class: "tp-stmts" },
      ...pickStatements(v, 3).map((s) =>
        h("li", { class: "tp-stmt" }, onlyPlain(h("p", null, s.text)), onlyPro(h("p", { class: s.pro ? "tp-pro" : "" }, s.pro || s.text)), h("small", { class: "stmt-src" }, t(`${s.name} · ${s.score} 分`, `${s.name} · ${s.score}`))),
      ),
    ),
    v.thisYear && (picks.length > 0 || line)
      ? h(
          "div",
          { class: "tp-now" },
          h("small", { class: "tp-now-title" }, t(`现在 · ${v.thisYear.period.year} 年`, `Now · ${v.thisYear.period.year}`)),
          picks.length > 0 ? h("ul", { class: "stmts" }, ...picks.map((p, i) => statement(p.signal, p.name, i))) : "",
          line ? h("p", { class: "tp-months" }, line) : "",
        )
      : "",
    h("div", { class: "tp-links" }, h("a", { class: "tp-link", href: "#/timeline" }, t("逐月看完整时间线 →", "See the full timeline by month →")), h("a", { class: "tp-link", href: `#/ask/t/${v.dim}` }, t("就这个话题提问 →", "Ask about this topic →"))),
  );
}

/** One switcher, one card per topic. The forecasts are computed after the first paint. */
function topicSection(results: MethodResult[]): HTMLElement {
  const slot = h("div", { class: "topic-slot" });
  setTimeout(() => {
    const views = topicViews(results, getForecasts());
    const cards = views.map((v, i) => topicCard(v, results.length, i !== 0));
    const tabs = views.map((v, i) =>
      h(
        "button",
        {
          type: "button",
          role: "tab",
          class: `dim-chip${i === 0 ? " on" : ""}`,
          "aria-selected": String(i === 0),
          onclick: () =>
            tabs.forEach((tab, j) => {
              tab.classList.toggle("on", i === j);
              tab.setAttribute("aria-selected", String(i === j));
              cards[j]!.hidden = i !== j;
            }),
        },
        `${v.name} ${Math.round(v.avg)}`,
      ),
    );
    slot.append(reveal(h("div", { class: "dim-filter", role: "tablist", "aria-label": t("话题", "Topics") }, ...tabs)), reveal(h("div", { class: "topic-cards" }, ...cards)));
  }, 0);
  return slot;
}

export function renderSummary(view: HTMLElement) {
  const { results, fusion } = getState();
  if (!results || !fusion) return;
  const year = new Date().getFullYear();
  const n = cnNum(results.length);
  const hasElements = Object.values(fusion.elements).some((v) => v > 0);

  const score = h("b", null, "0");
  const oracle = h("div", { class: "oracle" }, ...fusion.oracle.map(() => h("p")));
  view.append(
    topbar(["#/hub", t("← 星盘总览", "← Overview")], "FUSION", ["#/new", t("↺ 重新输入", "↺ Start over")]),
    h(
      "header",
      { class: "page-head" },
      h("p", { class: "eyebrow" }, `${results.length} SYSTEMS · ONE CHART`),
      h("h1", { class: "title-glow small" }, t("命运全息图", "Your full chart")),
      h("p", { class: "birth-line" }, birthLine()),
      h("div", { class: "ring big", style: { "--p": fusion.overall } as never }, score, h("small", null, t("出生画像", "Birth profile"))),
      h(
        "p",
        { class: "hub-guide" },
        t(
          `最闪耀：${dimName(fusion.strongest)} · 最需经营：${dimName(fusion.weakest)}${hasElements ? ` · 五行偏${fusion.dominantElement}、缺${fusion.weakElement}` : " · 所选体系没有五行资料"}`,
          `Brightest: ${dimName(fusion.strongest)} · Most to work on: ${dimName(fusion.weakest)}${hasElements ? ` · Elements: most ${wxName(fusion.dominantElement)}, least ${wxName(fusion.weakElement)}` : " · No five-element data in the selected systems"}`,
        ),
      ),
    ),
    reveal(h("section", { class: "glass oracle-card" }, h("span", { class: "oracle-mark" }, "❝"), oracle)),
    sectionTitle(t("按话题看：共识与分歧", "By topic: agreement and disagreement"), t("画像分数综合已启用体系；年运只用年度信号，月运只用月度信号，均不加入画像分数", "Profile scores average the enabled systems. Year outlooks use only year signals and month outlooks only month signals; neither enters the profile score.")),
    topicSection(results),
  );
  setTimeout(() => countUp(score, fusion.overall, 1800), 300);
  (async () => {
    await sleep(900);
    for (const [i, text] of fusion.oracle.entries()) await typewrite(oracle.children[i] as HTMLElement, text, 24);
  })();

  // Radar: every method as a faint polygon, the average in gold.
  const C = 170;
  const R = 120;
  const pt = (i: number, v: number) => {
    const a = ((-90 + i * 72) * Math.PI) / 180;
    return { x: C + Math.cos(a) * R * (v / 100), y: C + Math.sin(a) * R * (v / 100) };
  };
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, v)).map((p) => `${f(p.x)},${f(p.y)}`).join(" ");
  const grid = [20, 40, 60, 80, 100].map((v) => `<polygon points="${poly(DIMS.map(() => v))}" class="grid"/>`).join("");
  const axes = DIMS.map((d, i) => {
    const p = pt(i, 100);
    const l = pt(i, 122);
    return `<line x1="${C}" y1="${C}" x2="${f(p.x)}" y2="${f(p.y)}" class="grid"/><text x="${f(l.x)}" y="${f(l.y + 5)}" text-anchor="middle" class="rl">${dimName(d)} ${fusion.scores[d]}</text>`;
  }).join("");
  const each = results.map((r, i) => `<polygon points="${poly(DIMS.map((d) => r.scores[d]))}" class="each" style="--i:${i}"><title>${r.name}</title></polygon>`).join("");
  const radar = svg("-40 -10 420 360", `${grid}${axes}${each}<polygon points="${poly(DIMS.map((d) => fusion.scores[d]))}" class="avg"/>`, "radar");
  const spread = DIMS.map((d) => {
    const vals = results.map((r) => r.scores[d]);
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    return { d, sd: Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length) };
  }).sort((a, b) => b.sd - a.sd)[0]!;

  view.append(
    sectionTitle(t("五维星图 · 出生画像", "Five-area star map · birth profile"), t(`金色为${n}体系的画像平均值，淡色线为各体系的画像分数`, `Gold is the average of ${results.length} systems; faint lines are each system's own scores`)),
    reveal(h("div", { class: "glass v-row radar-row" }, radar, h("div", null, scoreBars(fusion.scores), h("p", { class: "v-caption" }, t(`体系之间分歧最大的是「${dimName(spread.d)}」（标准差 ${spread.sd.toFixed(1)} 分）——不同文明对它的看法并不一致。`, `The systems disagree most about ${dimName(spread.d)} (standard deviation ${spread.sd.toFixed(1)} points): different civilisations do not see it the same way.`))))),
  );

  // Five elements donut.
  const wx = Object.keys(fusion.elements) as WuXing[];
  let acc = 0;
  const circ = 2 * Math.PI * 80;
  const segs = wx
    .map((w, i) => {
      const len = (fusion.elements[w] / 100) * circ;
      const s = `<circle cx="120" cy="120" r="80" class="donut-seg" stroke="${WX_COLOR[w]}" stroke-dasharray="${f(len)} ${f(circ - len)}" stroke-dashoffset="${f(-acc)}" style="--i:${i}"/>`;
      acc += len;
      return s;
    })
    .join("");
  const donut = svg("0 0 240 240", `<g transform="rotate(-90 120 120)">${segs}</g><text x="120" y="118" text-anchor="middle" class="donut-big${isEn() ? " en" : ""}">${hasElements ? wxName(fusion.dominantElement) : "—"}</text><text x="120" y="145" text-anchor="middle" class="donut-small">${hasElements ? t("主导五行", "leading element") : t("暂无五行资料", "no element data")}</text>`, "donut");

  const votes = DIMS.filter((d) => fusion.topVotes[d] > 0).sort((a, b) => fusion.topVotes[b] - fusion.topVotes[a]);
  view.append(
    sectionTitle(t("五行与共识", "Elements and consensus"), t("东西方元素折算为五行后投票；以及各体系眼中你最强的天赋", "Eastern and Western elements, converted to the five elements and counted; and the gift each system rates highest")),
    reveal(
      h(
        "div",
        { class: "v-row" },
        h(
          "div",
          { class: "glass pad" },
          donut,
          h("ul", { class: "legend" }, ...wx.map((w) => h("li", { style: { "--c": WX_COLOR[w] } as never }, `${wxName(w)} ${fusion.elements[w]}%`))),
          h("p", { class: "v-caption" }, hasElements ? t(`补${fusion.weakElement}之道：${WU_XING[fusion.weakElement].lackText}`, `To add ${wxName(fusion.weakElement)}: ${WU_XING[fusion.weakElement].lackText}`) : t("所选体系没有提供五行资料。", "The selected systems give no five-element data.")),
        ),
        h(
          "div",
          { class: "glass pad" },
          h("h4", null, t(`${n}体系的投票`, `Votes of ${results.length} systems`)),
          h("ul", { class: "votes" }, ...votes.map((d) => h("li", null, h("b", null, dimName(d)), h("span", null, ...Array.from({ length: fusion.topVotes[d] }, (_, i) => h("i", { style: { "--i": i } as never }))), h("small", null, t(`${fusion.topVotes[d]} 票`, `${fusion.topVotes[d]} ${fusion.topVotes[d] === 1 ? "vote" : "votes"}`))))),
          h("p", { class: "v-caption" }, t("每种体系把自己评分最高的一项作为一票。", "Each system gives one vote to the area it rates highest.")),
        ),
      ),
    ),
  );

  view.append(
    sectionTitle(t("命运关键词", "Keywords"), t("每一种体系为你留下的一个词", "One word that each system leaves you")),
    reveal(h("div", { class: "kw-cloud" }, ...fusion.keywords.map((k, i) => h("span", { class: "kw", style: { "--i": i } as never }, k.word, h("small", null, k.from))))),
    sectionTitle(t("开运指引", "Luck guide"), t("出现次数最多的颜色、数字与方位，并以五行之缺补色", "The colours, numbers and directions named most often, with a colour for your weakest element")),
    reveal(luckyRow(fusion.lucky)),
    sectionTitle(t(`${year} 流年展望`, `${year} outlook`), t("各体系对今年的判断", "What each system says about this year")),
    reveal(h("div", { class: "outlook" }, ...fusion.outlook.map((o, i) => reveal(h("div", { class: "glass outlook-item" }, h("small", null, o.from), h("p", null, o.text)), i * 80)))),
    reveal(h("div", { class: "end-actions" }, h("a", { class: "btn btn-primary", href: "#/timeline" }, t("逐年逐月看未来运程 ☽", "Outlook by year and month ☽")), h("a", { class: "btn btn-ghost", href: "#/people" }, t("关系合盘 ❦", "Relationships ❦")))),
    sectionTitle(t(`${n}扇门`, `${results.length} doors`), t("点击回到任意一种体系", "Go back to any system")),
    reveal(
      h(
        "div",
        { class: "matrix" },
        ...results.map((r) =>
          h(
            "a",
            { href: `#/m/${r.id}`, class: "matrix-row" },
            h("span", { class: "mx-icon" }, r.icon),
            h("b", null, r.name),
            h("span", { class: "mx-head" }, r.headline),
            h("span", { class: "mx-score" }, String(Math.round(DIMS.reduce((s, d) => s + r.scores[d], 0) / DIMS.length))),
          ),
        ),
      ),
    ),
    h("div", { class: "end-actions" }, h("a", { class: "btn btn-ghost", href: "#/hub" }, t("← 回到星盘", "← Back to the chart")), h("a", { class: "btn btn-primary", href: "#/new" }, t("为另一个人推演 ✦", "Cast another chart ✦"))),
  );
}
