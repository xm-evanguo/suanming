import type { GodRule } from "../forecast-bazi";
import type { Phrase } from "../forecast-common";

/** English texts for the 八字 period forecast. Keys, dims, tones and weights match `../forecast-bazi.ts`. */

export const GOD_RULES_EN: Record<string, Partial<GodRule>> = {
  正官: {
    meaning: "Officer star: position, rules, recognition",
    phrase: {
      what: [
        "{T} your steady work gets noticed, and bosses or clients see you in a good light.",
        "{T} rules and process matter more than usual; people who play by them and deliver on time earn trust.",
        "{T} news of a promotion, a permanent contract or new responsibility is likely.",
      ],
    },
  },
  七杀: {
    meaning: "Seven Killings: pressure, competition, hard battles",
    phrase: {
      what: [
        "{T} pressure and competition at work both rise, but this is also when your real strength gets drawn out.",
        "{T} you meet a demanding boss or a difficult client, and also a hard battle that could make your name.",
        "{T} the pace is fast, with more last-minute tasks and surprises.",
      ],
    },
  },
  正财: {
    meaning: "Direct Wealth: earned income, steady money",
    phrase: {
      what: [
        "{T} income is fairly steady; your main job and steady effort bring money in.",
        "{T} you handle money with method; a good time to save regularly and sort your accounts.",
        "{T} salary, bonuses and money owed to you tend to arrive on time.",
      ],
    },
  },
  偏财: {
    meaning: "Indirect Wealth: unplanned money, income through contacts",
    phrase: {
      what: [
        "{T} there is a chance of unplanned income, such as a side job, a bonus or work a friend sends your way.",
        "{T} contacts open more ways to earn; leads for making money pop up when you deal with people.",
        "{T} more money comes in, but you also spend more freely.",
      ],
    },
  },
  食神: {
    meaning: "Eating God: talent, expression, good fortune",
    phrase: {
      what: [
        "{T} ideas flow and you express yourself well; a good time to write, present, film or explain things to others.",
        "{T} you are relaxed, and doing what you love brings results; your craft and creativity both shine.",
        "{T} ideas turn into reality easily, and people want to hear what you say.",
      ],
    },
    extra: {
      dim: "health",
      tone: "good",
      phrase: {
        what: [
          "{T} your appetite and mood are both good; enjoy proper meals and do things you like.",
          "{T} you are quite relaxed, eating well and sleeping soundly.",
        ],
      },
    },
  },
  伤官: {
    meaning: "Hurting Officer: talent on show, innovation, dislike of limits",
    phrase: {
      what: [
        "{T} you have lots of ideas and a strong urge to express them; a good time to make work, design and propose new plans.",
        "{T} you do not want to follow the rules and like to challenge old ways; creativity runs high.",
        "{T} your words and talent are on form; you speak with an edge and leave a strong impression.",
      ],
    },
    extra: {
      dim: "career",
      tone: "mixed",
      phrase: {
        what: [
          "{T} your boss's plans may strike you as unreasonable, and speaking bluntly can sour the mood.",
          "{T} more things bother you, and disagreements with bosses or seniors come easily.",
          "{T} you want to do things your way, and rules and process make you restless.",
        ],
        act: [
          "Raise ideas with your boss in private, and say \"I suggest\" rather than \"you're wrong\".",
          "Write complaints in a note first, wait a day, then decide whether to say them.",
          "Turn your objection into a proposal with data; it is more likely to be accepted.",
        ],
      },
    },
  },
  正印: {
    meaning: "Direct Resource: learning, elders, protection",
    phrase: {
      what: [
        "{T} learning goes well, and elders, teachers or seniors are likely to give you pointers.",
        "{T} exams, further study and certificates move forward smoothly.",
        "{T} people around you are willing to back you, and your family offers plenty of support.",
      ],
    },
  },
  偏印: {
    meaning: "Indirect Resource: unusual skills, intuition, solitude",
    phrase: {
      what: [
        "{T} you are drawn to niche things, such as a new skill, a craft or research.",
        "{T} your intuition is sharp and unusual ideas come easily; you also want more time alone.",
        "{T} you dive into a niche hobby and keep going deeper.",
      ],
    },
    extra: {
      dim: "health",
      tone: "mixed",
      phrase: {
        what: ["{T} you think a lot and may sleep lightly.", "{T} your mind is heavy, and you keep turning small things over."],
      },
    },
  },
  比肩: {
    meaning: "Friend: peers, friends, self",
    phrase: {
      what: [
        "{T} peers feature more; colleagues and friends come to you to work together.",
        "{T} you feel very independent and want to do things your way rather than be told.",
        "{T} there is competition among peers, and also chances to back each other up.",
      ],
    },
    extra: {
      dim: "wealth",
      tone: "mixed",
      phrase: {
        what: [
          "{T} you spend more with friends; settle up meals, splits and money you advance.",
          "{T} your money gets tangled with other people's; split shared costs clearly.",
        ],
      },
    },
  },
  劫财: {
    meaning: "Rob Wealth: competition, loss, shared money",
    phrase: {
      what: [
        "{T} money gets divided easily: friends borrowing, splitting gains with partners and treating people all increase.",
        "{T} competition in your field is fierce, with many people after the same resources.",
        "{T} you spend freely and may pay more than you should to save face.",
      ],
    },
  },
};

