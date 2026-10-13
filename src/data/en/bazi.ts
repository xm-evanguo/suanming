import type { Brief, WuXing } from "../types";
import type { DayMaster, WuXingInfo } from "../bazi";

/** English text for the 八字 tables in `../bazi.ts`. Scores, numbers and keys stay in the Chinese table. */

export const DAY_MASTERS_EN: Record<string, Partial<DayMaster>> = {
  甲: {
    image: "a towering tree",
    name: "Jia Wood",
    title: "The timber that grows toward the sky",
    keywords: ["upright", "driven", "kind-hearted", "stubborn", "leader"],
    summary: "You are the tallest tree in the forest: deep roots, high aims, and a natural pull to grow upward.",
    personality:
      "Jia Wood people are open and principled, with real ambition, and they will not bow to please anyone. You are loyal and will shelter your friends from the storm, so the load often ends up on your shoulders. The flip side is rigidity: you would rather break than bend, and people close to you sometimes find you hard to negotiate with.",
    career: "You suit leading, planning and founding roles. Education, management, architecture, forestry and publishing are all places where you can put down roots. Your path steadies with time, and it branches out most after midlife.",
    love: "In love you are earnest and faithful; once you choose someone, you protect them for the long run. Sweet talk is not your style, so remember to say what you feel now and then, or the other person may not feel the weight of your care.",
    health: "Watch your liver and gallbladder, your sinews and your neck and shoulders; long sitting makes you stiff. Spring is a good time to get outdoors and let your body stretch out like a tree.",
    advice: "Being upright is your root; being flexible is how you add rings. Learn to bend at the right moment, and after each storm you will only stand taller.",
    luckyColors: ["cyan green", "emerald green"],
  },
  乙: {
    image: "flowers, grass and vines",
    name: "Yi Wood",
    title: "The flowers and vines that bend with the wind",
    keywords: ["resilient", "nimble", "approachable", "perceptive", "adaptable"],
    summary: "You are like spring flowers and vines: soft to look at, yet always able to find a crack and grow a world of your own.",
    personality:
      "Yi Wood people are gentle and perceptive, good at reading a room, and well liked. You know how to borrow strength and find the most comfortable place in a complicated setting; you gain without fighting. There is real toughness inside, but you can worry too much, hesitate, or keep hurt feelings to yourself.",
    career: "You suit work that needs taste, communication and coordination: design, copywriting, floristry, PR, consulting and teaching. With a team and good mentors behind you, things usually go better than when you work alone.",
    love: "You are gentle and attentive and care about time together and small details; partners feel well looked after. Do not give in too much just to avoid conflict. Say what you really think, and the relationship will grow healthy.",
    health: "Watch your liver and gallbladder, nerves and hands and feet. When you bottle things up you may sleep or eat poorly. Sunshine and green plants help you unwind.",
    advice: "Soft is not weak. A vine climbs a tall tree because it knows its direction. Pick one goal, then use your flexibility to get there.",
    luckyColors: ["fresh green", "light pink"],
  },
  丙: {
    image: "the sun that lights up the world",
    name: "Bing Fire",
    title: "The bright sun that shines in every direction",
    keywords: ["warm", "open", "bright", "generous", "showy"],
    summary: "You are like the noon sun: your light is out in the open, and wherever you go, the place brightens up.",
    personality:
      "Bing Fire people are warm and cheerful, big-hearted, happy to help and very infectious. You act quickly, do not hold grudges, and like to be the one who is seen. Watch your temper: your heat comes fast and goes fast, and words that are too blunt can burn people without your meaning to.",
    career: "You suit fields with a stage and influence: media, public speaking, sales, energy, education, branding and charity work. You have natural pull, and the more public the setting, the more you shine.",
    love: "You love openly and warmly, with no games, and give your partner plenty of warmth. A little more patience and listening, turning your light toward what they need, will make it last.",
    health: "Watch your heart and blood vessels, eyes and blood pressure. You run hot and tend to stay up late. In summer, sleep earlier, drink plenty of water, and give yourself a quiet \"sunset hour\".",
    advice: "The sun does not have to chase people to shine on them; it just shines. Rein in the glare a little and let your warmth land on those who need it most.",
    luckyColors: ["true red", "orange gold"],
  },
  丁: {
    image: "candlelight",
    name: "Ding Fire",
    title: "A warm lamp in the dark",
    keywords: ["warm", "focused", "sensitive", "wise", "reserved"],
    summary: "You are a lamp that never goes out at night. Your light does not glare, yet people who come close feel safe and find their way.",
    personality:
      "Ding Fire people are careful thinkers with strong feelings, deep insight and fine taste. You look mild, but inside burns a fire that will not go out, and you focus hard on what matters to you. Watch your mood swings and overthinking; sometimes a small thing keeps burning in your mind.",
    career: "You suit work that needs deep thought and craft: research, writing, design, psychology, medicine, art and software. You do your best, most refined work in quiet places.",
    love: "Your feelings are fine-grained and you value a meeting of minds; you love deeply but quietly. Try to say what you need instead of making your partner guess, so the warmth can flow both ways.",
    health: "Look after your heart, your eyes and your sleep; you can get palpitations or think too much. Regular hours and putting the phone down before bed are the best care for you.",
    advice: "A lamp needs a wick and it needs oil. Before you light the way for others, save some rest and fuel for yourself.",
    luckyColors: ["crimson", "purple"],
  },
  戊: {
    image: "a high mountain of thick earth",
    name: "Wu Earth",
    title: "The mountain that does not move",
    keywords: ["steady", "tolerant", "trustworthy", "stubborn", "dependable"],
    summary: "You are like a silent mountain. You say little, yet many people count on you more than anyone.",
    personality:
      "Wu Earth people are solid and down to earth; they do what they say and carry a natural sense of security and authority. You can tolerate a lot and carry a lot, and in a storm you only grow calmer. The weak spot is flexibility: once you have decided, you rarely change your mind, which can look stubborn, and you seldom ask for help.",
    career: "You suit fields built on trust and long-term build-up: property, finance, administration, engineering, agriculture, warehousing and large institutions. Your weight grows the longer you stay; you are the ballast of a team.",
    love: "You are steady in love and give a partner a solid sense of the future, though a little short on romance. A small surprise now and then shows how deep your feelings run.",
    health: "Look after your stomach and digestion; irregular meals or worry upset your gut. Regular meals and moderate exercise keep this mountain alive.",
    advice: "A tall mountain gathers clouds and rain; let the streams change course too. Listen to different voices, and your steadiness will gain warmth.",
    luckyColors: ["earth yellow", "tan brown"],
  },
  己: {
    image: "rich farmland",
    name: "Ji Earth",
    title: "The fields that feed everything",
    keywords: ["tolerant", "practical", "meticulous", "modest", "patient"],
    summary: "You are soft, fertile farmland. You quietly nourish everything around you and do not make a show of what you give.",
    personality:
      "Ji Earth people are modest and practical, good at caring for others, careful in thought, and they leave room in how they handle things. You turn mess into order and are the grease that keeps a team running. You lose out by thinking too much of others: you often hold back your own views, and you can keep weighing gains and losses over small things.",
    career: "You suit service, management, logistics, education, agriculture, food, finance and HR. Patient and careful, you build steady success step by step through long-term reputation and trust.",
    love: "You are caring and family-minded and give quietly to the relationship. Remember to say what you hope for too; being loved is not something you should have to put up with.",
    health: "Watch your stomach, skin and dampness in the body; you tire easily and your limbs can feel heavy. Eat less cold, sweet and greasy food and walk more to keep things moving.",
    advice: "What farmland fears most is giving without receiving. Draw your boundaries, and let yourself be a field that gets fed too.",
    luckyColors: ["cream yellow", "apricot"],
  },
  庚: {
    image: "a blade of raw iron",
    name: "Geng Metal",
    title: "A sword just showing its edge",
    keywords: ["resolute", "decisive", "loyal", "sharp", "tough"],
    summary: "You are like good steel waiting to be tempered: a hard will that, once it has a target, cuts away distractions and goes straight for it.",
    personality:
      "Geng Metal people are firm and decisive, loyal, with a strong sense of right and wrong, and they take responsibility when it counts. You dislike dragging things out, you execute well, and you will go to any length for a friend. Your nature is hard and your words can cut, so without some polish you clash with people easily.",
    career: "You suit fields that need nerve and execution: the military or police, law, surgery, machinery, finance, sports and hard start-up work. The tougher the situation, the more your value shows.",
    love: "You love decisively, keep your promises, and dislike beating around the bush. Soften your tone and listen more than you judge, and the blade in your love becomes protection.",
    health: "Look after your lungs, airways, large intestine and skin; autumn dries you out. Protect your joints when you exercise, and do not keep yourself tense all the time.",
    advice: "A good sword is tempered in fire and ground on stone. Treat the grinding as a gift for growth, and your edge will end up used in the right place.",
    luckyColors: ["silver white", "gold"],
  },
  辛: {
    image: "pearls and jade",
    name: "Xin Metal",
    title: "Pearl and jade with a soft glow",
    keywords: ["refined", "perceptive", "proud", "elegant", "perfectionist"],
    summary: "You are the pearl in the jewel box: smooth and bright, with an inborn eye for beauty and quality, and a self-respect that will not be slighted.",
    personality:
      "Xin Metal people have an elegant air, excellent taste and fine-grained thinking, and they care about dignity and detail. You see clearly and often hit the nail on the head. Because you aim for perfection, you can expect too much of yourself and others and care a lot about being judged; setbacks hurt you quietly.",
    career: "You suit fields where precision, taste and expertise all matter: jewellery design, financial analysis, legal work, aesthetic medicine, art, branding and luxury goods. You win respect through skill and taste.",
    love: "You have taste in love and a high bar; you warm up slowly but sincerely. Let go of \"it must be perfect\" a little, allow your partner to fall short, and both of you will relax.",
    health: "Look after your lungs, skin, teeth and breathing; when you are tense you get sensitive and unwell. Keep your space clean and humid, and find an outlet for your feelings.",
    advice: "A pearl is made by grinding, not by fussing. Accept your flaws, and your shine will become softer and more moving.",
    luckyColors: ["pearl white", "champagne gold"],
  },
  壬: {
    image: "a rushing river",
    name: "Ren Water",
    title: "The great river rushing to the sea",
    keywords: ["open-minded", "clever", "free", "tolerant", "changeable"],
    summary: "You are like a great river rushing to the sea: broad-minded, with a mind that flows, unwilling to be held by any bank.",
    personality:
      "Ren Water people think fast, see wide, adapt well and feel for others. You love freedom and exploring, know many people and have lots of ideas. The unsteady side is that your mood follows your surroundings and your interests shift; you start strong, but sometimes need someone to keep you going.",
    career: "You suit mobile work that needs strategy and vision: trade, logistics, international business, consulting, media, research and the internet. The more change around you, the more at home you are.",
    love: "You are romantic and generous and need space and real conversation in love. Give your partner a clear sense of security, so your story does not flow away like water.",
    health: "Look after your kidneys, bladder, urinary tract and lower back; you catch cold easily or retain water. Stay up less, keep warm and drink warm water.",
    advice: "A river with banks can travel far. Give your talent a direction, so the flow has somewhere to go.",
    luckyColors: ["deep blue", "ink black"],
  },
  癸: {
    image: "rain, dew and sweet springs",
    name: "Gui Water",
    title: "The dew that nourishes without a sound",
    keywords: ["wise", "reserved", "intuitive", "gentle", "thoughtful"],
    summary: "You are morning dew and a mountain spring: quiet and clear, and you nourish the people around you without their noticing.",
    personality:
      "Gui Water people have sharp intuition and deep minds; they observe well and have a gift for sensing other people's feelings. You are reserved, do not chase credit, and work with wisdom and patience. On the other hand, you can think too much, carry hidden unease, and miss chances out of caution.",
    career: "You suit fields that need insight and research: counselling, research and analysis, writing, metaphysics, healthcare, planning and behind-the-scenes management. You spot trends in the details.",
    love: "Your feelings are rich and sensitive; you value a meeting of minds and give quietly. Try to say what you feel directly, so your thoughts do not turn into fog and your partner can truly come close.",
    health: "Look after your kidneys, urinary and hormonal systems and your sleep; when you are low your hands and feet go cold. Keeping warm, foot baths and regular sleep matter a lot for you.",
    advice: "Dew must fall before it can nourish. Act on your intuition, and do not let caution turn into waiting.",
    luckyColors: ["sky blue", "silver grey"],
  },
};

