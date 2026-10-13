import type { Dignity, HouseInfo, SectInfo, Trad, TradInfo } from "../hellenistic";

/** English texts for Hellenistic astrology. Keys and order match `../hellenistic.ts`. */

export const WEEKDAY_ZH_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const DIGNITY_NAME_EN: Record<Dignity, string> = {
  domicile: "domicile",
  exaltation: "exaltation",
  detriment: "detriment",
  fall: "fall",
  peregrine: "peregrine",
};

export const DIGNITY_PLAIN_EN: Record<Dignity, string> = {
  domicile: "at home, so it works with ease",
  exaltation: "in an honoured seat, so respect comes easily",
  detriment: "in an unfriendly setting, so it takes extra effort",
  fall: "a little short of footing, so you make up for it with preparation",
  peregrine: "no special help and no special resistance",
};

/**
 * Planet texts. `strong`, `weak` and `mixed` are verb phrases that follow the planet's name ("Mars has drive...").
 * `plainKw` follows "governs"; `stage` starts with "a stage of"; `dayText` and `hourText` follow "suit".
 */
export const TRAD_INFO_EN: Record<Trad, Partial<TradInfo>> = {
  sun: {
    zh: "Sun",
    kw: ["self", "authority", "reputation"],
    plainKw: "confidence and being seen",
    strong: "gives you solid footing: people listen to you and are glad to hand you important things",
    weak: "can leave you short on confidence, or make you push too hard to be seen",
    mixed: "makes you want recognition badly, and how well it goes depends on how much you prepare",
    stage: "a stage of stepping to the front and taking on a central role",
    dayText: "meeting your boss, talking about promotion and doing things where you need to be seen, such as reports and interviews",
    hourText: "stating your position, meeting elders or your boss and doing things where you appear in public",
    title: "Sun · Light of Kings",
    colors: ["gold", "orange"],
  },
  moon: {
    zh: "Moon",
    kw: ["emotion", "body", "family"],
    plainKw: "mood, sleep and family",
    strong: "keeps your mood steady and your manner soft, so family and colleagues like to be near you",
    weak: "swings your mood, and can bring sleepless nights or overthinking",
    mixed: "makes your mood follow your surroundings, so you need a fixed routine to hold yourself steady",
    stage: "a stage when daily rhythm, family and feelings come first",
    dayText: "family matters, tidying your room and looking after relatives, and also an early night",
    hourText: "housework, sorting out your feelings and getting in touch with family and old friends",
    title: "Moon · Tides and Home",
    colors: ["silver white", "milky white"],
  },
  mercury: {
    zh: "Mercury",
    kw: ["communication", "learning", "trade"],
    plainKw: "communication, study and paperwork",
    strong: "keeps your head clear and your tongue quick, so talks and writing go smoothly",
    weak: "can make you say the wrong thing or miss details, so read emails and contracts twice",
    mixed: "brings many ideas but scatters your attention, so a checklist keeps you from getting muddled",
    stage: "a stage of study, communication, running about and doing deals",
    dayText: "writing, talking, studying, sending emails, signing documents and short business trips",
    hourText: "drafting proposals, answering messages, discussing prices and doing homework",
    title: "Mercury · Pen of the Messenger",
    colors: ["emerald", "light grey"],
  },
  venus: {
    zh: "Venus",
    kw: ["love", "beauty", "harmony"],
    plainKw: "romance, taste and popularity",
    strong: "wins you friends and sharpens your taste, so pleasant people and moments find you easily",
    weak: "can make you squeeze yourself small to please others, or spend on impulse",
    mixed: "gives you real charm, but you have to work out what you truly want",
    stage: "a stage when relationships, enjoyment and popularity matter more",
    dayText: "dates, parties, buying clothes, decorating a room and mending relationships",
    hourText: "seeing someone you like, meeting friends, dressing up and gentle conversations",
    title: "Venus · Love and Beauty",
    colors: ["rose pink", "pale white"],
  },
  mars: {
    zh: "Mars",
    kw: ["action", "competition", "courage"],
    plainKw: "action and courage",
    strong: "gives you drive: you dare to speak and to act, and you push things through cleanly",
    weak: "shortens your temper and hurries your work, so you may clash with people",
    mixed: "gives plenty of drive but can overshoot, so count to three before you act",
    stage: "a stage of taking the initiative, competing and working hard physically",
    dayText: "exercise, starting work and anything that needs drive, with fewer arguments",
    hourText: "working out, hands-on work and pushing forward something you have put off for ages",
    title: "Mars · Blade of the Warrior",
    colors: ["vermilion", "ochre red"],
  },
  jupiter: {
    zh: "Jupiter",
    kw: ["expansion", "helpers", "faith"],
    plainKw: "opportunities, helpers and perspective",
    strong: "brings helpful people and plenty of chances, and many are glad to lend a hand",
    weak: "can make you blindly optimistic, promising too much and spending too much",
    mixed: "brings real chances, but you have to choose among them and not take everything on",
    stage: "a stage of more opportunities, a wider view and easier help",
    dayText: "asking seniors for advice, planning, visiting elders and happy occasions",
    hourText: "asking for help, discussing cooperation, signing up to study and making long-term plans",
    title: "Jupiter · Father of the Sky",
    colors: ["bright yellow", "royal blue"],
  },
  saturn: {
    zh: "Saturn",
    kw: ["responsibility", "time", "limits"],
    plainKw: "duty, rules and patience",
    strong: "makes you patient, so slow accumulation turns into solid results",
    weak: "weighs on you, so things feel stuck and easy to put off",
    mixed: "makes progress slow but steady, so you need to set a clear pace for yourself",
    stage: "a stage of laying foundations, carrying responsibility and slowly earning results",
    dayText: "long-term planning, clearing out old things and patient groundwork",
    hourText: "organising papers, reviewing and doing single-minded, monotonous work",
    title: "Saturn · Old Man of Time",
    colors: ["ink black", "deep blue"],
  },
};

