/** English plain-language tables for the Western astrology page. Keys match `../plain-astrology.ts`. */

export const PLAIN_PLANET_EN: Record<string, string> = {
  sun: "core self",
  moon: "feelings and sense of security",
  mercury: "way of thinking and speaking",
  venus: "love and taste",
  mars: "drive and temper",
  jupiter: "luck and optimism",
  saturn: "duty and self-discipline",
  uranus: "need for change and independence",
  neptune: "imagination and sensitivity",
  pluto: "deep transformation",
};

/** Verb phrases: how two planets in an aspect act on each other. */
export const PLAIN_ASPECT_EN: Record<string, string> = {
  conjunction: "sit on top of each other and amplify one another, so these two parts stand out strongly in you",
  sextile: "help each other out, and turn into real opportunities as long as you use them on purpose",
  square: "pull against each other a little, which can make you anxious but also pushes you to act and grow stronger",
  trine: "work together smoothly; this is a natural talent of yours, so do not skip practising it just because it comes easily",
  opposition: "sit at the two ends of a scale, so you may swing between two needs; learning to hold both is your strength",
};

export const PLAIN_WEST_LACK_EN: Record<string, string> = {
  火: "The \"action and enthusiasm\" side of you is a little thin, so take the smallest first step on what you want to do, rather than waiting until you feel fully ready.",
  土: "The \"practical and patient\" side of you is a little thin, so use lists, budgets and fixed habits to help your ideas land on the ground.",
  风: "The \"thinking and communicating\" side of you is a little thin, so say important things out loud and ask a few more questions, rather than making people guess.",
  水: "The \"feeling and empathy\" side of you is a little thin, so pay more attention to the mood of the people near you, and stop now and then to ask yourself, \"How do I feel right now?\"",
};
