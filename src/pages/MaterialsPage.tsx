import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, RefreshCw } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import MaterialForm from '../components/forms/MaterialForm';
import axios from '../config/axios';
import { useAuth } from '../context/AuthContext';

interface Material {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  threshold: number;
  description: string;
  created_at: string;
}

const MaterialsPage: React.FC = () => {
  const { t } = useTranslation();
  const { state } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/materials');
      setMaterials(response.data);
    } catch (error: any) {
      console.error('Error fetching materials:', error);
      setError(error.response?.data?.message || 'Failed to fetch materials');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaterial = async (data: Partial<Material>) => {
    try {
      setError(null);
      await axios.post('/materials', data);
      setShowAddModal(false);
      fetchMaterials();
    } catch (error: any) {
      console.error('Error adding material:', error);
      setError(error.response?.data?.message || 'Failed to add material');
    }
  };

  const handleUpdateMaterial = async (id: number, data: Partial<Material>) => {
    try {
      setError(null);
      await axios.put(`/materials/${id}`, data);
      setSelectedMaterial(null);
      fetchMaterials();
    } catch (error: any) {
      console.error('Error updating material:', error);
      setError(error.response?.data?.message || 'Failed to update material');
    }
  };

  const handleDeleteMaterial = async (id: number) => {
    if (!window.confirm(t('inventory.confirmDelete'))) return;
    
    try {
      setError(null);
      await axios.delete(`/materials/${id}`);
      fetchMaterials();
    } catch (error: any) {
      console.error('Error deleting material:', error);
      setError(error.response?.data?.message || 'Failed to delete material');
    }
  };

  if (state.user?.role !== 'admin' && state.user?.role !== 'super_admin') {
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
          {t('inventory.materials')}
        </h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={fetchMaterials}
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
            {t('inventory.addMaterial')}
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
            { header: t('inventory.name'), accessor: 'name' },
            { header: t('inventory.quantity'), accessor: 'quantity' },
            { header: t('inventory.unit'), accessor: 'unit' },
            { header: t('inventory.threshold'), accessor: 'threshold' },
            { header: t('inventory.description'), accessor: 'description' },
            {
              header: t('common.actions'),
              accessor: 'id',
              cell: (value: any, row: any) => (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedMaterial(row)}
                    title={t('common.edit')}
                  >
                    {t('common.edit')}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteMaterial(value)}
                    title={t('common.delete')}
                  >
                    {t('common.delete')}
                  </Button>
                </div>
              ),
            },
          ]}
          data={materials}
          loading={loading}
          emptyMessage={t('inventory.noMaterials')}
        />
      </Card>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={t('inventory.addMaterial')}
      >
        <MaterialForm onSubmit={handleAddMaterial} />
      </Modal>

      <Modal
        isOpen={!!selectedMaterial}
        onClose={() => setSelectedMaterial(null)}
        title={t('inventory.editMaterial')}
      >
        {selectedMaterial && (
          <MaterialForm
            material={selectedMaterial}
            onSubmit={(data) => handleUpdateMaterial(selectedMaterial.id, data)}
          />
        )}
      </Modal>
    </Layout>
  );
};

export default MaterialsPage;
