/**
 * Display language. Chinese is the source language; English is a full translation.
 *
 * Every text is picked when it is built, so a language change reloads the page
 * (`switchLang`) instead of re-rendering. Tests call `setLang` directly.
 */
export type Lang = "zh" | "en";

const LANG_KEY = "tianji.lang.v1";

function detect(): Lang {
  // Outside a browser (tests) the default is Chinese, the source language.
  if (typeof document === "undefined") return "zh";
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === '"en"' || saved === '"zh"') return JSON.parse(saved) as Lang;
  } catch {
    // Storage can be unavailable (private mode).
  }
  return /^zh\b/i.test(navigator.language ?? "") ? "zh" : "en";
}

let lang: Lang = detect();

export const getLang = (): Lang => lang;
export const isEn = (): boolean => lang === "en";

/** Set the language for texts built from now on. The UI uses `switchLang`. */
export function setLang(l: Lang) {
  lang = l;
  if (typeof document !== "undefined") document.documentElement.lang = l === "en" ? "en" : "zh-CN";
}

/** Save the choice and reload, so every page and computed reading is built again in that language. */
export function switchLang(l: Lang) {
  try {
    localStorage.setItem(LANG_KEY, JSON.stringify(l));
  } catch {
    // Ignore; the choice then lasts only for this page.
  }
  location.reload();
}

/** The text for the current language. */
export const t = (zh: string, en: string): string => (lang === "en" ? en : zh);

/** The value for the current language, for tables and functions. */
export const pick = <T>(zh: T, en: T): T => (lang === "en" ? en : zh);

/** Sentence separators: Chinese text has no spaces between sentences. */
export const sep = () => (lang === "en" ? " " : "");

/** List joiner: "、" in Chinese, ", " in English. */
export const listJoin = (items: string[]) => items.join(lang === "en" ? ", " : "、");

/** "1 year" / "2 years" in English, "N 年" in Chinese, for any unit pair. */
export function plural(n: number | string, zhUnit: string, enOne: string, enMany = `${enOne}s`): string {
  if (lang !== "en") return `${n} ${zhUnit}`;
  return `${n} ${Number(n) === 1 ? enOne : enMany}`;
}

setLang(lang);

type EnEntry<V> = V extends string ? string : V extends readonly unknown[] ? V : V extends object ? Partial<V> : V;

/**
 * A data table that reads in the current language. In English, entry `k` of `en` replaces the text fields
 * of entry `k` of `zh` (or the whole entry, for a table of strings). Numbers, scores and element keys stay
 * in the Chinese table. Existing `TABLE[key]` call sites need no change, and tests can switch languages.
 */
export function live<V>(zh: V[], en: readonly (EnEntry<NoInfer<V>> | undefined)[]): V[];
export function live<K extends string, V>(zh: Record<K, V>, en: Partial<Record<NoInfer<K>, EnEntry<NoInfer<V>>>>): Record<K, V>;
export function live(zh: object, en: object): object {
  const cache = new Map<PropertyKey, unknown>();
  return new Proxy(zh, {
    get(target, key) {
      const value = Reflect.get(target, key);
      if (lang !== "en" || typeof key === "symbol" || !Object.hasOwn(en, key)) return value;
      if (!cache.has(key)) {
        const e = (en as Record<string, unknown>)[key];
        cache.set(key, value && typeof value === "object" && !Array.isArray(value) && e && typeof e === "object" ? { ...value, ...e } : e);
      }
      return cache.get(key);
    },
  });
}