/**
 * Houses. `short` is the wheel label. `topic` may carry a second part after a semicolon (the traditional name of the place),
 * and the one-line condition drops it. `plainTopic` fills the slot "the area of ...".
 */
export const HOUSES_EN: Partial<HouseInfo>[] = [
  {
    name: "House of Life", short: "Self", topic: "life, the body and self-image", plainTopic: "your own state and image",
    good: ["A good time to give yourself a new look, or to start an exercise habit you can keep.", "Start the personal project you have in mind now; it works better than waiting until you feel ready."],
    care: ["Do not carry everything yourself; get enough sleep before you decide.", "Stop wrestling with people and put your own rhythm in order first."],
  },
  {
    name: "House of Wealth", short: "Money", topic: "property, income and making a living", plainTopic: "income and spending habits",
    good: ["A good time to ask for a raise, take a side job or sort out your accounts; move the money you want to save out first each month.", "If you have a skill you can sell, quoting a price now will stand up better than usual."],
    care: ["Sleep on big purchases for three days before you decide.", "Track your spending for a month and find the small leaks you miss most."],
  },
  {
    name: "House of Siblings", short: "Kin", topic: "siblings, neighbours and short trips", plainTopic: "everyday communication: siblings, neighbours, colleagues and daily travel",
    good: ["A good time for a short course, for writing and speaking more, and for contacting siblings or old colleagues.", "Proposals you need to write and emails you need to send come out clearer now."],
    care: ["Say important things face to face or by phone; do not rely on text messages alone.", "Check your papers and your car before a long trip, and do not rush on the road."],
  },
  {
    name: "House of Home", short: "Home", topic: "parents, home and roots", plainTopic: "home, family and where you live",
    good: ["A good time to tidy your room, look at houses, or share a few good meals with family.", "Turn one corner of your home into a place where you can really rest."],
    care: ["When you disagree with family, hear them out first, and do not dig up old quarrels at the table.", "For a move or renovation, ask about the cost before you decide."],
  },
  {
    name: "House of Pleasure", short: "Joy", topic: "children, romance and pleasure; the place of Good Fortune", plainTopic: "romance, hobbies and what makes you happy",
    good: ["A good time for dates, for building a hobby, or for playing with children or young friends.", "Invite someone you like to a film or a meal; it works better than guessing what they think."],
    care: ["Do not overdo the fun, and keep the late-night parties down.", "In love, do not rush for an answer; meet a few more times first."],
  },
  {
    name: "House of Toil", short: "Toil", topic: "illness and labour; the place of Bad Fortune", plainTopic: "your daily workload and small health niggles",
    good: ["A good time to sort out your work routine and fix regular times for exercise and sleep.", "Clear the small chores you have been putting off in one go; you will feel much lighter."],
    care: ["Look after your sleep and food first, and stop when you are tired.", "When a colleague hands you something, ask exactly what is included, and do not take on everything."],
  },
  {
    name: "House of Partnership", short: "Union", topic: "marriage, partners and open opponents", plainTopic: "partners, collaborators and contracts",
    good: ["A good time to discuss cooperation, meet a partner's family, or clear the air in a relationship.", "Sit down with someone important and say plainly what each of you wants."],
    care: ["Read a contract clause by clause before you sign, and ask about anything you are unsure of.", "In a quarrel, pause for ten minutes before you come back to talk."],
  },
  {
    name: "House of Shared Resources", short: "Shared", topic: "other people's money, inheritance and transformation", plainTopic: "money, debts and turning points you share with others",
    good: ["A good time to sort out joint accounts, loans or insurance, the long-term arrangements.", "Letting go of an old habit or relationship that has been draining you brings relief."],
    care: ["Before you lend money or put money into a partnership, write down who is responsible for how much.", "When your mood is low, hold off on big decisions."],
  },
  {
    name: "House of Journeys", short: "Travel", topic: "long journeys, belief and higher learning; the place of God", plainTopic: "long journeys, further study and what you believe",
    good: ["A good time for a long trip, a further-study course, or a book that widens your view.", "If you plan to go abroad, sit an exam or write a paper, it goes more smoothly now."],
    care: ["Leave some slack in your itinerary and do not fill every day.", "Do not be led by one grand-sounding idea; look into it yourself."],
  },
  {
    name: "House of Career", short: "Career", topic: "career, reputation and social standing", plainTopic: "career, position and how your boss sees you",
    good: ["A good time to show your results to your boss, or to take on a project people will see.", "Go ahead with interviews and promotion talks, and prepare three concrete achievements beforehand."],
    care: ["Do not complain in public; raise work disagreements in private.", "Finish the project in hand before you take a new one."],
  },
  {
    name: "House of Friends", short: "Allies", topic: "friends, allies and hopes; the place of the Good Spirit", plainTopic: "friends, contacts and your team",
    good: ["A good time for gatherings and industry events, and for letting friends introduce you to resources.", "Tell trusted friends what you want to do; unexpected help often follows."],
    care: ["Judge friends by what they do, not only by what they say.", "Do what you can for a friend's request, and do not force yourself to agree."],
  },
  {
    name: "House of Hidden Things", short: "Hidden", topic: "hidden matters, solitude and obstacles; the place of the Bad Spirit", plainTopic: "solitude, behind-the-scenes matters and hidden pressure",
    good: ["A good time to sort out your thoughts quietly, prepare behind the scenes, or help someone in need.", "A walk alone or a diary page can help you think through something you have put off for a long time."],
    care: ["If something is on your mind, do not bottle it up; talk to someone you trust.", "Gossip less behind people's backs, and do not trust news with no source."],
  },
];

