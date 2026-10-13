import type { Phrase } from "../forecast-common";

/** English texts for the 九星気学 period forecast. Keys match `../forecast-kyusei.ts`. */

export const DIRECTION_RULES_EN: Record<string, { phrase: Phrase }> = {
  东: {
    phrase: {
      what: [
        "{T} new ideas and plans keep springing up; a good time to make a start and take the first step.",
        "{T} your drive grows, and things you hesitated over start to move.",
        "{T} a new beginning is waiting for you, such as a new project, a new course or a new habit.",
      ],
    },
  },
  东南: {
    phrase: {
      what: [
        "{T} your popularity and credibility both rise, and news from afar and offers to work together turn up easily.",
        "{T} is good for visiting people and making introductions; romance and partnerships take shape easily.",
        "{T} people think well of you, and the promises you make are trusted.",
      ],
    },
  },
  南: {
    phrase: {
      what: [
        "{T} your talent is easily seen; a good time to show your work, share your ideas or give a talk.",
        "{T} your name and presence rise, and your words travel easily, so think one step ahead before you speak.",
        "{T} you are full of inspiration and the urge to express it; good for writing, drawing and speaking.",
      ],
    },
  },
  西南: {
    phrase: {
      what: [
        "{T} progress is slow, but what you do with your feet on the ground slowly adds up.",
        "{T} is good for groundwork, sorting your materials and doing what is in hand thoroughly.",
      ],
    },
  },
  西: {
    phrase: {
      what: [
        "{T} there is more socialising and enjoyment, with gatherings, treats and small pleasures; money comes in and goes out briskly.",
        "{T} time with people is pleasant, and conversations easily bring good chances, and extra spending too.",
        "{T} a relaxed, cheerful mood helps you close deals, and can also tip into too much fun.",
      ],
    },
  },
  西北: {
    phrase: {
      what: [
        "{T} your responsibility and standing rise, and you may be pushed into the lead role.",
        "{T} is good for stepping up to lead; your decisions and leadership are recognised.",
        "{T} the people around you are willing to follow your plans, a good time to show you can carry responsibility.",
      ],
    },
  },
  北: {
    phrase: {
      what: [
        "{T} the pace is slow, good for gathering strength, learning and planning, not for rushing ahead.",
        "{T} your energy turns inward and you would rather stay home; good for resting and sorting your thoughts.",
        "{T} there is less going on outside, just right for getting your sleep and body back in shape.",
      ],
    },
  },
  东北: {
    phrase: {
      what: [
        "{T} your surroundings change: work, home or mindset may all be reorganised once.",
        "{T} old arrangements loosen and a new shape is forming, which can feel a little unsettled.",
        "{T} is good for clearing out and switching over; let go of what you no longer need.",
      ],
    },
  },
};

export const CENTER_RULE_EN: Phrase = {
  what: [
    "{T} is a point to pause; whatever you do feels hard to push, better for sorting out than sprinting.",
    "{T} things are at a turning point, and you often feel stuck between going forward and back. Gather in what is in hand, and set off once the wind is clear.",
    "{T} is like standing at a crossroads: a time to settle and review, saving big moves for the next stage.",
  ],
  act: [
    "Break your plans into small pieces, do what you can right now first, and push big changes further back.",
    "Listen more to the people around you, and do not rush to decide alone.",
    "Set regular time aside to rest and tidy up, and keep your mind steady.",
  ],
};

export const HAZARD_RULES_EN: Record<string, { label: string; phrase: Phrase }> = {
  暗剣殺: {
    label: "Dark Sword: the direction opposite 5 Yellow, a sign of sudden change",
    phrase: {
      what: [
        "{T} small surprises come up easily: plans get upset, or people you hardly know sway things.",
        "{T} sudden events are more common than usual: last-minute changes, people going back on their word, trips cancelled.",
      ],
      act: [
        "Push big moves such as moving house or long trips further back, leave more slack in your plans, and confirm important arrangements again in advance.",
        "Keep a backup plan, take extra care when going out or driving, and do not rush.",
        "When something sudden happens, take a deep breath and do not judge on the spot; decide once things are clear.",
      ],
    },
  },
  五黄殺: {
    label: "5 Yellow: your natal star is 5 Yellow Earth, on the board's 5 Yellow position",
    phrase: {
      what: [
        "{T} things tend to drag on and take the long way round, and old problems are more likely to resurface.",
        "{T} people and things feel heavy, and it takes extra patience to move them.",
      ],
      act: [
        "Clear old problems one by one now instead of putting them off; set big new projects aside for the moment.",
        "Rest more, take on fewer new burdens, and hold your ground.",
      ],
    },
  },
  歳破: {
    label: "Year Break: the direction opposite the year's branch",
    phrase: {
      what: [
        "{T} existing plans are easily broken and the rhythm turns unsteady, so plans need to flex.",
        "{T} things do not go quite as expected, and there are more last-minute changes.",
      ],
      act: ["Write plans as \"main plan plus backup\", and confirm key dates early.", "Do not stake everything on one thing; spreading it out is safer."],
    },
  },
  月破: {
    label: "Month Break: the direction opposite the month's branch",
    phrase: {
      what: ["{T} plans tend to shift a little, and agreed arrangements may change at short notice.", "{T} the pace is stop-start, and things do not move very smoothly."],
      act: ["Confirm important arrangements the day before and leave buffer time.", "Set aside what is not working and try again another time."],
    },
  },
};
