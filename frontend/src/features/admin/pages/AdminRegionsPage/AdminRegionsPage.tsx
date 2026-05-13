import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { createRegion, deleteRegion, updateRegion } from '../../api/regions.api';
import { RegionForm } from '../../components/regions/RegionForm/RegionForm';
import { RegionsGrid } from '../../components/regions/RegionsGrid/RegionsGrid';
import { RegionsToolbar } from '../../components/regions/RegionsToolbar/RegionsToolbar';
import { ConfirmModal } from '../../components/shared/ConfirmModal/ConfirmModal';
import { useRegionsList } from '../../hooks/useRegionsList';
import {
  formatRegionPhone,
  hasCompleteRegionPhone,
  normalizeRegionPhone,
} from '../../../../utils/region-phone';
import type {
  AdminRegion,
  CreateRegionPayload,
  RegionFormData,
} from '../../types/regions.types';

type NotificationType = 'success' | 'error';
type NotificationState = { message: string; type: NotificationType };
import './AdminRegionsPage.css';

const initialFormState: RegionFormData = {
  name: '',
  address: '',
  email: '',
  phone: '',
};

const validateRegionForm = (formData: RegionFormData): string | null => {
  const name = formData.name.trim();
  const address = formData.address.trim();
  const email = formData.email.trim().toLowerCase();
  const phone = formData.phone.trim();

  if (name.length < 2) {
    return 'El nombre debe tener al menos 2 caracteres.';
  }

  if (address.length < 6) {
    return 'La dirección debe tener al menos 6 caracteres.';
  }

  if (!email.includes('@')) {
    return 'El email no es válido.';
  }

  if (phone && !hasCompleteRegionPhone(phone)) {
    return 'El teléfono debe tener exactamente 9 dígitos.';
  }

  return null;
};

const buildRegionPayload = (formData: RegionFormData): CreateRegionPayload => {
  const normalizedPhone = normalizeRegionPhone(formData.phone);

  return {
    name: formData.name.trim(),
    address: formData.address.trim(),
    email: formData.email.trim().toLowerCase(),
    ...(normalizedPhone ? { phone: normalizedPhone } : {}),
  };
};

