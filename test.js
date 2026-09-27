#!/usr/bin/env node
// Logic tests for the scoreboard. Loads the real <script> from the HTML into a
// minimal DOM stub and drives the game functions directly. Run: node test.js
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const html = fs.readFileSync(path.join(__dirname, 'universal_scoreboard_pwa.html'), 'utf8');
const code = html.match(/<script>([\s\S]*)<\/script>/)[1]
  .replace(/window\.addEventListener\('DOMContentLoaded'[\s\S]*$/, '');   // we call init pieces ourselves

// ---- DOM / browser stubs ----
const els = {};
const mk = (id) => els[id] || (els[id] = {
  id, textContent: '', value: '', className: '', dataset: {}, attrs: {}, style: { setProperty() {} },
  setAttribute(k, v) { this.attrs[k] = v; },
  classList: {
    _s: new Set(),
    add(...c) { c.forEach((x) => this._s.add(x)); },
    remove(...c) { c.forEach((x) => this._s.delete(x)); },
    toggle(c, on) { on ? this._s.add(c) : this._s.delete(c); },
    contains(c) { return this._s.has(c); }
  },
  appendChild() {}, addEventListener() {}, set innerHTML(v) {}, get innerHTML() { return ''; }
});
let store = {};
global.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }
};
global.document = {
  getElementById: mk, querySelectorAll: () => [], createElement: () => mk('tmp' + Math.random()),
  head: { appendChild() {} }, addEventListener() {}, documentElement: mk('html'), visibilityState: 'visible'
};
const spoken = [];
global.window = {
  addEventListener() {}, innerWidth: 844, innerHeight: 390, scrollTo() {},
  matchMedia: () => ({ matches: false }),
  speechSynthesis: { speak: (u) => spoken.push(u.lang === 'zh-CN' ? `[zh]${u.text}` : u.text), cancel: () => spoken.push('<cancel>') }
};
global.SpeechSynthesisUtterance = function (t) { this.text = t; };
Object.defineProperty(global, 'navigator', { value: {}, configurable: true });
global.screen = {}; global.location = { protocol: 'https:' };
global.getComputedStyle = () => ({ top: '0px', right: '0px', bottom: '0px', left: '0px', getPropertyValue: () => '' });
global.matchMedia = window.matchMedia;
global.console = { ...console, warn() {} };   // silence AudioContext warnings from the stub env

// Evaluate the app script in this scope; expose what we need.
const api = eval(code + `
  ;({ state, updateScore, swapTeams, confirmGameWin, getServingTeam, setServingTeam, isDecidingGame,
      resetAll, renderUI, saveState, loadSavedState, isMatchInProgress, applySavedState, teamName, isCJK })`);
const { state } = api;

function fresh(overrides = {}) {
  spoken.length = 0;
  Object.assign(state, {
    team1: { name: 'Percy', score: 0, sets: 0, color: 'red', id: 1 },
    team2: { name: 'Li', score: 0, sets: 0, color: 'blue', id: 2 },
    targetScore: 11, bestOf: 5, games: [], firstServer: 1, pendingWin: null, matchOver: false,
    midGameSwapped: false, soundEnabled: true, wakeLockWanted: false, wakeLock: null
  }, overrides);
}
const serving = () => api.getServingTeam();
const servingName = () => api.teamName(serving());
let passed = 0;
function test(name, fn) { fn(); passed++; console.log('  ok  ' + name); }

console.log('scoreboard tests');

test('service alternates every 2 points, every point from 10-10', () => {
  fresh();
  assert.equal(serving(), 1);
  api.updateScore(1, 1); api.updateScore(1, 1);            // 2-0
  assert.equal(serving(), 2);
  api.updateScore(2, 1); api.updateScore(2, 1);            // 2-2
  assert.equal(serving(), 1);
  fresh(); state.team1.score = 10; state.team2.score = 10;
  const first = serving();
  api.updateScore(1, 1);                                   // 11-10, not over (need 2)
  assert.equal(serving(), first === 1 ? 2 : 1, 'deuce: serve changes every point');
  assert.equal(state.pendingWin, null);
});

test('swap sides keeps the serve with the same player', () => {
  fresh(); api.updateScore(1, 1); api.updateScore(1, 1);    // Li serving now
  const before = servingName();
  api.swapTeams();
  assert.equal(servingName(), before);
  assert.equal(state.team1.name, 'Li');                    // Li is now on the left
});

