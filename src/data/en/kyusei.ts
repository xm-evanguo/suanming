import type { NineStar } from "../kyusei";

/** English texts for 九星気学. Index and keys match `../kyusei.ts` and `../plain-kyusei.ts`. */

export const NINE_STARS_EN: Partial<NineStar>[] = [
  {
    name: "1 White Water",
    title: "The flowing sage of the deep pool",
    keywords: ["flexible", "calm", "adaptable", "perceptive", "patient"],
    summary: "Like water you take the shape of whatever holds you: calm on the surface, with deep currents below, good at reading a situation without showing it.",
    personality:
      "1 White Water people are like a deep pool: mild and low-key outside, with rich feelings and sharp intuition inside. You listen well and know how to go with the flow; when you meet an obstacle you do not ram it, you quietly go around. Sometimes you hide your thoughts so deep that the people around you cannot read you.",
    career: "You suit fields that need patience and insight, such as research, consulting, trade, media and behind-the-scenes planning. You are good at finding chances in change, and long-term plans suit you better than short sprints.",
    love: "In love you value a meeting of minds; you dislike loud declarations and prefer something quiet and lasting. Try saying your thoughts out loud, so your partner does not get lost in your silence.",
    health: "Water rules the kidneys and urinary system; mind your back, keep warm and protect your sleep. Avoid long stretches of late nights, and let your body flow with a steady rhythm like water.",
    advice: "Write down or say the thoughts you keep hidden; only moving water stays fresh.",
    luckyColors: ["black", "deep blue"],
  },
  {
    name: "2 Black Earth",
    title: "The guardian of the deep soil",
    keywords: ["grounded", "accepting", "hard-working", "patient", "family-minded"],
    summary: "Like the earth, solid and gentle, you quietly carry everything and are the steadiest base in any team or family.",
    personality:
      "2 Black Earth people are plain and steady, take one step at a time and never brag about what they give. You are a natural at looking after others and can put messy affairs in good order. At times you are so used to giving way that your own needs come last.",
    career: "You suit work that needs steady tending, such as administration, education, agriculture, property, nursing and logistics. You are a reliable doer, and your value grows the more you build up.",
    love: "You are faithful and attentive in love and happy to take care of the details of daily life. Let your partner know your needs too; the one who looks after others deserves looking after.",
    health: "Earth rules the stomach and spleen, so keep regular meals and look after your digestion. Do not skip rest because of worry; moderate exercise keeps you lighter.",
    advice: "You do not have to carry everything. Learn to ask for help; even the earth needs rain.",
    luckyColors: ["yellow", "beige"],
  },
  {
    name: "3 Jade Wood",
    title: "The pioneer woken by spring thunder",
    keywords: ["action", "youthful energy", "innovation", "frankness", "drive"],
    summary: "Like a sprout breaking the soil and spring thunder, you are full of drive and the urge to express yourself, always first to rush at something new.",
    personality:
      "3 Jade Wood people are warm and frank, think fast and act at once. You hate dawdling and like to light up a room with your voice and energy. Your heat comes fast and can fade before the job is done, so your drive needs a little patience.",
    career: "You suit media, performance, sales, start-ups, music and new technology. You are good at launching and building buzz; a partner who helps you finish makes it complete.",
    love: "You show love openly and directly and may well fall at first sight. Slowing down to learn your partner's rhythm avoids a letdown after the first rush.",
    health: "Wood rules the liver, gallbladder and nerves, and impatience makes you run hot. Stretch more and keep regular hours, so the thunder does not keep rolling inside you.",
    advice: "Before each start, ask \"and then what?\", so your drive turns into fruit.",
    luckyColors: ["cyan green", "sky blue"],
  },
  {
    name: "4 Green Wood",
    title: "The messenger who travels with the wind",
    keywords: ["gentle", "sociable", "trustworthy", "supple", "far-travelling"],
    summary: "Like a breeze through the woods, gentle and good at communicating, you carry bonds in every direction on the strength of your word and reputation.",
    personality:
      "4 Green Wood people are friendly and polite, good at building bridges between people. You value your reputation and do your best to keep promises, but big choices make you hesitate and you can be blown about by everyone's opinions.",
    career: "You suit trade, travel, diplomacy, PR, logistics and education. Your network is your capital, and the more it crosses regions and circles, the better you do.",
    love: "You are gentle and caring with plenty of romantic chances, but you can waver when choosing. Follow the one who makes your heart feel most settled, not the one who makes the most noise.",
    health: "Wood brings wind; watch for minor breathing and stomach troubles. Walks outside and fresh air do you a lot of good.",
    advice: "The wind may go anywhere, but it needs a weather vane of its own.",
    luckyColors: ["light green", "white"],
  },
  {
    name: "5 Yellow Earth",
    title: "The emperor star at the centre",
    keywords: ["leader", "resilient", "extreme", "renewal", "nerve"],
    summary: "Standing at the centre of the nine palaces with a powerful presence, you have the strength to create and the resolve to tear down and rebuild.",
    personality:
      "5 Yellow Earth people carry a regal air, with a firm will that refuses to drift with the crowd. Your life tends to have clear highs and lows, and you are good at fighting back from the bottom. Your strong opinions can pressure the people around you; a little softness doubles your charm.",
    career: "You suit management, start-ups, investment, turnarounds and crisis work. You have the nerve to lead a team through storms, and the harder the situation, the more you show your true colours.",
    love: "In love you are both possessive and responsible; you love deeply and want a lot. Let go of control and give each other space, and the relationship will last.",
    health: "Your energy is strong but easily overspent; watch your digestion and stress-related illness. After big decisions, give yourself a quiet spell to recover.",
    advice: "A true ruler knows how to delegate, and how to bow at the right moment.",
    luckyColors: ["golden yellow", "brown"],
  },
  {
    name: "6 White Metal",
    title: "The keeper of order high in the heavens",
    keywords: ["upright", "authority", "responsibility", "ambition", "principle"],
    summary: "As high and wide as the sky, you value rules and honour and carry a natural dignity that wins trust.",
    personality:
      "6 White Metal people have strong self-respect, act on principle and have a strong sense of duty and ambition. You are willing to take responsibility and expect respect in return. When you chase perfection too hard you can seem stern or distant; letting your guard down now and then makes you warmer.",
    career: "You suit public service, law, finance, management, aviation and large institutions. You do well making decisions from a high position and rising steadily, and mentors tend to appear.",
    love: "You keep your promises in love and take the person you choose seriously to the end. Try replacing \"should\" with \"want\", and closeness becomes easier.",
    health: "Metal rules the lungs and head; mind your airways, head and neck, and overwork. Tight nerves need regular release, and regular exercise is good medicine.",
    advice: "Keep your pride, and keep a sense of humour too; it is lonely at the top, but laughter keeps it warm.",
    luckyColors: ["white", "gold"],
  },
  {
    name: "7 Red Metal",
    title: "The socialite with a voice like golden bells",
    keywords: ["charm", "eloquence", "pleasure", "taste", "joy"],
    summary: "Like golden bells in autumn, you carry joy and charm, know how to enjoy life and make the people around you happy.",
    personality:
      "7 Red Metal people are cheerful, witty and well spoken, with a natural nose for good food, art and beautiful things. You can lighten any room in a moment, but at times you overspend or overpromise on a whim; your fun needs some limits.",
    career: "You suit food and drink, art, sales, hosting, financial services and entertainment. Your way with words and warmth are your core assets, and your good name brings you chances.",
    love: "You attract admirers easily and know how to create romance. A truly lasting relationship needs more steadiness and commitment beyond the fun.",
    health: "Metal rules the mouth and lungs; watch for overeating and throat and mouth problems. Amid the fun, keep regular hours.",
    advice: "Bank some of your laughter, and save some of your enthusiasm for your future self.",
    luckyColors: ["gold", "pink"],
  },
  {
    name: "8 White Earth",
    title: "The saver who stands still as a mountain",
    keywords: ["steady", "firm", "accumulation", "change", "keeping"],
    summary: "Like a mountain standing still, steady and resolute, you are good at building up over the long run and can also bring a turn at key moments.",
    personality:
      "8 White Earth people are reserved and solid, slow to take a stand and hard to move once decided. You value family assets and heritage and are good at building resources bit by bit. Stubbornness can make you miss chances to adapt; listening to different voices makes you steadier.",
    career: "You suit property, warehousing, finance, traditional industries, consulting and family businesses. You play the long game, and time compounds your gains.",
    love: "You warm up slowly in love but are loyal, and once you commit you protect it wholeheartedly. Do not keep the door of your heart shut too tight; taking the first step now and then brings a lot of warmth.",
    health: "Earth rules the stomach and spleen; also mind your joints, back and hands. Long sitting stiffens the mountain, so stretching matters.",
    advice: "The mountain does not move because its roots are deep, but leave a path so the wind and guests can come up.",
    luckyColors: ["white", "cream yellow"],
  },
  {
    name: "9 Purple Fire",
    title: "The lamp hanging in the night sky",
    keywords: ["passion", "talent", "intuition", "renown", "brightness"],
    summary: "Like blazing fire and a bright lamp, you light up others and draw the eye, overflowing with talent and fiery feeling.",
    personality:
      "9 Purple Fire people are bright and perceptive, with artistic sense and insight; you want to be seen and are willing to shine. Your feelings come and go fast, and you can swing between passion and exhaustion. Learn to control the heat, and your light will last.",
    career: "You suit design, art, media, education, consulting, beauty and academic research. Your talent and charm easily bring fame; staying focused matters more than lighting fires everywhere.",
    love: "You love passionately and want passion back. Leave a cool buffer in your relationship, so a moment's impulse does not burn you both.",
    health: "Fire rules the heart and eyes; watch your heart and blood vessels, your eyesight and mood swings. Calm and some empty space in your schedule do you particular good.",
    advice: "Be a steady lamp, not a firework that dazzles for a moment.",
    luckyColors: ["purple", "red"],
  },
];

