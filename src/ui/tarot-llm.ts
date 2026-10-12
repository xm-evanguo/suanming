import { requestSignal } from "../llm/client";
import { CONTEXT_LIMIT, interpretTarot, QUESTION_LIMIT, type TarotQuestion } from "../llm/tarot";
import { h } from "./dom";
import { currentKey, deepseekPanel, profileApiLink } from "./llm-key";

export function tarotLlm(input: TarotQuestion): { element: HTMLElement; cancel: () => void } {
  let controller: AbortController | undefined;
  const status = h("p", { class: "v-caption", role: "status", "aria-live": "polite" });
  const output = h("div", { class: "llm-output" });
  const question = h("textarea", { class: "field", rows: "3", maxlength: String(QUESTION_LIMIT), "aria-label": "具体问题", placeholder: "例如：我已收到新公司的录用通知，但试用期薪资较低。我该先核实哪些条件再决定？" });
  question.value = input.question;
  const context = h("textarea", { class: "field", rows: "3", maxlength: String(CONTEXT_LIMIT), "aria-label": "补充背景（可选）", placeholder: "补充背景（可选）：当前处境、正在比较的选择、限制条件，以及你最担心的事。请避免填写身份等敏感信息。" });
  const cancel = h("button", { type: "button", class: "btn btn-ghost", hidden: true, onclick: () => controller?.abort() }, "取消解读");
  const submit = h("button", { type: "submit", class: "btn btn-primary" }, "结合问题解读 ✦");
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
    status.textContent = "正在结合问题与三张牌解读……";
    try {
      const answer = await interpretTarot(currentKey(), { ...input, question: question.value, context: context.value }, signal);
      if (signal.aborted || !form.isConnected) return;
      output.replaceChildren(h("h4", null, "针对本次问题的 AI 解读"), h("p", null, answer));
      status.textContent = "解读完成。";
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : "解读失败，请重试。";
    } finally {
      controller = undefined;
      submit.disabled = false;
      question.disabled = context.disabled = false;
      cancel.hidden = true;
    }
  } },
    h("p", { class: "v-caption" }, "DeepSeek · deepseek-flash，按你的 API 用量计费。"),
    profileApiLink(),
    h("label", null, "你想问的具体问题", question),
    h("label", null, "补充背景（可选）", context),
    h("p", { class: "v-caption" }, "解读时会把问题、背景、方向和三张牌发送给 AI。"),
    h("div", { class: "draw-actions" }, submit, cancel), status, output,
  );
  const root = deepseekPanel("DeepSeek · 用 AI 解读你的具体问题", h("section", { class: "llm-reading" }, form));
  return { element: root, cancel: () => controller?.abort() };
}
