import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import MaterialForm from '../components/forms/MaterialForm';
import axios from '../config/axios';
import { useAuth } from '../context/AuthContext';

const MaterialsPage: React.FC = () => {
  const { state } = useAuth();
  const [materials, setMaterials] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/materials');
      setMaterials(res.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaterial = async (data: any) => {
    try {
      await axios.post('/materials', data);
      setShowAddModal(false);
      fetchMaterials();
    } catch (error) {
      console.error('Error adding material:', error);
    }
  };

  const handleUpdateMaterial = async (id: number, data: any) => {
    try {
      await axios.put(`/materials/${id}`, data);
      setSelectedMaterial(null);
      fetchMaterials();
    } catch (error) {
      console.error('Error updating material:', error);
    }
  };

  const handleDeleteMaterial = async (id: number) => {
    if (!window.confirm('Delete this material?')) return;
    try {
      await axios.delete(`/materials/${id}`);
      fetchMaterials();
    } catch (error) {
      console.error('Error deleting material:', error);
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
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Materials</h1>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>Add Material</Button>
      </div>
      <Card>
        <DataTable
          columns={[
            { header: 'Name', accessor: 'name' },
            { header: 'Quantity', accessor: 'quantity' },
            { header: 'Unit', accessor: 'unit' },
            { header: 'Threshold', accessor: 'threshold' },
            { header: 'Description', accessor: 'description' },
            {
              header: 'Actions',
              accessor: 'id',
              cell: (value: any, row: any) => (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedMaterial(row)}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDeleteMaterial(value)}>Delete</Button>
                </div>
              ),
            },
          ]}
          data={materials}
          loading={loading}
          emptyMessage="No materials found."
        />
      </Card>
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Material">
        <MaterialForm onSubmit={handleAddMaterial} />
      </Modal>
      <Modal isOpen={!!selectedMaterial} onClose={() => setSelectedMaterial(null)} title="Edit Material">
        {selectedMaterial && (
          <MaterialForm
            material={selectedMaterial}
            onSubmit={async (data: any) => {
              await handleUpdateMaterial(selectedMaterial.id, data);
            }}
          />
        )}
      </Modal>
    </Layout>
  );
};

export default MaterialsPage;
