// MachinesPage.tsx - CRUD page for machines (copy of MaterialsPage, adapted)
import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import axios from '../config/axios';
import { useAuth } from '../context/AuthContext';
import MachineForm from '../components/forms/MachineForm';

const MachinesPage: React.FC = () => {
  const { state } = useAuth();
  const [machines, setMachines] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMachines(); }, []);

  const fetchMachines = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/machines');
      setMachines(response.data);
    } catch (error) {
      console.error('Error fetching machines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMachine = async (data: any) => {
    try {
      await axios.post('/machines', data);
      setShowAddModal(false);
      fetchMachines();
    } catch (error) {
      console.error('Error adding machine:', error);
    }
  };

  const handleUpdateMachine = async (id: number, data: any) => {
    try {
      await axios.put(`/machines/${id}`, data);
      setSelectedMachine(null);
      fetchMachines();
    } catch (error) {
      console.error('Error updating machine:', error);
    }
  };

  const handleDeleteMachine = async (id: number) => {
    if (!window.confirm('Delete this machine?')) return;
    try {
      await axios.delete(`/machines/${id}`);
      fetchMachines();
    } catch (error) {
      console.error('Error deleting machine:', error);
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
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Machines</h1>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>Add Machine</Button>
      </div>
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
                  <Button variant="outline" size="sm" onClick={() => setSelectedMachine(row)}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDeleteMachine(value)}>Delete</Button>
                </div>
              ),
            },
          ]}
          data={machines}
          loading={loading}
          emptyMessage="No machines found."
        />
      </Card>
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Machine">
        <MachineForm onSubmit={handleAddMachine} />
      </Modal>
      <Modal isOpen={!!selectedMachine} onClose={() => setSelectedMachine(null)} title="Edit Machine">
        {selectedMachine && (
          <MachineForm
            machine={selectedMachine}
            onSubmit={async (data: any) => {
              await handleUpdateMachine(selectedMachine.id, data);
            }}
          />
        )}
      </Modal>
    </Layout>
  );
};

export default MachinesPage;
