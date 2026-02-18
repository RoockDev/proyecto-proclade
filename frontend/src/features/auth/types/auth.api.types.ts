export type LoginRequestDto = {
  email: string;
  password: string;
};

export type RegisterRequestDto = {
  name: string;
  surname: string;
  email: string;
  password: string;
};

export type GoogleSignInRequestDto = {
  idToken: string;
};

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  surname: string;
  roles: string[];
};

export type AuthResponseData = {
  accessToken: string;
  user: AuthUser;
};
