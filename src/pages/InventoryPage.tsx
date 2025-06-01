import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, RefreshCw, AlertTriangle } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import MaterialForm from '../components/forms/MaterialForm';
import { useAuth } from '../context/AuthContext';
import axios from "../config/axios";
import { use } from 'i18next';

interface Material {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  threshold: number;
  description: string;
}

const InventoryPage: React.FC = () => {
  const { t } = useTranslation();
  const { state } = useAuth();
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [colorMixes, setColorMixes] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  useEffect(() => {
    fetchMaterials();
    fetchColorMixes();
    
   
    
  }, []);


  const [combinedData, setCombinedData] = useState<any[]>([]);

useEffect(() => {
  // Always combine, even if one is empty
  const combined = [
    ...materials.map((m: any) => ({
      id: m.id,
      name: m.name,
      quantity: m.quantity,
      unit: m.unit,
      threshold: m.threshold,
      description: m.description,
      type: 'Material',
    })),
    ...colorMixes.map((cm: any) => {
      let materialsStr = '';
      try {
        const weights = typeof cm.materialWeights === 'string' ? JSON.parse(cm.materialWeights) : cm.materialWeights;
        if (Array.isArray(weights)) {
          materialsStr = weights.map((mw: any) => {
            const material = materials.find((m: any) => String(m.id) === String(mw.materialId));
            return `${material ? material.name : mw.materialId}: ${mw.quantity}kg`;
          }).join(', ');
        } else if (weights && typeof weights === 'object') {
          materialsStr = Object.entries(weights)
            .map(([mid, qty]) => {
              const material = materials.find((m: any) => String(m.id) === String(mid));
              return `${material ? material.name : mid}: ${qty}kg`;
            })
            .join(', ');
        }
      } catch (e) {
        console.warn('Invalid materialWeights for mix', cm.id, cm.materialWeights);
      }
      return {
        id: `mix-${cm.id}`,
        name: cm.formulaName ? `Color Mix: ${cm.formulaName}` : `Color Mix #${cm.id}`,
        quantity: cm.colorRequirement,
        unit: 'kg',
        threshold: 0,
        description: `Materials: ${materialsStr || 'No materials'}`,
        type: 'Color Mix',
      };
    }),
  ];
  setCombinedData(combined);
  console.log('Combined data:', combined);
}, [materials, colorMixes]);
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/materials');
      console.log('Fetched materials:', response);
      setMaterials(response.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchColorMixes = async () => {
    try {
      const response = await axios.get('/color-mix-entries');
      setColorMixes(response.data);
    } catch (error) {
      console.error('Error fetching color mixes:', error);
    }
  };

  const handleAddMaterial = async (data: any) => {
    try {
      await axios.post('/api/materials', data);
      setShowAddModal(false);
      fetchMaterials();
    } catch (error) {
      console.error('Error adding material:', error);
    }
  };

  // Add delete handler for materials
  const handleDeleteMaterial = async (materialId: number) => {
    if (window.confirm(t('inventory.confirmDelete'))) {
      try {
        await axios.delete(`/api/materials/${materialId}`);
        fetchMaterials();
      } catch (error) {
        if (axios.isAxiosError(error)) {
          alert(error.response?.data?.message || 'Error deleting material');
        }
        console.error('Error deleting material:', error);
      }
    }
  };





  

  const columns = [
    { header: t('inventory.name'), accessor: 'name' },
    { header: t('inventory.quantity'), accessor: 'quantity' },
    { header: t('inventory.unit'), accessor: 'unit' },
    { header: 'Description', accessor: 'description' },
    { header: 'Type', accessor: 'type' },
    {
      header: t('common.actions'),
      accessor: 'id',
      cell: (value: any, row: any) => (
        row.type === 'Material' && (state.user?.role === 'super_admin' || state.user?.role === 'admin') ? (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMaterial(row)}
            >
              {t('Update')}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDeleteMaterial(value)}
            >
              {t('Delete')}
            </Button>
          </div>
        ) : null
      ),
    },
  ];

  return (
    <Layout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
          Store
        </h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          {(state.user?.role === 'super_admin' || state.user?.role === 'admin') && (
            <Button
              variant="primary"
              onClick={() => setShowAddModal(true)}
              className="flex items-center"
            >
              <Plus size={16} className="mr-2" />
              {t('addMaterial')}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={fetchMaterials}
            className="flex items-center"
          >
            <RefreshCw size={16} className="mr-2" />
            {t('Refresh')}
          </Button>
        </div>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={combinedData}
          loading={loading}
          emptyMessage={t('noMaterials')}
        />
      </Card>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={t('addMaterial')}
      >
        <MaterialForm onSubmit={handleAddMaterial} />
      </Modal>

      {selectedMaterial && (state.user?.role === 'super_admin' || state.user?.role === 'admin') && (
        <Modal
          isOpen={!!selectedMaterial}
          onClose={() => setSelectedMaterial(null)}
          title={t('updateMaterial')}
        >
          <MaterialForm
            material={selectedMaterial}
            onSubmit={async (data) => {
              try {
                await axios.put(`/api/materials/${(selectedMaterial as any).id}`, data);
                setSelectedMaterial(null);
                fetchMaterials();
              } catch (error) {
                console.error('Error updating material:', error);
              }
            }}
          />
        </Modal>
      )}
    </Layout>
  );
};

export default InventoryPage;