import type { Profile } from "../data/types";
import type { MethodResult, Section } from "./types";

/** Standard reading sections for an archetype profile. */
export function profileSections(p: Profile, prefix = ""): Section[] {
  return [
    { title: `${prefix}性格本质`, body: `${p.summary}${p.personality}` },
    { title: "事业财运", body: p.career },
    { title: "感情人际", body: p.love },
    { title: "健康能量", body: p.health },
    { title: "星语箴言", body: p.advice },
  ];
}

export function profileLucky(p: Profile): MethodResult["lucky"] {
  return {
    colors: p.luckyColors ?? [],
    numbers: p.luckyNumbers ?? [],
    directions: p.luckyDirection ? [p.luckyDirection] : [],
  };
}