export const MONTH_STAR_TEXT_EN: Record<number, string> = {
  1: "your inner self is like still water: your feelings are fine and sensitive, you turn things over again and again when no one is around, and you need time alone to recharge.",
  2: "your inner self is soft and practical; you long for stability and belonging, and looking after others is how you feel safe.",
  3: "inside you lives an adventurous child: your feelings are direct and quick, and when something new comes along you want to try it at once.",
  4: "your inner self is gentle and considerate; you care how others feel and what they think, and often weigh \"should I or shouldn't I\" back and forth.",
  5: "your inner self is strong and stubborn, with a line you will not let anyone push you past; your moods hit like a storm, and afterwards you regroup quickly.",
  6: "your inner self is disciplined and proud; you are strict with yourself and want to do the right thing and be someone worthy of respect.",
  7: "your inner self loves beauty and company; you want to be admired and loved, you glow when happy, and alone you are secretly afraid of loneliness.",
  8: "your inner self is steady and stubborn, your thoughts kept deep; once decided you rarely change, and you treasure a sense of security.",
  9: "your inner self is fiery and sensitive; ideas spark like flames, your moods are bright and changeable, and you long to express yourself and be understood.",
};

export const PLAIN_KYUSEI_YEAR_EN: Record<string, string> = {
  中宫: "This year is like standing at a crossroads, with everything at a turning point. Good for sorting out, settling and cutting back; not for impulsive big decisions.",
  北: "This year is on the quiet side, a year to gather strength. Good for learning, planning and saving, laying the base for the next climb.",
  西南: "This is a year of tilling the soil. Work steadily; what you put in now will become results next year.",
  东: "This is a year of sprouting. New ideas and plans will pop up; try them boldly and you will get a response.",
  东南: "This year, contacts and trust matter most. News from afar, partnerships and romance take shape easily, and keeping your word earns points.",
  西北: "This year your responsibility and position rise, a good time to show leadership. Take on a bit more, and do not forget to save time for family.",
  西: "This is a year of harvest and socialising, with money and friendships both lively. Watch out for having so much fun that you overspend.",
  东北: "This year brings many changes; work, home or mindset may need rearranging. Treat it as a tidy-up rather than a mess.",
  南: "This year you stand out; your talent is easily seen and your name rises. Choose your words with care to avoid needless gossip.",
};

