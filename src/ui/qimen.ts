import { GRID, QIMEN_RULE, qimenChart, qimenReading } from "../core/qimen";
import { onlyPlain, onlyPro } from "./components";
import { h } from "./dom";

const beijingInput = (at: Date) => new Date(at.getTime() + 8 * 3600_000).toISOString().slice(0, 16);

/** One question chart stays in memory while the user changes tabs. */
export function qimenPanel(): HTMLElement {
  const question = h("textarea", { class: "field", rows: "2", maxlength: "300", required: true, "aria-label": "奇门问事的问题", placeholder: "写下一件具体的事，例如：这次合作有哪些需要先确认的条件？" });
  const time = h("input", { class: "field", type: "datetime-local", required: true, min: "1900-01-01T00:00", max: "2100-12-31T23:59", "aria-label": "起局时间（北京时间）" });
  time.value = beijingInput(new Date());
  const status = h("p", { class: "v-caption", role: "status", "aria-live": "polite" });
  const result = h("div", { class: "qimen-result", "aria-live": "polite" });
  const form = h("form", { class: "llm-form", onsubmit: (event: Event) => {
    event.preventDefault();
    if (!question.value.trim()) { status.textContent = "请先写下一个具体的问题。"; return; }
    try {
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(time.value)) throw new Error("请选择有效的起局时间。");
      const chart = qimenChart(new Date(`${time.value}:00+08:00`));
      result.replaceChildren(
        h("h3", null, `${chart.yang ? "阳遁" : "阴遁"}${chart.ju}局 · ${chart.term}${chart.yuan}`),
        h("p", null, "本次问题：", question.value.trim()),
        h("p", { class: "v-caption" }, chart.time),
        onlyPro(h("p", null, `${chart.pillars.join(" · ")}｜符头${chart.fuHead}｜${chart.xun}旬遁${chart.hiddenStem}｜值符${chart.chiefStar}｜值使${chart.chiefDoor}`)),
        h("p", { class: "v-caption" }, "九宫图上南下北。标记“你”和“事”的宫位，对应本次解读。"),
        h("div", { class: "qimen-grid", "aria-label": "奇门九宫盘" }, ...GRID.map((n) => {
          const p = chart.palaces[n - 1]!;
          const tags = [n === chart.selfPalace ? "你" : "", n === chart.matterPalace ? "事" : ""].filter(Boolean).join(" · ");
          return h("section", { class: `qimen-palace${tags ? " qimen-marked" : ""}` },
            h("header", null, h("b", null, `${p.name} · ${p.direction}`), tags ? h("span", { class: "qimen-tag" }, tags) : ""),
            h("strong", null, p.door || "中宫"),
            h("p", null, p.star, p.guest ? " · 天禽" : ""),
            h("small", null, p.god || "寄坤随芮"),
            onlyPro(h("p", { class: "qimen-stems" }, `天 ${p.heaven || "—"} / 地 ${p.earth}${p.guest ? ` / 寄 ${p.guest}` : ""}`)),
          );
        })),
        ...qimenReading(chart).map((r) => h("section", { class: "qimen-reading" }, h("h4", null, r.title), onlyPlain(h("p", null, r.text)), onlyPro(h("p", null, r.rule), h("p", null, r.text)))),
      );
      status.textContent = "起局完成。本次问题和盘面仅留在当前页面。";
    } catch (error) { status.textContent = error instanceof Error ? error.message : "起局失败，请检查时间。"; }
  } },
    h("label", null, "你想问的具体问题", question),
    h("label", null, "起局时间 · 北京时间（UTC+8）", time),
    h("div", { class: "draw-actions" }, h("button", { type: "button", class: "btn btn-ghost", onclick: () => { time.value = beijingInput(new Date()); } }, "使用当前时间"), h("button", { type: "submit", class: "btn btn-primary" }, "起奇门局 ✦")),
    status,
  );
  return h("section", { class: "qimen glass" },
    h("h3", null, "奇门遁甲 · 问事"),
    h("p", { class: "v-caption" }, "围绕一个具体问题，按所选时刻起局。排盘与基础解读在浏览器内完成。"),
    form, result,
    h("details", { class: "ask-details" }, h("summary", null, "排局规则与解读范围"),
      h("p", null, QIMEN_RULE),
      h("p", null, "统一使用北京时间，不校正真太阳时；23:00 换日，节气以交接时刻为界。按甲己符头定三元，值符随时干，值使按旬内时序阳顺阴逆行九宫，中五寄坤二。"),
      h("p", null, "基础解读只取日干与时干落宫关系、八门取象；尚未综合旺衰、空亡、击刑、入墓和十干克应，不能据此直接断成败或应期。此盘不参与出生画像、年运或月运分数。传统占卜没有经科学验证的预测能力。"),
      h("p", null, "规则参考：", h("a", { href: "https://zh.wikisource.org/wiki/遁甲演義_(四庫全書本)/卷1", target: "_blank", rel: "noopener noreferrer" }, "《遁甲演义》卷一")),
    ),
  );
}
