import type { WuXing } from "../types";
import type { PlainDayMaster } from "../plain-bazi";

/** English plain-language tables for the 八字 page. Keys match `../plain-bazi.ts`. */

export const PLAIN_DAY_MASTER_EN: Record<string, PlainDayMaster> = {
  甲: {
    image: "a very straight tree with deep roots that keeps reaching upward",
    who: "You have principles and ambition, and you do not bow to please people. In meetings you are often the first to say \"that's not right\". When a friend is in trouble you step up, so the load easily lands on you.",
    work: "You suit leading or planning roles, such as management, education, publishing or architecture. You grow steadier with time, and from your thirties and forties people trust you with more.",
    love: "Once you choose someone, it lasts, but sweet talk does not come easily. A weekly \"thank you for today\" works better than an expensive gift.",
    body: "Long sitting stiffens your neck and shoulders. Stand up and move every hour, and get outdoors at weekends; you will feel much better.",
  },
  乙: {
    image: "a soft vine that does not look strong, yet always finds a crack to grow through",
    who: "You are gentle, careful and good at reading the mood, and you quickly find a comfortable place wherever you go. You avoid head-on clashes, but you are resilient inside. The downside: you worry a lot and can think for a long time without deciding.",
    work: "You suit work that needs taste and communication, such as design, copywriting, customer service, PR or teaching. With a good team, things go much better than alone.",
    love: "You are thoughtful and remember what your partner likes and fears. Watch out for always saying \"anything is fine\" to avoid conflict. If something bothers you, say so the same day.",
    body: "Under stress you sleep badly and lose your appetite. Use your phone less before bed, get sunlight, and do not skip proper meals.",
  },
  丙: {
    image: "the noon sun: you stand out wherever you go without trying",
    who: "You are warm and direct, and you bring energy into a room. You like to help and do not hold grudges. The downside: you are impatient, and when you are too blunt, colleagues can feel hurt.",
    work: "You suit work that faces people, such as sales, hosting, teaching, branding or charity work. Public settings are your home ground; the bigger the audience, the better you shine.",
    love: "You love brightly and openly, with no games. Ask \"what do you think?\" a little more, and your partner will feel more cared for.",
    body: "You tend to stay up late, run hot and sleep late. Put the phone down before 11 pm, drink more water, and pick exercise that makes you sweat.",
  },
  丁: {
    image: "a small lamp at night: its light does not glare, but people near it feel safe",
    who: "You are reserved, focused and attentive to detail. You do not say much, but you put real care into the people and things you value. You overthink easily; one remark can keep you thinking all night.",
    work: "You suit work that needs deep thought and craft, such as research, writing, design, psychology or software. Making fine things quietly is your strength.",
    love: "You love deeply but show it quietly. Do not make your partner guess. Say what you need, so the feeling can flow both ways.",
    body: "You tend to overthink and sleep lightly. A fixed bedtime and no scrolling before sleep matter a lot for you.",
  },
  戊: {
    image: "a calm, solid mountain: few words, yet many people lean on it",
    who: "You are steady and trustworthy; what you promise gets done. People come to you when something happens. The downside: you can be stubborn, and once you have decided, it is hard to talk you round.",
    work: "You suit work built on trust and long-term build-up, such as property, finance, administration or engineering. You are the ballast of the team, and your weight grows over time.",
    love: "You feel solid and safe, if a little short on romance. A small surprise now and then makes your feelings clearer.",
    body: "Your stomach is sensitive to routine and diet. Eat at regular times, avoid overeating, and walk every day.",
  },
  己: {
    image: "soft farmland that quietly feeds everything around it",
    who: "You are careful, patient and modest. You are good at looking after people and at sorting out a mess. The downside: you put others first so often that your own needs come last.",
    work: "You suit careful work such as service, management, logistics, education, finance or HR. You build up step by step through long-term reputation and trust.",
    love: "You are caring and family-minded and give quietly. Remember to say what you hope for too; being loved is not something you should have to put up with.",
    body: "You tire easily and feel heavy. Eat less cold, sweet and greasy food; a walk after meals suits you better than hard exercise.",
  },
  庚: {
    image: "a piece of good steel: not yet polished, already hard and sharp",
    who: "You are determined and decisive, and loyal to friends. Once you set a goal, you cut out every distraction and go straight for it. The downside: you speak bluntly and can come across as too hard.",
    work: "You suit work that needs nerve and drive, such as law, surgery, machinery, finance, sports or hard start-up work. The tougher the situation, the more your value shows.",
    love: "You love decisively, keep promises and dislike beating around the bush. Soften your tone and listen more than you judge, and your partner will find you more reliable.",
    body: "You are always braced. Look after your airways and skin, drink more water when the seasons change, protect your joints when you exercise, and do not push through pain.",
  },
  辛: {
    image: "a polished pearl: smooth, refined and particular about quality",
    who: "You are perceptive, tidy and tasteful, with strong self-respect. You expect a lot of yourself and of others. The downside: you can be picky and remember a small mistake for a long time.",
    work: "You suit precise work that needs expertise, such as design, financial analysis, legal work, branding or art. You win respect through skill and taste.",
    love: "You have standards in love; you warm up slowly but sincerely. Let your partner be \"not quite perfect\", and things get much easier for both of you.",
    body: "When you are tense, your skin, throat and breathing suffer. Keep your space clean, and give your feelings an outlet, such as a journal or a walk.",
  },
  壬: {
    image: "a river rushing to the sea: broad-minded, full of ideas, and hard to fence in",
    who: "You are open-minded, clever, freedom-loving and adaptable, and you get along with all kinds of people. The downside: you change fast and want to do many things at once, and some never get finished.",
    work: "You suit mobile work with a wide view, such as trade, logistics, international business, consulting, media or the internet. The more your surroundings change, the more at ease you are.",
    love: "You are romantic and generous; you need space and good conversation. Give your partner a clear sense of security, so the relationship does not flow away like water.",
    body: "You catch cold easily and your lower back can ache. Stay up less, keep warm and drink warm water.",
  },
  癸: {
    image: "morning dew: quiet and clear, quietly nourishing the people around you",
    who: "You have strong intuition, think deeply and speak gently. You notice feelings people have not put into words. The downside: you think a lot and act slowly, and sometimes caution turns into waiting.",
    work: "You suit work that needs observation and analysis, such as counselling, research, writing, planning or behind-the-scenes management. You spot trends in the details.",
    love: "Your feelings are rich and sensitive, and you value an unspoken understanding. Say what you feel directly, so your thoughts do not turn into fog and your partner can truly come close.",
    body: "Your hands and feet get cold easily and you sleep lightly. Keep warm, soak your feet before bed and keep regular hours.",
  },
};

