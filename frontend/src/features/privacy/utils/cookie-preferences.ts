import {
  COOKIE_PREFERENCES_EVENT,
  COOKIE_PREFERENCES_STORAGE_KEY,
  DEFAULT_COOKIE_PREFERENCES,
  type CookieCategory,
  type CookiePreferences,
} from '../types/cookie-preferences.types';

const isBrowser = (): boolean =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const sanitize = (raw: unknown): CookiePreferences => {
  if (raw && typeof raw === 'object') {
    const candidate = raw as Partial<CookiePreferences>;
    return {
      necessary: true,
      externalServices: candidate.externalServices === true,
      analytics: candidate.analytics === true,
    };
  }
  return { ...DEFAULT_COOKIE_PREFERENCES };
};

export const getCookiePreferences = (): CookiePreferences => {
  if (!isBrowser()) {
    return { ...DEFAULT_COOKIE_PREFERENCES };
  }

  try {
    const stored = window.localStorage.getItem(COOKIE_PREFERENCES_STORAGE_KEY);
    if (!stored) {
      return { ...DEFAULT_COOKIE_PREFERENCES };
    }
    return sanitize(JSON.parse(stored));
  } catch {
    return { ...DEFAULT_COOKIE_PREFERENCES };
  }
};

export const setCookiePreferences = (preferences: CookiePreferences): void => {
  if (!isBrowser()) {
    return;
  }

  const normalized: CookiePreferences = {
    necessary: true,
    externalServices: preferences.externalServices === true,
    analytics: preferences.analytics === true,
  };

  try {
    window.localStorage.setItem(
      COOKIE_PREFERENCES_STORAGE_KEY,
      JSON.stringify(normalized),
    );
  } catch {
    // Ignore localStorage write errors (quota, private mode, etc.)
  }

  window.dispatchEvent(
    new CustomEvent(COOKIE_PREFERENCES_EVENT, { detail: normalized }),
  );
};

export const acceptAllPreferences = (): void => {
  setCookiePreferences({
    necessary: true,
    externalServices: true,
    analytics: false,
  });
};

export const rejectAllPreferences = (): void => {
  setCookiePreferences({ ...DEFAULT_COOKIE_PREFERENCES });
};

export const isCategoryEnabled = (category: CookieCategory): boolean => {
  const prefs = getCookiePreferences();
  return prefs[category] === true;
};
