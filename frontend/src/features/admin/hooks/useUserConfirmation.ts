import { useState } from 'react';
import type { AdminUser } from '../types/users.types';

type ConfirmActionHandler = (user: AdminUser) => Promise<void>;

export const useUserConfirmation = () => {
  const [pendingUser, setPendingUser] = useState<AdminUser | null>(null);

  const requestConfirmation = (user: AdminUser) => {
    setPendingUser(user);
  };

  const cancelConfirmation = () => {
    setPendingUser(null);
  };

  const confirm = async (onConfirm: ConfirmActionHandler) => {
    if (!pendingUser) {
      return;
    }

    await onConfirm(pendingUser);
    setPendingUser(null);
  };

  return {
    pendingUser,
    requestConfirmation,
    cancelConfirmation,
    confirm,
  };
};
