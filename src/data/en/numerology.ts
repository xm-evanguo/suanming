import type { Brief } from "../types";
import type { NumberProfile } from "../numerology";

/** English texts for 生命灵数. Keys match `../numerology.ts` and `../plain-numerology.ts`. Scores, elements and numbers stay in the Chinese table. */

export const LIFE_PATH_EN: Record<number, Partial<NumberProfile>> = {
  1: {
    name: "Life Path 1 · The Pioneer",
    title: "The first ray of dawn",
    keywords: ["independent", "pioneering", "leading", "confident", "driven"],
    summary: "Your life is a road that starts from zero, and you are meant to take the first step yourself. Your mission is to show that one person can light up a direction.",
    personality:
      "You have a strong sense of self and plenty of drive. You do not like being told what to do and prefer to make your own call. You are brave and direct, and when you hit an obstacle you look for a way round it rather than complain. Now and then you can be stubborn or self-centred, and learning to listen is your homework.",
    career: "You suit starting a business, management, sales and independent professional roles. You are good at building something from nothing, and with a clear goal you will carry a team over the finish line.",
    love: "You love openly and frankly, and you like a partner who fights alongside you. Leave your partner room to speak and the relationship will be more equal and last longer.",
    health: "You have plenty of energy but tend to push yourself too hard, and your head, shoulders and back are prone to tension. Regular exercise and rest are your fuel stops.",
    advice: "Trust your instinct and set out boldly. Remember too that a real leader knows how to let others shine.",
    luckyColors: ["bright red", "golden yellow"],
  },
  2: {
    name: "Life Path 2 · The Peacemaker",
    title: "The gentle bridge of peace",
    keywords: ["cooperative", "sensitive", "patient", "caring", "balanced"],
    summary: "You are a born harmoniser who replaces confrontation with understanding. Your strength lies in your delicacy and patience.",
    personality:
      "You are gentle and understanding, with a sharp sense of other people's feelings. You value harmony and often support others quietly from behind the scenes. Sometimes you give way too much and hold yourself back; this is where you need to practise saying \"no\".",
    career: "You suit coaching, counselling, diplomacy, administrative support and team-based work. You help different people work together smoothly and are the oil that keeps a team running.",
    love: "You are a caring partner who values equality and a quiet understanding. Be brave and say what you need; do not wait for the other person to guess.",
    health: "Your feelings and body are closely linked; under stress your stomach and nerves are easily affected. A regular routine and deep breathing help you keep your inner calm.",
    advice: "Your sensitivity is a gift, not a weakness. Give yourself the same gentleness, then share it with others.",
    luckyColors: ["cream", "pale blue"],
  },
  3: {
    name: "Life Path 3 · The Communicator",
    title: "The storyteller who shines",
    keywords: ["creative", "optimistic", "expressive", "charming", "inspired"],
    summary: "You came into the world with a spark of joy, and you light up others with your voice, your words or your brush. Your task is to enjoy creating and to share that joy.",
    personality:
      "You are cheerful and funny, good with words, and easily become the centre of a crowd. You are curious about life and full of ideas. Sometimes your moods swing or your interest fades after a few minutes; learning to focus will give your talent more power.",
    career: "You suit writing, design, performing, media, teaching and marketing. A place that lets you use your imagination freely is your best stage.",
    love: "You are romantic and witty, a partner who makes people happy. Do not use jokes to dodge serious topics; honest words make the bond deeper.",
    health: "Your nerves get excited easily, so mind your throat, your sleep and your mood swings. Singing, dancing and other ways of expressing yourself are excellent healing.",
    advice: "Write your ideas down, say them aloud, make them real. Finishing one piece of work is worth more than dreaming up ten ideas.",
    luckyColors: ["bright yellow", "orange"],
  },
  4: {
    name: "Life Path 4 · The Builder",
    title: "The dreamer who builds brick by brick",
    keywords: ["steady", "orderly", "diligent", "reliable", "enduring"],
    summary: "You believe a solid foundation beats a pretty blueprint, and you turn dreams into reality one step at a time. Reliability is your gift to the world.",
    personality:
      "You are serious and trustworthy, organised, and you care about rules and detail. You do not like gambling and are used to trading time and effort for results. Sometimes you are too cautious or stubborn; give new things a little chance and you will find more possibilities.",
    career: "You suit engineering, accounting, management, construction, manufacturing and project delivery. You are good at building processes and landing complicated matters safely.",
    love: "You are loyal and dependable, and you show love through actions. A soft word now and then, or a small surprise, will put your partner more at ease.",
    health: "You are sturdy, but watch your lower back, bones and long hours of sitting. A regular routine and moderate stretching matter a lot for you.",
    advice: "Slow is fast. Lay the groundwork well, and leave a window open so inspiration and change can come in too.",
    luckyColors: ["dark green", "coffee brown"],
  },
  5: {
    name: "Life Path 5 · The Adventurer",
    title: "The free traveller in the wind",
    keywords: ["free", "changeable", "adventurous", "curious", "versatile"],
    summary: "You were made for change and long to taste every flavour of the world. Freedom is your oxygen and the journey is your teacher.",
    personality:
      "You are quick-witted and adapt easily, and you are interested in everything new. You hate being tied down and do not enjoy repetition. Your challenge is to stay responsible amid constant change, so that freedom does not become escape.",
    career: "You suit travel, media, sales, freelancing and international business. A changing environment where you meet all kinds of people suits you perfectly.",
    love: "You need room to be free and you like freshness. Find a partner willing to travel with you, and keep a little adventure within your commitment so love does not go stale.",
    health: "You are full of energy but burn it up easily. Look after your nervous system and sleep, and go easy on drinking and late nights.",
    advice: "Embrace change, but set yourself a few anchors. Real freedom means being able to set out at any time and also come home at any time.",
    luckyColors: ["sky blue", "silver grey"],
  },
  6: {
    name: "Life Path 6 · The Guardian",
    title: "The home with the lights on",
    keywords: ["responsible", "caring", "harmonious", "aesthetic", "devoted"],
    summary: "Your life revolves around love and responsibility, and you are good at looking after the people around you. Home and community are where you feel most at ease.",
    personality:
      "You are warm and considerate, with a natural pull towards beauty and order. You are willing to give for those you love and are often the one people lean on. Sometimes you worry too much or try too hard to make things perfect; you need to learn to let go.",
    career: "You suit education, healthcare, design, catering, social services and the home industry. You are good at creating a warm atmosphere in which others feel cared for.",
    love: "You value family and long-term relationships and are a loyal partner. Do not trade sacrifice for approval; let love be an equal exchange.",
    health: "Stress often settles in your heart and stomach, so keep regular meals and rest in moderation. Before you look after others, look after yourself.",
    advice: "Your warmth deserves an answer. Setting boundaries is not coldness; it lets love go the distance.",
    luckyColors: ["pink", "light green"],
  },
  7: {
    name: "Life Path 7 · The Seeker",
    title: "The lone traveller in search of truth",
    keywords: ["insightful", "analytical", "spiritual", "independent", "truth-seeking"],
    summary: "You were born with eyes that look both inward and outward, and you refuse to settle for less than the truth and meaning. Quiet places are where you are strongest.",
    personality:
      "You are both rational and intuitive, you like to think and study on your own, and you have little interest in surface bustle. Your inner world is rich, and you can be hard to approach. You need time alone, but do not let solitude become escape; sharing your thoughts now and then brings resonance.",
    career: "You suit research, technology, writing, philosophy, psychology and analysis. Fields that call for deep focus let your insight reach its peak.",
    love: "You want a meeting of minds and are slow to warm but sincere. Say what you feel and the other person will find it easier to come close.",
    health: "Too much thinking can lead to insomnia or nervous fatigue. Meditation, walks in nature and regular sleep work especially well for you.",
    advice: "Trust your inner voice, but let people you trust come near. Wisdom only comes alive once it is shared.",
    luckyColors: ["purple", "deep blue"],
  },
  8: {
    name: "Life Path 8 · The Achiever",
    title: "The one who holds the mountain top",
    keywords: ["power", "wealth", "boldness", "organised", "achieving"],
    summary: "You have a special bond with the material world and are good at turning vision into strength. Your mission is to learn to use power and resources well.",
    personality:
      "You are ambitious and bold, and good at planning and carrying things out. You have a strong hunger for success and can shoulder responsibility. Take care that work does not swallow your life, and that control does not take the place of trust.",
    career: "You suit corporate management, finance, investment, law and large projects. You have a natural nose for business and can steer through complex situations.",
    love: "You are serious and dependable in love, but busyness often makes you neglect time together. Give a little time to those close to you and the relationship will be steadier.",
    health: "A high-pressure life can cause heart and sleep problems. Schedule rest, and manage your health the way you manage your business.",
    advice: "Abundance is more than numbers. Let power serve value, and your achievement will nourish both you and others.",
    luckyColors: ["deep gold", "dark green"],
  },
  9: {
    name: "Life Path 9 · The Sage",
    title: "The elder with a heart for all beings",
    keywords: ["compassionate", "tolerant", "idealistic", "completing", "giving"],
    summary: "You walk through life with a wide heart and understand different people and situations well. Your lesson is to let go and give love with fewer conditions.",
    personality:
      "You are full of sympathy, idealistic, and moved by the suffering of the world. Your view is wide, and you often see the big picture. Sometimes expecting too much leaves you disappointed; learn to accept imperfection and you will feel lighter.",
    career: "You suit charity, education, the arts, healthcare, international affairs and the creative industries. Work that brings value to a larger group satisfies you most.",
    love: "Your love is generous and selfless, but you may wrong yourself to make things work for others. Voice your needs in moderation and the relationship will truly balance.",
    health: "Mood swings affect your body, especially your immunity and sleep. Creating art, travelling or volunteering are your natural remedies.",
    advice: "Letting go is also a way of completing. Keep a little love for yourself and you can go further.",
    luckyColors: ["wine red", "magenta"],
  },
  11: {
    name: "Life Path 11 · The Illuminator",
    title: "The high-frequency messenger of inspiration",
    keywords: ["intuitive", "inspired", "sharp", "enlightening", "idealistic"],
    summary: "You were born with an antenna and pick up signals others cannot feel. Your light comes from turning inspiration into gentle encouragement.",
    personality:
      "You are keenly intuitive and unusually sensitive, and easily notice the mood and feelings in a room. You have ideals and vision, but can also be tense and moody. Finding a steady rhythm of life is the key to grounding your gift.",
    career: "You suit counselling, the arts, personal growth, education and innovation. Your insight inspires others, and with a steady partner to carry things out, your influence can be great.",
    love: "You long for a bond at the level of the soul and expect a lot from love. Accept the ordinariness of your partner and the relationship will feel more solid.",
    health: "Your nervous system is sensitive and you tire and worry easily. Protect your sleep, cut down on stimulation, and adjust with meditation or time in nature.",
    advice: "Write your inspiration down, then carry it out step by step. Your sensitivity is not a burden; it is an antenna that needs to be used well.",
    luckyColors: ["silver white", "pale violet"],
  },
  22: {
    name: "Life Path 22 · The Master Builder",
    title: "The one who builds dreams into reality",
    keywords: ["grand vision", "practical", "leading", "integrating", "hands-on"],
    summary: "You have dreams on a grand scale and the drive to make them real. You are one of the few who can truly build an ideal into a structure.",
    personality:
      "You have both long-range vision and down-to-earth stamina, and you can bring many people's strengths together. The expectations on you are higher too, so you may feel the weight or be hard on yourself. Leave yourself room to breathe and you can walk this long road to its end.",
    career: "You suit large projects, start-ups, architecture, international organisations and social innovation. You are good at turning an abstract vision into a system that works.",
    love: "You are serious and dependable, and often see your partner as a companion in a shared effort. Do not let a busy career starve the relationship of care.",
    health: "Long-term high pressure tends to build up in your digestion and sleep. Setting limits, delegating and resting are important lessons for you.",
    advice: "Break the big dream into small steps. Do a little each day, then let more people join your blueprint.",
    luckyColors: ["gold", "deep blue"],
  },
  33: {
    name: "Life Path 33 · The Compassionate Teacher",
    title: "The healer who carries love as a lamp",
    keywords: ["compassionate", "devoted", "healing", "selfless", "guiding"],
    summary: "You came into the world with a gentle and powerful love, and you are willing to light a lamp for others. Your calling is to nourish everything around you with love.",
    personality:
      "You are full of empathy and naturally inclined to care for and guide others. Your kindness is contagious, but you can also take other people's burdens onto your own shoulders. Learn to protect your energy and your compassion will last.",
    career: "You suit education, healing, charity, the arts and personal growth. Your very presence calms others, and you are the warm pillar of a team.",
    love: "Your love is deep and accepting, but you need a partner who can look after you too. Let yourself be the one who is loved, not only the one who gives.",
    health: "You are prone to exhaustion in body and mind from taking on too much. Set aside time to rest and be alone, and keep topping up your own energy.",
    advice: "Fill your own lamp with oil first, and you can light the way for others. Compassion includes gentleness towards yourself.",
    luckyColors: ["rose pink", "moon white"],
  },
};

