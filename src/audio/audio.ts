import type { SoundName } from '../types.js';

// Import audio files through bundler so they get proper URLs
const sfxWing = require('../../assets/audio/sfx_wing.wav');
const sfxPoint = require('../../assets/audio/sfx_point.wav');
const sfxHit = require('../../assets/audio/sfx_hit.wav');
const sfxDie = require('../../assets/audio/sfx_die.wav');
const sfxSwoosh = require('../../assets/audio/sfx_swooshing.wav');

interface AudioModule {
  play(sound: SoundName): void;
}

const SOUND_FILES: Record<SoundName, string> = {
  flap: sfxWing,
  score: sfxPoint,
  collision: sfxHit,
  fall: sfxDie,
  swoosh: sfxSwoosh,
};

// Web fallback using HTMLAudioElement
class WebAudioModule implements AudioModule {
  private sounds: Map<SoundName, HTMLAudioElement> = new Map();

  constructor() {
    for (const [name, src] of Object.entries(SOUND_FILES)) {
      const audio = new Audio();
      audio.src = src;
      audio.preload = 'auto';
      this.sounds.set(name as SoundName, audio);
    }
  }

  play(sound: SoundName): void {
    const audio = this.sounds.get(sound);
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Autoplay may be blocked until user interaction
      });
    }
  }
}

// Native module stub for Lynx native targets (Android/iOS)
// To implement: register a native module called 'AudioModule' on each platform
// Android: LynxModule with @LynxMethod play(String soundName)
// iOS: LynxModule with - (void)play:(NSString *)soundName
class NativeAudioModule implements AudioModule {
  play(sound: SoundName): void {
    try {
      const mod = (globalThis as any).__lynx_requireModule?.('AudioModule');
      if (mod) {
        mod.play(sound);
      } else {
        console.warn(`[Audio] Native AudioModule not available, cannot play: ${sound}`);
      }
    } catch {
      console.warn(`[Audio] Failed to play: ${sound}`);
    }
  }
}

// Auto-detect environment
function createAudioModule(): AudioModule {
  if (typeof Audio !== 'undefined') {
    return new WebAudioModule();
  }
  return new NativeAudioModule();
}

export const audioModule = createAudioModule();
