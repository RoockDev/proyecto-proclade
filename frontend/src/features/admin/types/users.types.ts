export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
};

export type AdminUser = {
  id: number;
  name: string;
  surname: string;
  email: string;
  roles: string[];
  deletedAt?: string | null;
  updatedAt: string;
};

export type AdminUserFilters = 'todos' | 'activos' | 'eliminados';

export type CreateUserPayload = {
  name: string;
  surname: string;
  email: string;
  roles: string[];
  password: string;
};

export type UpdateUserPayload = Partial<CreateUserPayload> & {
  id: number;
};

export type ReactivateUserPayload = {
  id: number;
};

export type DeleteUserPayload = {
  id: number;
};
