export type CookieCategory = 'necessary' | 'externalServices' | 'analytics';

export type CookiePreferences = {
  necessary: true;
  externalServices: boolean;
  analytics: boolean;
};

export const DEFAULT_COOKIE_PREFERENCES: CookiePreferences = {
  necessary: true,
  externalServices: false,
  analytics: false,
};

export const COOKIE_PREFERENCES_STORAGE_KEY = 'puch_cookie_preferences_v1';
export const COOKIE_PREFERENCES_EVENT = 'cookiePreferencesChanged';
