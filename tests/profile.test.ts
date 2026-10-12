import { afterAll, beforeEach, describe, expect, test } from "bun:test";
import { CITIES } from "../src/core/cities";
import { askEvidence } from "../src/llm/ask";
import { METHOD_ORDER } from "../src/methods";
import { profileBirthInput } from "../src/ui/profile";
import { clearState, compatWith, compute, getEnabledMethods, getForecasts, getState, loadSaved, setEnabledMethods } from "../src/ui/state";

const city = CITIES[0]!;
const input = profileBirthInput("1990-05-15", "14:30", true, city, "male", true);
const storage = new Map<string, string>();
const oldStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value) } });
afterAll(() => {
  setEnabledMethods(METHOD_ORDER);
  clearState();
  if (oldStorage) Object.defineProperty(globalThis, "localStorage", oldStorage);
  else Reflect.deleteProperty(globalThis, "localStorage");
});
beforeEach(() => { setEnabledMethods(METHOD_ORDER); compute(input); });

describe("profile preferences", () => {
  test("all 14 systems are enabled by default", () => {
    expect(getEnabledMethods()).toEqual(METHOD_ORDER);
    expect(getState().results).toHaveLength(14);
  });

  test("a disabled system leaves display, fusion, forecasts and AI evidence", () => {
    const chosen = METHOD_ORDER.filter((id) => id !== "bazi" && id !== "chenggu");
    setEnabledMethods(chosen);
    const state = getState();
    expect(state.results!.map((r) => r.id)).toEqual(chosen);
    expect(state.fusion!.oracle.join(" ")).not.toContain("生辰八字");
    expect(state.fusion!.oracle.join(" ")).not.toContain("袁天罡称骨");
    expect(getForecasts().bazi).toBeUndefined();
    const e = askEvidence(state.results!, getForecasts(), "career", "bazi", input);
    expect(e.focus).toBeUndefined();
    expect(JSON.stringify(e)).not.toContain("生辰八字");
    expect(JSON.stringify(e)).not.toContain("袁天罡称骨");
    expect(JSON.parse(storage.get("tianji.methods.v1")!)).toEqual(chosen);
  });

  test("selection invalidates compatibility and forecast caches", () => {
    const p = { id: "test", name: "测试", relation: "friend" as const, input };
    expect(getForecasts().bazi).toBeDefined();
    expect(compatWith(p).compats.some((c) => c.methodId === "bazi")).toBe(true);
    setEnabledMethods(["numerology"]);
    expect(Object.keys(getForecasts())).toEqual(["numerology"]);
    expect(compatWith(p).compats.map((c) => c.methodId)).toEqual(["numerology"]);
    setEnabledMethods(METHOD_ORDER);
    expect(getState().results).toHaveLength(14);
    expect(getForecasts().bazi).toBeDefined();
  });

  test("empty and single-system selections do not produce invalid scores", () => {
    setEnabledMethods([]);
    expect(getState().results).toEqual([]);
    expect(getState().fusion).toBeUndefined();
    expect(getForecasts()).toEqual({});
    setEnabledMethods(["chenggu"]);
    const f = getState().fusion!;
    expect(Number.isFinite(f.overall)).toBe(true);
    expect(Object.values(f.elements)).toEqual([0, 0, 0, 0, 0]);
    expect(f.oracle.join(" ")).toContain("没有五行资料");
  });

  test("birth edits keep the selection and replace cached data", () => {
    setEnabledMethods(["bazi"]);
    const oldChart = getState().chart;
    const oldForecast = getForecasts();
    compute(profileBirthInput("1991-06-16", "", false, city, "female", false));
    expect(getState().chart).not.toBe(oldChart);
    expect(getForecasts()).not.toBe(oldForecast);
    expect(getState().input!.hour).toBe(12);
    expect(getState().results!.map((r) => r.id)).toEqual(["bazi"]);
    clearState();
    loadSaved();
    expect(getState().input!.year).toBe(1991);
    expect(getState().results!.map((r) => r.id)).toEqual(["bazi"]);
  });

  test("invalid birth edits leave the previous chart unchanged", () => {
    const before = getState().chart;
    expect(() => profileBirthInput("2026-02-30", "14:30", true, city, "male", true)).toThrow();
    expect(() => profileBirthInput("2999-01-01", "14:30", true, city, "male", true)).toThrow();
    expect(() => profileBirthInput("1990-05-15", "25:00", true, city, "male", true)).toThrow();
    expect(() => profileBirthInput("1990-05-15", "14:30", true, { ...city, lat: NaN }, "male", true)).toThrow();
    expect(() => profileBirthInput("1990-05-15", "14:30", true, { ...city, tz: "bad-zone" }, "male", true)).toThrow();
    expect(getState().chart).toBe(before);
  });
});
