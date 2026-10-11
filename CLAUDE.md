# CLAUDE.md

Static single-page site (vanilla TypeScript, no framework). See README.md for the feature list and structure.

## Toolchain

Use Bun for everything.

- `bun run dev` — dev server (`bun index.html`). `.claude/launch.json` starts it on port 5173.
- `bun test` — engine tests in `tests/`.
- `bunx tsc --noEmit -p .` — type check.
- `bun run build` — static build into `dist/`.

Run all three checks (types, tests, build) before a commit.

## Conventions

- DOM: use `h()` from `src/ui/dom.ts`. Pass CSS custom properties in `style` as `{ "--name": value }`. `h()` uses `setProperty`, because `Object.assign` on a style object drops custom properties.
- `h()` skips attributes whose value is `false`. For ARIA states, pass a string: `"aria-pressed": String(flag)`.
- Each method in `src/methods/` returns a `MethodResult` with five scores in 0–100. Register new methods in `src/methods/index.ts` and add a visual in `src/ui/visuals.ts`.
- Animations: an element with base `opacity: 0` must use a keyframe that has a `to` frame, or it stays invisible.
- Registered `@property --p` is a `<number>`. Do not put a percent value in it. Use a different property name.
- Astrology glyphs carry `︎`, so they show as text, not as emoji.
- Code comments and docs are in English. UI text is in Chinese.

## Browser checks

- In the Claude browser pane, a hidden pane pauses `requestAnimationFrame`. Views can look blank until a later frame. Wait before a screenshot.
- A hash change does not reload code. Use `location.reload()` after an edit.
