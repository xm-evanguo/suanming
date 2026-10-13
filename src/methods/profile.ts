import { PLAIN_BODY, plainBodyDefault } from "../data/plain-common";
import type { Profile } from "../data/types";
import { sep, t } from "../i18n";
import { plainTitles, type MethodResult, type Section } from "./types";

/** Standard reading sections for an archetype profile. */
export function profileSections(p: Profile, prefix = ""): Section[] {
  return [
    { title: `${prefix}${t("性格本质", "Character")}`, body: [p.summary, p.personality].join(sep()) },
    { title: t("事业财运", "Career and money"), body: p.career },
    { title: t("感情人际", "Love and people"), body: p.love },
    { title: t("健康能量", "Health and energy"), body: p.health },
    { title: t("星语箴言", "Words of advice"), body: p.advice },
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
  const body = p.element ? PLAIN_BODY[p.element] : plainBodyDefault();
  const titles = plainTitles();
  return [
    { title: titles.who, body: [lead, p.personality].filter(Boolean).join(sep()) },
    { title: titles.work, body: p.career },
    { title: titles.love, body: p.love },
    { title: titles.advice, body: [p.advice, body, adviceExtra].filter(Boolean).join(sep()) },
  ];
}
