import { GRID, QIMEN_RULE, qimenChart, qimenName, qimenReading, qimenStem } from "../core/qimen";
import { isEn, t } from "../i18n";
import { dirName } from "../data/en/terms";
import { onlyPlain, onlyPro } from "./components";
import { h } from "./dom";

const beijingInput = (at: Date) => new Date(at.getTime() + 8 * 3600_000).toISOString().slice(0, 16);

/** One question chart stays in memory while the user changes tabs. */
export function qimenPanel(): HTMLElement {
  const question = h("textarea", { class: "field", rows: "2", maxlength: "300", required: true, "aria-label": t("奇门问事的问题", "Your question for Qimen"), placeholder: t("写下一件具体的事，例如：这次合作有哪些需要先确认的条件？", "Write one specific matter, e.g. what terms should I confirm before this partnership?") });
  const time = h("input", { class: "field", type: "datetime-local", required: true, min: "1900-01-01T00:00", max: "2100-12-31T23:59", "aria-label": t("起局时间（北京时间）", "Chart time (Beijing time)") });
  time.value = beijingInput(new Date());
  const status = h("p", { class: "v-caption", role: "status", "aria-live": "polite" });
  const result = h("div", { class: "qimen-result", "aria-live": "polite" });
  const form = h("form", { class: "llm-form", onsubmit: (event: Event) => {
    event.preventDefault();
    if (!question.value.trim()) { status.textContent = t("请先写下一个具体的问题。", "Write one specific question first."); return; }
    try {
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(time.value)) throw new Error(t("请选择有效的起局时间。", "Choose a valid time for the chart."));
      const chart = qimenChart(new Date(`${time.value}:00+08:00`));
      result.replaceChildren(
        h("h3", null, isEn() ? `${chart.yang ? "Yang" : "Yin"} dun, chart ${chart.ju} · ${qimenName(chart.term)}, ${qimenName(chart.yuan)}` : `${chart.yang ? "阳遁" : "阴遁"}${chart.ju}局 · ${chart.term}${chart.yuan}`),
        h("p", null, t("本次问题：", "Your question: "), question.value.trim()),
        h("p", { class: "v-caption" }, chart.time),
        onlyPro(h("p", null, isEn()
          ? `${chart.pillars.map(qimenStem).join(" · ")} | head ${qimenStem(chart.fuHead)} | ${qimenStem(chart.xun)} decade hides ${qimenStem(chart.hiddenStem)} | chief star ${qimenName(chart.chiefStar)} | chief door ${qimenName(chart.chiefDoor)}`
          : `${chart.pillars.join(" · ")}｜符头${chart.fuHead}｜${chart.xun}旬遁${chart.hiddenStem}｜值符${chart.chiefStar}｜值使${chart.chiefDoor}`)),
        h("p", { class: "v-caption" }, t("九宫图上南下北。标记“你”和“事”的宫位，对应本次解读。", "South is at the top of the nine palaces and north at the bottom. The palaces marked \"you\" and \"matter\" are the ones read below.")),
        h("div", { class: "qimen-grid", "aria-label": t("奇门九宫盘", "Qimen nine-palace chart") }, ...GRID.map((n) => {
          const p = chart.palaces[n - 1]!;
          const tags = [n === chart.selfPalace ? t("你", "you") : "", n === chart.matterPalace ? t("事", "matter") : ""].filter(Boolean).join(" · ");
          return h("section", { class: `qimen-palace${tags ? " qimen-marked" : ""}` },
            h("header", null, h("b", null, `${qimenName(p.name)} · ${dirName(p.direction)}`), tags ? h("span", { class: "qimen-tag" }, tags) : ""),
            h("strong", null, p.door ? qimenName(p.door) : t("中宫", "Centre")),
            h("p", null, qimenName(p.star), p.guest ? ` · ${qimenName("天禽")}` : ""),
            h("small", null, p.god ? qimenName(p.god) : t("寄坤随芮", "lodged in Kun with Tianrui")),
            onlyPro(h("p", { class: "qimen-stems" }, t(`天 ${p.heaven || "—"} / 地 ${p.earth}${p.guest ? ` / 寄 ${p.guest}` : ""}`, `heaven ${p.heaven ? qimenStem(p.heaven) : "—"} / earth ${qimenStem(p.earth)}${p.guest ? ` / lodged ${qimenStem(p.guest)}` : ""}`))),
          );
        })),
        ...qimenReading(chart).map((r) => h("section", { class: "qimen-reading" }, h("h4", null, r.title), onlyPlain(h("p", null, r.text)), onlyPro(h("p", null, r.rule), h("p", null, r.text)))),
      );
      status.textContent = t("起局完成。本次问题和盘面仅留在当前页面。", "Chart cast. Your question and the chart stay on this page only.");
    } catch (error) { status.textContent = error instanceof Error ? error.message : t("起局失败，请检查时间。", "Could not cast the chart. Check the time."); }
  } },
    h("label", null, t("你想问的具体问题", "Your question"), question),
    h("label", null, t("起局时间 · 北京时间（UTC+8）", "Chart time · Beijing time (UTC+8)"), time),
    h("div", { class: "draw-actions" }, h("button", { type: "button", class: "btn btn-ghost", onclick: () => { time.value = beijingInput(new Date()); } }, t("使用当前时间", "Use the current time")), h("button", { type: "submit", class: "btn btn-primary" }, t("起奇门局 ✦", "Cast the chart ✦"))),
    status,
  );
  return h("section", { class: "qimen glass" },
    h("h3", null, t("奇门遁甲 · 问事", "Qimen Dunjia · Ask")),
    h("p", { class: "v-caption" }, t("围绕一个具体问题，按所选时刻起局。", "Cast a chart for one specific question at the chosen moment.")),
    form, result,
    h("details", { class: "ask-details" }, h("summary", null, t("排局规则与解读范围", "Chart rules and the scope of the reading")),
      h("p", null, QIMEN_RULE()),
      h("p", null, t("统一使用北京时间，不校正真太阳时；23:00 换日，节气以交接时刻为界。按甲己符头定三元，值符随时干，值使按旬内时序阳顺阴逆行九宫，中五寄坤二。", "Beijing time is used throughout, with no true solar time correction. The day changes at 23:00 and solar terms change at their exact moment. The Jia and Ji heads set the three yuan; the chief star follows the hour stem; the chief door moves through the nine palaces by the hour within the decade, forward in yang dun and backward in yin dun; the centre 5 lodges in Kun 2.")),
      h("p", null, t("基础解读只取日干与时干落宫关系、八门取象；尚未综合旺衰、空亡、击刑、入墓和十干克应，不能据此直接断成败或应期。此盘不参与出生画像、年运或月运分数。传统占卜没有经科学验证的预测能力。", "The basic reading uses only how the day and hour stem palaces relate and the symbols of the eight doors. It does not yet weigh seasonal strength, void branches, punishments, tombs or the ten-stem responses, so it cannot judge success or timing. This chart does not enter the birth profile or the year and month scores. Traditional divination has no scientifically proven power to predict.")),
      h("p", null, t("规则参考：", "Rule source: "), h("a", { href: "https://zh.wikisource.org/wiki/遁甲演義_(四庫全書本)/卷1", target: "_blank", rel: "noopener noreferrer" }, t("《遁甲演义》卷一", "Dunjia Yanyi, volume 1 (Chinese)"))),
    ),
  );
}
