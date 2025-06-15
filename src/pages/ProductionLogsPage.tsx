import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, RefreshCw } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import axios from '../config/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

interface ProductionLog {
  id: number;
  taskId: number;
  hour: string; // time (HH:mm)
  totalPieces: number;
  perfectPieces: number;
  defectPieces: number;
  date: string; // YYYY-MM-DD
  perfect_weight: number | null;
  defective_weight: number | null;
  wastage_weight: number | null;
  remarks: string | null;
  createdAt: string;
}

interface Task {
  id: number;
  name: string;
  machine_name: string;
  mould_name: string;
  product_name: string;
  color_mix_name: string;
  status: string;
}

const ProductionLogsPage: React.FC = () => {
  const { t } = useTranslation();
  const { taskId } = useParams<{ taskId: string }>();
  const { state } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [logs, setLogs] = useState<ProductionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    id: undefined as number | undefined,
    hour: '',
    totalPieces: 0,
    perfectPieces: 0,
    defectPieces: 0,
    date: new Date().toISOString().slice(0, 10),
    perfect_weight: '',
    defective_weight: '',
    wastage_weight: '',
    remarks: ''
  });

  useEffect(() => {
    if (taskId) {
      fetchTask();
      fetchLogs();
    }
  }, [taskId]);

  const fetchTask = async () => {
    try {
      const response = await axios.get(`/api/tasks/${taskId}`);
      setTask(response.data);
    } catch (err) {
      toast.error('Failed to fetch task details');
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await axios.get('/api/production-logs');
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching production logs:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this log?')) return;
    try {
      await axios.delete(`/api/production-logs/${id}`);
      toast.success('Log deleted successfully');
      fetchLogs();
    } catch (err) {
      toast.error('Failed to delete log');
    }
  };

  const handleUpdate = async (log: ProductionLog) => {
    setFormData({
      id: log.id,
      hour: log.hour,
      totalPieces: log.totalPieces,
      perfectPieces: log.perfectPieces,
      defectPieces: log.defectPieces,
      date: log.date,
      perfect_weight: log.perfect_weight?.toString() || '',
      defective_weight: log.defective_weight?.toString() || '',
      wastage_weight: log.wastage_weight?.toString() || '',
      remarks: log.remarks || ''
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate piece counts
    if (formData.perfectPieces + formData.defectPieces !== formData.totalPieces) {
      toast.error('Total pieces must equal the sum of perfect and defect pieces');
      return;
    }

    try {
      const data = {
        taskId: Number(taskId),
        hour: formData.hour,
        totalPieces: Number(formData.totalPieces),
        perfectPieces: Number(formData.perfectPieces),
        defectPieces: Number(formData.defectPieces),
        date: formData.date,
        perfect_weight: formData.perfect_weight === '' ? null : Number(formData.perfect_weight),
        defective_weight: formData.defective_weight === '' ? null : Number(formData.defective_weight),
        wastage_weight: formData.wastage_weight === '' ? null : Number(formData.wastage_weight),
        remarks: formData.remarks || null
      };

      if (formData.id) {
        await axios.put(`/api/production-logs/${formData.id}`, data);
        toast.success('Log updated successfully');
      } else {
        await axios.post('/api/production-logs', data);
        toast.success('Log added successfully');
      }

      setShowAddModal(false);
      setFormData({
        id: undefined,
        hour: '',
        totalPieces: 0,
        perfectPieces: 0,
        defectPieces: 0,
        date: new Date().toISOString().slice(0, 10),
        perfect_weight: '',
        defective_weight: '',
        wastage_weight: '',
        remarks: ''
      });
      fetchLogs();
    } catch (err) {
      toast.error('Failed to save log');
    }
  };

  const columns = [
    { header: 'Hour', accessor: 'hour' },
    { header: 'Date', accessor: 'date' },
    { header: 'Perfect Pieces', accessor: 'perfectPieces' },
    { header: 'Defect Pieces', accessor: 'defectPieces' },
    { header: 'Total Pieces', accessor: 'totalPieces' },
    { header: 'Perfect Weight (kg)', accessor: 'perfect_weight' },
    { header: 'Defective Weight (kg)', accessor: 'defective_weight' },
    { header: 'Wastage Weight (kg)', accessor: 'wastage_weight' },
    { 
      header: 'Remarks', 
      accessor: 'remarks',
      cell: (value: string) => (
        <div className="max-w-xs truncate" title={value || ''}>
          {value || '-'}
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (value: any, row: any) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUpdate(row)}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(value)}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <Layout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          {task && (
            <p className="text-gray-600">
              {t('productionLogstaskDetails', {
                task: task.name,
                machine: task.machine_name,
                mould: task.mould_name
              })}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          {state.user?.role === 'worker' && task?.status === 'in_progress' && (
            <Button
              variant="primary"
              onClick={() => setShowAddModal(true)}
              className="flex items-center"
            >
              <Plus size={16} className="mr-2" />
              {t('addLog')}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={fetchLogs}
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
          data={logs}
          loading={loading}
          emptyMessage={t('noLogs')}
        />
      </Card>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={t('addLog')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="hour"
              label={t('productionLogs.hour')}
              type="time"
              value={formData.hour}
              onChange={(e) => setFormData({ ...formData, hour: e.target.value })}
              required
              fullWidth
            />
            <Input
              id="date"
              label={t('productionLogs.date')}
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              fullWidth
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              id="totalPieces"
              label={t('productionLogs.totalPieces')}
              type="number"
              min="0"
              value={formData.totalPieces}
              onChange={(e) => setFormData({ ...formData, totalPieces: Number(e.target.value) })}
              required
              fullWidth
            />
            <Input
              id="perfectPieces"
              label={t('productionLogs.perfectPieces')}
              type="number"
              min="0"
              value={formData.perfectPieces}
              onChange={(e) => setFormData({ ...formData, perfectPieces: Number(e.target.value) })}
              required
              fullWidth
            />
            <Input
              id="defectPieces"
              label={t('productionLogs.defectPieces')}
              type="number"
              min="0"
              value={formData.defectPieces}
              onChange={(e) => setFormData({ ...formData, defectPieces: Number(e.target.value) })}
              required
              fullWidth
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              id="perfect_weight"
              label={t('productionLogs.perfectWeight')}
              type="number"
              min="0"
              step="0.01"
              value={formData.perfect_weight}
              onChange={(e) => setFormData({ ...formData, perfect_weight: e.target.value })}
              fullWidth
            />
            <Input
              id="defective_weight"
              label={t('productionLogs.defectiveWeight')}
              type="number"
              min="0"
              step="0.01"
              value={formData.defective_weight}
              onChange={(e) => setFormData({ ...formData, defective_weight: e.target.value })}
              fullWidth
            />
            <Input
              id="wastage_weight"
              label={t('productionLogs.wastageWeight')}
              type="number"
              min="0"
              step="0.01"
              value={formData.wastage_weight}
              onChange={(e) => setFormData({ ...formData, wastage_weight: e.target.value })}
              fullWidth
            />
          </div>
          <div className="col-span-full">
            <Input
              id="remarks"
              label={t('productionLogs.remarks')}
              type="text"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              fullWidth
              placeholder="Add any remarks or notes here..."
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddModal(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit">
              {formData.id ? t('updateLog') : t('addLog')}
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default ProductionLogsPage;