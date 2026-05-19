export const PASSWORD_POLICY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const PASSWORD_POLICY_MESSAGE =
  'La contraseña debe tener al menos 8 caracteres e incluir una mayúscula, una minúscula y un número';

export const isPasswordPolicyValid = (password: string): boolean =>
  PASSWORD_POLICY_REGEX.test(password);
