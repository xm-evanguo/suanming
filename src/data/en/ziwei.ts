import type { Brief } from "../types";
import type { PlainStar } from "../plain-ziwei";

/** English text for the 紫微斗数 tables in `../ziwei.ts` and `../plain-ziwei.ts`. Keys are the Chinese names. */

export const MAJOR_STARS_EN: Record<string, Partial<Brief>> = {
  紫微: {
    name: "Zi Wei",
    keywords: ["noble", "leader", "proud", "organiser"],
    text: "With Zi Wei, the Emperor star, in your Life palace, you carry yourself with poise and natural authority, and you want everything done with scope and dignity. You are good at seeing the whole picture and easily attract people who want to follow you. Watch your pride, which can make you seem aloof; listening to others makes your light warmer.",
  },
  天机: {
    name: "Tian Ji",
    keywords: ["clever", "strategic", "changeable", "studious"],
    text: "With Tian Ji, the Strategist, in your Life palace, your mind is nimble and full of ideas; you analyse and plan well and are a born adviser. You are very curious and learn fast, but you can also think too much and change course too often. Turn cleverness into expertise and add a little more resolve, and your strategy will carry more weight.",
  },
  太阳: {
    name: "Tai Yang",
    keywords: ["bright", "warm", "giving", "renowned"],
    text: "With Tai Yang, the Sun, in your Life palace, you are open and generous, warm and outgoing, like a light source happy to give to others. You care about your name and your loyalty, and you shine in public. You worry too much and often overwork; leave yourself room to rest and be looked after.",
  },
  武曲: {
    name: "Wu Qu",
    keywords: ["resolute", "practical", "wealth star", "decisive"],
    text: "With Wu Qu, the General, in your Life palace, you are firm, decisive, practical and efficient. It is the wealth star of Zi Wei Dou Shu, with a natural feel for money and resources. You act strongly and go all out once you have a goal. You speak bluntly and can seem cool in love; a little more softness makes your relationships smoother.",
  },
  天同: {
    name: "Tian Tong",
    keywords: ["gentle", "blessed", "easy-going", "content"],
    text: "With Tian Tong, the Harmony star, in your Life palace, you are good-natured and content, with a childlike innocence and good fortune, and you enjoy life's small pleasures. You dislike competing and get along with everyone. At times you lack drive and settle for things as they are; set yourself goals so your good fortune turns into achievement.",
  },
  廉贞: {
    name: "Lian Zhen",
    keywords: ["intense", "complex", "principled", "charismatic"],
    text: "With Lian Zhen, the Integrity star, in your Life palace, you have a vivid personality and strong feelings, both rational and emotional, with firm principles and real charm. You take clear stands and give yourself fully to love and work. There is a lot of inner conflict and swing; learn to channel your feelings, and your talent will bloom steadily.",
  },
  天府: {
    name: "Tian Fu",
    keywords: ["steady", "keeper", "treasury", "tolerant"],
    text: "With Tian Fu, the Treasury star, in your Life palace, you are calm and solid, good at running things and keeping what you have built, and you like security and order. You are generous with people and know where the limits are, so others trust you. You lean conservative and avoid risk, and can miss chances when things change; trying something new now and then helps.",
  },
  太阴: {
    name: "Tai Yin",
    keywords: ["gentle", "delicate", "prosperous", "reserved"],
    text: "With Tai Yin, the Moon, in your Life palace, you are soft and delicate like moonlight, rich in feeling with a fine sense of beauty, good at caring for people and at building up resources. You prefer quiet surroundings and a stable life, and your inner world runs deep. You are sensitive and can sink into low moods; keep regular hours and get more sunshine.",
  },
  贪狼: {
    name: "Tan Lang",
    keywords: ["versatile", "desire", "charm", "social"],
    text: "With Tan Lang, the Wolf, in your Life palace, you are multi-talented and sociable, with a strong appetite for new things and good living; it is called the star of romance and desire. You are full of charm and adapt well, with something to say in any setting. Your interests sprawl and you can be fickle; choose one or two things to go deep, and your talent becomes real strength.",
  },
  巨门: {
    name: "Ju Men",
    keywords: ["eloquent", "probing", "questioning", "controversy"],
    text: "With Ju Men, the Great Gate, in your Life palace, you speak well, analyse sharply and keep asking until you reach the truth and the details. You suit work that lives on words, research and expertise. Your questioning and plain speaking can invite misunderstanding and gossip; say things gently, and your insight will be easier to accept.",
  },
  天相: {
    name: "Tian Xiang",
    keywords: ["supportive", "fair", "steady", "thoughtful"],
    text: "With Tian Xiang, the Minister, in your Life palace, you are thoughtful, fair and dignified, a natural aide and coordinator who values courtesy and tact. You like to help others succeed and are happy to be the reliable centre of a team. At times you think so much about the whole that you hold back your own view; stating your position makes you steadier.",
  },
  天梁: {
    name: "Tian Liang",
    keywords: ["sheltering", "steady", "helpful", "mature"],
    text: "With Tian Liang, the Sage, in your Life palace, you are mature and steady with the air of an elder. It is called the shelter star: helpers often appear, and you like to look after others. You are upright and good at solving problems. At times you can sound preachy or out of step; a little more lightness and play makes your wisdom more approachable.",
  },
  七杀: {
    name: "Qi Sha",
    keywords: ["bold", "independent", "charging", "nerve"],
    text: "With Qi Sha, Seven Killings, in your Life palace, you are bold, fierce and independent, like a general leading the charge, daring and unafraid of challenge. Your life has more ups and downs than most, and that has made you tough. You are blunt and slow to bow; learn to borrow other people's strength, and your road will be steadier.",
  },
  破军: {
    name: "Po Jun",
    keywords: ["reform", "breakthrough", "change", "pioneer"],
    text: "With Po Jun, the Army Breaker, in your Life palace, you dare to tear down and rebuild, with a strong drive to innovate. You are never content with the status quo and often find new life in change. Your life has many turns, but you also have the courage to start over. Impulse and a destructive streak can burn through your resources; always leave some room.",
  },
};