export const PARTNER_PHRASE_EN: Record<"steady" | "passion", Phrase> = {
  steady: {
    what: [
      "{T} romantic chances are down to earth; you are likely to meet someone who wants to get serious.",
      "{T} talking with your partner or the person you like goes smoothly, and the relationship moves toward stability.",
      "{T} you do well with potential partners; someone a friend introduces is worth meeting.",
    ],
  },
  passion: {
    what: [
      "{T} love runs hot: your heart moves fast, and the ups and downs can be big.",
      "{T} you are drawn to charismatic people; there are sparks, and friction too.",
      "{T} romantic chances are plentiful, but tell a passing thrill from a real fit.",
    ],
  },
};

export const SPOUSE_RULES_EN: Record<string, { phrase: Phrase }> = {
  六合: {
    phrase: {
      what: [
        "{T} you are especially in tune with your partner or the people close to you, and good times together come easily.",
        "{T} single people are likely to meet someone easy to talk to; couples can talk about plans for the future.",
        "{T} warmth rises in close relationships, and each of you thinks one step further for the other.",
      ],
    },
  },
  三合: {
    phrase: {
      what: [
        "{T} the people around you are willing to go along with you, and the mood in close relationships is warm.",
        "{T} time with your partner or family is easy, and you can get a small thing done together.",
      ],
    },
  },
  冲: {
    phrase: {
      what: [
        "{T} close relationships may change: a move, new routines, or arguments over small things.",
        "{T} your rhythm and your partner's or family's are out of step; you may quarrel once or twice, and it may clear the air.",
        "{T} you think about changes in love or where you live; single people meet different types of people.",
      ],
    },
  },
  害: {
    phrase: {
      what: [
        "{T} small misunderstandings come easily between close people, and words get twisted as they pass along.",
        "{T} a careless remark from someone close may stay on your mind for a long time.",
      ],
    },
  },
  伏吟: {
    phrase: {
      what: [
        "{T} the same things keep coming back: old topics, old arguments, repeated arrangements.",
        "{T} an old problem at home or in love comes up again; a good time to deal with it properly.",
      ],
    },
  },
};

