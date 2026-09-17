import { STATE_OVER } from '../types.js';
import type { SoundName } from '../types.js';
import { createGame, gameConfig, isSettled, step, STEP_MS, tap } from './engine.js';
import type { GameConfig, GameSnapshot } from './engine.js';

export interface Replay {
  version: 1;
  seed: number;
  bestScore: number;
  config: GameConfig;
  frames: number;
  taps: number[];
}

// A session owns scheduling and recording; renderers only consume snapshots/events.
export class GameSession {
  state: GameSnapshot;
  paused = false;
  lastReplay: Replay | null = null;
  private accumulator = 0;
  private taps: number[] = [];
  private initialBest: number;
  private playback: Replay | null = null;
  private playbackIndex = 0;

  constructor(public config = gameConfig(), seed = 1, bestScore = 0) {
    this.state = createGame(seed, bestScore);
    this.initialBest = bestScore;
  }

  get replaying() { return this.playback !== null; }

  input(): SoundName[] {
    if (this.paused || this.replaying) return [];
    if (this.state.gameState === STATE_OVER) {
      this.lastReplay = this.recording();
      this.taps = [];
      this.initialBest = this.state.bestScore;
      this.accumulator = 0;
    } else this.taps.push(this.state.frame);
    const result = tap(this.state);
    this.state = result.state;
    return result.sounds;
  }

  setPaused(paused: boolean) {
    this.paused = paused;
    this.accumulator = 0;
  }

  restart(config = this.config, seed = this.state.seed) {
    if (!this.replaying && this.taps.length) this.lastReplay = this.recording();
    this.config = config;
    this.initialBest = this.state.bestScore;
    this.state = createGame(seed, this.initialBest);
    this.taps = [];
    this.playback = null;
    this.paused = false;
    this.accumulator = 0;
  }

  recording(): Replay {
    return { version: 1, seed: this.state.seed, bestScore: this.initialBest,
      config: { ...this.config }, frames: this.state.frame, taps: [...this.taps] };
  }

  replay(): boolean {
    const recording = this.playback ?? (this.taps.length ? this.recording() : this.lastReplay);
    if (!recording || recording.frames === 0) return false;
    this.lastReplay = recording;
    this.playback = recording;
    this.playbackIndex = 0;
    this.config = { ...recording.config };
    this.state = createGame(recording.seed, recording.bestScore);
    this.paused = false;
    this.accumulator = 0;
    return true;
  }

  private applyPlaybackInputs(sounds: SoundName[]) {
    while (this.playback?.taps[this.playbackIndex] === this.state.frame) {
      const result = tap(this.state);
      this.state = result.state;
      sounds.push(...result.sounds);
      this.playbackIndex++;
    }
  }

  singleStep(): SoundName[] {
    const sounds: SoundName[] = [];
    if (this.playback) {
      this.applyPlaybackInputs(sounds);
      if (this.state.frame >= this.playback.frames) {
        this.setPaused(true);
        return sounds;
      }
    }
    const result = step(this.state, this.config);
    this.state = result.state;
    sounds.push(...result.sounds);
    if (this.playback && this.state.frame >= this.playback.frames) {
      // A recording can end just after a tap, before the next physics step.
      this.applyPlaybackInputs(sounds);
      this.setPaused(true);
    }
    return sounds;
  }

  advance(elapsedMs: number): SoundName[] {
    if (this.paused || isSettled(this.state, this.config)) return [];
    this.accumulator += Math.max(0, Math.min(elapsedMs, 250)) * this.config.timeScale;
    const sounds: SoundName[] = [];
    while (this.accumulator >= STEP_MS && !this.paused) {
      this.accumulator -= STEP_MS;
      sounds.push(...this.singleStep());
    }
    return sounds;
  }
}
