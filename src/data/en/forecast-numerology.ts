import type { NumReading } from "../forecast-numerology";

/**
 * English readings for the numerology personal year and month. Keys, `dim`, `tone` and the order of the wordings match
 * `../forecast-numerology.ts`; a whole list replaces the Chinese one.
 */

export const PERSONAL_YEAR_READINGS_EN: Record<number, NumReading[]> = {
  1: [
    { dim: "career", tone: "good", plain: ["A new nine-year cycle begins this year, a good time to start a new project, change track or put your own ideas forward. If there is something you want to do, make a start this year."] },
    { dim: "love", tone: "mixed", plain: ["In love it pays to take the first step: if you are single, dare to say how you feel; if you have a partner, set a new goal together."] },
    { dim: "health", tone: "good", plain: ["Your energy is high, a good time to begin a new exercise or sleep routine. Start with a small goal."] },
  ],
  2: [
    { dim: "love", tone: "good", plain: ["This year is about teamwork and relationships: your understanding with your partner, collaborators and colleagues matters. Listen more and talk over people less, and things will go more smoothly than you expect."] },
    { dim: "career", tone: "mixed", plain: ["At work it suits you to let results ripen slowly. Do not rush for outcomes; do each step steadily and keep your relationships in good repair."] },
    { dim: "health", tone: "mixed", plain: ["You feel things more keenly, so watch your sleep and stress, and set aside a little quiet time each day."] },
  ],
  3: [
    { dim: "wisdom", tone: "good", plain: ["A year of expression and creativity, good for writing, making content and showing your work. When an idea comes, write it down or say it aloud, and people will like it."] },
    { dim: "love", tone: "good", plain: ["Your social life is lively and it is easy to meet new people. If you are single, your luck in love is good too; go to more gatherings and join in hobby activities."] },
    { dim: "wealth", tone: "mixed", plain: ["You will spend more on fun and socialising, so set yourself a monthly limit."] },
  ],
  4: [
    { dim: "career", tone: "good", plain: ["A year for laying foundations: make your routines, skills and plans solid. Steady build-up may look slow this year, but it is the root of the years to come."] },
    { dim: "wealth", tone: "good", plain: ["A good time to sort out your accounts, make a budget and save your first emergency fund. Steady steps beat chasing quick money."] },
    { dim: "health", tone: "mixed", plain: ["The workload is on the heavy side, so mind your lower back and long sitting, and get up and move at set times."] },
  ],
  5: [
    { dim: "career", tone: "mixed", plain: ["The year with the most change: new surroundings, a new pace, new people. Stay flexible so you can react fast when a chance comes."] },
    { dim: "love", tone: "mixed", plain: ["Love may bring freshness and shifts. Work out whether it is a passing thrill or a lasting need before you decide."] },
    { dim: "wisdom", tone: "good", plain: ["A good time to travel, try new things and learn new skills; widening your view will give you more than staying in your comfort zone."] },
  ],
  6: [
    { dim: "love", tone: "good", plain: ["Home and close relationships are the focus: family matters, your partner, children and parents all need a little more of your time. These investments will leave you more settled."] },
    { dim: "health", tone: "good", plain: ["A good time to make your living space comfortable, eat regularly and rest well. Look after others, but do not forget to look after yourself."] },
    { dim: "career", tone: "mixed", plain: ["Your responsibilities grow. Do not take everything on your shoulders; learn to say \"I can't help with this one\"."] },
  ],
  7: [
    { dim: "wisdom", tone: "good", plain: ["A year of reflection and study, good for reading, research and exams, and also for time alone to sort out your direction. Go to fewer social events and settle more."] },
    { dim: "career", tone: "mixed", plain: ["Do not push hard at work. Put your focus on deepening your expertise; the results will show in the next two years."] },
    { dim: "health", tone: "mixed", plain: ["You need more rest and quiet time. Spend more time in nature and protect your sleep."] },
  ],
  8: [
    { dim: "career", tone: "good", plain: ["A year of results and authority: the effort of earlier years starts to pay off, a good time to go for a promotion, a raise or a bigger business. Go into the talk with a clear goal."] },
    { dim: "wealth", tone: "good", plain: ["Money is the focus, and your income may rise clearly, though spending can grow too. Plan well so you can keep what you earn."] },
    { dim: "love", tone: "mixed", plain: ["When you are busy with work, do not neglect the people around you; keep the time together you have promised."] },
  ],
  9: [
    { dim: "wisdom", tone: "mixed", plain: ["A year of closing and letting go: sort out the past nine years, end the relationships, jobs or habits that no longer fit, and make room for the next round of new beginnings."] },
    { dim: "love", tone: "mixed", plain: ["In love, forgiveness and goodbyes go side by side. Say a proper goodbye to someone you need to let go of, and thank the people who matter."] },
    { dim: "wealth", tone: "mixed", plain: ["Not a time for big new commitments. Finish what is in hand, clear old debts, and go into next year travelling light."] },
  ],
};

