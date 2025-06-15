import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import axios from '../config/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

interface ProductionLog {
  id: number;
  task_id: number;
  hour: string;
  perfect_pieces: number;
  defect_pieces: number;
  total_pieces: number;
  perfect_weight: string;
  defective_weight: string;
  wastage_weight: string;
  remarks: string;
  date: string;
  created_at: string;
}

const ProductionLogsPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const { state } = useAuth();
  const [logs, setLogs] = useState<ProductionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<{
    id: number | undefined;
    hour: string;
    date: string;
    perfect_pieces: number;
    defect_pieces: number;
    total_pieces: number;
    perfect_weight: number;
    defective_weight: number;
    wastage_weight: number;
    remarks: string;
  }>({
    id: undefined,
    hour: '',
    date: new Date().toISOString().split('T')[0],
    perfect_pieces: 0,
    defect_pieces: 0,
    total_pieces: 0,
    perfect_weight: 0,
    defective_weight: 0,
    wastage_weight: 0,
    remarks: ''
  });
  const { user } = state;

  useEffect(() => {
    if (taskId) {
      fetchLogs();
    }
  }, [taskId]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      console.log('Fetching logs for task ID:', taskId);
      const response = await axios.get(`/hourly-production-logs/task/${taskId}`);
      console.log('API Response:', response.data);
      
      // Map backend fields to frontend fields
      const mappedLogs = response.data.map((log: any) => ({
        id: log.id,
        task_id: log.task_id,
        hour: log.hour,
        perfect_pieces: log.perfect_pieces,
        defect_pieces: log.defect_pieces,
        total_pieces: log.total_pieces,
        perfect_weight: log.perfect_weight,
        defective_weight: log.defective_weight,
        wastage_weight: log.wastage_weight,
        remarks: log.remarks,
        date: log.date,
        created_at: log.created_at
      }));
      
      console.log('Mapped logs:', mappedLogs);
      setLogs(mappedLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this log?')) return;
    try {
      await axios.delete(`/hourly-production-logs/${id}`);
      toast.success('Log deleted successfully');
      fetchLogs();
    } catch (err: any) {
      console.error('Error deleting log:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete log';
      toast.error(errorMessage);
    }
  };

  // Utility to extract valid HH:mm from any hour string
  function extractValidHour(hour: string): string {
    if (!hour) return '';
    // Match HH:mm or HH:mm:ss or any string starting with HH:mm
    const match = hour.match(/^(\d{2}):(\d{2})/);
    return match ? `${match[1]}:${match[2]}` : hour;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Always send hour as HH:mm
      const formattedHour = extractValidHour(formData.hour);
      const data = {
        task_id: taskId,
        hour: formattedHour,
        date: formData.date,
        perfect_pieces: Number(formData.perfect_pieces) || 0,
        defect_pieces: Number(formData.defect_pieces) || 0,
        total_pieces: Number(formData.total_pieces) || 0,
        perfect_weight: formData.perfect_weight ? Number(formData.perfect_weight) : null,
        defective_weight: formData.defective_weight ? Number(formData.defective_weight) : null,
        wastage_weight: formData.wastage_weight ? Number(formData.wastage_weight) : null,
        remarks: formData.remarks || ''
      };

      console.log('Submitting data:', data);

      if (formData.id) {
        // Update existing log
        await axios.put(`/hourly-production-logs/${formData.id}`, data);
        toast.success('Log updated successfully');
      } else {
        // Create new log
        await axios.post('/hourly-production-logs', data);
        toast.success('Log created successfully');
      }

      setShowAddModal(false);
      setFormData({
        id: undefined,
        hour: '',
        date: new Date().toISOString().split('T')[0],
        perfect_pieces: 0,
        defect_pieces: 0,
        total_pieces: 0,
        perfect_weight: 0,
        defective_weight: 0,
        wastage_weight: 0,
        remarks: ''
      });
      fetchLogs();
    } catch (error: any) {
      console.error('Error saving log:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to save log');
      toast.error(error.response?.data?.message || 'Failed to save log');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (log: ProductionLog) => {
    setFormData({
      id: log.id,
      hour: log.hour,
      date: log.date,
      perfect_pieces: Number(log.perfect_pieces) || 0,
      defect_pieces: Number(log.defect_pieces) || 0,
      total_pieces: Number(log.total_pieces) || 0,
      perfect_weight: log.perfect_weight ? Number(log.perfect_weight) : 0,
      defective_weight: log.defective_weight ? Number(log.defective_weight) : 0,
      wastage_weight: log.wastage_weight ? Number(log.wastage_weight) : 0,
      remarks: log.remarks || ''
    });
    setShowAddModal(true);
  };

  const columns = [
    {
      header: 'Hour',
      accessor: 'hour',
      cell: (value: string) => value ? value.split(':')[0] + ':00' : '-'
    },
    {
      header: 'Date',
      accessor: 'date',
      cell: (value: string) => value ? new Date(value).toLocaleDateString() : '-'
    },
    {
      header: 'Perfect Pieces',
      accessor: 'perfect_pieces',
      cell: (value: number) => value || 0
    },
    {
      header: 'Defect Pieces',
      accessor: 'defect_pieces',
      cell: (value: number) => value || 0
    },
    {
      header: 'Total Pieces',
      accessor: 'total_pieces',
      cell: (value: number) => value || 0
    },
    {
      header: 'Perfect Weight (kg)',
      accessor: 'perfect_weight',
      cell: (value: string) => value ? Number(value).toFixed(2) : '0.00'
    },
    {
      header: 'Defective Weight (kg)',
      accessor: 'defective_weight',
      cell: (value: string) => value ? Number(value).toFixed(2) : '0.00'
    },
    {
      header: 'Wastage Weight (kg)',
      accessor: 'wastage_weight',
      cell: (value: string) => value ? Number(value).toFixed(2) : '0.00'
    },
    {
      header: 'Remarks',
      accessor: 'remarks',
      cell: (value: string) => value || '-'
    },
    {
      header: 'Created At',
      accessor: 'created_at',
      cell: (value: string) => value ? new Date(value).toLocaleString() : '-'
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (value: number, row: ProductionLog) => {
        const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
        
        return (
          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(row)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(value)}
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Production Logs</h1>
            <p className="mt-1 text-sm text-gray-600">View and manage production logs for task #{taskId}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Log
            </Button>
            <Button
              variant="outline"
              onClick={fetchLogs}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : (
          <Card>
            <DataTable
              columns={columns}
              data={logs}
              loading={loading}
              emptyMessage="No logs found"
            />
          </Card>
        )}

        <Modal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setFormData({
              id: undefined,
              hour: '',
              date: new Date().toISOString().split('T')[0],
              perfect_pieces: 0,
              defect_pieces: 0,
              total_pieces: 0,
              perfect_weight: 0,
              defective_weight: 0,
              wastage_weight: 0,
              remarks: ''
            });
          }}
          title={formData.id ? "Edit Production Log" : "Add Production Log"}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Hour</label>
                <select
                  value={formData.hour}
                  onChange={(e) => setFormData({ ...formData, hour: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Hour</option>
                  {[...Array(24)].map((_, i) => (
                    <option key={i} value={i.toString().padStart(2, '0') + ':00:00'}>
                      {i.toString().padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Perfect Pieces</label>
                <input
                  type="number"
                  value={formData.perfect_pieces}
                  onChange={(e) => {
                    const perfectPieces = Number(e.target.value);
                    setFormData({
                      ...formData,
                      perfect_pieces: perfectPieces,
                      total_pieces: perfectPieces + formData.defect_pieces
                    });
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Defect Pieces</label>
                <input
                  type="number"
                  value={formData.defect_pieces}
                  onChange={(e) => {
                    const defectPieces = Number(e.target.value);
                    setFormData({
                      ...formData,
                      defect_pieces: defectPieces,
                      total_pieces: formData.perfect_pieces + defectPieces
                    });
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Pieces</label>
                <input
                  type="number"
                  value={formData.total_pieces}
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Perfect Weight (kg)</label>
                <input
                  type="number"
                  value={formData.perfect_weight}
                  onChange={(e) => setFormData({ ...formData, perfect_weight: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Defective Weight (kg)</label>
                <input
                  type="number"
                  value={formData.defective_weight}
                  onChange={(e) => setFormData({ ...formData, defective_weight: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Wastage Weight (kg)</label>
                <input
                  type="number"
                  value={formData.wastage_weight}
                  onChange={(e) => setFormData({ ...formData, wastage_weight: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {formData.id ? 'Update' : 'Add'} Log
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default ProductionLogsPage;