export const AdminRegionsPage = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedRegion, setSelectedRegion] = useState<AdminRegion | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pendingDeleteRegion, setPendingDeleteRegion] = useState<AdminRegion | null>(
    null,
  );

  const handleRegionError = useCallback(
    (message: string) => setFeedback(message),
    [],
  );

  const showNotification = useCallback((message: string, type: NotificationType) => {
    setNotification({ message, type });
  }, []);

  const {
    filteredRegions,
    isFetching,
    refreshRegions,
    search,
    setSearch,
  } = useRegionsList({ onError: handleRegionError });

  const rowsPerPage = 4;
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(filteredRegions.length / rowsPerPage));
  const paginatedRegions = useMemo(
    () =>
      filteredRegions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredRegions, page, rowsPerPage],
  );

  useEffect(() => {
    setPage(0);
  }, [filteredRegions.length, search]);

  useEffect(() => {
    if (page >= totalPages) {
      setPage(totalPages - 1);
    }
  }, [page, totalPages]);

  useEffect(() => {
    if (!notification) {
      return undefined;
    }

    const timer = setTimeout(() => setNotification(null), 2000);
    return () => clearTimeout(timer);
  }, [notification]);

  const resetFormState = () => {
    setFormData(initialFormState);
    setFormMode('create');
    setSelectedRegion(null);
  };

  const handleCreateRegion = () => {
    resetFormState();
    setFeedback(null);
    setIsFormOpen(true);
  };

  const handleEditRegion = (region: AdminRegion) => {
    setFormMode('edit');
    setSelectedRegion(region);
    setFormData({
      name: region.name,
      address: region.address,
      email: region.email,
      phone: formatRegionPhone(region.phone),
    });
    setFeedback(null);
    setIsFormOpen(true);
  };

  const handleRequestDelete = (region: AdminRegion) => {
    setPendingDeleteRegion(region);
  };

  const handleCancelDelete = () => {
    setPendingDeleteRegion(null);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteRegion) {
      return;
    }

    setIsProcessing(true);
    setFeedback(null);

    try {
      const response = await deleteRegion(pendingDeleteRegion.id);
      if (response.success) {
        const deleteMessage = response.message || 'Delegación eliminada correctamente.';
        setFeedback(deleteMessage);
        showNotification(deleteMessage, 'success');
        await refreshRegions();
      } else {
        const deleteError = response.message || 'No se pudo eliminar la delegación.';
        setFeedback(deleteError);
        showNotification(deleteError, 'error');
      }
    } catch {
      const deleteError = 'No se pudo eliminar la delegación.';
      setFeedback(deleteError);
      showNotification(deleteError, 'error');
    } finally {
      setIsProcessing(false);
      setPendingDeleteRegion(null);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    resetFormState();
    setFeedback(null);
  };

  const handleResetForm = () => {
    setFormData(initialFormState);
    setFeedback(null);
  };

  const handleFieldChange = (field: keyof RegionFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'phone' ? formatRegionPhone(value) : value,
    }));
    setFeedback(null);
  };

  const handleSubmitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateRegionForm(formData);
    if (validationError) {
      setFeedback(validationError);
      return;
    }

    if (formMode === 'edit' && !selectedRegion) {
      setFeedback('Selecciona una delegación antes de editar.');
      return;
    }

    setIsProcessing(true);
    setFeedback(null);

    try {
      const payload = buildRegionPayload(formData);
      const response =
        formMode === 'create'
          ? await createRegion(payload)
          : await updateRegion({
              id: selectedRegion!.id,
              ...payload,
            });

      if (response.success) {
        const successMessage = response.message || 'Operación realizada correctamente.';
        showNotification(successMessage, 'success');
        setFeedback(successMessage);
        await refreshRegions();
        setIsFormOpen(false);
        resetFormState();
      } else {
        const errorMessage = response.message || 'No se pudo guardar la delegación.';
        setFeedback(errorMessage);
        showNotification(errorMessage, 'error');
      }
    } catch {
      const errorMessage = 'Error al guardar la delegación.';
      setFeedback(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="admin-regions-page">
      {notification && (
        <div
          className={`admin-regions-page__feedback-badge admin-regions-page__feedback-badge--${notification.type}`}
          role="status"
        >
          <i
            className={`bi ${
              notification.type === 'success'
                ? 'bi-check-circle-fill'
                : 'bi-x-circle-fill'
            } admin-regions-page__feedback-badge-icon`}
            aria-hidden="true"
          />
          {notification.message}
        </div>
      )}
      <RegionForm
        isOpen={isFormOpen}
        formMode={formMode}
        formData={formData}
        feedback={isFormOpen ? feedback : null}
        isProcessing={isProcessing}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmitForm}
        onReset={handleResetForm}
        onClose={handleCloseForm}
      />

      <RegionsToolbar
        search={search}
        onSearchChange={setSearch}
        onNew={handleCreateRegion}
      />

      {isFetching ? (
        <p className="admin-regions-page__state">Cargando delegaciones...</p>
      ) : null}

      <RegionsGrid
        regions={paginatedRegions}
        onEdit={handleEditRegion}
        onDelete={handleRequestDelete}
      />

      <div className="regions-pagination">
        <div className="regions-pagination__info">
          Mostrando {filteredRegions.length === 0 ? 0 : page * rowsPerPage + 1}-
          {Math.min(filteredRegions.length, (page + 1) * rowsPerPage)} de{' '}
          {filteredRegions.length}
        </div>
        <div className="regions-pagination__controls">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            disabled={page === 0}
            aria-label="Página anterior"
          >
            ←
          </button>
          <span>
            {page + 1} de {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
            disabled={page >= totalPages - 1}
            aria-label="Página siguiente"
          >
            →
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(pendingDeleteRegion)}
        title="Eliminar delegación"
        description={
          pendingDeleteRegion
            ? `¿Quieres eliminar la delegación "${pendingDeleteRegion.name}"?`
            : undefined
        }
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isProcessing={isProcessing}
      />
    </section>
  );
};
