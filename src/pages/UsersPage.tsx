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
import { isAxiosError as isAxiosErrorBase } from 'axios';

const UsersPage: React.FC = () => {
  const { t } = useTranslation();
  const { state } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  // Fix: ensure selectedUser is typed so selectedUser.id is always available
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/users');
      // Ensure we're setting the users data correctly
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Show error to user
      if (isAxiosErrorBase(error)) {
        alert(error.response?.data?.message || 'Error fetching users');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (data: any) => {
    try {
      await axios.post('/api/users', data);
      setShowAddModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  // Add update and delete handlers for users
  const handleUpdateUser = async (id: number, data: any) => {
    try {
      await axios.put(`/api/users/${id}`, data);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm(t('users.confirmDelete'))) {
      try {
        await axios.delete(`/api/users/${userId}`);
        // No response body expected for 204, just refresh
        fetchUsers();
      } catch (error: any) {
        if (isAxiosErrorBase(error)) {
          alert(error.response?.data?.message || 'Error deleting user');
        }
        console.error('Error deleting user:', error);
      }
    }
  };

  const columns = [
    { header: t('users.user_id'), accessor: 'user_id' },
    { header: t('users.name'), accessor: 'name' },
    { header: t('users.email'), accessor: 'email' },
    { header: t('users.role'), accessor: 'role' },
    { header: t('users.createdAt'), accessor: 'createdAt', 
      cell: (value: string) => new Date(value).toLocaleDateString() 
    },
    {
      header: t('common.actions'),
      accessor: 'id',
      cell: (value: any, row: any) => (
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

  return (
    <Layout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
          {t('users')}
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
            onSubmit={(data) => handleUpdateUser((selectedUser as any).id, data)}
          />
        </Modal>
      )}
    </Layout>
  );
};

export default UsersPage;
