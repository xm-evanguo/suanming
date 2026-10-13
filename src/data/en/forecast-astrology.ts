import type { Phrase } from "../forecast-common";

/**
 * English texts for the Western astrology transit forecast. Keys, order and pool lengths match `../forecast-astrology.ts`.
 * `{scene}` and `{day}` sit after a preposition so that the sentence reads the same for any scene.
 */

export const HOUSES_EN: { topic: string; scenes: string[] }[] = [
  { topic: "your own state and image", scenes: ["your hair, clothes and first impressions", "something new you want to try", "your spirits and stamina"] },
  { topic: "income and spending", scenes: ["pay, bonuses and side income", "your shopping and saving habits", "how you judge your own worth"] },
  { topic: "communication and learning", scenes: ["everyday conversation and messages", "short trips", "learning a small skill", "dealings with siblings and neighbours"] },
  { topic: "home and family", scenes: ["where you live, moving or redecorating", "getting along with family", "the small things that make you feel secure"] },
  { topic: "romance and creativity", scenes: ["dates and flirting", "hobbies, creative work and entertainment", "time with children"] },
  { topic: "daily work and routine", scenes: ["the tasks and colleagues in front of you", "your routine, food and exercise", "looking after small health niggles"] },
  { topic: "partners and partnerships", scenes: ["a romantic partner or spouse", "an important business partner", "negotiations with clients"] },
  { topic: "shared money and deep trust", scenes: ["joint accounts and shared costs", "trust in close relationships", "old habits you need to let go of"] },
  { topic: "travel and further study", scenes: ["going abroad or taking a long trip", "further study and exams", "your values and beliefs"] },
  { topic: "career and public image", scenes: ["your position and promotion", "your name at work or in your field", "what your boss thinks of you"] },
  { topic: "friends and social circles", scenes: ["friends' gatherings and communities", "your long-term wishes", "chances that come through friends"] },
  { topic: "solitude and rest", scenes: ["sleep and recovery", "things you keep to yourself", "preparation behind the scenes"] },
];

export const PLANET_TEMPLATES_EN: Record<string, { direct: string[]; retro?: string[] }> = {
  jupiter: {
    direct: [
      "{T} Jupiter moves into the area of {topic}, so lucky openings come more easily around {scene}, and you are likely to meet people willing to help.",
      "{T} Jupiter shines on {topic}, and your luck is good around {scene}; go for it freely and it will pay back.",
      "{T} Jupiter is kind to {topic}, especially around {scene}, where good news comes easily.",
    ],
    retro: [
      "{T} Jupiter turns retrograde in the area of {topic}, so good chances slow down; use the time around {scene} to check back and finish old plans, and do not rush to expand.",
      "{T} expansion in the area of {topic} slows for now; around {scene} it suits you better to review and polish.",
    ],
  },
  saturn: {
    direct: [
      "{T} Saturn settles in the area of {topic}, asking more and moving slower around {scene}, but what you build solidly will last a long time.",
      "{T} you need more patience in the area of {topic}, especially around {scene}; do not expect to get there in one step.",
      "{T} a sense of duty presses on {topic}, and around {scene} it may leave you tired, but it is also a good time to build your inner strength.",
    ],
    retro: [
      "{T} Saturn turns retrograde in the area of {topic}, so old problems resurface; around {scene} it suits you to sort things out again, slowly.",
      "{T} an old lesson in the area of {topic} comes back to find you; shore up the basics around {scene} and the road ahead gets much easier.",
    ],
  },
  mars: {
    direct: [
      "{T} Mars passes through the area of {topic}, giving you strong drive around {scene}, but also a short temper and a quick flare of anger.",
      "{T} you are impatient in the area of {topic} and full of energy, so leave extra room around {scene}.",
    ],
  },
  venus: {
    direct: [
      "{T} Venus arrives in the area of {topic}, and the mood around {scene} is warm, with small things that make you happy.",
      "{T} your mood is light in the area of {topic}, and people are more willing to cooperate around {scene}.",
    ],
  },
  sun: {
    direct: [
      "{T} the Sun lights up the area of {topic}, making {scene} the focus, and well worth some extra thought.",
      "{T} your attention goes to {topic}, especially to {scene}.",
    ],
  },
};

export const SIGN_THEMES_EN: { theme: string; scene: string }[] = [
  { theme: "taking the initiative on new things", scene: "new projects or directions you want to try" },
  { theme: "steady income and enjoying life", scene: "saving, spending and quality of life" },
  { theme: "learning and exchange", scene: "reading, courses and everyday conversation" },
  { theme: "family and feelings", scene: "matters at home and the people close to you" },
  { theme: "showing yourself and creating", scene: "hobbies, creative work and dating" },
  { theme: "work details and looking after your body", scene: "your routine, food and the work in your hands" },
  { theme: "partnership and cooperation", scene: "romance and working relationships" },
  { theme: "shared resources and deep trust", scene: "shared expenses and trust in close relationships" },
  { theme: "travel and wider horizons", scene: "trips, further study and long-range ideas" },
  { theme: "career and long-term goals", scene: "your position, responsibilities and long-term plans" },
  { theme: "your circle of friends and new ideas", scene: "communities, friends and fresh ideas" },
  { theme: "imagination, rest and healing", scene: "sleep, time alone and sorting out your inner world" },
];