export const TAISUI_RULES_EN: Record<string, { phrase: Phrase }> = {
  "值太岁（本命年）": {
    phrase: {
      what: [
        "{T} is your own zodiac year: ups and downs are more noticeable than usual, and you may feel like starting over.",
        "{T} both your surroundings and your mindset are shifting gear; it can feel hectic, and it is also a good time to rethink your direction.",
      ],
      act: [
        "Think big decisions through, keep regular hours, and wearing a small red item for peace of mind does no harm.",
        "Aim for progress within stability: sort out sleep and exercise first, then turn to new plans.",
      ],
    },
  },
  冲太岁: {
    phrase: {
      what: [
        "{T} brings a lot of change: a new role, a new company, a move or a long trip may all come up.",
        "{T} your usual rhythm gets disrupted, and old arrangements may need redoing.",
        "{T} outside forces push you to move whether you like it or not; choosing the change beats having it happen to you.",
      ],
      act: [
        "Before any change, get clear on what you want and save a cushion of money, then decide whether to go.",
        "Do not fight the change; treat it as a chance to live differently, and keep a way back at every step.",
        "Check details carefully before travel or a move, leave extra time on the road, and put safety first.",
      ],
    },
  },
  害太岁: {
    phrase: {
      what: [
        "{T} misunderstandings with people come easily, with more gossip behind your back and small frictions.",
        "{T} small things can open a gap between you and the people you work with, so communicate more clearly.",
      ],
      act: [
        "Put important things in writing, say less and do more, and stay out of gossip.",
        "If there is a misunderstanding, ask directly instead of guessing.",
      ],
    },
  },
  六合太岁: {
    phrase: {
      what: [
        "{T} people warm to you, and partnerships and love both tend to bring good news.",
        "{T} someone is willing to make introductions; people and opportunities friends bring are worth a try.",
        "{T} helpers and chances often come from people you already know.",
      ],
    },
  },
  三合太岁: {
    phrase: {
      what: [
        "{T} the wider environment helps you, and plans you want to start move forward with the tide.",
        "{T} is good for breaking new ground, and more people on the team want to work with you.",
      ],
    },
  },
};

export const SHENSHA_RULES_EN: Record<string, { phrase: Phrase }> = {
  天乙贵人: {
    phrase: {
      what: [
        "{T} there are signs of helpful people: you are likely to meet someone willing to give you a hand, such as a former colleague, a senior or a boss. Reach out to them about what you want to move forward.",
        "{T} helpers step in at key moments: someone speaks up for you, someone shows you the way. When you get stuck, do not just push through; ask someone who knows.",
        "{T} there are signs of a helper appearing, perhaps through a friend's introduction or a passing tip from a senior. Pay attention to the advice of those around you.",
      ],
      act: [],
    },
  },
  文昌: {
    phrase: {
      what: [
        "{T} reading, exams and writing go well; your head is clear, good for exam prep or work that needs a way with words.",
        "{T} you learn especially fast, and material that would not go in before suddenly clicks.",
      ],
    },
  },
  驿马: {
    phrase: {
      what: [
        "{T} there are more chances for business trips, travel, moving or a change of scene, and you find it hard to sit still.",
        "{T} you are out and about more; work may keep you moving, or you may want to see somewhere new.",
      ],
      act: [
        "Book your trips early, pack your documents and charger, and leave buffer time on the road.",
        "When you are out a lot, group important things together to avoid running back and forth.",
      ],
    },
  },
  桃花: {
    phrase: {
      what: [
        "{T} your popularity and romantic appeal rise, and single people are likely to meet someone who makes their heart skip.",
        "{T} there are more social occasions, and your smile and charm count for more. If you have a partner, save more time for them.",
      ],
    },
  },
};

export const RHYTHM_PHRASE_EN: Record<"fit" | "off" | "flat", Phrase> = {
  flat: {
    what: [
      "{T} the overall rhythm is steady, neither especially smooth nor especially awkward; just take things step by step.",
      "{T} the wider environment is neither loose nor tight, good for doing everyday things carefully and well.",
    ],
  },
  fit: {
    what: [
      "{T} the overall rhythm suits you; things go smoothly and you are in good spirits.",
      "{T} the wider environment is friendly to you; move what needs doing forward with the tide.",
    ],
  },
  off: {
    what: [
      "{T} the overall rhythm is a little at odds with you; you tire easily and things move slowly.",
      "{T} the wider environment is not easy to work with, and things take more effort.",
    ],
  },
};
