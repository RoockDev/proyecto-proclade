const DEFAULT_POST_AUTH_PATH = '/';
const AUTH_ONLY_PATHS = new Set(['/auth/login', '/auth/register']);

type RedirectLocationState = {
  redirectTo?: string;
};

const isSafeRedirectPath = (path: string): boolean => {
  return path.startsWith('/') && !path.startsWith('//') && !path.includes('://');
};

const getPathnameFromTarget = (target: string): string => {
  const [pathname] = target.split('?');
  return pathname;
};

const hasRedirectState = (state: unknown): state is RedirectLocationState => {
  if (typeof state !== 'object' || state === null) {
    return false;
  }

  return 'redirectTo' in state;
};

export const getRequestedRedirectTarget = (
  search: string,
  state: unknown,
): string | null => {
  const queryRedirect = new URLSearchParams(search).get('redirectTo');
  if (typeof queryRedirect === 'string' && queryRedirect.trim().length > 0) {
    return queryRedirect.trim();
  }

  if (hasRedirectState(state) && typeof state.redirectTo === 'string') {
    const stateRedirect = state.redirectTo.trim();
    if (stateRedirect.length > 0) {
      return stateRedirect;
    }
  }

  return null;
};

export const resolvePostAuthTarget = (requestedTarget: string | null): string => {
  if (!requestedTarget || !isSafeRedirectPath(requestedTarget)) {
    return DEFAULT_POST_AUTH_PATH;
  }

  const targetPathname = getPathnameFromTarget(requestedTarget);
  if (AUTH_ONLY_PATHS.has(targetPathname)) {
    return DEFAULT_POST_AUTH_PATH;
  }

  return requestedTarget;
};