export const SIGN_TEMPLATES_EN: Record<"jupiter" | "saturn" | "sun", string[]> = {
  sun: [
    "{T} the Sun is moving through {sign}, so {theme} becomes a shared topic, and your own mind may well turn to {scene}.",
    "{T} the Sun enters {sign} and the general mood leans toward {theme}; it is worth giving a little more time to {scene}.",
  ],
  jupiter: [
    "{T} Jupiter is in {sign}, and your luck is good with {theme}; try a little more around {scene}.",
    "{T} Jupiter is moving through {sign}, so helpers turn up easily around {scene}, and {theme} is worth investing in.",
  ],
  saturn: [
    "{T} Saturn is in {sign}, so {theme} asks more of you and moves more slowly; bring a little extra patience to {scene}.",
    "{T} Saturn is moving through {sign}: build up {scene} steadily, because {theme} cannot be rushed.",
  ],
};

export const YEAR_EVENTS_EN: Record<string, { label: string; phrase: Phrase }> = {
  "jupiter-return": {
    label: "Jupiter return",
    phrase: {
      what: [
        "{T} is the start of a new twelve-year cycle: the \"big cycle\" of your fortunes begins again. It suits setting a direction for the next ten years, such as changing field, studying, or moving to a city you want to live in.",
        "{T} a new cycle of growth starts, and you will want to widen your horizons and try what you have not done before. Take the plan you have wanted for a long time and make a real start on it this year.",
      ],
    },
  },
  "saturn-return": {
    label: "Saturn return",
    phrase: {
      what: [
        "{T} is a \"coming-of-age gate\" that comes about once in thirty years: you look again at your work, relationships and life direction, and some things need to settle while others need to be let go.",
        "{T} duty and realism are strong, which suits long-term planning: fixing a career direction, sorting out relationships and setting new rules for your life. The process is a bit tiring, but well worth it.",
      ],
      act: [
        "Write five things you want and five you do not want for the next three years, then pick one and start on it this quarter.",
        "Do not push through alone; talk about your pressure with someone you trust, and lay the foundations one step at a time.",
      ],
    },
  },
  "saturn-sun-0": {
    label: "Saturn conjunct natal Sun",
    phrase: {
      what: [
        "{T} Saturn returns to the position of your Sun, so your confidence and energy get pressed by reality, and it is also a time to set your goals again.",
        "{T} duty and pressure gather on you and you may feel worn out, but the direction you settle on this year will be very firm.",
      ],
    },
  },
  "saturn-sun-90": {
    label: "Saturn square natal Sun",
    phrase: {
      what: [
        "{T} asks you to be stricter with yourself, and you meet limits in your work or goals, so you need to adjust your method.",
        "{T} outside rules and pressure increase, and self-expression can meet cold water, but if you keep going it will bear fruit.",
      ],
    },
  },
  "saturn-sun-180": {
    label: "Saturn opposite natal Sun",
    phrase: {
      what: [
        "{T} the expectations and limits others place on you grow, and you may end up at odds with a boss, an elder or a partner; talk until you find a way both sides can accept.",
        "{T} you feel pressure from outside, and you need to find a balance between your own goals and your duties.",
      ],
    },
  },
  "saturn-moon-0": {
    label: "Saturn conjunct natal Moon",
    phrase: {
      what: [
        "{T} you are more likely to feel lonely or under pressure, and your responsibilities at home increase.",
        "{T} there is a feeling inside that you have to shoulder it all, life slows and gets heavier, and you need more sleep and the company of people close to you.",
      ],
    },
  },
  "saturn-moon-90": {
    label: "Saturn square natal Moon",
    phrase: {
      what: [
        "{T} your mood can sag or tighten, and duties hold you back, so you need to plan time to relax on purpose.",
        "{T} your need for security grows stronger, and family or housing matters need more of your attention.",
      ],
    },
  },
  "saturn-moon-180": {
    label: "Saturn opposite natal Moon",
    phrase: {
      what: [
        "{T} your feelings and reality pull against each other; people close to you may seem to ask too much, and you may feel misunderstood.",
        "{T} you need to draw a line between looking after others and looking after yourself, and to say clearly what you need.",
      ],
    },
  },
  "jupiter-sun-0": {
    label: "Jupiter conjunct natal Sun",
    phrase: {
      what: [
        "{T} Jupiter returns to the position of your Sun, and confidence, chances and good luck arrive together: a year in which you are seen and recognised.",
        "{T} what you want to do gets support easily, and you may be offered a promotion, an honour or a bigger stage.",
      ],
    },
  },
  "jupiter-moon-0": {
    label: "Jupiter conjunct natal Moon",
    phrase: {
      what: [
        "{T} your mood is full, family and close relationships bring warmth, and happy news is likely, such as a celebration, a move or a new baby.",
        "{T} you feel secure inside and are willing to open up to those near you, so your relationships grow closer.",
      ],
    },
  },
};

