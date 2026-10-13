/**
 * English texts for the life path compatibility tables. Keys match `../compat-numerology.ts`.
 * `HELP_BRINGS` phrases are bare verb phrases ("push you to act") that follow "they can ...".
 */

export const RELATIONSHIP_NUMBER_EN: Record<number, string> = {
  1: "starting something new together",
  2: "working together and listening to each other",
  3: "expressing yourselves and having fun together",
  4: "keeping your days steady and orderly",
  5: "frequent change, which calls for flexibility",
  6: "caring for each other and for the family",
  7: "giving each other space and thinking things through together",
  8: "building a career and managing resources together",
  9: "going beyond yourselves to complete something big together",
};

export const HELP_BRINGS_EN: Record<number, { career: string; general: string }> = {
  1: { career: "push you forward boldly and turn your hesitation into action", general: "push you to take action" },
  2: { career: "make introductions and coordinate, and bring you into the right circles", general: "listen patiently and mediate" },
  3: { career: "use their way with words and their contacts to help you get your ideas out", general: "bring a relaxed mood and inspiration" },
  4: { career: "give you a clear process and solid methods so that things land", general: "arrange things steadily and safely" },
  5: { career: "bring new information and chances and widen your horizons", general: "bring change and fresh experiences" },
  6: { career: "back you up when you need it, with care and practical support", general: "look after you and give you the feeling of home" },
  7: { career: "analyse and judge, and help you see the industry and its risks clearly", general: "give you calm insight" },
  8: { career: "show you the way with their experience of management and resources", general: "help you turn goals into results" },
  9: { career: "show you a longer-term direction with their broad view and wide network", general: "be generous and accepting, and show you the big picture" },
};
