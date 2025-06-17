import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, RefreshCw, Edit, Trash } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import UserForm from '../components/forms/UserForm';
import { useAuth } from '../context/AuthContext';
import axios from '../config/axios';
import { User } from '../types';

const UsersPage: React.FC = () => {
  const { t } = useTranslation();
  const { state } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/users');
      console.log('Fetched users:', response.data);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (data: any) => {
    try {
      setError(null);
      console.log('[AddUser] Payload:', data);
      await axios.post('/users', data);
      setShowAddModal(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error adding user:', error);
      // Show backend error message if available
      const msg = error?.response?.data?.message || 'Failed to add user';
      setError(msg);
      alert(msg);
    }
  };

  const handleUpdateUser = async (id: number, data: any) => {
    try {
      setError(null);
      // Always include userId from selectedUser if not present in data
      const userIdToSend = data.userId || selectedUser?.userId;
      await axios.put(`/users/${id}`, { ...data, userId: userIdToSend });
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm(t('users.confirmDelete'))) return;
    try {
      setError(null);
      await axios.delete(`/users/${id}`);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user');
    }
  };

  // Only super_admin and admin can access this page
  if (state.user?.role === 'worker') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500">{t('common.unauthorized')}</p>
        </div>
      </Layout>
    );
  }

  const columns = [
    { header: t('users.user_id'), accessor: 'user_id' },
    { header: t('users.name'), accessor: 'name' },
    { header: t('users.role'), accessor: 'role' },
    { 
      header: t('users.createdAt'), 
      accessor: 'created_at',
      cell: (value: string) => new Date(value).toLocaleDateString() 
    },
    {
      header: t('common.actions'),
      accessor: 'id',
      cell: (value: number, row: User) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedUser(row)}
            title={t('common.edit')}
          >
            <Edit size={16} />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteUser(value)}
            title={t('common.delete')}
          >
            <Trash size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
          {t('users.manage')}
        </h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            className="flex items-center"
          >
            <Plus size={16} className="mr-2" />
            {t('users.addUser')}
          </Button>
          <Button
            variant="outline"
            onClick={fetchUsers}
            className="flex items-center"
          >
            <RefreshCw size={16} className="mr-2" />
            {t('common.refresh')}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <Card>
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          emptyMessage={t('users.noUsers')}
        />
      </Card>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={t('users.addUser')}
      >
        <UserForm onSubmit={handleAddUser} />
      </Modal>

      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title={t('users.editUser')}
        >
          <UserForm
            user={selectedUser}
            onSubmit={(data) => handleUpdateUser(selectedUser.id, data)}
          />
        </Modal>
      )}
    </Layout>
  );
};

export default UsersPage;
