import { WU_XING } from "../data/bazi";
import type { WuXing } from "../data/types";
import { DIM_NAMES, DIMS } from "../methods/fusion";
import { consensusText, strongestSignals, type TopicPeriod, type TopicStatement, type TopicView, topicViews } from "../methods/topics";
import type { MethodResult } from "../methods/types";
import { cnNum, luckyRow, onlyPlain, onlyPro, scoreBars, sectionTitle, statement } from "./components";
import { countUp, h, reveal, sleep, svg, typewrite, WX_COLOR } from "./dom";
import { birthLine } from "./hub";
import { getForecasts, getState } from "./state";

const f = (n: number) => n.toFixed(1);

const periodName = (p: TopicPeriod["period"]) => (p.month ? `${p.year} 年 ${p.month} 月` : `${p.year} 年`);

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
function monthsLine(v: TopicView): string {
  const withSignals = v.months.filter((m) => m.signals.length > 0);
  if (withSignals.length === 0) return "";
  const best = withSignals.reduce((a, b) => (b.score > a.score ? b : a));
  const worst = withSignals.reduce((a, b) => (b.score < a.score ? b : a));
  return [best.score > 50 ? `较顺：${periodName(best.period)}` : "", worst.score < 50 ? `需留意：${periodName(worst.period)}` : ""].filter(Boolean).join(" · ");
}

function topicCard(v: TopicView, total: number, hidden: boolean): HTMLElement {
  const picks = v.thisYear ? strongestSignals(v.thisYear, 2) : [];
  const line = monthsLine(v);
  return h(
    "section",
    { class: "glass topic-card", role: "tabpanel", hidden },
    h("div", { class: "tp-head" }, h("h3", null, v.name), h("span", { class: "tp-avg" }, h("b", null, String(Math.round(v.avg))), " 分")),
    h("p", { class: "tp-consensus" }, consensusText(v, total)),
    h(
      "ul",
      { class: "tp-stmts" },
      ...pickStatements(v, 3).map((s) =>
        h("li", { class: "tp-stmt" }, onlyPlain(h("p", null, s.text)), onlyPro(h("p", { class: s.pro ? "tp-pro" : "" }, s.pro || s.text)), h("small", { class: "stmt-src" }, `${s.name} · ${s.score} 分`)),
      ),
    ),
    v.thisYear && (picks.length > 0 || line)
      ? h(
          "div",
          { class: "tp-now" },
          h("small", { class: "tp-now-title" }, `现在 · ${v.thisYear.period.year} 年`),
          picks.length > 0 ? h("ul", { class: "stmts" }, ...picks.map((p, i) => statement(p.signal, p.name, i))) : "",
          line ? h("p", { class: "tp-months" }, line) : "",
        )
      : "",
    h("div", { class: "tp-links" }, h("a", { class: "tp-link", href: "#/timeline" }, "逐月看完整时间线 →"), h("a", { class: "tp-link", href: `#/ask/t/${v.dim}` }, "就这个话题提问 →")),
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
            tabs.forEach((t, j) => {
              t.classList.toggle("on", i === j);
              t.setAttribute("aria-selected", String(i === j));
              cards[j]!.hidden = i !== j;
            }),
        },
        `${v.name} ${Math.round(v.avg)}`,
      ),
    );
    slot.append(reveal(h("div", { class: "dim-filter", role: "tablist", "aria-label": "话题" }, ...tabs)), reveal(h("div", { class: "topic-cards" }, ...cards)));
  }, 0);
  return slot;
}