test('manual serve override then game win alternates first server', () => {
  fresh(); api.setServingTeam(2);
  assert.equal(servingName(), 'Li');
  state.team1.score = 10; state.team2.score = 5; api.updateScore(1, 1);
  assert.ok(state.pendingWin && state.pendingWin.winner === 1);
  api.confirmGameWin();
  // new game: sides swapped and the other player (Percy) serves first
  assert.equal(state.games.length, 1);
  assert.equal(servingName(), 'Percy');
});

test('game history survives side swaps (recorded by team id)', () => {
  fresh();
  state.team1.score = 11; state.team2.score = 5; state.pendingWin = { winner: 1 }; api.confirmGameWin();
  const g = state.games[0];
  assert.deepEqual([g.id1, g.id2, g.t1, g.t2, g.winnerId], [1, 2, 11, 5, 1]);
  // after the automatic swap, team1 slot holds Li (id 2) but the record still says Percy won 11-5
  assert.equal(state.team1.id, 2);
});

test('deciding game: swap at 5, announced, only once', () => {
  fresh(); state.team1.sets = 2; state.team2.sets = 2; state.team1.score = 4;
  assert.ok(api.isDecidingGame());
  spoken.length = 0;
  api.updateScore(1, 1);
  assert.ok(state.midGameSwapped);
  assert.deepEqual(spoken, ['<cancel>', 'Change Sides', '5 - 3, Percy Serve'.replace('3', '0')]);
  api.updateScore(1, 1); api.updateScore(2, 1); api.updateScore(2, 1); api.updateScore(2, 1); api.updateScore(2, 1); api.updateScore(2, 1);
  assert.equal(spoken.filter((s) => s === 'Change Sides').length, 1);
});

test('end-of-game announcement sequence and match end', () => {
  fresh(); state.team1.sets = 1; state.team2.sets = 0; state.team1.score = 10; state.team2.score = 8;
  state.games = [{ t1: 11, t2: 6, id1: 1, id2: 2, winnerId: 1 }];
  spoken.length = 0; api.updateScore(1, 1);
  assert.deepEqual(spoken.slice(-1), ['Percy wins Game 2, 11 - 8']);
  spoken.length = 0; api.confirmGameWin();
  assert.deepEqual(spoken, ['Game 3, 0 - 2', 'Change Sides', '0 - 0, Li Serve']);
  // win the match
  const percy = state.team1.name === 'Percy' ? 1 : 2;
  state[`team${percy}`].sets = 2; state[`team${percy}`].score = 11; state[`team${percy === 1 ? 2 : 1}`].score = 3;
  state.pendingWin = { winner: percy }; spoken.length = 0; api.confirmGameWin();
  assert.ok(state.matchOver);
  assert.deepEqual(spoken, ['Match over, Percy wins, 3 - 0']);
  // board is frozen after the match
  const s1 = state.team1.score; api.updateScore(1, 1); assert.equal(state.team1.score, s1);
});

test('a Chinese name is spoken in Mandarin, the rest of the call stays English', () => {
  fresh({ team1: { name: '小明', score: 0, sets: 0, color: 'red', id: 1 } });
  assert.ok(api.isCJK('小明') && !api.isCJK('Li'));
  spoken.length = 0; api.updateScore(1, 1);
  assert.deepEqual(spoken, ['<cancel>', '1 - 0,', '[zh]小明', 'Serve']);
  // English name: one merged utterance, as before
  fresh(); spoken.length = 0; api.updateScore(1, 1);
  assert.deepEqual(spoken, ['<cancel>', '1 - 0, Percy Serve']);
  // game win with a Chinese winner
  state.team1.score = 10; state.team2.score = 5; state.team1.name = '小明'; spoken.length = 0; api.updateScore(1, 1);
  assert.deepEqual(spoken, ['[zh]小明', 'wins Game 1, 11 - 5']);
});

test('state persists and is detected as in progress', () => {
  fresh(); api.updateScore(1, 1); api.updateScore(1, 1); api.updateScore(2, 1);
  const saved = api.loadSavedState();
  assert.ok(api.isMatchInProgress(saved));
  fresh(); assert.equal(state.team1.score, 0);
  api.applySavedState(saved);
  assert.deepEqual([state.team1.score, state.team2.score, state.team1.name], [2, 1, 'Percy']);
  assert.equal(api.isMatchInProgress({ ...saved, matchOver: true }), false);
});

console.log(`\n${passed} tests passed`);
