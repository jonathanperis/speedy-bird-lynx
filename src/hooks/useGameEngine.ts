import { useCallback, useEffect, useRef, useState } from '@lynx-js/react';
import { getHostBridge } from '../audio/audio.js';
import { gameConfig, isSettled } from '../game/engine.js';
import { GameSession } from '../game/session.js';
import { DEFAULT_PREFERENCES, parsePreferences } from '../game/preferences.js';
import type { Preferences } from '../game/preferences.js';
import type { SoundName } from '../types.js';

export type GameCommand = 'tap' | 'pause' | 'step' | 'restart' | 'replay' | 'practice' | 'mute' | 'debug';

export function useGameEngine() {
  const session = useRef<GameSession | null>(null);
  if (!session.current) session.current = new GameSession();
  const preferences = useRef<Preferences>({ ...DEFAULT_PREFERENCES });
  const wake = useRef<() => void>(() => {});
  const loaded = useRef(false);
  const [view, setView] = useState({
    renderState: session.current.state, config: session.current.config,
    paused: false, replaying: false, preferences: preferences.current, frameMs: 0, bridgeAvailable: false,
  });

  const publish = useCallback((sounds: SoundName[] = [], frameMs = 0) => {
    'background only';
    const current = session.current!;
    const bridge = getHostBridge();
    if (!preferences.current.muted) sounds.forEach(sound => bridge?.play(sound));
    if (current.state.bestScore > preferences.current.bestScore) {
      preferences.current = { ...preferences.current, bestScore: current.state.bestScore };
      bridge?.savePreferences(JSON.stringify(preferences.current));
    }
    setView({ renderState: current.state, config: current.config, paused: current.paused,
      replaying: current.replaying, preferences: preferences.current, frameMs, bridgeAvailable: !!bridge });
  }, []);

  const command = useCallback((action: GameCommand) => {
    'background only';
    if (!loaded.current) return;
    const current = session.current!;
    let sounds: SoundName[] = [];
    if (action === 'tap') sounds = current.input();
    if (action === 'pause') current.setPaused(!current.paused);
    if (action === 'step') { current.setPaused(true); sounds = current.singleStep(); }
    if (action === 'restart') current.restart();
    if (action === 'replay') current.replay();
    if (action === 'practice' || action === 'mute' || action === 'debug') {
      const key = action === 'mute' ? 'muted' : action;
      preferences.current = { ...preferences.current, [key]: !preferences.current[key] };
      if (action === 'practice') current.restart(gameConfig(preferences.current.practice));
      getHostBridge()?.savePreferences(JSON.stringify(preferences.current));
    }
    if (current.paused || preferences.current.muted) getHostBridge()?.stopAudio();
    publish(sounds);
    wake.current();
  }, [publish]);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let last = Date.now();
    const current = session.current!;
    const bridge = getHostBridge();
    const schedule = () => {
      if (!active || !loaded.current || timer !== undefined || current.paused || isSettled(current.state, current.config)) return;
      last = Date.now();
      timer = setTimeout(tick, 17);
    };
    const tick = () => {
      timer = undefined;
      if (!active || current.paused) return;
      const now = Date.now();
      const elapsed = now - last;
      last = now;
      publish(current.advance(elapsed), elapsed);
      if (!current.paused && !isSettled(current.state, current.config)) timer = setTimeout(tick, 17);
    };
    wake.current = schedule;
    const restore = (value: string) => {
      if (!active) return;
      preferences.current = parsePreferences(value);
      current.state = { ...current.state, bestScore: preferences.current.bestScore };
      current.restart(gameConfig(preferences.current.practice));
      loaded.current = true;
      publish();
      schedule();
    };
    if (bridge) bridge.loadPreferences(restore);
    else restore(''); // Lynx Explorer has no app-specific bridge; gameplay is still usable.

    const events = lynx.getJSModule('GlobalEventEmitter');
    const pause = () => {
      current.setPaused(true);
      if (timer !== undefined) clearTimeout(timer);
      timer = undefined;
      bridge?.stopAudio();
      publish();
    };
    const hostCommand = (action: unknown) => {
      if (typeof action === 'string' && ['tap', 'pause', 'step', 'restart', 'replay', 'practice', 'mute', 'debug'].includes(action)) {
        command(action as GameCommand);
      }
    };
    events.addListener('SpeedyBirdPause', pause);
    events.addListener('SpeedyBirdCommand', hostCommand);
    return () => {
      active = false;
      loaded.current = false;
      wake.current = () => {};
      if (timer !== undefined) clearTimeout(timer);
      events.removeListener('SpeedyBirdPause', pause);
      events.removeListener('SpeedyBirdCommand', hostCommand);
      bridge?.stopAudio();
    };
  }, [command, publish]);

  return { ...view, command };
}