export const SHI_SHEN_EN: Record<string, Brief> = {
  比肩: {
    name: "Friend",
    keywords: ["self-reliant", "equal", "peers", "rivalry"],
    text: "Same element and same polarity as the Day Master; it stands for siblings, friends and peers. It brings confidence, independence and a sense of fairness, and favours cooperation. Too much of it makes you stubborn and competitive, and you may end up splitting your gains with others.",
  },
  劫财: {
    name: "Rob Wealth",
    keywords: ["bold", "risk-taking", "contest", "loyalty"],
    text: "Same element as the Day Master but opposite polarity; it stands for rivals and helpers at once. It brings drive and daring, but also loose spending, and money can slip away through impulse or favours to others.",
  },
  食神: {
    name: "Eating God",
    keywords: ["talent", "good fortune", "enjoyment", "mildness"],
    text: "Produced by the Day Master with the same polarity; it stands for talent, good food and ease. It brings an easy-going nature, creativity and a taste for good living, a calm and lucky sign.",
  },
  伤官: {
    name: "Hurting Officer",
    keywords: ["flair", "rebellion", "expression", "innovation"],
    text: "Produced by the Day Master with opposite polarity; it stands for talent and sharpness on display. It brings cleverness, the nerve to break conventions and a gift for expression, but sharp words that clash with authority and rules.",
  },
  偏财: {
    name: "Indirect Wealth",
    keywords: ["flow", "opportunity", "networking", "generosity"],
    text: "Controlled by the Day Master with the same polarity; it stands for money that moves and windfalls. It brings social skill, an open hand and a head for business, and warns that money gathers and scatters.",
  },
  正财: {
    name: "Direct Wealth",
    keywords: ["thrift", "stability", "practicality", "responsibility"],
    text: "Controlled by the Day Master with opposite polarity; it stands for steady income earned by honest work. It brings diligence, self-discipline, trustworthiness and good money sense. In a man's chart it often also stands for the wife and steady family duties.",
  },
  七杀: {
    name: "Seven Killings",
    keywords: ["nerve", "pressure", "authority", "challenge"],
    text: "Controls the Day Master with the same polarity; it stands for heavy pressure and challenge. It brings nerve and responsibility and the ability to succeed in adversity. Well handled it becomes authority; out of control it brings trouble.",
  },
  正官: {
    name: "Direct Officer",
    keywords: ["rules", "reputation", "duty", "integrity"],
    text: "Controls the Day Master with opposite polarity; it stands for order, position and reputation. It brings an upright character that keeps the rules and earns respect, good for careers in organisations. In a woman's chart it often also stands for the husband.",
  },
  偏印: {
    name: "Indirect Resource",
    keywords: ["unusual talent", "intuition", "solitude", "inspiration"],
    text: "Produces the Day Master with the same polarity; it is also called the Owl God. It brings an original mind, skill in niche crafts and research and plenty of inspiration, but also a tendency to be withdrawn and suspicious and to dislike routine.",
  },
  正印: {
    name: "Direct Resource",
    keywords: ["mentors", "learning", "protection", "kindness"],
    text: "Produces the Day Master with opposite polarity; it stands for mother, elders and study. It brings help from mentors, respect for learning and reputation and a kind heart. Too much of it makes you dependent and slow to act.",
  },
};

