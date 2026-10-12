# AGENTS.md

Static single-page site (vanilla TypeScript, no framework). See README.md for the feature list and structure.

## Toolchain

Use Bun for everything.

- `bun run dev` — dev server (`bun index.html`). `.claude/launch.json` starts it on port 5173.
- `bun test` — engine tests in `tests/`.
- `bunx tsc --noEmit -p .` — type check.
- `bun run build` — clears `dist/`, then builds the static site into it. The `dist` entry in `.claude/launch.json` serves it on port 5180.
- Deploy: `bunx wrangler@4 pages deploy dist --project-name suanming --branch main` (Cloudflare Pages). Get user approval before each deploy.

Run all three checks (types, tests, build) before a commit.

## Conventions

- DOM: use `h()` from `src/ui/dom.ts`. Pass CSS custom properties in `style` as `{ "--name": value }`. `h()` uses `setProperty`, because `Object.assign` on a style object drops custom properties.
- `h()` skips attributes whose value is `false`. For ARIA states, pass a string: `"aria-pressed": String(flag)`.
- Each method in `src/methods/` returns a `MethodResult` with five scores in 0–100 and a required `plain` reading (no jargon). Register new methods in `src/methods/index.ts` and add a visual in `src/ui/visuals.ts`.
- A method with a traditional period rule also registers a forecast in `src/forecast/index.ts`. Do not invent period forecasts for natal-only systems. A method that can compare two charts registers a `CompatFn` in `src/compat/index.ts`.
- Mode toggle: wrap professional-only content in `onlyPro()` and plain-only content in `onlyPlain()` (`src/ui/components.ts`). The switch is CSS only (`body[data-mode]`), so views do not re-render.
- Before you add a class name, search `src/styles.css` for it. Global rules such as `.flash { opacity: 0 }` exist there.
- Animations: an element with base `opacity: 0` must use a keyframe that has a `to` frame, or it stays invisible.
- Do not put `filter` on a `transform-style: preserve-3d` element (for example `.tcard-inner`). The filter flattens it, and the back face shows. Put the filter on the faces.
- Registered `@property --p` is a `<number>`. Do not put a percent value in it. Use a different property name.
- Astrology glyphs carry `︎`, so they show as text, not as emoji.
- Code comments and docs are in English. UI text is in Chinese.

## Browser checks

- In the Claude browser pane, a hidden pane pauses `requestAnimationFrame`. Views can look blank until a later frame. Wait before a screenshot.
- A hash change does not reload code. Use `location.reload()` after an edit.

## AI features and security

- Keep API keys out of Git, logs, URLs and site-server requests. Send DeepSeek keys directly to DeepSeek. Browser storage is not encrypted; say so in the UI.
- Render AI output as text nodes. Never insert it as HTML.
- Send only what the UI discloses. Do not send the birth date, birth place or names.
- Tests mock API calls. Do not use real keys or paid calls in tests.
