export type AdminChallenge = {
  id: number;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateChallengePayload = {
  title: string;
  description: string;
  targetAmount: number;
  currentAmount?: number;
  isActive?: boolean;
};

export type UpdateChallengePayload = Partial<CreateChallengePayload> & {
  id: number;
};

export type UpdateChallengeAmountPayload = {
  id: number;
  currentAmount: number;
};

export type ChallengeFormData = {
  title: string;
  description: string;
  targetAmount: string;
  currentAmount: string;
  isActive: boolean;
};
