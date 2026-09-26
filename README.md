# Scoreboard

A single-file table tennis scoreboard for a phone lying at the edge of the table, designed so both players can read it from across the table. No build step, no backend — open `universal_scoreboard_pwa.html` in a browser, or add it to your home screen as a PWA for fullscreen offline use.

## How it looks

Two halves fill the screen, one per player. Each half shows one giant digit. The **serving player's half lights up** in their colour (red or blue); the receiving half stays dark. That colour flip is the serve indicator — there's no icon to squint at.

A small white pill at the top centre shows the games won (`2 : 1`). Names sit in the outer top corners; a muted control strip along the bottom has Reset, Swap Sides, the current game / format, and Settings. Everything other than the digits and the lit half is intentionally small: it's for the person keeping score, not the players.

Hold the phone horizontally. The layout also works in portrait (halves stacked), but landscape is what it's tuned for.

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
- **Swap Sides** in the bottom strip mirrors the halves manually so the left half always matches the player standing on the left — the serve and the match history follow the players, not the side of the screen

## Voice announcements

Uses the browser's built-in speech (Web Speech API, English), so nothing to install:

- Every point: score with the server's number first, then who serves — `"7 - 5, Percy Serve"`
- Game won: `"Percy wins Game 2, 11 - 8"`
- Start of the next game: the games score, then `"Change Sides"`, then `"0 - 0, Li Serve"`
- Match over: `"Match over, Percy wins, 3 - 1"`

Rapid scoring interrupts any call still playing, so you only ever hear the current score. Turn the whole thing off with **Sound & voice** in Settings.

## Settings

- Match format: Bo3 / Bo5 / Bo7
- Sound & voice on/off
- Keep screen on (Wake Lock; on iPhones without support, set Auto-Lock to Never)

## Installing as an app

In iPhone Safari: Share → **Add to Home Screen**. The page registers a service worker so it keeps working offline.

## Development

It's one file: `universal_scoreboard_pwa.html`. Tailwind (CDN, JIT) for styling, Lucide for icons, everything else vanilla JS in the `<script>` at the bottom.

Things you're most likely to tweak:

- **Digit size** — `.score-digit` in the `<style>` block: `min(34vw, 74vh)` for side-by-side, `min(70vw, 38vh)` for stacked
- **Half colours** — the `.half[data-color=…]` rules (dark = receiving, `.serving` = lit)
- **Voice wording** — `announceServeChange`, `showGameWinModal`, `announceGameScore`, `announceMatchResult`

Match state lives in the `state` object. Each team has a stable `id` that travels with it through side swaps; game history is recorded by that id, which is what keeps the match summary correct after sides change.
