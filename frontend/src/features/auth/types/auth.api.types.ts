export type LoginRequestDto = {
  email: string;
  password: string;
};

export type AuthUser = {
  email: string;
};

export type LoginResponseData = {
  accessToken: string;
  user: AuthUser;
};
