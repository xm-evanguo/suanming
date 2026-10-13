import { h } from "./dom";
import { getMode, type Mode, setMode } from "./state";
import { t } from "../i18n";

/** Fixed pill that switches between the professional and the plain reading. */
export function mountModeToggle(): (visible: boolean) => void {
  const btn = (m: Mode, label: string) =>
    h("button", { type: "button", "data-m": m, onclick: () => { setMode(m); sync(); } }, label);
  const el = h("div", { class: "mode-toggle", role: "group", "aria-label": t("解读方式", "Reading style"), hidden: true }, h("i", { class: "mode-thumb", "aria-hidden": "true" }), btn("pro", t("专业版", "Expert")), btn("plain", t("通俗版", "Plain")));
  const sync = () => {
    const m = getMode();
    document.body.dataset.mode = m;
    for (const b of el.querySelectorAll("button")) b.setAttribute("aria-pressed", String(b.dataset.m === m));
  };
  sync();
  document.body.append(el);
  // Phones show the pill at the bottom centre. CSS hides it (.tucked) while the reader scrolls down.
  let lastY = scrollY;
  addEventListener(
    "scroll",
    () => {
      const y = scrollY;
      if (Math.abs(y - lastY) < 8) return;
      el.classList.toggle("tucked", y > lastY && y > 240);
      lastY = y;
    },
    { passive: true },
  );
  return (visible) => (el.hidden = !visible);
}
