import type { AuthUser } from '../../auth/types/auth.api.types';

export type UserProfile = AuthUser;

export type UpdateProfilePayload = {
  name: string;
  surname: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};
