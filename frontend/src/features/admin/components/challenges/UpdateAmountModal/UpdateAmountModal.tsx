import { useState } from 'react';
import type { AdminChallenge } from '../../../types/challenges.types';
import { AdminButton } from '../../shared/AdminButton/AdminButton';
import './UpdateAmountModal.css';

type UpdateAmountModalProps = {
  isOpen: boolean;
  challenge: AdminChallenge | null;
  isProcessing: boolean;
  onConfirm: (currentAmount: number) => void;
  onCancel: () => void;
};

export const UpdateAmountModal = ({
  isOpen,
  challenge,
  isProcessing,
  onConfirm,
  onCancel,
}: UpdateAmountModalProps) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !challenge) return null;

  const handleConfirm = () => {
    const parsed = Number(amount);

    if (!Number.isInteger(parsed) || parsed < 0) {
      setError('El monto debe ser un número entero no negativo.');
      return;
    }

    if (parsed > challenge.targetAmount) {
      setError('El monto no puede superar el objetivo.');
      return;
    }

    setError(null);
    onConfirm(parsed);
  };

  const handleClose = () => {
    setAmount('');
    setError(null);
    onCancel();
  };

  const formatAmount = (cents: number) => {
    const euros = cents / 100;
    return euros.toLocaleString('es-ES', {
      style: 'currency',
      currency: 'EUR',
    });
  };

  return (
    <div className="update-amount-modal" role="dialog" aria-modal="true">
      <div
        className="update-amount-modal__backdrop"
        onClick={handleClose}
        role="presentation"
      />

      <div className="update-amount-modal__content">
        <h3 className="update-amount-modal__title">Actualizar monto</h3>
        <p className="update-amount-modal__info">
          Reto: <strong>{challenge.title}</strong>
          <br />
          Objetivo: {formatAmount(challenge.targetAmount)}
        </p>

        {error && (
          <p className="update-amount-modal__error" role="alert">
            {error}
          </p>
        )}

        <label className="update-amount-modal__field">
          Nuevo monto actual (céntimos)
          <input
            type="number"
            min={0}
            max={challenge.targetAmount}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
          />
        </label>

        <div className="update-amount-modal__actions">
          <AdminButton
            variant="solid"
            onClick={handleConfirm}
            loading={isProcessing}
            disabled={!amount.trim() || isProcessing}
          >
            Actualizar
          </AdminButton>
          <AdminButton variant="outline" onClick={handleClose} disabled={isProcessing}>
            Cancelar
          </AdminButton>
        </div>
      </div>
    </div>
  );
};
