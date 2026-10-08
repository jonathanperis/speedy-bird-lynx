// The SpeedyBirdModule contract as implemented by each host. The build fails if a host file
// stops implementing a method, so this table cannot drift from the code.
import { readRepoFile, sourceUrl } from './repo-files';

const HOSTS = {
  android: 'android/app/src/main/kotlin/com/jonathanperis/speedybird/SpeedyBirdModule.kt',
  ios: 'ios/SpeedyBird/SpeedyBirdModule.swift',
  web: 'web-host/host.ts',
} as const;

const source = Object.fromEntries(Object.entries(HOSTS).map(([host, path]) => [host, readRepoFile(path)])) as Record<
  keyof typeof HOSTS,
  string
>;

const METHODS = [
  { method: 'play(sound)', android: 'SoundPool', ios: 'AVAudioPlayer', web: 'Web Audio', marks: ['fun play(', 'func play(', "case 'play'"] },
  { method: 'stopAudio()', android: 'SoundPool.autoPause', ios: 'AVAudioPlayer.stop', web: 'stop every source', marks: ['fun stopAudio(', 'func stopAudio(', "case 'stopAudio'"] },
  { method: 'loadPreferences(callback)', android: 'SharedPreferences', ios: 'UserDefaults', web: 'localStorage', marks: ['fun loadPreferences(', 'func loadPreferences(', "case 'loadPreferences'"] },
  { method: 'savePreferences(json)', android: 'SharedPreferences', ios: 'UserDefaults', web: 'localStorage', marks: ['fun savePreferences(', 'func savePreferences(', "case 'savePreferences'"] },
  { method: 'announce(message)', android: 'Live region', ios: 'VoiceOver announcement', web: 'aria-live region', marks: ['fun announce(', 'func announce(', "case 'announce'"] },
] as const;

for (const { method, marks } of METHODS) {
  (['android', 'ios', 'web'] as const).forEach((host, index) => {
    if (!source[host].includes(marks[index])) {
      throw new Error(`${HOSTS[host]} no longer implements SpeedyBirdModule.${method} (looked for "${marks[index]}")`);
    }
  });
}

export const BRIDGE_ROWS = METHODS.map(({ method, android, ios, web }) => ({ method, android, ios, web }));
export const HOST_LINKS = Object.fromEntries(Object.entries(HOSTS).map(([host, path]) => [host, sourceUrl(path)])) as Record<
  keyof typeof HOSTS,
  string
>;
