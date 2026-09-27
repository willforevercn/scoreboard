# Changelog

All notable changes to the scoreboard. Versions follow the order of merged pull requests; dates are commit dates.

## 1.1.4 — 2026-09-27

### Fixed
- The deciding-game side change at 5 points was performed but never announced: the per-point score call (interrupt mode) cancelled the "Change Sides" utterance. The swap call now goes first and that point's score call queues behind it.

## 1.1.3 — 2026-09-27

### Changed
- Added `index.html` that redirects to `universal_scoreboard_pwa.html`, so the app opens from the site root without typing the file name. Manifest `start_url` and the offline cache now point at the app file explicitly.

## 1.1.2 — 2026-09-26

### Fixed
- Black band along the far edge (right in landscape, bottom when self-rotated) in home-screen mode. With `apple-mobile-web-app-status-bar-style=black-translucent`, iOS sizes the web view 59pt short (the status-bar height) while anchoring it at the screen origin, so the far edge is native black that the page can't paint. Switched to the opaque `black` style, which lays the web view out below the status bar and lets it reach the screen edge; in landscape the status bar is hidden so the board is full-screen. (Existing home-screen icons must be re-added for the new style to take effect.)
- Installed app never picked up new versions: the service worker was cache-first. It is now network-first with cache fallback, and clears old caches on activate.

### Added
- Layout diagnostics line at the bottom of Settings (viewport, app size, screen, safe-area insets, scroll, orientation, browser/standalone).

## 1.1.1 — 2026-09-26

### Fixed
- Black band on the right after rotating back to real landscape, and flicker while rotating: the document is now pinned (`html, body { position: fixed; overflow: hidden }`) so the rotated container's oversized pre-transform box can't scroll the page sideways or trigger re-layouts mid-rotation. Scroll is also reset on every orientation change.

## 1.1.0 — 2026-09-26

### Added
- Forced landscape: when the viewport is portrait (rotation lock on, phone lying flat) the app rotates itself 90° and swaps its dimensions, so the board is always shown landscape. Tap/swipe gestures are remapped to the rotated axis. Manifest `orientation: landscape` and a best-effort `screen.orientation.lock()` for Android PWAs.

## 1.0.0 — 2026-09-26

First stable release. Distance-readable redesign: the screen is now meant to be read by both players from across the table.

### Changed
- Dark theme. Each half is filled by one giant digit (`min(34vw, 74vh)` in landscape).
- The serving half lights up in its colour (red / blue); the receiving half stays dark. This replaces the serve icon entirely.
- Removed the top header and the `−` / `+ Score` button row. Scoring is tap / swipe up (+1) and swipe down (−1).
- Controls (Reset, Swap Sides, Settings) are three small translucent buttons floating over the bottom of the centre seam; the `Game · 11 PTS · BoN` caption was dropped.
- Halves run edge to edge under the notch / Dynamic Island in landscape; only corner labels respect the safe area.
- Sets shown as a single `2 : 1` pill at the top centre. Sets are display-only (no manual +/−).
- Team names moved to the outer top corners; a faint `SERVE` tag in each bottom corner lets the scorer override who is serving.
- Sound & voice and Keep screen on moved into Settings. All dialogs (game win, match over, reset, settings) restyled to match.

### Added
- Voice call on every point: score with the server's number first, then who serves (`"7 - 5, Percy Serve"`). Rapid scoring interrupts stale calls.
- Voice on game win (`"Percy wins Game 2, 11 - 8"`), on new game (games score → `"Change Sides"` → `"0 - 0, Li Serve"`), and on match end (`"Match over, Percy wins, 3 - 1"`).
- Automatic side swap after every game, and at 5 points in the deciding game.
- Serve indicator uses the team's name rather than "Change Serve".

### Removed
- Beep tones for serve / side changes (replaced by speech); the ping-pong ball / paddle icons.

## 0.5.0 — 2026-09-22 (#4)

### Removed
- Configurable target score. Games are always to 11, win by 2.

## 0.4.0 — 2026-09-22 (#3)

### Added
- Match format setting: best of 3 / 5 / 7 (default Bo5). Header shows the current format.

### Removed
- Team colour picker and the countdown timer.

### Fixed
- Settings dialog overflowing on phones in landscape.

## 0.3.0 — 2026-09-22 (#2)

### Added
- Tap the serve badge to manually set who serves (e.g. first server of game 1).
- Match summary shows team names once as a table header instead of on every row.
- Landscape-phone layout: side-by-side halves, compact spacing, safe-area insets for the notch.

### Fixed
- Swap Sides now carries the serve with the player instead of leaving it on the same side of the screen.
- Game history is recorded by a stable team id, so the match summary stays correct when sides are swapped mid-match (previously a game could be attributed to the wrong player).

## 0.2.0 — 2026-09-22

### Changed
- UI text switched to English.

## 0.1.0 — 2026-09-21 / 22 (#1)

- Initial single-file PWA scoreboard: two team cards, tap/swipe scoring, sets, timer, colour themes, service rotation, game-win confirmation and match summary.
- README added.
