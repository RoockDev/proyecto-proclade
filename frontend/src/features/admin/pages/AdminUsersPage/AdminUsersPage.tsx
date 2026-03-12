import { type FormEvent, useCallback, useRef, useState } from 'react';
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

const initialFormState = {
  name: '',
  surname: '',
  email: '',
  roles: 'ADMIN',
};

export const AdminUsersPage = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const formRef = useRef<HTMLDivElement | null>(null);
  const reactivateConfirmation = useUserConfirmation();
  const deleteConfirmation = useUserConfirmation();
  const handleUsersError = useCallback((message: string) => setFeedback(message), []);

  const {
    filteredUsers,
    refreshUsers,
    search,
    setSearch,
    viewFilter,
    setViewFilter,
  } = useUsersList({ onError: handleUsersError });

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

    if (!trimmedName || !trimmedSurname || !trimmedEmail) {
      setFeedback('Completa nombre, apellido y email.');
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
              password: 'ChangeMe123!',
            })
          : await updateUser({
              id: userToUpdate!.id,
              name: trimmedName,
              surname: trimmedSurname,
              email: trimmedEmail,
              roles,
            });

      if (response.success) {
        setFeedback(formMode === 'create' ? 'Usuario creado con éxito.' : 'Usuario actualizado.');
        setFormData(initialFormState);
        setFormMode('create');
        setSelectedUser(null);
        await refreshUsers();
      } else {
        setFeedback(response.message || 'No se pudo guardar el usuario.');
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 409) {
        setFeedback('Ya existe un usuario con ese email. Reactiva el existente o usa otro email.');
      } else {
        console.error('Error al guardar usuario', error);
        setFeedback('Error al intentar guardar el usuario.');
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
        setFeedback('Usuario eliminado.');
        await refreshUsers();
      } else {
        setFeedback(response.message || 'No se pudo eliminar el usuario.');
      }
    } catch (error) {
      console.error('Error al eliminar usuario', error);
      setFeedback('No se pudo eliminar el usuario.');
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
        setFeedback('Usuario reactivado.');
        await refreshUsers();
      } else {
        setFeedback(response.message || 'No se pudo reactivar el usuario.');
      }
    } catch (error) {
      console.error('Error al reactivar usuario', error);
      setFeedback('No se pudo reactivar el usuario.');
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
          { label: 'Eliminados', value: 'deleted' },
          { label: 'Todos', value: 'all' },
        ]}
        currentFilter={viewFilter}
        onFilterChange={handleFilterChange}
      />

      <UsersTable
        users={filteredUsers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReactivate={requestReactivate}
      />

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
        confirmLabel="Sí, reactivar"
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
