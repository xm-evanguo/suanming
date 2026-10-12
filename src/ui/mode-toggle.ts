import { h } from "./dom";
import { getMode, type Mode, setMode } from "./state";

/** Fixed pill that switches between the professional and the plain reading. */
export function mountModeToggle(): (visible: boolean) => void {
  const btn = (m: Mode, label: string) =>
    h("button", { type: "button", "data-m": m, onclick: () => { setMode(m); sync(); } }, label);
  const el = h("div", { class: "mode-toggle", role: "group", "aria-label": "解读方式", hidden: true }, h("i", { class: "mode-thumb", "aria-hidden": "true" }), btn("pro", "专业版"), btn("plain", "通俗版"));
  const sync = () => {
    const m = getMode();
    document.body.dataset.mode = m;
    for (const b of el.querySelectorAll("button")) b.setAttribute("aria-pressed", String(b.dataset.m === m));
  };
  sync();
  document.body.append(el);
  return (visible) => (el.hidden = !visible);
}
