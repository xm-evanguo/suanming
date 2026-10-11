import { CONTEXT_LIMIT, interpretTarot, KEY_STORAGE, QUESTION_LIMIT, type TarotQuestion } from "../llm/tarot";
import { h } from "./dom";

export function tarotLlm(input: TarotQuestion): { element: HTMLElement; cancel: () => void } {
  let controller: AbortController | undefined;
  const status = h("p", { class: "v-caption", role: "status", "aria-live": "polite" });
  const output = h("div", { class: "llm-output" });
  const key = h("input", { type: "password", class: "field", autocomplete: "off", spellcheck: "false", "aria-label": "DeepSeek API Key", placeholder: "输入你的 DeepSeek API Key" });
  try { key.value = localStorage.getItem(KEY_STORAGE) ?? ""; }
  catch { status.textContent = "浏览器无法读取本地存储。你仍可以输入 Key 使用。"; }
  const question = h("textarea", { class: "field", rows: "3", maxlength: String(QUESTION_LIMIT), "aria-label": "具体问题", placeholder: "例如：我已收到新公司的录用通知，但试用期薪资较低。我该先核实哪些条件再决定？" });
  question.value = input.question;
  const context = h("textarea", { class: "field", rows: "3", maxlength: String(CONTEXT_LIMIT), "aria-label": "补充背景（可选）", placeholder: "补充背景（可选）：当前处境、正在比较的选择、限制条件，以及你最担心的事。请避免填写身份等敏感信息。" });
  const save = h("button", { type: "button", class: "btn btn-ghost", onclick: () => {
    if (!key.value.trim()) { status.textContent = "请先输入 API Key。"; return; }
    try { localStorage.setItem(KEY_STORAGE, key.value.trim()); status.textContent = "Key 已保存在当前浏览器，可随时清除。"; }
    catch { status.textContent = "浏览器无法保存 Key，本次仍可使用，刷新后需要重填。"; }
  } }, "保存 Key 到此浏览器");
  const clear = h("button", { type: "button", class: "btn btn-ghost", onclick: () => {
    controller?.abort();
    key.value = "";
    try { localStorage.removeItem(KEY_STORAGE); status.textContent = "已清除当前浏览器保存的 Key。"; }
    catch { status.textContent = "无法清除本地存储，请在浏览器的网站设置中清除本站数据。"; }
  } }, "清除 Key");
  const cancel = h("button", { type: "button", class: "btn btn-ghost", hidden: true, onclick: () => controller?.abort() }, "取消解读");
  const submit = h("button", { type: "submit", class: "btn btn-primary" }, "结合问题解读 ✦");
  const form = h("form", { class: "llm-form", onsubmit: async (event: Event) => {
    event.preventDefault();
    if (controller) return;
    controller = new AbortController();
    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(90_000)]);
    submit.disabled = true;
    question.disabled = context.disabled = key.disabled = save.disabled = true;
    cancel.hidden = false;
    output.replaceChildren();
    status.textContent = "正在结合问题与三张牌解读……";
    const leave = () => controller?.abort();
    addEventListener("hashchange", leave, { once: true });
    try {
      const answer = await interpretTarot(key.value, { ...input, question: question.value, context: context.value }, signal);
      if (signal.aborted || !form.isConnected) return;
      output.replaceChildren(h("h4", null, "针对本次问题的 AI 解读"), h("p", null, answer));
      status.textContent = "解读完成。问题与回答不会保存在本站。";
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : "解读失败，请重试。";
    } finally {
      removeEventListener("hashchange", leave);
      controller = undefined;
      submit.disabled = false;
      question.disabled = context.disabled = key.disabled = save.disabled = false;
      cancel.hidden = true;
    }
  } },
    h("p", { class: "v-caption" }, "服务商：DeepSeek · 模型：deepseek-flash。点击解读才会发送请求，由你的 DeepSeek 账户按 API 用量付费。"),
    h("label", null, "DeepSeek API Key", key),
    h("div", { class: "draw-actions" }, save, clear),
    h("p", { class: "v-caption" }, "保存后，Key 留在此浏览器的 localStorage，未加密；请勿在共用设备保存。Key 只会直接发送给 DeepSeek，不经过本站服务器。"),
    h("label", null, "你想问的具体问题", question),
    h("label", null, "补充背景（可选）", context),
    h("p", { class: "v-caption" }, "解读时，会把问题、背景、方向和三张牌的牌位及正逆位发送给 DeepSeek；不会发送你的生辰。增加具体背景能减少空泛的建议，但不代表预测更准确。"),
    h("div", { class: "draw-actions" }, submit, cancel), status, output,
  );
  const root = h("section", { class: "llm-reading glass" }, h("h3", null, "用 AI 解读你的具体问题"), form);
  return { element: root, cancel: () => controller?.abort() };
}
