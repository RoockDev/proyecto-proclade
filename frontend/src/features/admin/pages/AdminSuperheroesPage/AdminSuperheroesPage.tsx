import type { AxiosError } from 'axios';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SuperheroesToolbar } from '../../components/superheroes/SuperheroesToolbar/SuperheroesToolbar';
import { ConfirmModal } from '../../components/shared/ConfirmModal/ConfirmModal';
import { SuperheroesTable } from '../../components/superheroes/SuperheroesTable/SuperheroesTable';
import {
  createAdminSuperhero,
  updateAdminSuperhero,
  updateAdminSuperheroStatus,
  deleteAdminSuperhero,
  restoreAdminSuperhero,
} from '../../api/admin-superheroes.api';
import { useAdminSuperheroesList } from '../../hooks/useAdminSuperheroesList';
import type { AdminSuperheroRow, SuperheroStatus } from '../../types/superheroes.types';
import { SuperheroFormModal } from '../../components/superheroes/SuperheroFormModal/SuperheroFormModal';
import { resolveHeroImageUrl } from '../../utils/resolveHeroImageUrl';
import './AdminSuperheroesPage.css';

type NotificationType = 'success' | 'error';
type NotificationState = {
  message: string;
  type: NotificationType;
};

type AdminSuperheroFilterValue = SuperheroStatus | '' | 'DELETED';

const statusFilters: { label: string; value: AdminSuperheroFilterValue }[] = [
  { label: 'Todos', value: '' },
  { label: 'Borrador', value: 'DRAFT' },
  { label: 'Publicados', value: 'PUBLISHED' },
  { label: 'Ocultos', value: 'HIDDEN' },
  { label: 'Desactivados', value: 'DELETED' },
];

const initialFormState = {
  name: '',
  description: '',
  quote: '',
  country: '',
  sortOrder: '',
  status: 'DRAFT' as SuperheroStatus,
};

