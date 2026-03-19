import type { AxiosError } from 'axios';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  createAdminChallenge,
  updateAdminChallenge,
  updateAdminChallengeAmount,
  deleteAdminChallenge,
} from '../../api/challenges.api';
import { ChallengesToolbar } from '../../components/challenges/ChallengesToolbar/ChallengesToolbar';
import { ChallengesGrid } from '../../components/challenges/ChallengesGrid/ChallengesGrid';
import { ChallengeForm } from '../../components/challenges/ChallengeForm/ChallengeForm';
import { UpdateAmountModal } from '../../components/challenges/UpdateAmountModal/UpdateAmountModal';
import { ConfirmModal } from '../../components/shared/ConfirmModal/ConfirmModal';
import { useAdminChallengesList } from '../../hooks/useAdminChallengesList';
import type {
  AdminChallenge,
  ChallengeFormData,
} from '../../types/challenges.types';
import './AdminChallengesPage.css';

type NotificationType = 'success' | 'error';
type NotificationState = { message: string; type: NotificationType };

const initialFormState: ChallengeFormData = {
  title: '',
  description: '',
  targetAmount: '',
  currentAmount: '0',
  isActive: true,
};

export const AdminChallengesPage = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedChallenge, setSelectedChallenge] = useState<AdminChallenge | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [formFeedback, setFormFeedback] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminChallenge | null>(null);
  const [pendingAmount, setPendingAmount] = useState<AdminChallenge | null>(null);

  const showNotification = useCallback(
    (message: string, type: NotificationType) => {
      setNotification({ message, type });
    },
    [],
  );

  const handleListError = useCallback(
    (message: string) => showNotification(message, 'error'),
    [showNotification],
  );

  const { filteredChallenges, isFetching, refresh, search, setSearch } =
    useAdminChallengesList({ onError: handleListError });

  useEffect(() => {
    if (!notification) return undefined;
    const timer = setTimeout(() => setNotification(null), 2500);
    return () => clearTimeout(timer);
  }, [notification]);

  const resetForm = () => {
    setFormData(initialFormState);
    setFormMode('create');
    setSelectedChallenge(null);
    setFormFeedback(null);
  };

  const handleNew = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleEdit = (challenge: AdminChallenge) => {
    resetForm();
    setSelectedChallenge(challenge);
    setFormMode('edit');
    setFormData({
      title: challenge.title,
      description: challenge.description,
      targetAmount: challenge.targetAmount.toString(),
      currentAmount: challenge.currentAmount.toString(),
      isActive: challenge.isActive,
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  const handleFieldChange = (
    field: keyof ChallengeFormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormFeedback(null);
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = formData.title.trim();
    const description = formData.description.trim();
    const targetAmount = Number(formData.targetAmount);
    const currentAmount = Number(formData.currentAmount);

    if (!title) {
      setFormFeedback('El título es obligatorio.');
      return;
    }
    if (!description) {
      setFormFeedback('La descripción es obligatoria.');
      return;
    }
    if (!Number.isInteger(targetAmount) || targetAmount <= 0) {
      setFormFeedback('El monto objetivo debe ser un entero mayor que 0.');
      return;
    }
    if (!Number.isInteger(currentAmount) || currentAmount < 0) {
      setFormFeedback('El monto actual debe ser un entero no negativo.');
      return;
    }
    if (currentAmount > targetAmount) {
      setFormFeedback('El monto actual no puede superar el objetivo.');
      return;
    }

    setIsProcessing(true);
    setFormFeedback(null);

    try {
      const payload = {
        title,
        description,
        targetAmount,
        currentAmount,
        isActive: formData.isActive,
      };

      const response =
        formMode === 'create'
          ? await createAdminChallenge(payload)
          : await updateAdminChallenge({ id: selectedChallenge!.id, ...payload });

      if (response.success) {
        showNotification(
          response.message || (formMode === 'create' ? 'Reto creado.' : 'Reto actualizado.'),
          'success',
        );
        await refresh();
        handleCloseForm();
      } else {
        setFormFeedback(response.message || 'No se pudo guardar el reto.');
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setFormFeedback(
        axiosError.response?.data?.message || 'Error al guardar el reto.',
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestDelete = (challenge: AdminChallenge) => {
    setPendingDelete(challenge);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setIsProcessing(true);

    try {
      const response = await deleteAdminChallenge(pendingDelete.id);
      if (response.success) {
        showNotification(response.message || 'Reto eliminado.', 'success');
        await refresh();
      } else {
        showNotification(response.message || 'No se pudo eliminar el reto.', 'error');
      }
    } catch {
      showNotification('Error al eliminar el reto.', 'error');
    } finally {
      setIsProcessing(false);
      setPendingDelete(null);
    }
  };

  const handleRequestUpdateAmount = (challenge: AdminChallenge) => {
    setPendingAmount(challenge);
  };

  const handleConfirmUpdateAmount = async (currentAmount: number) => {
    if (!pendingAmount) return;
    setIsProcessing(true);

    try {
      const response = await updateAdminChallengeAmount({
        id: pendingAmount.id,
        currentAmount,
      });
      if (response.success) {
        showNotification(response.message || 'Monto actualizado.', 'success');
        await refresh();
      } else {
        showNotification(response.message || 'No se pudo actualizar el monto.', 'error');
      }
    } catch {
      showNotification('Error al actualizar el monto.', 'error');
    } finally {
      setIsProcessing(false);
      setPendingAmount(null);
    }
  };

  return (
    <section className="admin-challenges-page">
      {notification && (
        <div
          className={`admin-challenges-page__notification admin-challenges-page__notification--${notification.type}`}
          role="status"
        >
          <span className="admin-challenges-page__notification-icon" aria-hidden="true">
            {notification.type === 'success' ? '✓' : '⚠'}
          </span>
          <span className="admin-challenges-page__notification-message">
            {notification.message}
          </span>
        </div>
      )}

      <header className="admin-challenges-page__header">
        <p className="admin-challenges-page__eyebrow">Panel de administración</p>
        <h1 className="admin-challenges-page__title">Gestión de retos</h1>
        <p className="admin-challenges-page__description">
          Crea, edita y gestiona los retos solidarios del proyecto.
        </p>
      </header>

      <ChallengesToolbar
        search={search}
        onSearchChange={setSearch}
        onNew={handleNew}
      />

      <ChallengeForm
        isOpen={isFormOpen}
        formMode={formMode}
        formData={formData}
        isProcessing={isProcessing}
        feedback={formFeedback}
        onFieldChange={handleFieldChange}
        onSubmit={handleFormSubmit}
        onClose={handleCloseForm}
      />

      {isFetching ? (
        <p className="admin-challenges-page__loading">Cargando retos...</p>
      ) : (
        <ChallengesGrid
          challenges={filteredChallenges}
          onEdit={handleEdit}
          onUpdateAmount={handleRequestUpdateAmount}
          onDelete={handleRequestDelete}
        />
      )}

      <UpdateAmountModal
        isOpen={Boolean(pendingAmount)}
        challenge={pendingAmount}
        isProcessing={isProcessing}
        onConfirm={handleConfirmUpdateAmount}
        onCancel={() => setPendingAmount(null)}
      />

      <ConfirmModal
        isOpen={Boolean(pendingDelete)}
        title="Eliminar reto"
        description={
          pendingDelete ? (
            <>
              ¿Seguro que quieres eliminar <strong>{pendingDelete.title}</strong>?
              Esta acción archivará el reto.
            </>
          ) : undefined
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
        isProcessing={isProcessing}
      />
    </section>
  );
};