/** Personal month 1-9, two wordings each so repeated numbers in a year do not read the same. */
export const PERSONAL_MONTH_READINGS_EN: Record<number, NumReading[]> = {
  1: [
    { dim: "career", tone: "good", plain: ["This month suits beginnings: put forward a new idea, start a plan, sign up for a course. If there is something you want to do, take the first step.", "Taking the initiative gets a response this month. For the chance you want or the person you want to contact, just speak up."] },
    { dim: "health", tone: "good", plain: ["You are in good spirits, so you could set yourself a new small habit, such as a ten-minute walk in the morning.", "Your body feels strong, a good time to start exercising again."] },
  ],
  2: [
    { dim: "love", tone: "good", plain: ["This month suits cooperation and listening. Talk things through with your partner or colleagues and the relationship goes more smoothly.", "This month is about working together: others need your support, and you can ask others for help too."] },
    { dim: "career", tone: "mixed", plain: ["Things move slowly, so be patient waiting for replies and do not push too hard.", "Good for details and paperwork, not for bold sweeping moves."] },
  ],
  3: [
    { dim: "wisdom", tone: "good", plain: ["You are in the mood to express yourself, a good time to write something, give a talk or post something you are happy with.", "Ideas come easily, so jot them down as they come and pick one or two to act on later."] },
    { dim: "love", tone: "good", plain: ["Your social life is lively. Seeing friends brings good spirits and new contacts.", "Your smile and humour make you popular; if you are single, get out and about more."] },
  ],
  4: [
    { dim: "career", tone: "good", plain: ["A good time for groundwork: sort out your files, set up a routine and clear the tasks you have been putting off.", "A month for steady work, when the backlog on your desk is easiest to move."] },
    { dim: "wealth", tone: "mixed", plain: ["A good time to make a budget and check your accounts, not for big new spending.", "Go through your fixed costs once, and your saving will have a clearer direction."] },
  ],
  5: [
    { dim: "career", tone: "mixed", plain: ["Lots of change, and plans are easily adjusted at short notice. Leave some slack in your trips and schedule.", "New messages and invitations multiply. Do not accept them all; pick the two most interesting."] },
    { dim: "love", tone: "mixed", plain: ["The pull of novelty is strong and you are easily drawn to new people and things. Sleep on it for a day before you decide.", "You have a strong urge to get away, so plan a short trip with friends."] },
  ],
  6: [
    { dim: "love", tone: "good", plain: ["Family and those close to you need you. Arrange a meal or some time together; it will be well worth it.", "This month values friendship. Do a friend a small favour, and do not forget to show care for yourself too."] },
    { dim: "health", tone: "good", plain: ["A good time to arrange your home, cook something nice and make life more comfortable.", "Tidy up a corner of your home where you can relax."] },
  ],
  7: [
    { dim: "wisdom", tone: "good", plain: ["A good time for solitude, reading and thinking; you will find answers in the quiet.", "Go to fewer social events and keep some time for yourself; inspiration will come then."] },
    { dim: "health", tone: "mixed", plain: ["You need more rest. Go to bed earlier and do not fill your diary.", "Spend more time in nature. An hour's walk will clear your head."] },
  ],
  8: [
    { dim: "career", tone: "good", plain: ["A good time to negotiate and ask for what you want. If you want to talk about pay, a role or a partnership, get your figures ready and speak up this month.", "You act with confidence and your results are easy to see, so you can report your achievements yourself."] },
    { dim: "wealth", tone: "good", plain: ["Money is lively this month. Plan your income and spending carefully and spend where it counts.", "Accounts and income are the focus; check this month's books at the end of the month."] },
  ],
  9: [
    { dim: "wisdom", tone: "mixed", plain: ["A good time to wrap things up: finish what you have been putting off and clear out things you no longer use and old contacts.", "Put down one old burden this month and you will feel much lighter."] },
    { dim: "love", tone: "mixed", plain: ["There is both goodbye and gratitude in your feelings. Tell the people who matter how you feel, and forgive one old thing.", "A good time to make peace with someone and untie a knot in your heart."] },
  ],
};
