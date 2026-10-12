import { KEY_STORAGE } from "../llm/client";
import { h } from "./dom";

export interface KeyField {
  /** The label, the input, the save and clear buttons, and the storage note. */
  element: HTMLElement;
  value: () => string;
  setDisabled: (disabled: boolean) => void;
}

/**
 * The DeepSeek key input shared by the AI features. The key lives in localStorage under one name,
 * so a key saved on one page works on the others. `say` shows messages in the caller's status line.
 */
export function keyField(say: (message: string) => void, onClear?: () => void): KeyField {
  const input = h("input", { type: "password", class: "field", autocomplete: "off", spellcheck: "false", "aria-label": "DeepSeek API Key", placeholder: "输入你的 DeepSeek API Key" });
  try { input.value = localStorage.getItem(KEY_STORAGE) ?? ""; }
  catch { say("浏览器无法读取本地存储。你仍可以输入 Key 使用。"); }
  const save = h("button", { type: "button", class: "btn btn-ghost", onclick: () => {
    if (!input.value.trim()) { say("请先输入 API Key。"); return; }
    try { localStorage.setItem(KEY_STORAGE, input.value.trim()); say("Key 已保存在当前浏览器，可随时清除。"); }
    catch { say("浏览器无法保存 Key，本次仍可使用，刷新后需要重填。"); }
  } }, "保存 Key 到此浏览器");
  const clear = h("button", { type: "button", class: "btn btn-ghost", onclick: () => {
    onClear?.();
    input.value = "";
    try { localStorage.removeItem(KEY_STORAGE); say("已清除当前浏览器保存的 Key。"); }
    catch { say("无法清除本地存储，请在浏览器的网站设置中清除本站数据。"); }
  } }, "清除 Key");
  const element = h("div", { class: "llm-key" },
    h("label", null, "DeepSeek API Key", input),
    h("div", { class: "draw-actions" }, save, clear),
    h("p", { class: "v-caption" }, "保存后，Key 留在此浏览器的 localStorage，未加密；请勿在共用设备保存。Key 只会直接发送给 DeepSeek，不经过本站服务器。"),
  );
  return {
    element,
    value: () => input.value,
    setDisabled: (disabled) => { input.disabled = save.disabled = clear.disabled = disabled; },
  };
}