export function renderSummary(view: HTMLElement) {
  const { results, fusion } = getState();
  if (!results || !fusion) return;
  const year = new Date().getFullYear();
  const n = cnNum(results.length);

  const score = h("b", null, "0");
  const oracle = h("div", { class: "oracle" }, ...fusion.oracle.map(() => h("p")));
  view.append(
    h("nav", { class: "topbar" }, h("a", { href: "#/hub", class: "btn btn-ghost" }, "← 星盘总览"), h("span", { class: "topbar-count" }, "FUSION"), h("a", { href: "#/new", class: "btn btn-ghost" }, "↺ 重新输入")),
    h(
      "header",
      { class: "page-head" },
      h("p", { class: "eyebrow" }, `${results.length} SYSTEMS · ONE CHART`),
      h("h1", { class: "title-glow small" }, "命运全息图"),
      h("p", { class: "birth-line" }, birthLine()),
      h("div", { class: "ring big", style: { "--p": fusion.overall } as never }, score, h("small", null, "综合星运")),
      h("p", { class: "hub-guide" }, `最闪耀：${DIM_NAMES[fusion.strongest]} · 最需经营：${DIM_NAMES[fusion.weakest]} · 五行偏${fusion.dominantElement}、缺${fusion.weakElement}`),
    ),
    reveal(h("section", { class: "glass oracle-card" }, h("span", { class: "oracle-mark" }, "❝"), oracle)),
    sectionTitle("按话题看：共识与分歧", "同一个话题，各体系各说了什么；以及今年和未来 12 个月的信号"),
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
    return `<line x1="${C}" y1="${C}" x2="${f(p.x)}" y2="${f(p.y)}" class="grid"/><text x="${f(l.x)}" y="${f(l.y + 5)}" text-anchor="middle" class="rl">${DIM_NAMES[d]} ${fusion.scores[d]}</text>`;
  }).join("");
  const each = results.map((r, i) => `<polygon points="${poly(DIMS.map((d) => r.scores[d]))}" class="each" style="--i:${i}"><title>${r.name}</title></polygon>`).join("");
  const radar = svg("-40 -10 420 360", `${grid}${axes}${each}<polygon points="${poly(DIMS.map((d) => fusion.scores[d]))}" class="avg"/>`, "radar");
  const spread = DIMS.map((d) => {
    const vals = results.map((r) => r.scores[d]);
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    return { d, sd: Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length) };
  }).sort((a, b) => b.sd - a.sd)[0]!;

  view.append(
    sectionTitle("五维星图", `金色为${n}体系的平均值，淡色线为每一种体系各自的判断`),
    reveal(h("div", { class: "glass v-row radar-row" }, radar, h("div", null, scoreBars(fusion.scores), h("p", { class: "v-caption" }, `体系之间分歧最大的是「${DIM_NAMES[spread.d]}」（标准差 ${spread.sd.toFixed(1)} 分）——不同文明对它的看法并不一致。`)))),
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
  const donut = svg("0 0 240 240", `<g transform="rotate(-90 120 120)">${segs}</g><text x="120" y="118" text-anchor="middle" class="donut-big">${fusion.dominantElement}</text><text x="120" y="145" text-anchor="middle" class="donut-small">主导五行</text>`, "donut");
  const votes = DIMS.filter((d) => fusion.topVotes[d] > 0).sort((a, b) => fusion.topVotes[b] - fusion.topVotes[a]);
  view.append(
    sectionTitle("五行与共识", "东西方元素折算为五行后投票；以及各体系眼中你最强的天赋"),
    reveal(
      h(
        "div",
        { class: "v-row" },
        h(
          "div",
          { class: "glass pad" },
          donut,
          h("ul", { class: "legend" }, ...wx.map((w) => h("li", { style: { "--c": WX_COLOR[w] } as never }, `${w} ${fusion.elements[w]}%`))),
          h("p", { class: "v-caption" }, `补${fusion.weakElement}之道：${WU_XING[fusion.weakElement].lackText}`),
        ),
        h(
          "div",
          { class: "glass pad" },
          h("h4", null, `${n}体系的投票`),
          h("ul", { class: "votes" }, ...votes.map((d) => h("li", null, h("b", null, DIM_NAMES[d]), h("span", null, ...Array.from({ length: fusion.topVotes[d] }, (_, i) => h("i", { style: { "--i": i } as never }))), h("small", null, `${fusion.topVotes[d]} 票`)))),
          h("p", { class: "v-caption" }, "每种体系把自己评分最高的一项作为一票。"),
        ),
      ),
    ),
  );

  view.append(
    sectionTitle("命运关键词", "每一种体系为你留下的一个词"),
    reveal(h("div", { class: "kw-cloud" }, ...fusion.keywords.map((k, i) => h("span", { class: "kw", style: { "--i": i } as never }, k.word, h("small", null, k.from))))),
    sectionTitle("开运指引", "出现次数最多的颜色、数字与方位，并以五行之缺补色"),
    reveal(luckyRow(fusion.lucky)),
    sectionTitle(`${year} 流年展望`, "各体系对今年的判断"),
    reveal(h("div", { class: "outlook" }, ...fusion.outlook.map((o, i) => reveal(h("div", { class: "glass outlook-item" }, h("small", null, o.from), h("p", null, o.text)), i * 80)))),
    reveal(h("div", { class: "end-actions" }, h("a", { class: "btn btn-primary", href: "#/timeline" }, "逐年逐月看未来运程 ☽"), h("a", { class: "btn btn-ghost", href: "#/people" }, "关系合盘 ❦"))),
    sectionTitle(`${n}扇门`, "点击回到任意一种体系"),
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
    reveal(
      h(
        "aside",
        { class: "caveats disclaimer" },
        h("b", null, "ⓘ 关于这份报告"),
        h("p", null, "命理与占星是流传千年的文化传统，不是经过验证的科学。没有可靠研究表明出生时刻能预测性格或命运；许多描述之所以“很准”，部分来自巴纳姆效应——笼统的描述人人都觉得像自己。"),
        h("p", null, `${n}种体系彼此独立，结论常常互相矛盾。“融合分数”只是把各体系的结果按同等权重取平均，是一种娱乐化的启发式算法，不代表任何真实的概率。`),
        h("p", null, "不同流派在细节上也有分歧：年界取立春还是春节、子时如何换日、玛雅历用 GMT 还是 Dreamspell 算法等。本站在每个页面的“推算说明”中注明了所用规则。"),
        h("p", null, "请把它当作一面有趣的镜子，而不是人生决策的依据。全部计算都在你的浏览器内完成；只有你点击 AI 解读（塔罗解读、问事）时，相关内容才会直接发送给 DeepSeek，其中不含出生日期、地点和姓名。"),
      ),
    ),
    h("div", { class: "end-actions" }, h("a", { class: "btn btn-ghost", href: "#/hub" }, "← 回到星盘"), h("a", { class: "btn btn-primary", href: "#/new" }, "为另一个人推演 ✦")),
  );
}
