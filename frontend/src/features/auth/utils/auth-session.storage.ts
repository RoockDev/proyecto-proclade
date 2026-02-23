import type { AuthResponseData, AuthUser } from '../types/auth.api.types';

/*
  Comentarios dejados a consciencia para ayuda propia y del equipo cuando volvamos a revisar este archivo
  He querido dejar todo este comentario ya que este helper es muy lioso pero la verdad que cuando he buscado como hacerlo
  junto a la ia, me ha gustado mucho y creo puede ser una buena práctica hacerlo de esta manera,
  y como siempre estoy pregúntandome como pueden mejorarse las cosas arquitéctonicamente pues he 
  querido dejarlo, aunque lo más facil para mi hubiese sido guardar el user.role en el localstorage
  y me iba a funcionar igual pero me chirriaba verlo así por lo tanto he decidido hacer esto.
  
  Este archivo centraliza la gestión de la sesión en frontend (token + usuario).

  - La HU15 necesita saber si el usuario autenticado tiene rol ADMIN para mostrar
    el botón "Panel Admin" en el Header.
  - El backend ya devuelve ese dato en login/register/google (`user.roles`), pero
    si cada componente accede directamente a localStorage por su cuenta:
      1) duplicamos lógica,
      2) es más fácil cometer errores,
      3) es más difícil mantener y explicar el código.

  ¿Qué hace este helper?
  - Guarda la sesión (`saveAuthSession`)
  - Lee la sesión (`getAuthSession`)
  - Limpia la sesión (`clearAuthSession`)
  - Comprueba si un usuario es admin (`userHasAdminRole`)
  - Permite que componentes (por ejemplo Header) se actualicen cuando cambia la sesión
    (`subscribeToAuthSession`)

  ¿Por qué está bien a nivel arquitectura?
  - Separamos responsabilidades:
    - formularios de login/register: autentican
    - helper de sesión: persiste/lee sesión
    - componentes UI (Header, panel): solo consumen datos
  - Facilita futuras mejoras (Context, logout, refresh token) sin reescribir todo.
*/

const ACCESS_TOKEN_STORAGE_KEY = 'accessToken';
const AUTH_USER_STORAGE_KEY = 'authUser';

// Evento propio para avisar a la misma pestaña de que la sesión ha cambiado.
// El evento nativo `storage` no siempre se dispara en la misma pestaña que modifica localStorage.
export const AUTH_SESSION_CHANGE_EVENT = 'auth-session-changed';

type AuthSessionSnapshot = {
  accessToken: string | null;
  user: AuthUser | null;
};

// Protección por si en el futuro este código se ejecuta fuera del navegador
// (tests, SSR, etc.). Así evitamos errores al acceder a `window` o `localStorage`.
const isBrowser = typeof window !== 'undefined';

const notifyAuthSessionChanged = (): void => {
  if (!isBrowser) {
    return;
  }

  window.dispatchEvent(new Event(AUTH_SESSION_CHANGE_EVENT));
};

const parseStoredUser = (rawUser: string | null): AuthUser | null => {
  if (!rawUser) {
    return null;
  }

  try {
    
    const parsed = JSON.parse(rawUser) as Partial<AuthUser>;

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof parsed.id !== 'number' ||
      typeof parsed.email !== 'string' ||
      typeof parsed.name !== 'string' ||
      typeof parsed.surname !== 'string' ||
      !Array.isArray(parsed.roles)
    ) {
      return null;
    }

    return {
      id: parsed.id,
      email: parsed.email,
      name: parsed.name,
      surname: parsed.surname,
      roles: parsed.roles.filter((role): role is string => typeof role === 'string'),
    };
  } catch {
    return null;
  }
};

export const getAuthSession = (): AuthSessionSnapshot => {
  if (!isBrowser) {
    return {
      accessToken: null,
      user: null,
    };
  }

  const accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  const user = parseStoredUser(localStorage.getItem(AUTH_USER_STORAGE_KEY));

  return {
    accessToken,
    user,
  };
};

export const saveAuthSession = (data: AuthResponseData): void => {
  if (!isBrowser) {
    return;
  }

  // Guardamos token y usuario juntos porque la HU15 necesita `user.roles`
  // para decidir si se muestra "Panel Admin".
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, data.accessToken);
  localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(data.user));
  notifyAuthSessionChanged();
};

export const clearAuthSession = (): void => {
  if (!isBrowser) {
    return;
  }

  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  notifyAuthSessionChanged();
};

export const userHasAdminRole = (user: AuthUser | null | undefined): boolean => {
  if (!user) {
    return false;
  }

  
  return user.roles.some((role) => role.toUpperCase() === 'ADMIN');
};

export const subscribeToAuthSession = (onChange: () => void): (() => void) => {
  if (!isBrowser) {
    return () => undefined;
  }

  const handleCustomChange = () => {
    onChange();
  };

  const handleStorageChange = (event: StorageEvent) => {
    // `storage` se usa para sincronizar cambios entre pestañas/ventanas.
    if (
      event.key === null ||
      event.key === ACCESS_TOKEN_STORAGE_KEY ||
      event.key === AUTH_USER_STORAGE_KEY
    ) {
      onChange();
    }
  };

  window.addEventListener(AUTH_SESSION_CHANGE_EVENT, handleCustomChange);
  window.addEventListener('storage', handleStorageChange);

  return () => {
    // Limpieza de listeners para evitar fugas de memoria cuando el componente se desmonta.
    window.removeEventListener(AUTH_SESSION_CHANGE_EVENT, handleCustomChange);
    window.removeEventListener('storage', handleStorageChange);
  };
};
