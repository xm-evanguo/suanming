import { requestSignal } from "../llm/client";
import { CONTEXT_LIMIT, interpretTarot, QUESTION_LIMIT, type TarotQuestion } from "../llm/tarot";
import { h } from "./dom";
import { currentKey, deepseekPanel, profileApiLink } from "./llm-key";
import { t } from "../i18n";

export function tarotLlm(input: TarotQuestion): { element: HTMLElement; cancel: () => void } {
  let controller: AbortController | undefined;
  const status = h("p", { class: "v-caption", role: "status", "aria-live": "polite" });
  const output = h("div", { class: "llm-output" });
  const question = h("textarea", { class: "field", rows: "3", maxlength: String(QUESTION_LIMIT), "aria-label": t("具体问题", "Your question"), placeholder: t("例如：我已收到新公司的录用通知，但试用期薪资较低。我该先核实哪些条件再决定？", "E.g. I have an offer from a new company, but the pay during probation is low. What should I check before deciding?") });
  question.value = input.question;
  const context = h("textarea", { class: "field", rows: "3", maxlength: String(CONTEXT_LIMIT), "aria-label": t("补充背景（可选）", "More background (optional)"), placeholder: t("补充背景（可选）：当前处境、正在比较的选择、限制条件，以及你最担心的事。请避免填写身份等敏感信息。", "More background (optional): your situation, the options you are weighing, limits, and what worries you most. Please leave out identifying details.") });
  const cancel = h("button", { type: "button", class: "btn btn-ghost", hidden: true, onclick: () => controller?.abort() }, t("取消解读", "Cancel"));
  const submit = h("button", { type: "submit", class: "btn btn-primary" }, t("结合问题解读 ✦", "Read for my question ✦"));
  const form = h("form", { class: "llm-form", onsubmit: async (event: Event) => {
    event.preventDefault();
    if (controller) return;
    if (!currentKey()) { status.replaceChildren(profileApiLink()); return; }
    controller = new AbortController();
    const signal = requestSignal(controller);
    submit.disabled = true;
    question.disabled = context.disabled = true;
    cancel.hidden = false;
    output.replaceChildren();
    status.textContent = t("正在结合问题与三张牌解读……", "Reading your question with the three cards…");
    try {
      const answer = await interpretTarot(currentKey(), { ...input, question: question.value, context: context.value }, signal);
      if (signal.aborted || !form.isConnected) return;
      output.replaceChildren(h("h4", null, t("针对本次问题的 AI 解读", "AI reading for this question")), h("p", null, answer));
      status.textContent = t("解读完成。", "Done.");
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : t("解读失败，请重试。", "The reading failed. Try again.");
    } finally {
      controller = undefined;
      submit.disabled = false;
      question.disabled = context.disabled = false;
      cancel.hidden = true;
    }
  } },
    h("p", { class: "v-caption" }, t("DeepSeek · deepseek-flash，按你的 API 用量计费。", "DeepSeek · deepseek-flash, billed to your API account by usage.")),
    profileApiLink(),
    h("label", null, t("你想问的具体问题", "Your question"), question),
    h("label", null, t("补充背景（可选）", "More background (optional)"), context),
    h("p", { class: "v-caption" }, t("解读时会把问题、背景、方向和三张牌发送给 AI。", "The reading sends your question, background, topic and the three cards to the AI.")),
    h("div", { class: "draw-actions" }, submit, cancel), status, output,
  );
  const root = deepseekPanel(t("DeepSeek · 用 AI 解读你的具体问题", "DeepSeek · Read your question with AI"), h("section", { class: "llm-reading" }, form));
  return { element: root, cancel: () => controller?.abort() };
}