export const PLAIN_SHISHEN_EN: Record<string, string> = {
  比肩: "You value fairness and like to decide for yourself rather than be told what to do. You do well partnering with like-minded people, but agree on money up front.",
  劫财: "You are daring and loyal, and you spend freely. Before lending to a friend or buying on impulse, wait a day.",
  食神: "You enjoy life, are relaxed and have some artistic flair. Your best ideas come when you feel good, eat well and sleep well.",
  伤官: "You think fast and talk fast, and you dislike doing things by the book. Your ideas are your strength, but arguing with a boss in public costs you; raise objections in private.",
  偏财: "You are sociable and generous, and chances often come through contacts and sudden good news. Income can swing, so keep some money for emergencies.",
  正财: "You are steady, trustworthy and good with numbers, and your income comes from consistent effort. You do well sticking with one thing for the long run.",
  七杀: "You have nerve; the more pressure, the more you rise to it, and you often get sent to solve hard problems. Do not push yourself too hard; let the people around you share the load.",
  正官: "You are upright, care about your reputation and keep the rules, so bosses and organisations trust you easily. The downside: you care too much about how others see you.",
  偏印: "Your ideas are unusual, you like niche subjects and work by inspiration, and you can seem a loner. Talking with one or two people who understand you will make life lighter.",
  正印: "Elders or teachers who want to help you tend to turn up, and you love to learn. Watch out for dependence: when a decision is yours, do not keep waiting for a push.",
};

export const PLAIN_EXCESS_EN: Record<WuXing, string> = {
  木: "Your \"urge to grow\" is very strong: lots of ideas and strong opinions, and you start many things at once. Finish one thing each month before you start the next.",
  火: "Your \"heat\" runs very high: quick to react, eager to charge in, and your feelings flare fast. Wait ten minutes before an argument or an important reply.",
  土: "Your \"steadiness\" is very heavy: slow to warm up, attached to what you know, and you can miss change. Try one new thing every season.",
  金: "Your \"sense of rules\" is very strong: high standards and efficiency, and you can be picky with yourself and others. Leave a little more room for small details.",
  水: "Your \"stream of thought\" is very full: deep but scattered, and you can lie awake at night. Write down what is on your mind before you turn off the light.",
};

export const PLAIN_LACK_EN: Record<WuXing, string> = {
  木: "You are a little short on \"stretch\": you hesitate and find it hard to start. A five-minute first step works better than waiting until you feel ready.",
  火: "You are a little short on \"heat\": you keep a low profile and do not like to show yourself. Start one get-together a week, or say one more thing in meetings.",
  土: "You are a little short on \"stability\": you drift and lack a steady rhythm. Start by fixing the times you get up and eat.",
  金: "You are a little short on the power to \"close\": starting is easy, finishing and saying no are hard. Practise saying \"I can't take this on\".",
  水: "You are a little short on \"buffer\": you rarely stop to rest and think. Keep ten minutes a day for doing nothing at all.",
};

export const PLAIN_ELEMENT_HELP_EN: Record<WuXing, string> = {
  木: "spend time in parks or on hills, keep some plants, and set yourself a small goal for learning or growth",
  火: "get sunshine, see friends often and keep exercising, to keep a little \"heat\" in your life",
  土: "sort out your routine, your budget and your home, and do things that build up slowly",
  金: "tidy your desk and your plans, set deadlines, and practise one solid skill",
  水: "keep quiet time alone, drink more water, read more, and relax near water",
};

export const PLAIN_DAYUN_EN: Record<"同" | "生我" | "我生" | "我克" | "克我", string> = {
  同: "more peers and partners around you; chances come mostly through contacts, but so does competition, so plan your spending.",
  生我: "support comes more easily, from elders, teachers and chances to learn. A good time to study, get certified and recharge.",
  我生: "a time to put things out: speaking, creating, running projects, and showing people what you can do.",
  我克: "more about money, resources and new chances. People who act will gain, but do not spread yourself too wide at once.",
  克我: "responsibility and pressure weigh more, but it is also a time to be seen and trusted with bigger tasks. Take it step by step and do not just grit your teeth.",
};

export const PLAIN_TAISUI_EN: Record<string, string> = {
  "值太岁（本命年）": "This is your own zodiac year, so expect more change and ups and downs. Do not rush big decisions; keep daily life steady first.",
  冲太岁: "This year brings change, such as a new job or a move. Change is not always bad; arranging it yourself beats having it happen to you.",
  害太岁: "Small misunderstandings come easily this year. Put important things in writing and rely less on messages passed along by others.",
  六合太岁: "People like you this year, and partnerships and love can bring good news. Get out and meet people.",
  三合太岁: "You have a tailwind this year, a good time to restart a plan you put aside.",
  平和之年: "This year has no special ups or downs. Just follow your plan.",
};