export const PALACE_INFO_EN: Record<string, string> = {
  命宫: "governs your inborn character, temperament and the basic course of your life; it is the core of the whole chart.",
  兄弟: "governs your ties with siblings, peers and business partners, and shows the help you get from people.",
  夫妻: "governs marriage, romance and your partner's nature, and shows how you love and how you relate up close.",
  子女: "governs your bond with children and younger people, and also creativity and romantic luck.",
  财帛: "governs how you earn, how you think about money and how strong your wealth luck is.",
  疾厄: "governs your health, your weak spots and the problems you are prone to, and also inner stress.",
  迁移: "governs luck away from home, how you deal with the outside world, your public image and chances elsewhere.",
  仆役: "governs help from friends, colleagues and staff, and what you gain or lose through people.",
  官禄: "governs your career direction, growth at work and ability, and shows achievement and status.",
  田宅: "governs property, your living environment and household luck, and shows your family base and assets.",
  福德: "governs your inner world, contentment and blessings, and shows the quality of your inner life and enjoyment.",
  父母: "governs your ties with parents, elders and bosses, and also study, documents and appearance.",
};

export const MUTAGEN_EN: Record<"禄" | "权" | "科" | "忌", Partial<Brief>> = {
  禄: {
    name: "Hua Lu",
    keywords: ["blessing", "opportunity", "ease", "income"],
    text: "Hua Lu brings blessing and opportunity: the star it touches brings goodwill, income and smooth going, and help comes easily, though watch out for wanting too much.",
  },
  权: {
    name: "Hua Quan",
    keywords: ["control", "drive", "leadership", "nerve"],
    text: "Hua Quan brings power and drive: the star it touches becomes stronger and more assertive, good for winning achievement and a voice, though guard against stubbornness and forcing things.",
  },
  科: {
    name: "Hua Ke",
    keywords: ["reputation", "helpers", "reason", "refinement"],
    text: "Hua Ke brings reputation, learning and helpers: the star it touches gains refinement and a good name, and someone tends to step in when trouble comes.",
  },
  忌: {
    name: "Hua Ji",
    keywords: ["fixation", "obstruction", "worry", "lesson"],
    text: "Hua Ji brings fixation and obstruction: the area of the star it touches tends to bring trouble, worry or setbacks. It is a life lesson that needs care, and seeing it differently can turn it into depth.",
  },
};

