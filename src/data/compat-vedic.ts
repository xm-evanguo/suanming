/**
 * Ashtakoota (Guna Milan) tables. Nakshatra indexes 0-26 run Ashwini..Revati; rashi indexes 0-11 run Aries..Pisces
 * (sidereal). Several cells differ between almanacs (Vashya, Gana); this file follows the commonly printed tables.
 */

/** Koota names with maximum points. Total 36. */
export const KOOTA_MAX = { varna: 1, vashya: 2, tara: 3, yoni: 4, maitri: 5, gana: 6, bhakoot: 7, nadi: 8 } as const;

// ---- Varna (1): rank of the Moon rashi's class; the boy's rank must be >= the girl's. ----
/** Rank 4 Brahmin (Cancer, Scorpio, Pisces), 3 Kshatriya (Aries, Leo, Sagittarius), 2 Vaishya (Taurus, Virgo, Capricorn), 1 Shudra (Gemini, Libra, Aquarius). */
export const VARNA_RANK = [3, 2, 1, 4, 3, 2, 1, 4, 3, 2, 1, 4];
export const VARNA_NAME = ["", "Shudra", "Vaishya", "Kshatriya", "Brahmin"];

// ---- Vashya (2): groups 0 Chatushpada (quadruped), 1 Manava (human), 2 Jalachara (water), 3 Vanachara (wild), 4 Keeta (insect). ----
export const VASHYA_NAME = ["Chatushpada", "Manava", "Jalachara", "Vanachara", "Keeta"];
/** Group by rashi; Sagittarius and Capricorn change group at 15 degrees (see vashyaGroup). */
const VASHYA_BY_RASHI = [0, 0, 1, 2, 3, 1, 1, 4, 1, 0, 1, 2];
export function vashyaGroup(rashi: number, degInRashi: number): number {
  if (rashi === 8) return degInRashi < 15 ? 1 : 0; // Sagittarius: first half human, second half quadruped
  if (rashi === 9) return degInRashi < 15 ? 0 : 2; // Capricorn: first half quadruped, second half water
  return VASHYA_BY_RASHI[rashi]!;
}
/** [boy group][girl group]. */
export const VASHYA_POINTS = [
  [2, 1, 1, 0, 1],
  [1, 2, 1.5, 0, 1],
  [1, 1.5, 2, 0, 1],
  [0, 0, 0, 2, 0],
  [1, 1, 1, 0, 2],
];

// ---- Tara (3): nakshatra count modulo 9. Remainders 3 (Vipat), 5 (Pratyak), 7 (Naidhana) are inauspicious. ----
export const TARA_BAD = [3, 5, 7];

// ---- Yoni (4): the animal of each nakshatra. ----
export const YONI_ANIMALS = ["Horse", "Elephant", "Sheep", "Serpent", "Dog", "Cat", "Rat", "Cow", "Buffalo", "Tiger", "Deer", "Monkey", "Mongoose", "Lion"];
export const NAK_YONI = [0, 1, 2, 3, 3, 4, 5, 2, 5, 6, 6, 7, 8, 9, 8, 9, 10, 10, 4, 11, 12, 11, 13, 0, 13, 7, 1];
/** Symmetric 14 x 14 matrix in the order of YONI_ANIMALS: 4 same animal, 0 natural enemies. */
export const YONI_POINTS = [
  [4, 2, 2, 3, 2, 2, 2, 1, 0, 1, 3, 3, 2, 1],
  [2, 4, 3, 3, 2, 2, 2, 2, 3, 1, 2, 3, 2, 0],
  [2, 3, 4, 2, 1, 2, 1, 3, 3, 1, 2, 0, 3, 1],
  [3, 3, 2, 4, 2, 1, 1, 1, 1, 2, 2, 2, 0, 2],
  [2, 2, 1, 2, 4, 2, 1, 2, 2, 1, 0, 2, 1, 1],
  [2, 2, 2, 1, 2, 4, 0, 2, 2, 1, 3, 3, 2, 1],
  [2, 2, 1, 1, 1, 0, 4, 2, 2, 2, 2, 2, 1, 2],
  [1, 2, 3, 1, 2, 2, 2, 4, 3, 0, 3, 2, 2, 1],
  [0, 3, 3, 1, 2, 2, 2, 3, 4, 1, 2, 2, 2, 1],
  [1, 1, 1, 2, 1, 1, 2, 0, 1, 4, 1, 1, 2, 1],
  [3, 2, 2, 2, 0, 3, 2, 3, 2, 1, 4, 2, 2, 1],
  [3, 3, 0, 2, 2, 3, 2, 2, 2, 1, 2, 4, 3, 2],
  [2, 2, 3, 0, 1, 2, 1, 2, 2, 2, 2, 3, 4, 2],
  [1, 0, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 2, 4],
];

// ---- Graha Maitri (5): rashi lords and their natural friendships. ----
/** 0 Sun 1 Moon 2 Mars 3 Mercury 4 Jupiter 5 Venus 6 Saturn. */
export const LORD_NAME = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
export const RASHI_LORD = [2, 5, 3, 1, 0, 3, 5, 2, 4, 6, 6, 4];
/** FRIENDSHIP[a][b]: how planet a regards planet b. F friend, N neutral, E enemy. */
export const FRIENDSHIP = [
  ["N", "F", "F", "N", "F", "E", "E"],
  ["F", "N", "N", "F", "N", "N", "N"],
  ["F", "F", "N", "E", "F", "N", "N"],
  ["F", "E", "N", "N", "N", "F", "N"],
  ["F", "F", "F", "E", "N", "E", "N"],
  ["E", "E", "N", "F", "N", "N", "F"],
  ["E", "E", "E", "F", "N", "F", "N"],
] as const;

// ---- Gana (6): 0 Deva, 1 Manushya, 2 Rakshasa. ----
export const GANA_NAME = ["Deva", "Manushya", "Rakshasa"];
export const NAK_GANA = [0, 1, 2, 1, 0, 1, 0, 0, 2, 2, 1, 1, 0, 2, 0, 2, 0, 2, 2, 1, 1, 0, 2, 2, 1, 1, 0];
/** [boy gana][girl gana]. */
export const GANA_POINTS = [
  [6, 6, 0],
  [5, 6, 0],
  [1, 0, 6],
];

// ---- Nadi (8): 0 Adi, 1 Madhya, 2 Antya. The pattern zigzags across groups of three nakshatras. ----
export const NADI_NAME = ["Adi", "Madhya", "Antya"];
export const nadiOf = (nak: number): number => [0, 1, 2, 2, 1, 0][nak % 6]!;
