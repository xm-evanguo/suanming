import { type BirthInput, type Chart, computeChart } from "../core/chart";
import type { Compat, Person } from "../compat/types";
import { runCompat } from "../compat";
import { runForecasts } from "../forecast";
import type { Forecast } from "../forecast/types";
import { runAll } from "../methods";
import { type Fusion, fuse } from "../methods/fusion";
import type { MethodId, MethodResult } from "../methods/types";

/** "pro" shows the technical reading (default); "plain" shows the everyday-language reading. */
export type Mode = "pro" | "plain";

export interface AppState {
  input?: BirthInput;
  chart?: Chart;
  results?: MethodResult[];
  fusion?: Fusion;
  forecasts?: Partial<Record<MethodId, Forecast>>;
}

const KEY = "tianji.input.v1";
const MODE_KEY = "tianji.mode.v1";
const PEOPLE_KEY = "tianji.people.v1";
const state: AppState = {};

export const getState = () => state;

// Storage can be unavailable (private mode) or corrupt; the session still works without it.
function load<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore.
  }
}

export function compute(input: BirthInput) {
  state.input = input;
  state.chart = computeChart(input);
  state.results = runAll(state.chart);
  state.fusion = fuse(state.results);
  state.forecasts = undefined;
  compatCache.clear();
  save(KEY, input);
}

/** Restore the last input so deep links like #/m/bazi work after a reload. */
export function loadSaved() {
  const input = load<BirthInput>(KEY);
  if (!input) return;
  try {
    compute(input);
  } catch {
    // Ignore an input that no longer computes.
  }
}

/** Forget the results (the last input stays as the wizard's defaults). */
export function clearState() {
  state.chart = undefined;
  state.results = undefined;
  state.fusion = undefined;
  state.forecasts = undefined;
}

export function result<V>(id: MethodId): MethodResult<V> {
  return state.results!.find((r) => r.id === id) as MethodResult<V>;
}

/** Period forecasts for this year + 2 and the next 12 months. Computed on first use. */
export function getForecasts(): Partial<Record<MethodId, Forecast>> {
  state.forecasts ??= runForecasts(state.chart!, new Date());
  return state.forecasts;
}

// ───────── reading mode

let mode: Mode = load<Mode>(MODE_KEY) === "plain" ? "plain" : "pro";
export const getMode = () => mode;
export function setMode(m: Mode) {
  mode = m;
  save(MODE_KEY, m);
  document.body.dataset.mode = m;
}

// ───────── other people

let people: Person[] = load<Person[]>(PEOPLE_KEY) ?? [];
const compatCache = new Map<string, { chart: Chart; compats: Compat[] }>();

export const listPeople = () => people;
export const getPerson = (id: string) => people.find((p) => p.id === id);

export function savePerson(p: Person) {
  const i = people.findIndex((x) => x.id === p.id);
  people = i < 0 ? [...people, p] : people.map((x) => (x.id === p.id ? p : x));
  compatCache.delete(p.id);
  save(PEOPLE_KEY, people);
}

export function removePerson(id: string) {
  people = people.filter((p) => p.id !== id);
  compatCache.delete(id);
  save(PEOPLE_KEY, people);
}

/** The person's chart and every system's compatibility reading with the user. */
export function compatWith(p: Person): { chart: Chart; compats: Compat[] } {
  let hit = compatCache.get(p.id);
  if (!hit) {
    const chart = computeChart(p.input);
    hit = { chart, compats: runCompat(state.chart!, chart, p.relation) };
    compatCache.set(p.id, hit);
  }
  return hit;
}