export const PLAIN_KYUSEI_THEME_EN: Record<string, string> = {
  中宫: "sorting out and settling",
  北: "gathering strength and learning",
  西南: "tilling the soil",
  东: "sprouting and trying",
  东南: "contacts and trust",
  西北: "responsibility and leadership",
  西: "harvest and socialising",
  东北: "change and rearranging",
  南: "being seen",
};

export const PALACE_YEAR_TEXT_EN: Record<string, string> = {
  中宫: "Your natal star returns to the centre, the once-in-nine-years \"blocked on all sides\" year: everything is at a turning point. Good for reorganising and settling; not for rushing ahead.",
  北: "It falls in the Kan palace, a year of lying low and gathering strength. Good for learning and planning, laying the base for the next rise.",
  西南: "It falls in the Kun palace, a year of tilling. Work with your feet on the ground, and the sweat will turn into fruit the year after next.",
  东: "It falls in the Zhen palace, a year of sprouting. New plans and ideas spring up, and bold action gets a response.",
  东南: "It falls in the Xun palace, a year of trust and contacts. News from afar, partnerships and marriage take shape easily.",
  西北: "It falls in the Qian palace, a year of reaching the top. Responsibility and status rise, a good time to show leadership.",
  西: "It falls in the Dui palace, a year of harvest and joy. Money and social life are lively; take care that fun does not turn into waste.",
  东北: "It falls in the Gen palace, a year of change. Work, home or mindset will be reorganised once.",
  南: "It falls in the Li palace, a year in the spotlight. Your talent is seen and your name rises; beware of gossip too.",
};
