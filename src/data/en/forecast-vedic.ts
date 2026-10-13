import type { Phrase } from "../forecast-common";
import type { GrahaText } from "../forecast-vedic";

/**
 * English texts for the 吠陀占星 period forecast. Keys (Chinese lord names, house numbers) match `../forecast-vedic.ts`.
 * `maha` pools start with "These years", `antar` with "This stretch", `praty` with "These weeks". The `{T}` pools start with `{T} `.
 */

export const GRAHA_EN: Record<string, Partial<GrahaText>> = {
  计都: {
    maha: [
      "In these years, you will want to let go of things; your interest in bustle and reputation drops, and you want to work out what you really care about.",
      "These years suit putting down what you no longer need and going deeper into your inner life and your craft. Compare less and focus more.",
    ],
    antar: [
      "In this stretch some things may feel as if they have lost their meaning, a good time to clear out old things and end a relationship or project that has dragged on.",
      "In this stretch you would rather stay quietly by yourself and have little interest in socialising. Leave yourself room to be alone.",
    ],
    praty: ["In these weeks, your mind turns inward, a good time to tidy up and deal with things you put aside."],
  },
  金星: {
    maha: [
      "In these years, love, taste and enjoying life are magnified, and your popularity and money luck run fairly smoothly. A good time to tend relationships and make life more refined.",
      "In these years, you value comfort and relationships. Chances to meet someone in tune with you or find things you love increase, but watch out for overindulgence.",
    ],
    antar: [
      "In this stretch it is a good time for dates, buying things you like and making your home more beautiful. People like you.",
      "In this stretch good news in love and partnerships comes easily, a good time to talk about cooperation, see friends and join events.",
    ],
    praty: ["In these weeks, your mood is light and people are pleasant, a good time for socialising and dates."],
  },
  太阳: {
    maha: [
      "In these years, you want to be seen and to play the lead. The themes of career and reputation are clear, a good time to go for a position and influence.",
      "In these years, your relationship with authority, your boss and father figures becomes important, and responsibility and honour grow together.",
    ],
    antar: [
      "In this stretch it is a good time to step forward and take charge, and to tell your boss your ideas; just take care not to be too forceful.",
      "In this stretch your confidence rises and recognition comes easily, a good time for showing your work in public.",
    ],
    praty: ["In these weeks, you feel sure of yourself, a good time to take a stand, decide and go for chances."],
  },
  月亮: {
    maha: [
      "In these years, feelings and family life are the theme. You need more security and are better at caring for others, and there will be more changes in your home and among your family.",
      "In these years, you value your inner feelings and your intuition is sharp. You are easily swayed by people and surroundings, and a regular life helps you stay steady.",
    ],
    antar: [
      "In this stretch your moods swing more. Spend more time with family; a regular sleep routine matters most.",
      "In this stretch you care more about how the people around you feel, a good time to look after the family and sort out your home.",
    ],
    praty: ["In these weeks, your feelings are sensitive; give yourself more quiet and rest."],
  },
  火星: {
    maha: [
      "In these years, your drive and competitive spirit are strong, a good time for pioneering, tackling hard problems and sport, but keep your temper and impulses in check.",
      "In these years, you are full of energy and love a challenge, a good time for things that need a push. Mind your safety and friction with people.",
    ],
    antar: [
      "In this stretch you have plenty of energy and want to charge ahead. Exercise and tackling hard projects both suit you; leave some room in what you say.",
      "In this stretch you act decisively and can easily end up in an argument. Calm down first, then reply.",
    ],
    praty: ["In these weeks, you are full of drive, a good time to push on with a tough task."],
  },
  罗睺: {
    maha: [
      "In these years, desire and ambition are magnified. You may chase novelty, crossing fields, far-off places or chances online, and the ups and downs are bigger.",
      "In these years, change is fast and you may meet unusual people and events, a good time to try a new field, but check information carefully.",
    ],
    antar: [
      "In this stretch you are drawn to new things and prone to overthinking. Put big decisions off for now and check your information.",
      "In this stretch chances and temptations arrive together. See clearly what you really want and do not be swept along by a passing craze.",
    ],
    praty: ["In these weeks, your thoughts are lively and things change a lot, so hold off on important promises."],
  },
  木星: {
    maha: [
      "These years bring more learning, helpful people and chances, a good time to study, widen your view and build long-term relationships, and guidance comes easily.",
      "In these years, your fortune is fairly generous, a good time to read, teach, lead people and plan for the long term, and your outlook on life will widen.",
    ],
    antar: [
      "In this stretch you easily meet someone who points the way, a good time to learn, teach others or talk about cooperation.",
      "In this stretch your luck with helpful people is fairly good. If there is someone you want to ask, speak up and you will gain from it.",
    ],
    praty: ["In these weeks, your mind is open, a good time to learn and talk with people."],
  },
  土星: {
    maha: [
      "In these years, the pace is slower and the duties heavier, but what you build up step by step is long-lasting, a good time to lay foundations and work on a long-term career.",
      "These years bring more tests from reality. Gains come slowly but solidly, and discipline and patience are the key.",
    ],
    antar: [
      "In this stretch things move slowly and demands are high. Do what is in front of you thoroughly and do not rush for speed.",
      "In this stretch your duties grow heavier and you may feel tired. Break tasks into small pieces and move one step at a time.",
    ],
    praty: ["In these weeks, the pace is slow, a good time for patient tidying-up work."],
  },
  水星: {
    maha: [
      "These years suit study, business, writing and communication. Your mind is quick, and information and contacts bring chances.",
      "In these years, your mind is nimble, a good time for trading, exams and handling paperwork and data. More reading and writing will pay off.",
    ],
    antar: [
      "In this stretch communication, negotiation, exams and writing proposals all go smoothly; take care not to overthink.",
      "In this stretch there is a lot of information and contact, a good time for talks and study. Write down the important points.",
    ],
    praty: ["In these weeks, your thinking is quick, a good time for paperwork and communication."],
  },
};

