import type { BirthInput } from "./core/chart";
import { renderHub } from "./ui/hub";
import { renderMethod } from "./ui/method-page";
import { mountModeToggle } from "./ui/mode-toggle";
import { renderPeople, renderPerson } from "./ui/people";
import { renderRitual } from "./ui/ritual";
import { startStarfield } from "./ui/starfield";
import { clearState, getState, loadSaved } from "./ui/state";
import { renderSummary } from "./ui/summary";
import { renderTimeline } from "./ui/timeline";
import { renderWizard } from "./ui/wizard";
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
  const needResults = parts[0] && parts[0] !== "new";
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
  scrollTo({ top: 0 });
  showModeToggle(["hub", "m", "summary", "timeline", "people"].includes(parts[0] ?? ""));

  switch (parts[0]) {
    case "ritual":
      current = renderRitual(view, stars.setWarp);
      break;
    case "hub":
      renderHub(view);
      break;
    case "m": {
      const id = parts[1] as MethodId;
      if (!METHOD_ORDER.includes(id)) return location.replace("#/hub");
      renderMethod(view, id);
      break;
    }
    case "summary":
      renderSummary(view);
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
