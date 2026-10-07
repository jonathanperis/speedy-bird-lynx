export interface Preferences {
  version: 1;
  bestScore: number;
}

export const DEFAULT_PREFERENCES: Preferences = { version: 1, bestScore: 0 };

/** Parse stored preferences, falling back to defaults for missing or corrupt data. */
export function parsePreferences(value: string | null | undefined): Preferences {
  if (!value) return { ...DEFAULT_PREFERENCES };
  try {
    const data: unknown = JSON.parse(value);
    if (!data || typeof data !== 'object') return { ...DEFAULT_PREFERENCES };
    const saved = data as Partial<Preferences>;
    if (saved.version !== 1) return { ...DEFAULT_PREFERENCES };
    const best = saved.bestScore;
    return { version: 1, bestScore: typeof best === 'number' && Number.isSafeInteger(best) && best >= 0 ? best : 0 };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function serializePreferences(preferences: Preferences): string {
  return JSON.stringify(preferences);
}
