export interface Preferences { version: 1; bestScore: number; muted: boolean; practice: boolean; debug: boolean }
export const DEFAULT_PREFERENCES: Preferences = { version: 1, bestScore: 0, muted: false, practice: false, debug: false };
export const STORAGE_KEY = 'speedy-bird.preferences.v1';

export function parsePreferences(value: string | null): Preferences {
  if (!value) return { ...DEFAULT_PREFERENCES };
  try {
    const data: unknown = JSON.parse(value);
    if (!data || typeof data !== 'object') return { ...DEFAULT_PREFERENCES };
    const saved = data as Partial<Preferences>;
    if (saved.version !== 1) return { ...DEFAULT_PREFERENCES };
    return {
      version: 1,
      bestScore: Number.isSafeInteger(saved.bestScore) && saved.bestScore! >= 0 ? saved.bestScore! : 0,
      muted: saved.muted === true, practice: saved.practice === true, debug: saved.debug === true,
    };
  } catch { return { ...DEFAULT_PREFERENCES }; }
}
