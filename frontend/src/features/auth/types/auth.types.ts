export type LoginFormState = {
  email: string;
  password: string;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
};
