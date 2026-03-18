import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { createRegion, deleteRegion, updateRegion } from '../../api/regions.api';
import { RegionForm } from '../../components/regions/RegionForm/RegionForm';
import { RegionsGrid } from '../../components/regions/RegionsGrid/RegionsGrid';
import { RegionsToolbar } from '../../components/regions/RegionsToolbar/RegionsToolbar';
import { ConfirmModal } from '../../components/shared/ConfirmModal/ConfirmModal';
import { useRegionsList } from '../../hooks/useRegionsList';
import type {
  AdminRegion,
  CreateRegionPayload,
  RegionFormData,
} from '../../types/regions.types';
import './AdminRegionsPage.css';

const initialFormState: RegionFormData = {
  name: '',
  address: '',
  email: '',
};

const validateRegionForm = (formData: RegionFormData): string | null => {
  const name = formData.name.trim();
  const address = formData.address.trim();
  const email = formData.email.trim().toLowerCase();

  if (name.length < 2) {
    return 'El nombre debe tener al menos 2 caracteres.';
  }

  if (address.length < 6) {
    return 'La dirección debe tener al menos 6 caracteres.';
  }

  if (!email.includes('@')) {
    return 'El email no es válido.';
  }

  return null;
};

const buildRegionPayload = (formData: RegionFormData): CreateRegionPayload => ({
  name: formData.name.trim(),
  address: formData.address.trim(),
  email: formData.email.trim().toLowerCase(),
});

export const AdminRegionsPage = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedRegion, setSelectedRegion] = useState<AdminRegion | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pendingDeleteRegion, setPendingDeleteRegion] = useState<AdminRegion | null>(
    null,
  );

  const handleRegionError = useCallback(
    (message: string) => setFeedback(message),
    [],
  );

  const {
    filteredRegions,
    isFetching,
    refreshRegions,
    search,
    setSearch,
  } = useRegionsList({ onError: handleRegionError });

  const rowsPerPage = 8;
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
        setFeedback(response.message || 'Delegación eliminada correctamente.');
        await refreshRegions();
      } else {
        setFeedback(response.message || 'No se pudo eliminar la delegación.');
      }
    } catch {
      setFeedback('No se pudo eliminar la delegación.');
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
    setFormData((prev) => ({ ...prev, [field]: value }));
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
        setFeedback(response.message || 'Operación realizada correctamente.');
        await refreshRegions();
        setIsFormOpen(false);
        resetFormState();
      } else {
        setFeedback(response.message || 'No se pudo guardar la delegación.');
      }
    } catch {
      setFeedback('Error al guardar la delegación.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="admin-regions-page">
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

      <header className="admin-regions-page__header">
        <p className="admin-regions-page__eyebrow">Panel de administración</p>
        <h1 className="admin-regions-page__title">Gestión de delegaciones</h1>
        <p className="admin-regions-page__description">
          Administra nombre, contacto y visibilidad de delegaciones.
        </p>
      </header>

      <RegionsToolbar
        search={search}
        onSearchChange={setSearch}
        onNew={handleCreateRegion}
      />

      {feedback && !isFormOpen ? (
        <p className="admin-regions-page__feedback" role="status">
          {feedback}
        </p>
      ) : null}

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