export const EMPTY_SOUL_TEXT_EN =
  "Your Life palace has no major star, called \"a life without main stars\", so the stars of the opposite palace (Travel) are borrowed. People like this are very adaptable and shaped by their surroundings and experiences, both accepting and changeable; meeting many kinds of people and things lets you live a uniquely rich life. ";

export const PLAIN_STARS_EN: Record<string, PlainStar> = {
  紫微: {
    trait: "an air of dignity, scope and organisation",
    who: "You have a presence that makes people want to follow, and you want things done with dignity and scope. You are good at organising, but your pride runs strong, and being contradicted in public really stings.",
    work: "You suit leading: running projects, managing teams, making decisions. Bosses and clients value your steadiness. Listen more to the people under you, and do not make every call yourself.",
    money: "You earn through standing and vision, and you are willing to spend for dignity. Watch out for spending on appearances.",
    love: "You want a partner who respects you and earns your respect. Let go a little of wanting to be put on a pedestal, and love will feel warmer.",
    recharge: "being respected and having orderly surroundings",
    tip: "Once a week, ask a friend who will tell you the truth what they think of your decisions.",
  },
  天机: {
    trait: "a quick, planning mind",
    who: "You have lots of ideas, react fast and learn quickly; you are the one others see as the strategist. The downside: you think a lot and change a lot, and often switch direction halfway through a plan.",
    work: "You suit work that needs analysis, planning and research, such as consulting, product, tech or operations. Get each project to a milestone before you switch; do not quit halfway.",
    money: "You earn with your head; information and skills are your capital. Do not put money into anything you have not studied properly.",
    love: "You like people you can really talk to and need mental stimulation. Do not overthink in love; if you have a question, just ask.",
    recharge: "reading, learning something new or a change of scene",
    tip: "Keep to three plans at most at a time, each with a finish date.",
  },
  太阳: {
    trait: "warm-hearted generosity",
    who: "You are open and generous and like to help; you think of others first. You care a lot about your reputation and often worry too much and wear yourself out.",
    work: "You suit public-facing work with influence, such as education, media, charity or management. The more you are trusted, the more you shine.",
    money: "You do not care much about small sums and care more about whether the work means something. Remember to keep some savings for yourself.",
    love: "You give a lot and ask for little back. But say what you need, so your partner has a chance to look after you too.",
    recharge: "sunshine, a good sweat, or being sincerely thanked",
    tip: "Keep half a day each week just for yourself and take no requests.",
  },
  武曲: {
    trait: "practical, decisive, efficient style",
    who: "You act decisively, care about results and have a keen sense of money and resources. Once you set a goal, you carry it through. You speak bluntly, and people sometimes find you a little cold.",
    work: "You suit results-driven work such as finance, banking, engineering or running a business. You can break complex things into steps that get done. In meetings, ask \"What do you think?\" and the team will rally behind you more.",
    money: "You have an inborn feel for money, keep good accounts and are good at building up. Just do not treat everything as a business deal.",
    love: "You are practical in love and show it through action. A soft word now and then works better than ten gifts.",
    recharge: "finishing something concrete, or exercising alone",
    tip: "Each week, give the person closest to you a word of praise or thanks.",
  },
  天同: {
    trait: "easy-going contentment and a knack for enjoying life",
    who: "You are mild-tempered, easily content and enjoy everyday life. You do not like to compete and get along with everyone. The downside: you settle for things as they are and put things off unless someone pushes.",
    work: "You suit stable, relaxed settings such as service, education, creative work or administration. Give yourself small goals with deadlines, so your good fortune turns into results.",
    money: "You do not stress about money, and your income tends to be steady. An automatic monthly transfer to savings works better than willpower.",
    love: "You are gentle and easy-going in love and dislike arguments. Do not bottle up complaints; say them gently, and your partner will understand.",
    recharge: "a good meal, a good night's sleep and time with people you like",
    tip: "Pick something you have wanted to do for ages and spend ten minutes on it today.",
  },
  廉贞: {
    trait: "clear principles and strong feelings",
    who: "You have your own principles and strong feelings, both rational and emotional, with a memorable charm. Your inner ups and downs are bigger than they look from outside.",
    work: "You suit work that needs a stance and nerve, such as legal work, management, marketing or art. You throw yourself into your work; just watch out for locking horns with colleagues.",
    money: "You spend on what you care about and earn through commitment and expertise. Before a big purchase, give yourself a day to cool down.",
    love: "You love wholeheartedly and want your partner to be just as serious. When you are upset, say \"I'm having a hard time right now\" instead of going silent.",
    recharge: "writing things down, exercise, or hands-on work",
    tip: "When your feelings are at their peak, step away for ten minutes before you respond.",
  },
  天府: {
    trait: "steadiness, good management and a need for security",
    who: "You are calm and kind, good at running things, and value security and order. People trust you because you know where the lines are. The downside: you lean conservative and avoid risk.",
    work: "You suit work that needs steady management, such as finance, administration, operations or property. You are good at protecting results. Trying a small new project now and then keeps you lively.",
    money: "You can save and you can keep what you save. Steady saving suits you, but do not freeze completely out of fear of risk.",
    love: "You are responsible in love and give a sense of security. A little more romance helps, even just a date somewhere new.",
    recharge: "a tidy home and a regular life",
    tip: "Try one new thing each season, even if it is just a new restaurant.",
  },
  太阴: {
    trait: "delicate, quiet and good at building up",
    who: "You are gentle and sensitive, rich in feeling, with good taste. You like a quiet, stable life, and your inner world runs deep. The downside: you are sensitive and can sink into low moods.",
    work: "You suit work that needs care and an eye for beauty, such as design, finance, education, nursing or behind-the-scenes planning. Patience and steady build-up bring your results.",
    money: "You save well and are happy to spend on quality of life. Keeping accounts helps you feel secure.",
    love: "You are tender and attentive in love and worry about your partner's moods. Say your worries out loud instead of making them guess.",
    recharge: "time alone, quiet evenings, or being close to nature",
    tip: "Keep a fixed bedtime, and avoid news that makes you anxious before sleep.",
  },
  贪狼: {
    trait: "many talents, many friends and a wish to try everything",
    who: "You are charming, love making friends and have many interests; you always have something to talk about. You have a big appetite for new things. The downside: you can be fickle and want everything.",
    work: "You suit work that needs contacts and ideas, such as sales, PR, entertainment, social media or start-ups. Going deep in one or two things gets more results than dabbling in all.",
    money: "Chances come often, and so does spending. Save part of what you earn first, then enjoy the rest.",
    love: "You are popular and have many romantic chances. If you want it to last, show commitment through what you do, so your partner never feels unsure.",
    recharge: "meeting new people and trying new things",
    tip: "Each month, pick just one new interest to go deep on and set the rest aside.",
  },
  巨门: {
    trait: "a love of analysis, a way with words and a habit of asking why",
    who: "You speak well, love to analyse and ask until you get to the bottom of things. You see problems others miss. The downside: when you speak bluntly, people may feel you are nitpicking.",
    work: "You suit work built on words and expertise, such as law, teaching, journalism, research or training. When you give feedback, start with the strengths before the problems, and people will listen.",
    money: "You earn through expertise and speaking. Reading contract terms twice is your strong suit.",
    love: "You value communication, but arguments can turn into debates. When things heat up, ask: \"Do you want me to listen, or to help you solve it?\"",
    recharge: "quiet reading and deep talks with people you click with",
    tip: "Before you say something important, ask yourself: is this helping, or is it nitpicking?",
  },
  天相: {
    trait: "thoughtfulness, fairness and a gift for coordination",
    who: "You are thorough, fair and good at bringing people together. With you on the team, things stay calm. The downside: thinking of the whole, you often keep your own view to yourself.",
    work: "You suit roles as a coordinator, assistant, HR person or adviser. You are the one who keeps a team running smoothly. Make sure your boss sees your contribution.",
    money: "You manage money soundly and are willing to spend on friends. Do not lend money just because you find it hard to say no.",
    love: "You are considerate and polite and mind your partner's feelings. Saying \"this is what I want\" now and then makes the relationship more equal.",
    recharge: "putting things in good order, or helping someone",
    tip: "Say what you really think at least once a day, even about something small.",
  },
  天梁: {
    trait: "steadiness and an elder-like care for others",
    who: "You are mature and steady, like a reliable older sibling; you like looking after people and you have ideas when trouble comes. You are upright, and a little prone to lecturing.",
    work: "You suit work that helps others, such as education, healthcare, law, counselling or charity. Seniors who want to bring you along tend to appear.",
    money: "Your money comes through reputation and helpers, not risk. Do not guarantee loans or lend money just out of kindness.",
    love: "You look after your partner like someone in your care, and sometimes sound like a parent. A few more jokes and a lighter touch make love more fun.",
    recharge: "quiet time after helping someone, or talking with older friends",
    tip: "Before giving advice, ask: \"Do you want advice?\"",
  },
  七杀: {
    trait: "boldness, daring and calm under pressure",
    who: "You are bold, independent and quick to charge; the more pressure, the more energy you have. Your road has had more ups and downs than most, and it has made you tough. The downside: you are blunt and slow to bow.",
    work: "You suit work that needs someone to lead the charge, such as start-ups, sales, hard projects, sports or crisis handling. With a team behind you, you can go further.",
    money: "You dare to invest and to take risks. Keep part of your money in an account you never touch; it is your backbone.",
    love: "You are direct in love and do not beat around the bush; when you like someone, you act. When your partner feels pressured, slow down half a step, and the relationship gets steadier.",
    recharge: "hard exercise and time alone",
    tip: "When you disagree, hear the other person out before deciding whether to push back.",
  },
  破军: {
    trait: "a drive to break through, start over and leave the old behind",
    who: "You refuse to stay the same and dare to tear down and rebuild, with the courage to start over. Your life has more turning points than most. The downside: in impulsive moments, you burn through your own resources.",
    work: "You suit work that needs innovation and reform, such as start-ups, transformation projects, design or new ventures. Before a big move, keep some money and time in reserve as a way back.",
    money: "Your finances may swing quite a lot. Before major spending, leave yourself a way out.",
    love: "In love you dare to commit and dare to end things, and there is a lot of change. When problems come, do not rush to call it over; talk first.",
    recharge: "making a change: a new setting, clearing out old things, starting a new plan",
    tip: "Before a major change, write down the worst case and your way back.",
  },
};

