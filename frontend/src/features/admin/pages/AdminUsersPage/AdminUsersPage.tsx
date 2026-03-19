import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AxiosError } from 'axios';
import { UsersForm } from '../../components/users/UsersForm/UsersForm';
import { UsersTable } from '../../components/users/UsersTable/UsersTable';
import { UsersToolbar } from '../../components/users/UsersToolbar/UsersToolbar';
import {
  createUser,
  deleteUser,
  reactivateUser,
  updateUser,
} from '../../api/users.api';
import type { AdminUser } from '../../types/users.types';
import { ConfirmModal } from '../../components/shared/ConfirmModal/ConfirmModal';
import { useUserConfirmation } from '../../hooks/useUserConfirmation';
import { useUsersList } from '../../hooks/useUsersList';
import './AdminUsersPage.css';

type NotificationType = 'success' | 'error';
type NotificationState = {
  message: string;
  type: NotificationType;
};

const initialFormState = {
  name: '',
  surname: '',
  email: '',
  roles: 'ADMIN',
  password: '',
  confirmPassword: '',
};

export const AdminUsersPage = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const formRef = useRef<HTMLDivElement | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const showNotification = useCallback((message: string, type: NotificationType) => {
    setNotification({ message, type });
  }, []);
  const reactivateConfirmation = useUserConfirmation();
  const deleteConfirmation = useUserConfirmation();
  const handleUsersError = useCallback(
    (message: string) => {
      setFeedback(message);
      showNotification(message, 'error');
    },
    [showNotification],
  );

  const {
    filteredUsers,
    refreshUsers,
    search,
    setSearch,
    viewFilter,
    setViewFilter,
  } = useUsersList({ onError: handleUsersError });

  const rowsPerPage = 6;
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage));
  const paginatedUsers = useMemo(
    () => filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredUsers, page, rowsPerPage],
  );

  useEffect(() => {
    setPage(0);
  }, [filteredUsers.length, search, viewFilter]);

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

  useEffect(() => {
    if (page >= totalPages) {
      setPage(totalPages - 1);
    }
  }, [page, totalPages]);

  const normalizeRoles = (value: string) =>
    value
      .split(',')
      .map((role) => role.trim())
      .filter(Boolean);

  const handleCreateNew = () => {
    setFormMode('create');
    setSelectedUser(null);
    setFormData(initialFormState);
    setFeedback(null);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedRoles = normalizeRoles(formData.roles);
    const hasValidRole = Boolean(parsedRoles.length);
    const roles = hasValidRole ? parsedRoles : ['USER'];
    const trimmedName = formData.name.trim();
    const trimmedSurname = formData.surname.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedPassword = formData.password.trim();
    const trimmedConfirm = formData.confirmPassword.trim();

    if (!trimmedName || !trimmedSurname || !trimmedEmail) {
      setFeedback('Completa nombre, apellido y email.');
      return;
    }

    if (formMode === 'create' && !trimmedPassword) {
      setFeedback('Introduce una contraseña para el usuario.');
      return;
    }

    if (trimmedPassword && trimmedPassword !== trimmedConfirm) {
      setFeedback('Las contraseñas no coinciden.');
      return;
    }

    if (formMode === 'edit' && !selectedUser) {
      setFeedback('Selecciona un usuario antes de editar.');
      return;
    }

    const userToUpdate = selectedUser;

    setIsProcessing(true);
    setFeedback(null);

    try {
        const response =
          formMode === 'create'
            ? await createUser({
                name: trimmedName,
                surname: trimmedSurname,
                email: trimmedEmail,
                roles,
                password: trimmedPassword,
              })
            : await updateUser({
                id: userToUpdate!.id,
                name: trimmedName,
                surname: trimmedSurname,
                email: trimmedEmail,
                roles,
                ...(trimmedPassword ? { password: trimmedPassword } : {}),
             });

        if (response.success) {
          const successMessage =
            formMode === 'create' ? 'Usuario creado con éxito.' : 'Usuario actualizado con éxito.';
          setFeedback(successMessage);
          showNotification(successMessage, 'success');
          setFormData(initialFormState);
          setFormMode('create');
          setSelectedUser(null);
          setIsFormOpen(false);
          await refreshUsers();
        } else {
          const errorMessage = response.message || 'No se pudo guardar el usuario.';
          setFeedback(errorMessage);
          showNotification(errorMessage, 'error');
        }
      } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 409) {
          const conflictMsg =
            'Ya existe un usuario con ese email. Reactiva el existente o usa otro email.';
          setFeedback(conflictMsg);
          showNotification(conflictMsg, 'error');
        } else {
          console.error('Error al guardar usuario', error);
          const genericError = 'Error al intentar guardar el usuario.';
          setFeedback(genericError);
          showNotification(genericError, 'error');
        }
      } finally {
        setIsProcessing(false);
      }
  };

  const handleEdit = (user: AdminUser) => {
    setFormMode('edit');
    setSelectedUser(user);
    setFormData({
      name: user.name,
      surname: user.surname,
      email: user.email,
      roles: user.roles.length ? user.roles[0] : 'USER',
      password: '',
      confirmPassword: '',
    });
    setFeedback(null);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setIsFormOpen(true);
  };

  const handleDelete = (user: AdminUser) => {
    deleteConfirmation.requestConfirmation(user);
  };

  const confirmDelete = async (user: AdminUser) => {
    setIsProcessing(true);
    setFeedback(null);
    try {
      const response = await deleteUser(user.id);
      if (response.success) {
        const deleteMessage = 'Usuario eliminado.';
        setFeedback(deleteMessage);
        showNotification(deleteMessage, 'success');
        await refreshUsers();
      } else {
        const deleteError = response.message || 'No se pudo eliminar el usuario.';
        setFeedback(deleteError);
        showNotification(deleteError, 'error');
      }
    } catch (error) {
      console.error('Error al eliminar usuario', error);
      const deleteError = 'No se pudo eliminar el usuario.';
      setFeedback(deleteError);
      showNotification(deleteError, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactivate = async (user: AdminUser) => {
    setIsProcessing(true);
    setFeedback(null);
    try {
      const response = await reactivateUser(user.id);
      if (response.success) {
        const reactivateMessage = 'Usuario reactivado.';
        setFeedback(reactivateMessage);
        showNotification(reactivateMessage, 'success');
        await refreshUsers();
      } else {
        const reactivateError = response.message || 'No se pudo reactivar el usuario.';
        setFeedback(reactivateError);
        showNotification(reactivateError, 'error');
      }
    } catch (error) {
      console.error('Error al reactivar usuario', error);
      const reactivateError = 'No se pudo reactivar el usuario.';
      setFeedback(reactivateError);
      showNotification(reactivateError, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const requestReactivate = (user: AdminUser) => {
    reactivateConfirmation.requestConfirmation(user);
  };

  const handleFilterChange = (filter: 'active' | 'deleted' | 'all') => {
    setViewFilter(filter);
  };

  const handleFieldChange = (field: keyof typeof initialFormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFeedback(null);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setFormMode('create');
    setSelectedUser(null);
    setFormData(initialFormState);
    setFeedback(null);
  };

    return (
      <section className="admin-users-page">
      {notification && (
        <div
          className={`admin-users-page__notification admin-users-page__notification--${notification.type}`}
          role="status"
        >
          <span className="admin-users-page__notification-icon">
            {notification.type === 'success' ? '✓' : '⚠'}
          </span>
          <span className="admin-users-page__notification-message">{notification.message}</span>
        </div>
      )}
      <div ref={formRef}>
        <UsersForm
        isOpen={isFormOpen}
        formMode={formMode}
        formData={formData}
        feedback={feedback}
        isProcessing={isProcessing}
        onFieldChange={handleFieldChange}
          onSubmit={handleFormSubmit}
          onReset={handleCreateNew}
          onClose={handleCloseForm}
        />
      </div>

      <UsersToolbar
        search={search}
        onSearchChange={setSearch}
        onNew={handleCreateNew}
        filters={[
          { label: 'Activos', value: 'active' },
          { label: 'Desactivados', value: 'deleted' },
          { label: 'Todos', value: 'all' },
        ]}
        currentFilter={viewFilter}
        onFilterChange={handleFilterChange}
      />

      <UsersTable
        users={paginatedUsers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReactivate={requestReactivate}
      />

      <div className="users-pagination">
        <div className="users-pagination__info">
          Mostrando {filteredUsers.length === 0 ? 0 : page * rowsPerPage + 1}-
          {Math.min(filteredUsers.length, (page + 1) * rowsPerPage)} de {filteredUsers.length}
        </div>
        <div className="users-pagination__controls">
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
        isOpen={Boolean(reactivateConfirmation.pendingUser)}
        title="Reactivar usuario"
        description={
          reactivateConfirmation.pendingUser ? (
            <>
              ¿Estás seguro de que quieres reactivar a{' '}
              <strong>
                {reactivateConfirmation.pendingUser.name} {reactivateConfirmation.pendingUser.surname}
              </strong>
              ?
            </>
          ) : undefined
        }
        confirmLabel= "Sí, reactivar"
        cancelLabel="Cancelar"
        onConfirm={() => reactivateConfirmation.confirm(handleReactivate)}
        onCancel={reactivateConfirmation.cancelConfirmation}
        isProcessing={isProcessing}
      />

      <ConfirmModal
        isOpen={Boolean(deleteConfirmation.pendingUser)}
        title="Eliminar usuario"
        description={
          deleteConfirmation.pendingUser ? (
            <>
              ¿Quieres eliminar al{' '}
              <strong>
                {deleteConfirmation.pendingUser.name} {deleteConfirmation.pendingUser.surname}
              </strong>
              ? Esta acción marcará el usuario como eliminado.
            </>
          ) : undefined
        }
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        onConfirm={() => deleteConfirmation.confirm(confirmDelete)}
        onCancel={deleteConfirmation.cancelConfirmation}
        isProcessing={isProcessing}
      />
    </section>
  );
};