export const SADE_SATI_EN: Record<"rising" | "peak" | "setting", { label: string; phrase: Phrase }> = {
  rising: {
    label: "Sade Sati (first stage): Saturn in the sign before your Moon sign",
    phrase: {
      what: [
        "{T} you enter a \"slowing down\" stretch of life, so watch your spending, sleep and family matters; the pressure starts with everyday details.",
        "{T} your sense of duty quietly gets heavier and you may worry about money and home matters. Making arrangements early makes things much lighter.",
      ],
      act: [
        "Keep your routine and spending steady and set aside an emergency sum each month; this stretch will go smoother than you expect.",
        "When the pressure builds, do not carry it alone. Talk with family or friends and work step by step to a plan.",
      ],
    },
  },
  peak: {
    label: "Sade Sati (middle stage): Saturn in your Moon sign itself",
    phrase: {
      what: [
        "{T} is the time in this slow stretch that asks for the most patience: your mood may be low and you work more slowly than usual, but it is also when you build the most composure.",
        "{T} your life feels heavy; you may feel lonely or weighed down by duty, and it is also a good time to see what you really need.",
      ],
      act: [
        "Sleep and exercise regularly, break big goals into weekly tasks you can finish, and stay close to a few people you trust.",
        "Make fewer impulsive decisions, keep your schedule looser for important things, and leave yourself time to recover.",
      ],
    },
  },
  setting: {
    label: "Sade Sati (last stage): Saturn in the sign after your Moon sign",
    phrase: {
      what: [
        "{T} this slow stretch is gradually coming to an end, the pressure eases bit by bit, and the patience you stored up starts to show results.",
        "{T} the load is lightening, and you will find you are steadier and surer of yourself than a few years ago.",
      ],
      act: [
        "Sum up what you have learned in these years as a list, and the next phase of plans can unfold slowly.",
        "While you are on the way up, pick up the small goals you put aside, one by one.",
      ],
    },
  },
};

/** Jupiter's transit house counted from the natal Moon sign. */
export const JUPITER_GOCHARA_EN: Record<number, { phrase: Phrase }> = {
  2: { phrase: { what: ["{T} Jupiter is in the 2nd house from your Moon: income and the mood at home are good, and money or good news from family comes easily."] } },
  5: { phrase: { what: ["{T} Jupiter is in the 5th house from your Moon: study, creative work and love all blossom easily, and it also suits spending time with children or younger people."] } },
  7: { phrase: { what: ["{T} Jupiter is in the 7th house from your Moon: your partner and working relationships become harmonious, and if you are single you may easily meet the right person."] } },
  9: { phrase: { what: ["{T} Jupiter is in the 9th house from your Moon: luck with helpful people, study and travel is good, a good time to learn and to go out and see the world."] } },
  11: { phrase: { what: ["{T} Jupiter is in the 11th house from your Moon: your network and income both look good, and wishes you want to realise easily find support."] } },
  8: { phrase: { what: ["{T} Jupiter is in the 8th house from your Moon: better to hold than to attack, so put your energy into keeping what you already have steady."] } },
  12: { phrase: { what: ["{T} Jupiter is in the 12th house from your Moon: more spending and running about, and you need more rest and time alone."] } },
};

/** The Sun's transit house counted from the natal Moon sign (good in 3, 6, 10, 11). */
export const SUN_GOCHARA_EN: Record<number, { phrase: Phrase }> = {
  3: { phrase: { what: ["{T} the Sun is in the 3rd house from your Moon: your courage and initiative are stronger than usual, a good time to get in touch and push on with what you have put off."] } },
  6: { phrase: { what: ["{T} the Sun is in the 6th house from your Moon: in competition and difficulties you easily have the upper hand, a good time to deal with tricky work."] } },
  10: { phrase: { what: ["{T} the Sun is in the 10th house from your Moon: your career may bring results and exposure, a good time to report and go for chances."] } },
  11: { phrase: { what: ["{T} the Sun is in the 11th house from your Moon: your network and income look good, a good time for socialising and talking about cooperation."] } },
};