export const PLAIN_PALACE_AREA_EN: Record<string, string> = {
  命宫: "your personality",
  兄弟: "siblings and friends your age",
  夫妻: "love and your partner",
  子女: "children and creativity",
  财帛: "earning and spending",
  疾厄: "your body and stress",
  迁移: "going out and your public image",
  仆役: "friends and colleagues",
  官禄: "career and work",
  田宅: "home and property",
  福德: "inner contentment",
  父母: "parents, elders and bosses",
};

export const PLAIN_MUTAGEN_EFFECT_EN: Record<"禄" | "权" | "科" | "忌", string> = {
  禄: "your {t} brings chances and goodwill more easily, so go ahead and say your ideas out loud.",
  权: "your {t} stands out more, and you want to make your own calls and take responsibility. Before you decide, hear out the people around you.",
  科: "you tend to have a good name, and people are willing to help when things happen. When you need help, ask.",
  忌: "you tend to brood, even pushing on while saying you are fine. When you are tired or upset, say so early and rest early; do not wait until you cannot hold on.",
};

export const PLAIN_EMPTY_SOUL_EN =
  "Your core position has no clear main star, so your style is shaped more by your surroundings and the people around you. That makes you very adaptable: in a different setting, you become a different version of yourself. The description below draws on the opposite position. ";