export const SECT_EN: Record<"day" | "night", Partial<SectInfo>> = {
  day: {
    name: "Day chart",
    text: "You were born with the Sun above the horizon. A day chart takes the Sun as its main light. Jupiter is the benefic that belongs to the day and helps you most; Saturn belongs to the day too, so its harshness is held in check; Mars is \"contrary\" to the day and is the one to watch.",
  },
  night: {
    name: "Night chart",
    text: "You were born with the Sun below the horizon. A night chart takes the Moon as its main light. Venus is the benefic that belongs to the night and helps you most; Mars belongs to the night too, so its harshness is held in check; Saturn is \"contrary\" to the night and is the one to watch.",
  },
};

export const LOT_TEXT_EN = {
  fortune: {
    name: "Lot of Fortune",
    meaning: "The Lot of Fortune is built around the Moon and stands for the body, health and material circumstances: what fate \"delivers into your hands\".",
  },
  spirit: {
    name: "Lot of Spirit",
    meaning: "The Lot of Spirit is built around the Sun and stands for the mind, ambition and choice of work: what you \"set out to do on purpose\".",
  },
};

export const FORTUNE_IN_HOUSE_EN: string[] = [
  "Lot of Fortune in house 1: your luck is tied closely to how you are yourself; look after your body and spirit and good fortune follows.",
  "Lot of Fortune in house 2: your material luck is good, and by building on your own skill and expertise your income can grow steadily.",
  "Lot of Fortune in house 3: good luck often comes through people around you, colleagues, neighbours and everyday talk, so keep talking and moving about.",
  "Lot of Fortune in house 4: home and roots hold you up; property, a settled home and family support are where your good fortune lies.",
  "Lot of Fortune in house 5: joy, romance, creative work and children are where luck most easily favours you.",
  "Lot of Fortune in house 6: your good fortune is hidden in daily work and self-discipline, and a regular life feeds you better than a big chance.",
  "Lot of Fortune in house 7: good luck mostly comes through a partner or collaborators, and a good pairing is your fortune.",
  "Lot of Fortune in house 8: fortune comes from shared resources, gifts from elders and one turning point after another, so learn to borrow strength.",
  "Lot of Fortune in house 9: travel, study and a wider view bring you fortune, and the further you go, the more chances you meet.",
  "Lot of Fortune in house 10: career and reputation are where your fortune lies, and you get more chances than most to be seen and trusted.",
  "Lot of Fortune in house 11: friends and communities are where your fortune lies, and a good circle keeps sending you chances.",
  "Lot of Fortune in house 12: fortune builds up behind the scenes and in solitude, and you have to go looking for it rather than wait for someone to hand it to you.",
];

