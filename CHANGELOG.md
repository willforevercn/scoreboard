# Changelog

All notable changes to the scoreboard. Versions follow the order of merged pull requests; dates are commit dates.

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
