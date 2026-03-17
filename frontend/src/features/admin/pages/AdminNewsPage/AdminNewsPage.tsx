import { type FormEvent, useCallback, useState } from 'react';
import {
  createAdminNews,
  deleteAdminNews,
  uploadAdminNewsImage,
  updateAdminNews,
} from '../../api/news-admin.api';
import { NewsForm } from '../../components/news/NewsForm/NewsForm';
import { NewsTable } from '../../components/news/NewsTable/NewsTable';
import { NewsToolbar } from '../../components/news/NewsToolbar/NewsToolbar';
import { ConfirmModal } from '../../components/shared/ConfirmModal/ConfirmModal';
import { useAdminNewsList } from '../../hooks/useAdminNewsList';
import type {
  AdminNewsFormData,
  AdminNewsItem,
  CreateAdminNewsPayload,
} from '../../types/news-admin.types';
import './AdminNewsPage.css';

const initialFormState: AdminNewsFormData = {
  title: '',
  excerpt: '',
  content: '',
  imageUrl: '',
  status: 'DRAFT',
};

const validateNewsForm = (formData: AdminNewsFormData): string | null => {
  const title = formData.title.trim();
  const excerpt = formData.excerpt.trim();
  const content = formData.content.trim();

  if (!title) {
    return 'El título es obligatorio.';
  }

  if (excerpt.length < 40) {
    return 'El resumen debe tener al menos 40 caracteres.';
  }

  if (!content) {
    return 'El contenido es obligatorio.';
  }

  return null;
};

const buildNewsPayload = (
  formData: AdminNewsFormData,
): CreateAdminNewsPayload => {
  const trimmedImageUrl = formData.imageUrl.trim();

  return {
    title: formData.title.trim(),
    excerpt: formData.excerpt.trim(),
    content: formData.content.trim(),
    status: formData.status,
    ...(trimmedImageUrl ? { imageUrl: trimmedImageUrl } : {}),
  };
};

export const AdminNewsPage = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedNews, setSelectedNews] = useState<AdminNewsItem | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pendingDeleteNews, setPendingDeleteNews] = useState<AdminNewsItem | null>(
    null,
  );

  const handleNewsError = useCallback(
    (message: string) => setFeedback(message),
    [],
  );

  const {
    filteredNews,
    isFetching,
    refreshNews,
    search,
    setSearch,
  } = useAdminNewsList({ onError: handleNewsError });

  const resetFormState = () => {
    setFormData(initialFormState);
    setFormMode('create');
    setSelectedNews(null);
  };

  const handleCreateNews = () => {
    resetFormState();
    setFeedback(null);
    setIsFormOpen(true);
  };

  const handleEditNews = (item: AdminNewsItem) => {
    setFormMode('edit');
    setSelectedNews(item);
    setFormData({
      title: item.title,
      excerpt: item.excerpt,
      content: item.content,
      imageUrl: item.imageUrl ?? '',
      status: item.status,
    });
    setFeedback(null);
    setIsFormOpen(true);
  };

  const handleRequestDelete = (item: AdminNewsItem) => {
    setPendingDeleteNews(item);
  };

  const handleCancelDelete = () => {
    setPendingDeleteNews(null);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteNews) {
      return;
    }

    setIsProcessing(true);
    setFeedback(null);

    try {
      const response = await deleteAdminNews(pendingDeleteNews.id);

      if (response.success) {
        setFeedback(response.message || 'Noticia eliminada correctamente.');
        await refreshNews();
      } else {
        setFeedback(response.message || 'No se pudo eliminar la noticia.');
      }
    } catch {
      setFeedback('No se pudo eliminar la noticia.');
    } finally {
      setIsProcessing(false);
      setPendingDeleteNews(null);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setIsUploadingImage(false);
    resetFormState();
    setFeedback(null);
  };

  const handleResetForm = () => {
    setFormData(initialFormState);
    setFeedback(null);
  };

  const handleFieldChange = (field: keyof AdminNewsFormData, value: string) => {
    const nextValue =
      field === 'status' ? (value as AdminNewsFormData['status']) : value;
    setFormData((prev) => ({ ...prev, [field]: nextValue }));
    setFeedback(null);
  };

  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    setFeedback(null);

    try {
      const response = await uploadAdminNewsImage(file);
      const uploadedImageUrl = response.data?.imageUrl ?? null;

      if (response.success && uploadedImageUrl) {
        setFormData((prev) => ({ ...prev, imageUrl: uploadedImageUrl }));
        setFeedback('Imagen subida correctamente.');
      } else {
        setFeedback(response.message || 'No se pudo subir la imagen.');
      }
    } catch {
      setFeedback('No se pudo subir la imagen.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isUploadingImage) {
      setFeedback('Espera a que termine la subida de imagen.');
      return;
    }

    const validationError = validateNewsForm(formData);
    if (validationError) {
      setFeedback(validationError);
      return;
    }

    if (formMode === 'edit' && !selectedNews) {
      setFeedback('Selecciona una noticia antes de editar.');
      return;
    }

    setIsProcessing(true);
    setFeedback(null);

    try {
      const payload = buildNewsPayload(formData);
      const response =
        formMode === 'create'
          ? await createAdminNews(payload)
          : await updateAdminNews({
              id: selectedNews!.id,
              ...payload,
            });

      if (response.success) {
        setFeedback(response.message || 'Operación realizada correctamente.');
        await refreshNews();
        setIsFormOpen(false);
        resetFormState();
      } else {
        setFeedback(response.message || 'No se pudo guardar la noticia.');
      }
    } catch {
      setFeedback('Error al guardar la noticia.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="admin-news-page">
      <NewsForm
        isOpen={isFormOpen}
        formMode={formMode}
        formData={formData}
        feedback={isFormOpen ? feedback : null}
        isProcessing={isProcessing}
        isUploadingImage={isUploadingImage}
        onFieldChange={handleFieldChange}
        onImageUpload={handleImageUpload}
        onSubmit={handleSubmitForm}
        onReset={handleResetForm}
        onClose={handleCloseForm}
      />

      <header className="admin-news-page__header">
        <p className="admin-news-page__eyebrow">Panel de administración</p>
        <h1 className="admin-news-page__title">Gestión de noticias</h1>
        <p className="admin-news-page__description">
          Lista de noticias en tiempo real con búsqueda cliente para administración.
        </p>
      </header>

      <NewsToolbar
        search={search}
        onSearchChange={setSearch}
        onNew={handleCreateNews}
      />

      {feedback && !isFormOpen ? (
        <p className="admin-news-page__feedback" role="status">
          {feedback}
        </p>
      ) : null}

      {isFetching ? (
        <p className="admin-news-page__state">Cargando noticias...</p>
      ) : null}

      <NewsTable
        news={filteredNews}
        onEdit={handleEditNews}
        onDelete={handleRequestDelete}
      />

      <ConfirmModal
        isOpen={Boolean(pendingDeleteNews)}
        title="Eliminar noticia"
        description={
          pendingDeleteNews
            ? `¿Quieres eliminar la noticia "${pendingDeleteNews.title}"? Esta acción marcará el registro como eliminado.`
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