export const AdminSuperheroesPage = () => {
  const [formState, setFormState] = useState(initialFormState);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedHero, setSelectedHero] = useState<AdminSuperheroRow | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generatedPreviewUrl, setGeneratedPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingDeactivate, setPendingDeactivate] = useState<AdminSuperheroRow | null>(null);
  const [pendingRestore, setPendingRestore] = useState<AdminSuperheroRow | null>(null);

  const [notification, setNotification] = useState<NotificationState | null>(null);

  const showNotification = useCallback((message: string, type: NotificationType) => {
    setNotification({ message, type });
  }, []);

  const handleListError = useCallback(
    (message: string) => {
      showNotification(message, 'error');
    },
    [showNotification],
  );

  const {
    superheroes,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    page,
    totalPages,
    total,
    pageSize,
    pageChange,
    isFetching,
    refresh,
    showDeleted,
    setShowDeleted,
  } = useAdminSuperheroesList({ pageSize: 6, onError: handleListError });

  useEffect(() => {
    return () => {
      if (generatedPreviewUrl) {
        URL.revokeObjectURL(generatedPreviewUrl);
      }
    };
  }, [generatedPreviewUrl]);

  useEffect(() => {
    if (!notification) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setNotification(null);
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [notification]);

  const resetForm = () => {
    setFormMode('create');
    setSelectedHero(null);
    setFormState(initialFormState);
    setImageFile(null);
    setImagePreview(null);
    if (generatedPreviewUrl) {
      URL.revokeObjectURL(generatedPreviewUrl);
      setGeneratedPreviewUrl(null);
    }
  };

  const closeForm = () => {
    resetForm();
    setIsFormOpen(false);
  };

  const handleNew = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleEdit = (hero: AdminSuperheroRow) => {
    resetForm();
    setSelectedHero(hero);
    setFormMode('edit');
    setFormState({
      name: hero.name,
      description: hero.description,
      quote: hero.quote ?? '',
      country: hero.country ?? '',
      sortOrder: hero.sortOrder.toString(),
      status: hero.status,
    });
    setImagePreview(resolveHeroImageUrl(hero.imageUrl ?? null) ?? null);
    setIsFormOpen(true);
  };

  const handleFieldChange = (field: keyof typeof initialFormState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: field === 'status' ? (value as SuperheroStatus) : value,
    }));
  };

  const handleFilterSelect = (value: AdminSuperheroFilterValue) => {
    if (value === 'DELETED') {
      setShowDeleted(true);
      setStatusFilter('');
      return;
    }

    setShowDeleted(false);
    setStatusFilter(value);
  };

  const handleImageChange = (file: File | null) => {
    if (generatedPreviewUrl) {
      URL.revokeObjectURL(generatedPreviewUrl);
      setGeneratedPreviewUrl(null);
    }

    setImageFile(file);

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setGeneratedPreviewUrl(previewUrl);
      setImagePreview(previewUrl);
    } else {
      setImagePreview(resolveHeroImageUrl(selectedHero?.imageUrl ?? null) ?? null);
    }
  };

  const buildPayload = () => {
    const sortOrder =
      formState.sortOrder.trim() === '' ? undefined : Number(formState.sortOrder.trim());

    return {
      name: formState.name.trim(),
      description: formState.description.trim(),
      quote: formState.quote.trim() || undefined,
      country: formState.country.trim() || undefined,
      sortOrder,
      status: formState.status,
      image: imageFile || undefined,
    };
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = formState.name.trim();
    const trimmedDescription = formState.description.trim();

    if (!trimmedName || !trimmedDescription) {
      showNotification('El nombre y la descripción son obligatorios.', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      const payload = buildPayload();
      const response =
        formMode === 'create'
          ? await createAdminSuperhero(payload)
          : await updateAdminSuperhero({ id: selectedHero!.id, ...payload });

      if (response.success) {
        const successMessage =
          formMode === 'create'
            ? 'Superhéroe creado con éxito.'
            : 'Cambios guardados correctamente.';
        showNotification(successMessage, 'success');
        resetForm();
        await refresh();
        setIsFormOpen(false);
      } else {
        showNotification(response.message || 'No se pudo guardar el superhéroe.', 'error');
      }
    } catch (error) {
      console.error('Error al guardar superhéroe', error);
      const axiosError = error as AxiosError<{ message?: string }>;
      console.error('Backend response:', axiosError.response?.data);
      const errorMessage =
        axiosError.response?.data?.message ?? 'No se pudo guardar el superhéroe.';
      showNotification(errorMessage, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleStatus = async (hero: AdminSuperheroRow) => {
    setIsProcessing(true);
    const nextStatus: SuperheroStatus = hero.status === 'PUBLISHED' ? 'HIDDEN' : 'PUBLISHED';

    try {
      const response = await updateAdminSuperheroStatus({ id: hero.id, status: nextStatus });
      if (response.success) {
        const message =
          nextStatus === 'PUBLISHED' ? 'Superhéroe publicado.' : 'Superhéroe ocultado.';
        showNotification(message, 'success');
        await refresh();
      } else {
        showNotification(response.message || 'No se pudo actualizar el estado.', 'error');
      }
    } catch (error) {
      console.error('Error al cambiar estado', error);
      showNotification('No se pudo cambiar el estado.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmDeactivate = async () => {
    if (!pendingDeactivate) return;

    setIsProcessing(true);

    try {
      const response = await deleteAdminSuperhero(pendingDeactivate.id);
      if (response.success) {
        showNotification('Superhéroe desactivado.', 'success');
        await refresh();
      } else {
        showNotification(response.message || 'No se pudo desactivar el superhéroe.', 'error');
      }
    } catch (error) {
      console.error('Error al desactivar superhéroe', error);
      showNotification('No se pudo desactivar el superhéroe.', 'error');
    } finally {
      setIsProcessing(false);
      setPendingDeactivate(null);
    }
  };

  const confirmRestore = async () => {
    if (!pendingRestore) {
      return;
    }

    setIsProcessing(true);

    try {
      const response = await restoreAdminSuperhero(pendingRestore.id);
      if (response.success) {
        showNotification('Superhéroe reactivado.', 'success');
        await refresh();
      } else {
        showNotification(response.message || 'No se pudo reactivar el superhéroe.', 'error');
      }
    } catch (error) {
      console.error('Error al reactivar superhéroe', error);
      showNotification('No se pudo reactivar el superhéroe.', 'error');
    } finally {
      setIsProcessing(false);
      setPendingRestore(null);
    }
  };

  const heroListInfo = useMemo(() => {
    const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const end = Math.min(total, page * pageSize);
    return { start, end };
  }, [page, pageSize, total]);

  const safeTotalPages = Math.max(1, totalPages || 1);

  return (
    <section className="admin-superheroes-page">
      {notification && (
        <div
          className={`admin-superheroes-page__notification admin-superheroes-page__notification--${notification.type}`}
          role="status"
        >
          <span
            className="admin-superheroes-page__notification-icon"
            aria-hidden="true"
          >
            {notification.type === 'success' ? '✓' : '⚠'}
          </span>
          <span className="admin-superheroes-page__notification-message">{notification.message}</span>
        </div>
      )}
      <div className="admin-superheroes-page__toolbar">
        <SuperheroesToolbar
          search={search}
          onSearchChange={setSearch}
          onNew={handleNew}
          filters={statusFilters}
          activeStatusFilter={statusFilter}
          showDeletedOnly={showDeleted}
          onFilterSelect={handleFilterSelect}
        />
      </div>

      <SuperheroFormModal
        isOpen={isFormOpen}
        formMode={formMode}
        formState={formState}
        isProcessing={isProcessing}
        imagePreview={imagePreview}
        onClose={closeForm}
        onFieldChange={handleFieldChange}
        onImageChange={handleImageChange}
        onSubmit={handleFormSubmit}
        onReset={resetForm}
      />

        <SuperheroesTable
          heroes={superheroes}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onDeactivate={(hero) => setPendingDeactivate(hero)}
          onRestore={(hero) => setPendingRestore(hero)}
          showDeletedOnly={showDeleted}
        />

      <div className="admin-superheroes-pagination">
        <p className="admin-superheroes-pagination__info">
          Mostrando {heroListInfo.start}-{heroListInfo.end} de {total}
        </p>
        <div className="admin-superheroes-pagination__controls">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => pageChange(Math.max(1, page - 1))}
            aria-label="Página anterior"
          >
            ←
          </button>
          <span>
            {page} / {safeTotalPages}
          </span>
          <button
            type="button"
            disabled={page >= safeTotalPages}
            onClick={() => pageChange(Math.min(safeTotalPages, page + 1))}
            aria-label="Página siguiente"
          >
            →
          </button>
        </div>
      </div>

        <ConfirmModal
          isOpen={Boolean(pendingDeactivate)}
          title="Desactivar superhéroe"
          description={
            pendingDeactivate ? (
              <>
                ¿Quieres desactivar a <strong>{pendingDeactivate.name}</strong>? Esta acción
                archivará el registro y podrás reactivarlo cuando quieras.
              </>
            ) : undefined
          }
          confirmLabel="Desactivar"
          cancelLabel="Cancelar"
          onConfirm={confirmDeactivate}
          onCancel={() => setPendingDeactivate(null)}
          isProcessing={isProcessing}
        />

        <ConfirmModal
          isOpen={Boolean(pendingRestore)}
          title="Reactivar superhéroe"
          description={
            pendingRestore ? (
              <>
                ¿Estás seguro de que quieres reactivar a{' '}
                <strong>{pendingRestore.name}</strong>?
              </>
            ) : undefined
          }
          confirmLabel="Reactivar"
          cancelLabel="Cancelar"
          onConfirm={confirmRestore}
          onCancel={() => setPendingRestore(null)}
          isProcessing={isProcessing}
        />

      {isFetching ? (
        <p className="admin-superheroes-page__loading">Actualizando lista...</p>
      ) : null}
    </section>
  );
};