export const SPIRIT_IN_HOUSE_EN: string[] = [
  "Lot of Spirit in house 1: your ambition and your self overlap closely, so you suit a path where you build a career on who you are and win through personal style.",
  "Lot of Spirit in house 2: what you want to do is tied closely to making a living, and you are good at turning ideas into real income.",
  "Lot of Spirit in house 3: your interests lie in expression, teaching, writing and communication, and information is your tool.",
  "Lot of Spirit in house 4: what you want to hold on to is your foundation: the family estate, land, family heritage, or work carried out at home.",
  "Lot of Spirit in house 5: your ambition carries creativity and warmth, and suits art, entertainment, education and work with children.",
  "Lot of Spirit in house 6: you are willing to put effort into careful work, service and caring for others, and the craftsman's spirit shows clearly.",
  "Lot of Spirit in house 7: your ambition is realised through cooperation and clients, and suits consulting, negotiation and face-to-face work.",
  "Lot of Spirit in house 8: you are drawn to depth, research, finance and matters others entrust to you, and are willing to handle complex situations.",
  "Lot of Spirit in house 9: your ambition lies in far places and in learning, and education, publishing, foreign trade and research all suit you.",
  "Lot of Spirit in house 10: your ambition runs the same way as your career; you naturally want to stand in a public place, and you have the makings of a leader.",
  "Lot of Spirit in house 11: your ambition is realised through teams and contacts, and suits communities, platforms and anything that brings many people together.",
  "Lot of Spirit in house 12: your ambition leans toward the background, concentration and looking inward, and suits research, writing, coaching and work that does not seek the limelight.",
];

export const FORTUNE_PLAIN_EN: string[] = [
  "Your luck is bound up with how you are yourself: when you sleep well and your mood is steady, chances multiply.",
  "Your luck mostly comes from your own skill and expertise, and building income steadily suits you better than betting on a long shot.",
  "Your luck often comes from people around you: an offhand remark from a colleague, neighbour or sibling may be the turning point.",
  "Your luck comes from home and roots: family support and a comfortable place to live become your backbone.",
  "Your luck is hidden in what makes you happy: romance, hobbies and time with children pay back the more you put in.",
  "Your luck comes from self-discipline day after day: a regular routine and careful work feed you better than a big chance.",
  "Your luck often comes through a partner or collaborators: finding a pairing that fits beats going it alone.",
  "Your luck comes from \"other people's resources\": help from elders, shared projects and one turning point after another, so learn to borrow strength.",
  "Your luck lies far away and in learning: get out and about and learn one more thing, and each step brings more chances.",
  "Your luck is bound up with your career: you get more chances than most to be seen and trusted, so do not hide.",
  "Your luck comes from friends and circles: a good circle keeps sending you chances and news.",
  "Your luck is hidden in quiet places: you have to go and find it rather than wait for someone to hand it to you.",
];

export const SPIRIT_PLAIN_EN: string[] = [
  "You suit building a career on \"who you are\": work with a strong personal style, such as your own brand, speaking or leading a team.",
  "You suit work that turns straight into income: a craft, professional services, sales or finance-related roles.",
  "You suit making a living by expression: writing, teaching, media, translation, and roles with a lot of communication.",
  "You suit work that holds on to \"roots\": property, home goods, the family business, or work you can do from home.",
  "You suit fields with creativity and warmth: design, art, entertainment, education and work with children.",
  "You suit careful, service-type work: operations, technical support, quality control and caring for others.",
  "You suit work done face to face: consulting, negotiation, client relations and any career that needs a partner.",
  "You suit work that handles complex situations: finance, research, risk management, and helping people sort out shared accounts.",
  "You suit work tied to far places and learning: education, publishing, foreign trade, research and international business.",
  "You suit work in a public position: management, public service and roles that need someone to lead; you have the makings for it.",
  "You suit work built on teams and contacts: community management, platforms and projects that bring many people together.",
  "You suit work behind the scenes with deep focus: research, writing, coaching; it is not flashy, but you can go very deep.",
];
