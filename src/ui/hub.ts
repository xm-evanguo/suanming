import { fmtTime, inputDate, inputTime } from "../core/chart";
import { DIMS } from "../methods/fusion";
import { type MethodResult, type Origin, originName } from "../methods/types";
import { isEn, pick, t } from "../i18n";
import { cnNum } from "./components";
import { cityName } from "../core/cities";
import { countUp, h, reveal, tilt, typewrite } from "./dom";
import { getState, listPeople } from "./state";

const ORIGIN_TITLE_EN: Record<Origin, string> = {
  中国: "The East · Chinese Destiny Arts",
  日本: "Japan · Japanese Star Lore",
  西方: "The West · Stars and Numbers",
  古希腊: "Ancient Greece · Hellenistic Astrology",
  古罗马: "Ancient Rome · Chaldean Planets",
  波斯: "Persia · Firdaria Periods",
  印度: "India · Vedic",
  玛雅: "Mesoamerica · Maya",
};

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
  const date = inputDate(input);
  const time = input.timeKnown ? inputTime(input) : t("时间不详", "time unknown");
  const solar = input.trueSolar && input.timeKnown ? ` · ${t("真太阳时", "true solar time")} ${fmtTime(chart.trueSolarTime).slice(11)}` : "";
  return `${date} ${time} · ${cityName(input.city)}${solar} · ${input.gender === "male" ? t("乾造", "male") : t("坤造", "female")}`;
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
      h("h1", { class: "title-glow small" }, t("你的命盘已成", "Your chart is ready")),
      h("p", { class: "birth-line" }, birthLine()),
      guide,
      h("a", { class: "btn btn-ghost", href: "#/new" }, t("↺ 重新输入", "↺ Start over")),
    ),
  );
  typewrite(guide, t(`${cnNum(results.length)}扇门已经为你打开。每一扇门后，都是一个古老文明看见的你。先逐一推开，或直接前往融合总结。`, `${results.length} ${results.length === 1 ? "door is" : "doors are"} open for you. Behind each one is you as an old civilisation sees you. Open them one by one, or go straight to the summary.`), 32);

  const score = h("b", null, "0");
  const ring = h("div", { class: "ring", style: { "--p": fusion.overall } as never }, score, h("small", null, t("出生画像", "Birth profile")));
  const card = h(
    "a",
    { class: "summary-card glass", href: "#/summary" },
    ring,
    h(
      "div",
      null,
      h("p", { class: "eyebrow" }, t("FUSION · 融合总结", "FUSION · SUMMARY")),
      h("h2", null, t(`${cnNum(results.length)}体系的命运全息图`, `Your chart across ${results.length} ${results.length === 1 ? "system" : "systems"}`)),
      h("p", null, fusion.oracle.at(-1) ?? ""),
      h("span", { class: "btn btn-primary" }, t("查看融合总结 ✦", "See the summary ✦")),
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
        feature("#/ask", "✦", t("QUAESTIO · 问事", "QUAESTIO · ASK"), t("问事", "Ask a question"), t("带着一个具体问题来：起奇门局、抽塔罗、心中默念掷圣杯，或让 AI 结合各体系回答。", "Bring one real question: cast a Qimen chart, draw tarot, throw the moon blocks, or let AI answer with all the systems."), t("去提问 →", "Ask →")),
        feature("#/timeline", "☽", t("TEMPUS · 流年流月", "TEMPUS · YEARS & MONTHS"), t("未来运程", "Your outlook"), t("今年起三年、未来十二个月。按事业、财富、感情等领域，看各体系说了什么。", "Three years from this one and the next twelve months. See what each system says about career, wealth, love and more."), t("查看时间轴 →", "Open the timeline →")),
        feature("#/people", "❦", t("CONIUNCTIO · 关系合盘", "CONIUNCTIO · RELATIONSHIPS"), t("你与身边的人", "You and the people around you"), people ? t(`已添加 ${people} 人。看缘分、相处，以及谁能在事业上帮你。`, `${people} ${people === 1 ? "person" : "people"} added. See your bond, how you get along, and who can help your career.`) : t("加入伴侣、父母或朋友的生日，看缘分、相处，以及谁能在事业上帮你。", "Add the birthday of a partner, parent or friend to see your bond, how you get along, and who can help your career."), people ? t("查看合盘 →", "Compare charts →") : t("添加一个人 →", "Add someone →")),
      ),
    ),
  );

  const origins = [...new Set(results.map((r) => r.origin))];
  let n = 0;
  for (const o of origins) {
    view.append(reveal(h("h3", { class: "origin-title" }, pick(ORIGIN_TITLE, ORIGIN_TITLE_EN)[o])));
    view.append(h("div", { class: "method-grid" }, ...results.filter((r) => r.origin === o).map((r) => methodCard(r, n++))));
  }
}

/** The first sentence of a text in either language. */
export const firstSentence = (text: string) => (isEn() ? text.split(/(?<=[.!?])\s/)[0] : text.split(/(?<=。)/)[0]) ?? text;

function methodCard(r: MethodResult, i: number): HTMLElement {
  const card = h(
    "a",
    { class: `method-card glass origin-${r.origin}`, href: `#/m/${r.id}` },
    h("div", { class: "mc-icon" }, r.icon),
    h("div", { class: "mc-top" }, h("span", { class: "mc-name" }, r.name), h("span", { class: "origin-chip" }, originName(r.origin))),
    h("p", { class: "mc-headline" }, r.headline),
    h("p", { class: "mc-tagline only-pro" }, r.tagline),
    r.plain && h("p", { class: "mc-tagline only-plain" }, firstSentence(r.plain.summary)),
    h("div", { class: "mini-bars" }, ...DIMS.map((d) => h("i", { style: { "--v": `${r.scores[d]}%` } as never }))),
    h("span", { class: "mc-go" }, t("推开这扇门 →", "Open this door →")),
  );
  tilt(card);
  return reveal(card, (i % 3) * 90);
}
