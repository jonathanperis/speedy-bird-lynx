// Sound effects for the Canvas demo through the Web Audio API: decoded once, low latency,
// overlapping playback. Audio is optional; any failure leaves the game silent but playable.

import type { SoundName } from '../../../src/types.ts';

const SOUND_FILES: Record<SoundName, string> = {
  flap: 'audio/sfx_wing.wav',
  score: 'audio/sfx_point.wav',
  collision: 'audio/sfx_hit.wav',
  fall: 'audio/sfx_die.wav',
  swoosh: 'audio/sfx_swooshing.wav',
};

export interface GameAudio {
  /** Create or resume the audio context. Call from a user gesture; starts loading sounds. */
  unlock(): void;
  play(sound: SoundName): void;
  /** Stop every sound that is still playing. */
  stop(): void;
  muted: boolean;
}

export function createAudio(assetsUrl: URL): GameAudio {
  let context: AudioContext | null = null;
  const buffers = new Map<SoundName, AudioBuffer>();
  const playing = new Set<AudioBufferSourceNode>();

  const load = (audio: AudioContext) => {
    for (const [name, file] of Object.entries(SOUND_FILES) as [SoundName, string][]) {
      fetch(new URL(file, assetsUrl))
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.arrayBuffer();
        })
        .then((data) => audio.decodeAudioData(data))
        .then((buffer) => buffers.set(name, buffer))
        .catch(() => {
          // Missing, blocked, or undecodable sound: play the game without it.
        });
    }
  };

  const api: GameAudio = {
    muted: false,
    unlock() {
      if (!context) {
        // Created on the first user gesture so browsers allow it to start.
        if (typeof AudioContext !== 'function') return;
        try {
          context = new AudioContext();
        } catch {
          return;
        }
        load(context);
      }
      if (context.state === 'suspended') void context.resume().catch(() => {});
    },
    play(sound) {
      const buffer = buffers.get(sound);
      if (api.muted || !context || !buffer) return;
      if (context.state === 'suspended') void context.resume().catch(() => {});
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.onended = () => playing.delete(source);
      playing.add(source);
      source.start();
    },
    stop() {
      for (const source of playing) {
        try {
          source.stop();
        } catch {
          // Already stopped.
        }
      }
      playing.clear();
    },
  };
  return api;
}