export const WU_XING_EN: Record<WuXing, WuXingInfo> = {
  木: {
    name: "木",
    color: "#3f9b5a",
    colors: ["cyan", "green"],
    direction: "东",
    season: "spring",
    organs: "liver and gallbladder",
    numbers: [3, 8],
    careers: "education, culture and publishing, forestry and gardening, Chinese medicine, clothing and textiles, design and creative work",
    nature: "Wood rules growth and stands for kindness, growth and reaching out; in character it leans upright, driven and compassionate.",
    excessText:
      "With too much Wood, people get stubborn, impatient and quick to anger, with many plans and few finished. Do more things that settle and contain you, and borrow Metal's decisiveness to prune the branches.",
    lackText:
      "A chart without Wood often lacks vitality and flexibility; you may hesitate and lack drive. Spend time with plants and nature and grow a hobby, to give your life some energy to grow.",
  },
  火: {
    name: "火",
    color: "#e0533d",
    colors: ["red", "purple"],
    direction: "南",
    season: "summer",
    organs: "heart and small intestine",
    numbers: [2, 7],
    careers: "media and entertainment, food and drink, energy and power, beauty and hair, advertising and marketing, optoelectronics",
    nature: "Fire rules rising heat and stands for courtesy, warmth and light; in character it leans cheerful, infectious and quick to act.",
    excessText:
      "With too much Fire, people get impatient and impulsive, with big mood swings; they heat up fast and cool down fast. Rest and calm the mind, borrow Water's softness to balance the spirit, and avoid late nights and arguments.",
    lackText:
      "A chart without Fire often lacks warmth and confidence, and you may shrink back or feel low. Get sunshine, socialise and exercise, and let yourself shine more actively.",
  },
  土: {
    name: "土",
    color: "#b8893f",
    colors: ["yellow", "brown"],
    direction: "中",
    season: "the end of each season (late summer)",
    organs: "spleen and stomach",
    numbers: [5, 0],
    careers: "property, agriculture, construction, warehousing and logistics, administration, consulting and brokerage",
    nature: "Earth rules sowing and harvest and stands for trust, weight and support; in character it leans steady, tolerant and reliable.",
    excessText:
      "With too much Earth, people get stubborn and slow, heavy-hearted and slow to react to change. Move around and try new things; borrow Wood to loosen the soil and Water to bring life.",
    lackText:
      "A chart without Earth often feels unanchored; things are hard to sustain and you drift. Build routines and long-term goals, form solid habits, and find people and things you can lean on.",
  },
  金: {
    name: "金",
    color: "#c9a227",
    colors: ["white", "gold"],
    direction: "西",
    season: "autumn",
    organs: "lungs and large intestine",
    numbers: [4, 9],
    careers: "finance and banking, law and justice, machinery and hardware, jewellery, security services, surgery",
    nature: "Metal rules gathering in and stands for loyalty, decisiveness and order; in character it leans firm, principled and effective.",
    excessText:
      "With too much Metal, people get hard and cold, with cutting words and little give. Grow gentleness and empathy, and let Fire's forge and Water's flow soften the edge.",
    lackText:
      "A chart without Metal often lacks decisiveness and boundaries; you waver and are easily swayed. Practise making clear choices, set clear rules, and spend time with metal objects and crisp autumn air.",
  },
  水: {
    name: "水",
    color: "#2f6fb5",
    colors: ["black", "blue"],
    direction: "北",
    season: "winter",
    organs: "kidneys and bladder",
    numbers: [1, 6],
    careers: "trade and logistics, travel and transport, seafood and drinks, media and consulting, research and academia, finance",
    nature: "Water rules flowing down and stands for wisdom, movement and storage; in character it leans clever, flexible and adaptable.",
    excessText:
      "With too much Water, people overthink, drift emotionally and keep changing their minds. Borrow Earth's banks to steady the mind and Wood to channel it, and turn ideas into action.",
    lackText:
      "A chart without Water often thinks narrowly and adapts poorly, and can turn dry and impatient. Drink more water, keep learning, and build a flexible mind so life has more flow.",
  },
};
