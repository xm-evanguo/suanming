import type { BirthInput } from "./core/chart";
import { renderAsk } from "./ui/ask";
import { renderHub } from "./ui/hub";
import { renderMethod } from "./ui/method-page";
import { mountModeToggle } from "./ui/mode-toggle";
import { renderPeople, renderPerson } from "./ui/people";
import { renderRitual } from "./ui/ritual";
import { startStarfield } from "./ui/starfield";
import { clearState, getState, isMethodEnabled, loadSaved } from "./ui/state";
import { renderSummary } from "./ui/summary";
import { renderTimeline } from "./ui/timeline";
import { renderWizard } from "./ui/wizard";
import { renderProfile } from "./ui/profile";
import { h } from "./ui/dom";
import type { MethodId } from "./methods/types";
import { METHOD_ORDER } from "./methods";

const app = document.getElementById("app")!;
const stars = startStarfield(document.getElementById("cosmos") as HTMLCanvasElement);

loadSaved();
const showModeToggle = mountModeToggle();

let current: (() => void) | undefined;

function route() {
  const hash = location.hash.replace(/^#/, "") || "/";
  const parts = hash.split("/").filter(Boolean);
  const s = getState();
  const needResults = parts[0] && !["new", "profile"].includes(parts[0]);
  if (needResults && !s.results) {
    location.replace("#/");
    return;
  }
  current?.();
  current = undefined;
  stars.setWarp(false);

  const view = document.createElement("div");
  view.className = "view";
  app.replaceChildren(view);
  // The ritual has its own fixed skip button in this corner.
  if (parts[0] !== "ritual") view.append(h("nav", { class: "profile-nav", "aria-label": "个人设置" }, h("a", { href: "#/profile", class: "btn btn-ghost" }, "个人资料 · Profile")));
  scrollTo({ top: 0 });
  showModeToggle(["hub", "m", "summary", "timeline", "people", "ask"].includes(parts[0] ?? ""));

  if (s.results?.length === 0 && ["hub", "summary", "timeline", "ritual"].includes(parts[0] ?? "")) {
    view.append(h("section", { class: "glass profile-card" }, h("h1", null, "尚未启用任何体系"), h("p", null, "请到 Profile 勾选想使用的体系。奇门、抽塔罗和掷圣杯仍可使用。"), h("div", { class: "draw-actions" }, h("a", { href: "#/profile", class: "btn btn-primary" }, "选择体系"), h("a", { href: "#/ask/qimen", class: "btn btn-ghost" }, "前往问事"))));
    requestAnimationFrame(() => view.classList.add("shown"));
    return;
  }

  switch (parts[0]) {
    case "profile":
      renderProfile(view, parts[1]);
      break;
    case "ritual":
      current = renderRitual(view, stars.setWarp);
      break;
    case "hub":
      renderHub(view);
      break;
    case "m": {
      const id = parts[1] as MethodId;
      if (!METHOD_ORDER.includes(id) || !isMethodEnabled(id)) return location.replace("#/hub");
      renderMethod(view, id);
      break;
    }
    case "summary":
      renderSummary(view);
      break;
    case "ask":
      current = renderAsk(view, parts.slice(1));
      break;
    case "timeline":
      renderTimeline(view);
      break;
    case "people":
      if (parts[1]) renderPerson(view, parts[1]);
      else renderPeople(view);
      break;
    case "new":
      clearState();
      renderWizard(view, s.input as BirthInput | undefined);
      break;
    default:
      renderWizard(view, s.input);
  }
  requestAnimationFrame(() => view.classList.add("shown"));
}

addEventListener("hashchange", route);
route();
