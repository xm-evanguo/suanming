import type { AspectKey, PlanetKey } from "../planets";
import type { Brief } from "../types";

/** English texts for the planets and aspects. Keys match `../planets.ts`; glyphs, angles and harmony stay in the Chinese tables. */

export const PLANETS_EN: Record<PlanetKey, Partial<Brief> & { zh: string }> = {
  sun: {
    zh: "Sun",
    name: "Sun",
    keywords: ["self", "vitality", "core"],
    text: "The Sun stands for your core self, your will and your life force, and for who you want to become. The sign it sits in sets the light you shine most truly.",
  },
  moon: {
    zh: "Moon",
    name: "Moon",
    keywords: ["emotion", "security", "instinct"],
    text: "The Moon governs your feelings, habits and inner needs, and the way you feel safe. It describes how you really are when you relax.",
  },
  mercury: {
    zh: "Mercury",
    name: "Mercury",
    keywords: ["mind", "communication", "learning"],
    text: "Mercury rules how you think, speak and learn, and how you handle information. It gives your ideas a shape and a voice.",
  },
  venus: {
    zh: "Venus",
    name: "Venus",
    keywords: ["love", "taste", "values"],
    text: "Venus rules love and taste, and shows what you value and how you enjoy things. It reveals what attracts you and how you love.",
  },
  mars: {
    zh: "Mars",
    name: "Mars",
    keywords: ["action", "desire", "courage"],
    text: "Mars stands for drive, desire and the urge to compete, and for how you go after your goals. It decides how you attack, and how you face conflict.",
  },
  jupiter: {
    zh: "Jupiter",
    name: "Jupiter",
    keywords: ["luck", "growth", "faith"],
    text: "Jupiter stands for expansion, opportunity and belief, the lucky star of the chart. It points to the areas where blessings and growth come to you most easily.",
  },
  saturn: {
    zh: "Saturn",
    name: "Saturn",
    keywords: ["duty", "limits", "tests"],
    text: "Saturn stands for responsibility, order and the test of time, bringing limits and maturity together. It points to where you must put in effort, and where you can finally win solid, lasting achievement.",
  },
  uranus: {
    zh: "Uranus",
    name: "Uranus",
    keywords: ["change", "originality", "awakening"],
    text: "Uranus rules sudden change, innovation and freedom, and breaks old frames. In your chart it marks the part of you that is different and unwilling to follow the crowd.",
  },
  neptune: {
    zh: "Neptune",
    name: "Neptune",
    keywords: ["dreams", "spirit", "mist"],
    text: "Neptune stands for dreams, inspiration and intuition, and also brings haze and illusion. It makes you especially sensitive to beauty and to mysterious things.",
  },
  pluto: {
    zh: "Pluto",
    name: "Pluto",
    keywords: ["transformation", "depth", "rebirth"],
    text: "Pluto stands for deep change and questions of power, driving you through destruction and rebirth. In your chart it points to your most intense and profound power of change.",
  },
};

export const ASPECTS_EN: Record<AspectKey, Partial<Brief>> = {
  conjunction: {
    name: "Conjunction",
    keywords: ["fusion", "amplify", "focus"],
    text: "Two planets sit close together, and their energies blend and grow stronger. The effect depends on the planets involved: it can be a powerful gift, or a tie that is hard to separate.",
  },
  sextile: {
    name: "Sextile",
    keywords: ["opportunity", "cooperation", "ease"],
    text: "A mild, helpful link between two planets that brings opportunity and balance. You need to reach out and use it before this potential turns into results.",
  },
  square: {
    name: "Square",
    keywords: ["conflict", "challenge", "drive"],
    text: "Two planets pull against each other, bringing friction and tension. That pressure pushes you to act, and once you work through it, it often becomes your biggest engine for growth.",
  },
  trine: {
    name: "Trine",
    keywords: ["harmony", "talent", "flow"],
    text: "Two planets support each other at the most comfortable angle, so the energy flows naturally and often shows up as talent and good luck. Do not let how easy it feels stop you from developing it.",
  },
  opposition: {
    name: "Opposition",
    keywords: ["polarity", "balance", "awareness"],
    text: "Two planets face each other across the chart, like the two ends of a scale pulling on one another. Learn to balance between them and you can hold both powers at once.",
  },
};

/** Sentence prefix per planet; the sign name follows, then a full stop. */
export const PLANET_IN_SIGN_HINT_EN: Record<"mercury" | "venus" | "mars", string> = {
  mercury: "Your thinking and speech carry the colour of",
  venus: "Your love and taste carry the colour of",
  mars: "Your action and drive carry the colour of",
};
