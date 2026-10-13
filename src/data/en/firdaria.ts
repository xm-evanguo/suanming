import type { FirPlanet, NodeInfo, NodeKey } from "../firdaria";

/** English texts for the Persian firdaria. Keys match `../firdaria.ts`. */

/** As in the planet texts, `stage` starts with "a stage of" and `plainKw` follows "governs". */
export const NODE_INFO_EN: Record<NodeKey, Partial<NodeInfo>> = {
  northNode: {
    zh: "North Node",
    kw: ["growth", "fated chances", "unfamiliar ground"],
    plainKw: "new chances and growth",
    stage: "a stage of stepping out of your comfort zone and meeting new people and new chances",
    title: "North Node · Head of the Dragon",
    colors: ["indigo", "ink purple"],
    actions: [
      "Get to know a few people outside your usual circle; the time of one coffee is enough.",
      "Do one thing you have always wanted to try but find unfamiliar, such as changing roles or learning a new skill.",
      "If someone invites you to a place or an occasion you have never been to, say yes first and think afterwards.",
    ],
    care: [
      "New chances come fast, so ask what exactly you would have to do before you agree.",
      "Do not throw out all your old arrangements just because something is new; change them one step at a time.",
    ],
  },
  southNode: {
    zh: "South Node",
    kw: ["letting go", "clearing out", "looking back"],
    plainKw: "letting go and clearing out",
    stage: "a stage of dropping old baggage and clearing out what you no longer need",
    title: "South Node · Tail of the Dragon",
    colors: ["grey blue", "charcoal"],
    actions: [
      "Sort through your phone, wardrobe and accounts once, and clear out what you no longer use.",
      "Put an end to a relationship or job that has dragged on for ages; saying it plainly is lighter than wearing it out.",
      "Look back at what you have learned over the years and write down three things worth keeping.",
    ],
    care: [
      "Do not be too quick to dismiss your past efforts; letting go is not the same as wasted.",
      "When you feel hollow, look after your sleep and meals first, then make the big decisions.",
    ],
  },
};

/** Fits after "This stretch is ruled by X (governs ...)." */
export const SUB_SCENE_EN: Partial<Record<FirPlanet, string>> = {
  sun: "You will want to be seen more, so it is a good time to report your results and go for a bigger role.",
  moon: "Family and feelings will take up a good deal of your thoughts, so it is a good time to spend time with family and adjust your routine.",
  mercury: "Communication, study and paperwork pick up, so it is a good time for exams, writing proposals and settling details.",
  venus: "There is room for romance and popularity to warm up, so it is a good time for dates, parties and mending relationships.",
  mars: "You want to move fast and win, so it is a good time to push forward delayed tasks, though watch your temper.",
  jupiter: "You are likely to meet people who want to help, so it is a good time to ask seniors for advice, sign up for a course and make long-term plans.",
  saturn: "Duties and rules weigh more, so it is a good time to lay solid foundations and finish things one by one.",
};

/** Fits "The task of this time is ...". */
export const TASK_EN: Record<FirPlanet, string> = {
  sun: "to show your own value and answer for it",
  moon: "to look after your body, your feelings and the people closest to you",
  mercury: "to learn more, ask more and say things clearly",
  venus: "to tend your relationships and to learn to enjoy life",
  mars: "to act with courage while keeping your temper in check",
  jupiter: "to open your eyes and take the hand others hold out",
  saturn: "to build patiently and carry your duties one at a time",
  northNode: "to walk toward the unfamiliar and accept new possibilities",
  southNode: "to let go of too much old baggage and travel light",
};
