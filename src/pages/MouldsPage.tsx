import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, RefreshCw } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import MouldForm from '../components/forms/MouldForm';
import axios from '../config/axios';
import { useAuth } from '../context/AuthContext';
import { Mould } from '../types';

const MouldsPage: React.FC = () => {
  const { t } = useTranslation();
  const { state } = useAuth();
  const [loading, setLoading] = useState(true);
  const [moulds, setMoulds] = useState<Mould[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMould, setSelectedMould] = useState<Mould | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMoulds();
  }, []);

  const fetchMoulds = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/moulds');
      setMoulds(response.data);
    } catch (error: any) {
      console.error('Error fetching moulds:', error);
      setError(error.response?.data?.message || 'Failed to fetch moulds');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMould = async (data: Partial<Mould>) => {
    try {
      setError(null);
      const response = await axios.post('/moulds', data);
      setShowAddModal(false);
      fetchMoulds();
    } catch (error: any) {
      console.error('Error adding mould:', error);
      setError(error.response?.data?.message || 'Failed to add mould');
    }
  };

  const handleUpdateMould = async (id: number, data: Partial<Mould>) => {
    try {
      setError(null);
      await axios.put(`/moulds/${id}`, data);
      setSelectedMould(null);
      fetchMoulds();
    } catch (error: any) {
      console.error('Error updating mould:', error);
      setError(error.response?.data?.message || 'Failed to update mould');
    }
  };

  const handleDeleteMould = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this mould?')) return;
    
    try {
      setError(null);
      await axios.delete(`/moulds/${id}`);
      fetchMoulds();
    } catch (error: any) {
      console.error('Error deleting mould:', error);
      setError(error.response?.data?.message || 'Failed to delete mould');
    }
  };

  if (state.user?.role !== 'admin' && state.user?.role !== 'super_admin') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500">Unauthorized: Only admin and super admin can access this page.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Moulds</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={fetchMoulds}
            className="flex items-center"
          >
            <RefreshCw size={16} className="mr-2" />
            {t('common.refresh')}
          </Button>
          <Button 
            variant="primary" 
            onClick={() => setShowAddModal(true)}
            className="flex items-center"
          >
            <Plus size={16} className="mr-2" />
            Add Mould
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <Card>
        <DataTable
          columns={[
            { header: 'Name', accessor: 'name' },
            { header: 'Description', accessor: 'description' },
            { header: 'Status', accessor: 'status' },
            {
              header: 'Actions',
              accessor: 'id',
              cell: (value: any, row: any) => (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedMould(row)}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDeleteMould(value)}>Delete</Button>
                </div>
              ),
            },
          ]}
          data={moulds}
          loading={loading}
          emptyMessage="No moulds found."
        />
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Mould">
        <MouldForm onSubmit={handleAddMould} />
      </Modal>

      <Modal isOpen={!!selectedMould} onClose={() => setSelectedMould(null)} title="Edit Mould">
        {selectedMould && (
          <MouldForm
            mould={selectedMould}
            onSubmit={async (data) => {
              await handleUpdateMould(selectedMould.id, data);
            }}
          />
        )}
      </Modal>
    </Layout>
  );
};

export default MouldsPage; 