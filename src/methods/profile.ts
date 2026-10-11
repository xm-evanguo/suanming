import { PLAIN_BODY, PLAIN_BODY_DEFAULT } from "../data/plain-common";
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

/**
 * The four shared blocks of a plain reading for an archetype profile. `lead` introduces the archetype in everyday words;
 * `adviceExtra` is appended to the advice block (e.g. a yearly note).
 */
export function plainProfileSections(p: Profile, lead: string, adviceExtra = ""): Section[] {
  const body = p.element ? PLAIN_BODY[p.element] : PLAIN_BODY_DEFAULT;
  return [
    { title: "你是怎样的人", body: `${lead}${p.personality}` },
    { title: "适合做什么", body: p.career },
    { title: "感情里的你", body: p.love },
    { title: "给你的建议", body: `${p.advice}${body}${adviceExtra}` },
  ];
}