export const MONTH_EVENTS_EN: Record<string, { what: string[] }> = {
  "venus-sun-0": { what: ["{T}, around the {day}, Venus comes close to your Sun, and your charm and popularity are especially good; a fine time to meet people, go on dates and talk about working together."] },
  "venus-sun-180": { what: ["{T}, around the {day}, Venus faces your Sun, and the other person's attitude can differ from what you had in mind; be a little more considerate when you talk."] },
  "venus-moon-0": { what: ["{T}, around the {day}, Venus comes close to your Moon, and your mood is soft and people close to you bring warmth; good for dates and family get-togethers."] },
  "venus-moon-180": { what: ["{T}, around the {day}, Venus faces your Moon, and you want to be cherished emotionally, but you can also be touchy about small things."] },
  "venus-venus-0": { what: ["{T}, around the {day}, Venus returns to where it stood at your birth, waking your sense of love and beauty; a good time to refresh your look, go on a date or buy yourself something small you like."] },
  "venus-venus-180": { what: ["{T}, around the {day}, Venus faces your natal Venus, and your ideas about money and love can waver; think twice before you shop."] },
  "venus-mc-0": { what: ["{T}, around the {day}, Venus comes close to your Midheaven, and you are especially well liked at work; good for socialising, meetings and presenting."] },
  "venus-mc-180": { what: ["{T}, around the {day}, Venus faces your Midheaven, so work and private life need balancing; do not let social obligations cost you your rest."] },
  "mars-sun-0": { what: ["{T}, around the {day}, Mars comes close to your Sun, and your energy is very high, good for sprinting at a goal, but you may be rash and run hot."] },
  "mars-sun-180": { what: ["{T}, around the {day}, Mars faces your Sun, and you may clash head-on with someone; when your temper rises, count to ten first."] },
  "mars-moon-0": { what: ["{T}, around the {day}, Mars comes close to your Moon, and feelings come fast and you may act on impulse; use exercise to release the energy."] },
  "mars-moon-180": { what: ["{T}, around the {day}, Mars faces your Moon, and people close to you can flare up over small things; let feelings cool down before you talk."] },
  "mars-venus-0": { what: ["{T}, around the {day}, Mars comes close to your Venus, and attraction is strong with plenty of sparks in love, but watch for impatience and possessiveness."] },
  "mars-venus-180": { what: ["{T}, around the {day}, Mars faces your Venus, and you can be hasty and quarrelsome in love; speak more slowly."] },
  "mars-mc-0": { what: ["{T}, around the {day}, Mars comes close to your Midheaven, and you have great drive at work, good for tackling hard problems, but you may lock horns with your boss."] },
  "mars-mc-180": { what: ["{T}, around the {day}, Mars faces your Midheaven, and the pace at work is pushed hard; set your priorities first, then start."] },
  "sun-sun-0": { what: ["{T} is your birthday month: the Sun returns to where it stood at your birth, the start of a new year of life. A good time to write down this year's goals and plan a small celebration for yourself."] },
  "sun-sun-180": { what: ["{T}, around the {day}, comes your half-birthday point, a good time to look back at how much of this half-year's goals you have met."] },
  "sun-moon-0": { what: ["{T}, around the {day}, the Sun comes close to your Moon, so your inner needs and outer actions agree; a good time to make decisions that put your mind at ease."] },
  "sun-moon-180": { what: ["{T}, around the {day}, the Sun faces your Moon, and your head and your heart say different things; sleep on any big decision."] },
  "sun-venus-0": { what: ["{T}, around the {day}, the Sun comes close to your Venus, lighting up love and popularity; a good time to show that you like someone."] },
  "sun-venus-180": { what: ["{T}, around the {day}, the Sun faces your Venus, and what you expect from a relationship and what is real can differ; talk more."] },
  "sun-mc-0": { what: ["{T}, around the {day}, the Sun comes close to your Midheaven, and your results at work are easy to see; good for reports and presentations."] },
  "sun-mc-180": { what: ["{T}, around the {day}, the Sun faces your Midheaven, so work and life need balancing; do not give all your time to work."] },
};

export const MERCURY_RETRO_EN: Phrase = {
  what: [
    "{T} Mercury is retrograde (around {range}): communication, travel plans and electronics tend to go back and forth, and things you arranged may be rescheduled.",
    "{T} Mercury is retrograde (around {range}): people and matters from the past may come back to you, and documents and messages are prone to misunderstanding.",
    "{T} Mercury is retrograde (around {range}): your thoughts tend to go in circles, and messages you send may be misread.",
  ],
  act: [
    "Check important emails and documents once more before sending, confirm the time and place of what you have arranged, and back up your devices.",
    "Do not rush to sign or place a new order; finish the old business first, and it is also a good time to contact someone you have not spoken to in a while.",
    "Leave half an hour of buffer when you travel, and say important things face to face rather than relying on a single message.",
  ],
};

export const MERCURY_DIRECT_SOON_EN: Phrase = {
  what: ["{T} Mercury turns from retrograde to direct (around {range}), and the communication and plans that were stuck begin to loosen."],
  act: ["Pick up what you had put aside and push it forward, and this is also a good time to untie any knots in communication."],
};
