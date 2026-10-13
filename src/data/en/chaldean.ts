import type { Trad } from "../hellenistic";

/** English texts for the Chaldean days and hours. Keys match `../chaldean.ts`. */

export const DECAN_FLAVOR_EN: Record<Trad, string> = {
  sun: "Your Sun gets a second coat of its own light, so confidence and leadership are stronger, and people easily take you for the backbone.",
  moon: "Your Sun carries the softness of the Moon: you feel things keenly, you ask yourself whether it feels right before you decide, and you are good at looking after those around you.",
  mercury: "Your Sun carries the quickness of Mercury: your mind turns fast, you love to learn and ask, and your way with words and writing helps you.",
  venus: "Your Sun carries the soft glow of Venus: you are gentle with people, have good taste, and find people a little easier than others of your sign do.",
  mars: "Your Sun carries the drive of Mars: you act fast and step forward when things happen; just give yourself a cushion when your temper rises.",
  jupiter: "Your Sun carries the generosity of Jupiter: you have a wide view and an optimistic outlook, and you often meet seniors who are glad to help you up.",
  saturn: "Your Sun carries the steadiness of Saturn: you are dependable and willing to put in hard work, and you grew up a little sooner than others your age.",
};

export const FACE_TECH_EN: Record<Trad, string> = {
  sun: "Face of the Sun: authority, honour and self-realisation",
  moon: "Face of the Moon: feeling, memory and care",
  mercury: "Face of Mercury: intellect, speech and craft",
  venus: "Face of Venus: warmth, taste and pleasure",
  mars: "Face of Mars: action, competition and courage",
  jupiter: "Face of Jupiter: expansion, generosity and faith",
  saturn: "Face of Saturn: limits, endurance and duty",
};

export const WEEK_HISTORY_EN =
  "The seven-day week gets its names from this system. The ancients ranked the planets by their distance from the Earth as Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon (the Chaldean order), then split the day into 24 hours and handed them to the seven planets in turn. The planet that holds the first hour of a day gives the day its name. From one day's first hour to the next, the order skips over three planets, which produces the sequence Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn. The names of the days of the week, in many languages, are echoes of this arrangement.";

export const TRIO_TEXT_EN = {
  soft: "Most of your three planets are gentle, so there is less resistance in your way, and someone tends to lend a hand when you hit trouble.",
  hard: "Most of your three planets are severe, so your road is more like \"hardship first, results later\", and patience is your greatest asset.",
  even: "Your three planets balance soft and hard, with tailwinds and headwinds, and you can stay steady by adjusting your own pace.",
  repeat: "Two or more of them are the same planet, so that planet's character shows strongly in you and has almost become your label.",
};
