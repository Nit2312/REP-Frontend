import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import axios from '../config/axios';
import { toast } from 'react-hot-toast';
import Modal from '../components/ui/Modal';
import { useTranslation } from 'react-i18next';

interface HourlyProductionLog {
  id: number;
  taskId: number;
  hour: string;
  totalPieces: number;
  perfectPieces: number;
  defectPieces: number;
  date: string;
  createdAt: string;
  defective_weight: number | null;
  wastage_weight: number | null;
  perfect_weight: number | null;
  remarks: string | null;
}

const HourlyProductionLogPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<HourlyProductionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharedHour, setSharedHour] = useState('');
  const [sharedDate, setSharedDate] = useState(new Date().toISOString().slice(0, 10));
  const [entries, setEntries] = useState([
    { perfectPieces: 0, defectPieces: 0, perfect_weight: '', defective_weight: '', wastage_weight: '', remarks: '' }
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    fetchLogs();
  }, [taskId]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      console.log('Fetching logs for task ID:', taskId);
      const res = await axios.get(`/api/hourly-production-logs/task/${taskId}`);
      console.log('API Response:', res.data);
      
      // Map backend fields to frontend fields for this page only
      const mappedLogs = res.data.map((log: any) => {
        console.log('Mapping log:', log);
        return {
          id: log.id,
          taskId: log.task_id,
          hour: log.hour,
          totalPieces: log.total_pieces,
          perfectPieces: log.perfect_pieces,
          defectPieces: log.defect_pieces,
          date: log.date,
          createdAt: log.created_at,
          defective_weight: log.defective_weight,
          wastage_weight: log.wastage_weight,
          perfect_weight: log.perfect_weight,
          remarks: log.remarks
        };
      });
      console.log('Mapped logs:', mappedLogs);
      setLogs(mappedLogs);
    } catch (err) {
      console.error('Error fetching logs:', err);
      toast.error('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  // Add a new empty row
  const addRow = () => {
    setEntries([...entries, { perfectPieces: 0, defectPieces: 0, perfect_weight: '', defective_weight: '', wastage_weight: '', remarks: '' }]);
  };

  // Remove a row by index
  const removeRow = (idx: number) => {
    setEntries(entries.filter((_, i) => i !== idx));
  };

  // Update a field in a row
  const updateEntry = (idx: number, field: string, value: any) => {
    const updatedEntries = entries.map((entry, i) => {
      if (i === idx) {
        return { ...entry, [field]: value };
      }
      return entry;
    });
    setEntries(updatedEntries);
  };

  // Calculate total pieces for all entries in the current hour
  const totalPiecesForHour = entries.reduce((sum, entry) => sum + entry.perfectPieces + entry.defectPieces, 0);

  const [formData, setFormData] = useState({
    id: null as number | null,
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
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sharedHour || !sharedDate) {
      toast.error('Please select both hour and date');
      return;
    }

    try {
      // Submit each entry as a separate log
      const submitPromises = entries.map(async (entry) => {
        const data = {
          task_id: Number(taskId),
          hour: extractHourHHMM(sharedHour), // Robust time format
          date: sharedDate,
          perfect_pieces: entry.perfectPieces,
          defect_pieces: entry.defectPieces,
          total_pieces: entry.perfectPieces + entry.defectPieces,
          perfect_weight: entry.perfect_weight ? Number(entry.perfect_weight) : null,
          defective_weight: entry.defective_weight ? Number(entry.defective_weight) : null,
          wastage_weight: entry.wastage_weight ? Number(entry.wastage_weight) : null,
          remarks: entry.remarks || ''
        };
        return axios.post('/api/hourly-production-logs', data);
      });

      await Promise.all(submitPromises);

      // Reset form
      setEntries([{ perfectPieces: 0, defectPieces: 0, perfect_weight: '', defective_weight: '', wastage_weight: '', remarks: '' }]);
      setSharedHour('');
      setSharedDate(new Date().toISOString().slice(0, 10));
      
      toast.success('Production logs added successfully');
      fetchLogs();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to save production logs';
      toast.error(msg);
    }
  };

  const handleUpdate = async (id: number, data: Partial<HourlyProductionLog>) => {
    try {
      await axios.put(`/api/hourly-production-logs/${id}`, {
        hour: extractHourHHMM(data.hour), // Robust time format
        date: data.date,
        total_pieces: data.totalPieces,
        perfect_pieces: data.perfectPieces,
        defect_pieces: data.defectPieces,
        perfect_weight: data.perfect_weight,
        defective_weight: data.defective_weight,
        wastage_weight: data.wastage_weight,
        remarks: data.remarks || ''
      });
      toast.success('Production log updated successfully');
      fetchLogs();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to update production log';
      toast.error(msg);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/hourly-production-logs/${id}`);
      toast.success('Production log deleted successfully');
      fetchLogs();
    } catch (err) {
      toast.error('Failed to delete production log');
    }
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    setFormData({
      id: null,
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
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sharedHour || !sharedDate) {
      toast.error('Please select both hour and date');
      return;
    }

    try {
      if (formData.id) {
        // Update existing log
        await handleUpdate(formData.id, {
          hour: extractHourHHMM(sharedHour),
          date: sharedDate,
          totalPieces: formData.perfectPieces + formData.defectPieces,
          perfectPieces: formData.perfectPieces,
          defectPieces: formData.defectPieces,
          perfect_weight: formData.perfect_weight ? Number(formData.perfect_weight) : null,
          defective_weight: formData.defective_weight ? Number(formData.defective_weight) : null,
          wastage_weight: formData.wastage_weight ? Number(formData.wastage_weight) : null,
          remarks: formData.remarks
        });
      } else {
        // Create new log
        await handleSubmit(e);
      }
      handleModalClose();
    } catch (err) {
      toast.error(formData.id ? 'Failed to update log' : 'Failed to save log');
    }
  };

  // Utility to extract valid HH:mm from any string
  function extractHourHHMM(hourStr: string = ''): string {
    const match = hourStr.match(/\b\d{2}:\d{2}\b/);
    return match ? match[0] : '';
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hourly Production Log</h1>
            <p className="mt-1 text-sm text-gray-600">Record and track production metrics for each hour</p>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2 w-full sm:w-auto justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Tasks
          </Button>
        </div>

        <Card className="mb-6">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Production Log</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Input
                    id="shared-hour"
                    label="Hour"
                    type="time"
                    value={sharedHour}
                    onChange={e => setSharedHour(e.target.value)}
                    required
                    fullWidth
                    className="bg-white"
                  />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Input
                    id="shared-date"
                    label="Date"
                    type="date"
                    value={sharedDate}
                    onChange={e => setSharedDate(e.target.value)}
                    required
                    fullWidth
                    className="bg-white"
                  />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Pieces (for this hour)</label>
                  <div className="px-4 py-2 bg-white border rounded-md text-lg font-semibold text-gray-900">
                    {totalPiecesForHour}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perfect</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Defect</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perfect Weight (kg)</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Defective Weight (kg)</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wastage Weight (kg)</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {entries.map((entry, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-3 py-3">
                            <Input
                              id={`perfectPieces-${idx}`}
                              type="number"
                              min="0"
                              value={entry.perfectPieces}
                              onChange={e => updateEntry(idx, 'perfectPieces', Number(e.target.value))}
                              fullWidth
                              className="bg-white"
                            />
                          </td>
                          <td className="px-3 py-3">
                            <Input
                              id={`defectPieces-${idx}`}
                              type="number"
                              min="0"
                              value={entry.defectPieces}
                              onChange={e => updateEntry(idx, 'defectPieces', Number(e.target.value))}
                              fullWidth
                              className="bg-white"
                            />
                          </td>
                          <td className="px-3 py-3 text-center font-medium text-gray-900">
                            {entry.perfectPieces + entry.defectPieces}
                          </td>
                          <td className="px-3 py-3">
                            <Input
                              id={`perfect_weight-${idx}`}
                              type="number"
                              step="0.01"
                              min="0"
                              value={entry.perfect_weight}
                              onChange={e => updateEntry(idx, 'perfect_weight', e.target.value)}
                              fullWidth
                              className="bg-white"
                            />
                          </td>
                          <td className="px-3 py-3">
                            <Input
                              id={`defective_weight-${idx}`}
                              type="number"
                              step="0.01"
                              min="0"
                              value={entry.defective_weight}
                              onChange={e => updateEntry(idx, 'defective_weight', e.target.value)}
                              fullWidth
                              className="bg-white"
                            />
                          </td>
                          <td className="px-3 py-3">
                            <Input
                              id={`wastage_weight-${idx}`}
                              type="number"
                              step="0.01"
                              min="0"
                              value={entry.wastage_weight}
                              onChange={e => updateEntry(idx, 'wastage_weight', e.target.value)}
                              fullWidth
                              className="bg-white"
                            />
                          </td>
                          <td className="px-3 py-3">
                            <Input
                              id={`remarks-${idx}`}
                              type="text"
                              value={entry.remarks}
                              onChange={e => updateEntry(idx, 'remarks', e.target.value)}
                              fullWidth
                              className="bg-white"
                              placeholder="Add notes..."
                            />
                          </td>
                          <td className="px-3 py-3">
                            {entries.length > 1 && (
                              <Button
                                type="button"
                                variant="danger"
                                onClick={() => removeRow(idx)}
                                className="flex items-center gap-1 w-full sm:w-auto justify-center"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Remove
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addRow}
                  className="flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Row
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                  className="flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Submit All
                </Button>
              </div>
            </form>
          </div>
        </Card>

        {/* --- UI IMPROVEMENTS FOR MOBILE --- */}
        {/* Show vertical card list for logs only on mobile (sm:hidden) */}
        <Card className="mt-6 sm:hidden">
          <h2 className="text-xl font-bold mb-2">Production Logs</h2>
          <div className="flex flex-col space-y-4">
            {logs.length === 0 && <div className="text-gray-500">No logs found.</div>}
            {logs.map((log, idx) => (
              <div key={log.id || idx} className="bg-white rounded-lg shadow p-4 flex flex-col space-y-1 border border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Hour:</span> <span>{log.hour}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Date:</span> <span>{log.date}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Perfect Pieces:</span> <span>{log.perfectPieces}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Defect Pieces:</span> <span>{log.defectPieces}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Total Pieces:</span> <span>{log.totalPieces}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Perfect Weight (kg):</span> <span>{log.perfect_weight ?? '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Defective Weight (kg):</span> <span>{log.defective_weight ?? '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Wastage Weight (kg):</span> <span>{log.wastage_weight ?? '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Remarks:</span> <span>{log.remarks || '-'}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
        {/* Show table for logs on tablet/desktop only (hidden on mobile) */}
        <Card className="mb-6 hidden sm:block">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Production Logs</h2>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hour</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perfect Pieces</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Defect Pieces</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Pieces</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perfect Weight (kg)</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Defective Weight (kg)</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wastage Weight (kg)</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {logs.length === 0 && (
                      <tr>
                        <td colSpan={9} className="text-center text-gray-500 py-4">No logs found.</td>
                      </tr>
                    )}
                    {logs.map((log, idx) => (
                      <tr key={log.id || idx}>
                        <td className="px-3 py-2">{log.hour}</td>
                        <td className="px-3 py-2">{log.date}</td>
                        <td className="px-3 py-2">{log.perfectPieces}</td>
                        <td className="px-3 py-2">{log.defectPieces}</td>
                        <td className="px-3 py-2">{log.totalPieces}</td>
                        <td className="px-3 py-2">{log.perfect_weight ?? '-'}</td>
                        <td className="px-3 py-2">{log.defective_weight ?? '-'}</td>
                        <td className="px-3 py-2">{log.wastage_weight ?? '-'}</td>
                        <td className="px-3 py-2">{log.remarks || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Card>

        
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={handleModalClose}
        title="Add Production Log"
        size="lg"
      >
        <form onSubmit={handleModalSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hour</label>
              <select
                name="hour"
                value={formData.hour}
                onChange={(e) => setFormData({ ...formData, hour: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select Hour</option>
                {[...Array(24)].map((_, i) => (
                  <option key={i} value={i}>
                    {i.toString().padStart(2, '0')}:00
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Total Pieces</label>
              <input
                type="number"
                name="totalPieces"
                value={formData.totalPieces}
                onChange={(e) => setFormData({ ...formData, totalPieces: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Perfect Pieces</label>
              <input
                type="number"
                name="perfectPieces"
                value={formData.perfectPieces}
                onChange={(e) => setFormData({ ...formData, perfectPieces: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Defect Pieces</label>
              <input
                type="number"
                name="defectPieces"
                value={formData.defectPieces}
                onChange={(e) => setFormData({ ...formData, defectPieces: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Perfect Weight (kg)</label>
              <input
                type="number"
                name="perfect_weight"
                value={formData.perfect_weight}
                onChange={(e) => setFormData({ ...formData, perfect_weight: e.target.value })}
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
                name="defective_weight"
                value={formData.defective_weight}
                onChange={(e) => setFormData({ ...formData, defective_weight: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Wastage Weight (kg)</label>
              <input
                type="number"
                name="wastage_weight"
                value={formData.wastage_weight}
                onChange={(e) => setFormData({ ...formData, wastage_weight: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter any additional remarks..."
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
            <button
              type="button"
              onClick={handleModalClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save Log
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default HourlyProductionLogPage;
