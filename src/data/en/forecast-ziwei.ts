import type { Phrase } from "../forecast-common";

/** English texts for the 紫微斗数 period forecast. Keys match `../forecast-ziwei.ts`. */

export const AREAS_EN: Record<string, { topic: string; scenes: string[] }> = {
  命宫: { topic: "your own state of mind and ideas", scenes: ["your image and how you feel about yourself", "your new plans for yourself"] },
  兄弟: { topic: "peers and partners", scenes: ["working with colleagues and people in your field", "time with your siblings"] },
  夫妻: { topic: "love and your partner", scenes: ["time with your partner", "people you have just met", "what you hope for from a relationship"] },
  子女: { topic: "children, younger people and creative work", scenes: ["time with children or younger people", "your own work and ideas", "light-hearted dates"] },
  财帛: { topic: "earning and spending", scenes: ["salary and bonuses", "everyday spending", "side income"] },
  疾厄: { topic: "your body and stress", scenes: ["your routine and sleep", "emotional stress", "old minor ailments"] },
  迁移: { topic: "going out and chances away from home", scenes: ["business trips and travel", "people you meet out and about", "the urge for a change of scene"] },
  仆役: { topic: "friends, colleagues and the people you lead", scenes: ["help from colleagues and friends", "leading a team or new starters", "contacts in your social circle"] },
  官禄: { topic: "work and career", scenes: ["your projects and position", "bosses and clients", "chances to move up or move on"] },
  田宅: { topic: "home and where you live", scenes: ["your home, a move or a renovation", "the mood at home", "household spending"] },
  福德: { topic: "your inner life and enjoying it", scenes: ["rest and hobbies", "your mood and sleep", "time on your own"] },
  父母: { topic: "elders, bosses and paperwork", scenes: ["talking with parents and elders", "documents, papers and exams", "how your boss sees you"] },
};

export const MUTAGEN_TEMPLATES_EN: Record<"禄" | "权" | "科" | "忌", string[]> = {
  禄: [
    "{T} things go fairly well with {topic}, and good news is likely around {scene}.",
    "{T}, around {scene}, you are likely to meet pleasant surprises and people who can help.",
    "{T} luck leans your way with {topic}; take the initiative with {scene}.",
  ],
  权: [
    "{T} you have stronger views on {topic}, and you can take the lead with {scene}.",
    "{T} you make decisions more boldly around {scene}, and your words carry more weight.",
  ],
  科: [
    "{T} you are likely to earn a good name in {topic}, and people will want to help with {scene}.",
    "{T}, when it comes to {scene}, someone who knows the ground is likely to show you the way.",
  ],
  忌: [
    "{T} you tend to overthink {topic}; double-check things around {scene}.",
    "{T} small obstacles turn up around {scene}; a slower pace is safer.",
    "{T} {topic} weighs on your mind, and {scene} will keep you thinking.",
  ],
};

export const FOCUS_TEMPLATES_EN: string[] = [
  "{T} your attention centres on {topic}, especially {scene}.",
  "{T} {topic} becomes the focus of your life, and {scene} takes up a lot of your thoughts.",
  "{T} there is more going on around {topic}, such as {scene}.",
];

export const HELPER_PHRASES_EN: Record<string, Phrase> = {
  贵人命: {
    what: [
      "{T} you are likely to meet someone willing to give you a hand, such as a former colleague, a senior or a boss. Reach out to them about what you want to move forward.",
      "{T} people around you are willing to speak up for you and make introductions. If there is something you want to get done, asking for advice is much faster than puzzling alone.",
    ],
    act: [],
  },
  贵人官: {
    what: [
      "{T} someone gives you a boost at work: a boss or senior is willing to give you a chance. Report your results yourself instead of waiting to be noticed.",
      "{T}, when a project gets stuck, someone who knows the ground will step in with advice. Take the hard problem to them; do not carry it alone.",
    ],
    act: [],
  },
  贵人财: {
    what: [
      "{T} someone tips you off or points you to a money opportunity, such as a good quote or a reliable side job. When you get a lead, ask a few people before deciding.",
      "{T} someone backs you up when money or pay is discussed, so make a serious case for the terms you want.",
    ],
    act: [],
  },
  禄财: {
    what: [
      "{T} income is steady; salary, bonuses and money owed to you tend to arrive on time.",
      "{T} effort is enough to catch the chances to earn; what you put in mostly comes back.",
    ],
  },
  禄官: {
    what: ["{T} work goes smoothly, and your results get noticed.", "{T} your projects move forward well, and colleagues and bosses cooperate."],
  },
  喜夫妻: {
    what: [
      "{T} there is joy in love: single people are likely to meet someone who makes their heart skip, and couples can talk about plans for the future.",
      "{T} good things draw near in close relationships; dates, meeting the family and making plans tend to go well.",
    ],
  },
  喜命: {
    what: ["{T} people warm to you and your mood is bright; you will be popular at social events.", "{T} you are likely to meet people and things that make you happy, so get out more."],
  },
  马迁移: {
    what: [
      "{T} there are more chances to go out, travel for work or change your surroundings, and you find it hard to sit still.",
      "{T} you are out and about more; work may keep you moving, or you may want to see somewhere new.",
    ],
    act: [
      "Book your trips early, pack your documents and charger, and leave buffer time on the road.",
      "When you are out a lot, group important things together to avoid running back and forth.",
    ],
  },
  羊陀: {
    what: [
      "{T} your pace swings between too rushed and too slow, so bumps and knocks come easily, or you feel tense and run hot.",
      "{T} you tend to be impatient, and small physical niggles come easily, such as a stiff neck, a sprain or poor sleep.",
    ],
    act: [
      "Slow down half a beat, take care when going out and exercising, and rest when you are tired.",
      "Keep ten minutes a day to unwind with a stretch or a walk, so the tension does not build up.",
    ],
  },
};
