# Scoreboard

A single-file table tennis scoreboard for a phone lying at the edge of the table, designed so both players can read it from across the table. No backend, no runtime dependencies — open `universal_scoreboard_pwa.html` in a browser (or the site root; `index.html` redirects there), or add it to your home screen as a PWA for fullscreen offline use.

## How it looks

The screen is a table seen from above: two blue halves with a white net down the middle, one giant digit per half. Players are told apart by digit colour — **orange** on one side, **white** on the other (the colours follow the players when sides swap). The **serving player's half lights up** in bright table blue while the receiving half drops to a deep navy and its digit dims; that brightness flip is the serve indicator — there's no icon to squint at. The home-screen icon is the same table with the same two digits.

A small white pill at the top centre shows the games won (`2 : 1`). Names sit in the outer top corners, and three small translucent buttons float over the bottom of the centre seam: Reset, Swap Sides, Settings. Everything other than the digits and the lit half is intentionally small: it's for the person keeping score, not the players.

Settings → **Layout** has two modes. **Force landscape** (default): the board is always side by side; when the phone is held upright the whole app rotates itself 90° so it still reads as landscape — for rotation lock or a phone lying flat. **Follow system**: the board follows the phone — held sideways it is side by side, held upright the halves stack top and bottom with a horizontal net, the far player on top, for a scorer standing at one end of the table. Swipe directions follow whichever layout is showing. On Android, installing it as a PWA locks the orientation natively in Force landscape. The halves run edge to edge (under the notch / Dynamic Island); only the corner labels step inside the safe area.

## Scoring

- **Tap** a half, or **swipe up** on it: +1 for that side
- **Swipe down**: −1 (undo a mis-tap)
- Games are to **11**, win by 2 (deuce at 10–10)
- When a game is won a dialog asks you to confirm (or undo the last point); sets update automatically and can't be edited by hand
- Match format is **best of 5** by default; switch to Bo3 or Bo7 in Settings

## Serve, sides, and rules handled for you

- Service alternates every 2 points, every point once both sides reach 10
- First server alternates each game
- Tap the faint **SERVE** tag in a half's bottom corner to set that side as the current server (e.g. to pick who serves first)
- Sides **swap automatically** after every game, and **at 5 points in the deciding game**
- **Swap Sides** (floating button) mirrors the halves manually so the left half always matches the player standing on the left — the serve and the match history follow the players, not the side of the screen

## Voice announcements

Uses the browser's built-in speech (Web Speech API), so nothing to install. Calls are in English; a player's name written in Chinese/Japanese/Korean characters is spoken in Mandarin within the English call:

- Every point: score with the server's number first, then who serves — `"7 - 5, Percy Serve"`
- Game won: `"Percy wins Game 2, 11 - 8"`
- Start of the next game: the games score, then `"Change Sides"`, then `"0 - 0, Li Serve"`
- Side change at 5 in the deciding game: `"Change Sides"`, then the score call for that point
- Match over: `"Match over, Percy wins, 3 - 1"`
- With a Chinese name: `"5 - 3, 小明 Serve"`, `"小明 wins Game 2, 11 - 8"` — the name in Mandarin, everything else in English

Rapid scoring interrupts any call still playing, so you only ever hear the current score — except that a "Change Sides" call is never cut off; the score queues behind it. Turn the whole thing off with **Sound & voice** in Settings.

## Settings

- Layout: Force landscape / Follow system
- Match format: Bo3 / Bo5 / Bo7
- Sound & voice on/off

The screen is kept awake automatically for the whole session (Wake Lock, re-acquired after switching apps); there's nothing to switch on. On iPhones that don't support it, set Auto-Lock to Never.

## Nothing gets lost

The match is saved after every point. If the app is reloaded, killed in the background or the phone restarts, it offers **Continue** (with the score it remembers) or **New match**. Names and preferences are always restored.

## Installing as an app

In iPhone Safari: Share → **Add to Home Screen**. A service worker (`sw.js`, network-first) keeps it working offline and picks up new versions automatically. If you installed a version before 1.2.0, delete the icon and add it again once — earlier versions had no working offline cache and used a status-bar style that left a black band at the screen edge.

## Development

The app is `universal_scoreboard_pwa.html`: pre-built Tailwind CSS inlined in `<style>`, Lucide icons inlined as SVG, vanilla JS in the `<script>` at the bottom. Around it:

| File | Purpose |
|---|---|
| `index.html` | one-line redirect so the site root works |
| `sw.js` | service worker (network-first, offline fallback) |
| `manifest.webmanifest`, `assets/icon-*.png` | install metadata and home-screen icons |
| `scripts/build.sh` | regenerates the inlined CSS after you change Tailwind class names (needs Node) |
| `scripts/make-icons.py` | regenerates the icons from code (needs Pillow) |
| `test.js` | logic tests — `node test.js` |

If you edit classes in the HTML or in JS strings, run `scripts/build.sh` to see the result locally; the CSS between the `TAILWIND:BEGIN/END` markers is generated, don't hand-edit it. You can also just open a PR: the CI workflow (`.github/workflows/ci.yml`) runs the tests, rebuilds the CSS, and commits the result back to the PR branch if you forgot. Pushes to `main` fail CI if the inlined CSS is stale.

Things you're most likely to tweak:

- **Digit size** — `.score-digit` in the `<style>` block: `min(38vw, 80vh)` in landscape (swapped to `min(38vh, 80vw)` when the app is self-rotated)
- **Colours** — `.half` / `.half.serving` (table blue, lit vs. navy) and `.half[data-color=orange|white] .score-digit` (player digit colours); the icon uses the same values in `scripts/make-icons.py`
- **Voice wording** — `announceServeChange`, `showGameWinModal`, `announceGameScore`, `announceMatchResult`

The forced-landscape behaviour is the `@media (orientation: portrait)` block: it rotates `.full-height` 90° and swaps its width/height, and `upAxisDelta()` in the script remaps swipes accordingly. In Follow-system mode `applyLayout()` sets `html.layout-stack` instead whenever the viewport is portrait; the `html.layout-stack` rules turn the grid into two rows. `html, body` are pinned (`position: fixed; overflow: hidden`) on purpose — without that, the rotated container's pre-transform box counts as horizontal overflow on iOS and the page can drift sideways.

The status-bar meta is `black` (opaque), not `black-translucent`, on purpose: with the translucent style iOS sizes a home-screen web app's view 59pt short and leaves an unpaintable black band at the far edge. Note iOS reads this meta when the icon is added — change it and you must re-add the icon. `fitViewport()` feeds the measured window size into `--app-w` / `--app-h`.

Match state lives in the `state` object. Each team has a stable `id` that travels with it through side swaps; game history is recorded by that id, which is what keeps the match summary correct after sides change.