export const PERSONAL_YEAR_EN: Record<number, Brief> = {
  1: {
    name: "Personal Year 1 · Year of Sowing",
    keywords: ["beginnings", "action", "independence"],
    text: "A new cycle starts now, a good time to set goals, begin plans and make bold choices. The seeds you plant will shape the next nine years.",
  },
  2: {
    name: "Personal Year 2 · Year of Tending",
    keywords: ["patience", "cooperation", "relationships"],
    text: "The pace slows and the focus is on nurturing relationships and waiting for things to sprout. Listen more and work together; do not rush for results, because slow and steady is the theme.",
  },
  3: {
    name: "Personal Year 3 · Year of Blooming",
    keywords: ["expression", "social life", "creating"],
    text: "Creative and social energy runs high, a good time to express yourself, share your work and meet new friends. Keep a light heart, and take care not to spread your energy too thin.",
  },
  4: {
    name: "Personal Year 4 · Year of Foundations",
    keywords: ["stability", "order", "effort"],
    text: "This is a down-to-earth year, good for sorting out your finances, setting up systems and finishing basic work. The sweat you put in will become the firmest foundation of the next few years.",
  },
  5: {
    name: "Personal Year 5 · Year of Change",
    keywords: ["change", "freedom", "opportunity"],
    text: "Changes and new chances follow one another, a good time to travel, switch paths and try new things. Stay flexible and avoid acting on impulse, so that your freedom has a direction.",
  },
  6: {
    name: "Personal Year 6 · Year of Care",
    keywords: ["family", "responsibility", "love"],
    text: "Relationships, family and responsibility take the focus, a good time to nurture close ties and improve your home. While you look after others, keep some space for yourself.",
  },
  7: {
    name: "Personal Year 7 · Year of Reflection",
    keywords: ["settling", "learning", "spirit"],
    text: "A good time for solitude, study and deep thought; exploring your inner world will bring important insight. There is no need to expand outwards; slowing down lets you see the direction.",
  },
  8: {
    name: "Personal Year 8 · Year of Harvest",
    keywords: ["achievement", "wealth", "authority"],
    text: "Energy for career and money peaks, and your effort has a chance to turn into clear returns. Use power and resources well, and keep a fair and steady attitude.",
  },
  9: {
    name: "Personal Year 9 · Year of Completion",
    keywords: ["finishing", "letting go", "gratitude"],
    text: "A nine-year cycle reaches its end, a good time to wrap up, tidy up and say goodbye to people and things that no longer fit. Put down the old baggage and make room for a new beginning.",
  },
};
