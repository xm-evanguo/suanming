import { type BirthInput, type Chart, computeChart } from "../core/chart";
import { runAll } from "../methods";
import { type Fusion, fuse } from "../methods/fusion";
import type { MethodId, MethodResult } from "../methods/types";

export interface AppState {
  input?: BirthInput;
  chart?: Chart;
  results?: MethodResult[];
  fusion?: Fusion;
}

const KEY = "tianji.input.v1";
const state: AppState = {};

export const getState = () => state;

export function compute(input: BirthInput) {
  state.input = input;
  state.chart = computeChart(input);
  state.results = runAll(state.chart);
  state.fusion = fuse(state.results);
  try {
    localStorage.setItem(KEY, JSON.stringify(input));
  } catch {
    // Storage can be unavailable (private mode); the session still works.
  }
}

/** Restore the last input so deep links like #/m/bazi work after a reload. */
export function loadSaved() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) compute(JSON.parse(raw) as BirthInput);
  } catch {
    // Ignore corrupt or unavailable storage.
  }
}

/** Forget the results (the last input stays as the wizard's defaults). */
export function clearState() {
  state.chart = undefined;
  state.results = undefined;
  state.fusion = undefined;
}

export function result<V>(id: MethodId): MethodResult<V> {
  return state.results!.find((r) => r.id === id) as MethodResult<V>;
}
