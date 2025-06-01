import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, RefreshCw } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import axios from '../config/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import OptionsMenu from '../components/ui/OptionsMenu';
import { useNavigate } from 'react-router-dom';

interface Task {
  id: number;
  name: string;
  description: string;
  machine_id: number;
  mould_id: number;
  product_id: number;
  color_mix_id: number;
  worker_id: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  target: number;
  completed_pieces: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  machine_name?: string;
  mould_name?: string;
  product_name?: string;
  color_mix_name?: string;
  worker_name?: string;
}

interface TaskFormData {
  name: string;
  description: string;
  machine_id: number;
  mould_id: number;
  product_id: number;
  color_mix_id: number;
  worker_id: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  target: number;
}

const TasksPage: React.FC = () => {
  const { t } = useTranslation();
  const { state } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>({
    name: '',
    description: '',
    machine_id: 0,
    mould_id: 0,
    product_id: 0,
    color_mix_id: 0,
    worker_id: 0,
    status: 'pending',
    target: 0
  });
  const [machines, setMachines] = useState<Array<{ id: number; name: string }>>([]);
  const [moulds, setMoulds] = useState<Array<{ id: number; name: string }>>([]);
  const [products, setProducts] = useState<Array<{ id: number; name: string }>>([]);
  const [colorMixes, setColorMixes] = useState<Array<{ id: number; name: string }>>([]);
  const [workers, setWorkers] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
    fetchDropdownData();
  }, []);

  // Pre-fill form when editing a task
  useEffect(() => {
    if (selectedTask) {
      setFormData({
        name: selectedTask.name || '',
        description: selectedTask.description || '',
        machine_id: selectedTask.machine_id || 0,
        mould_id: selectedTask.mould_id || 0,
        product_id: selectedTask.product_id || 0,
        color_mix_id: selectedTask.color_mix_id || 0,
        worker_id: selectedTask.worker_id || 0,
        status: selectedTask.status || 'pending',
        target: selectedTask.target || 0
      });
    } else {
      setFormData({
        name: '',
        description: '',
        machine_id: 0,
        mould_id: 0,
        product_id: 0,
        color_mix_id: 0,
        worker_id: 0,
        status: 'pending',
        target: 0
      });
    }
  }, [selectedTask, showAddModal]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/tasks');
      setTasks(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [machinesRes, mouldsRes, productsRes, formulasRes, workersRes] = await Promise.all([
        axios.get('/machines'),
        axios.get('/moulds'),
        axios.get('/products'),
        axios.get('/color-mix-formulas'),
        axios.get('/workers')
      ]);

      setMachines(machinesRes.data);
      setMoulds(mouldsRes.data);
      setProducts(productsRes.data);
      setColorMixes(formulasRes.data);
      setWorkers(workersRes.data);
    } catch (err) {
      setError('Failed to fetch dropdown data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: formData.name,
        description: formData.description,
        machine_id: Number(formData.machine_id),
        mould_id: Number(formData.mould_id),
        product_id: Number(formData.product_id),
        color_mix_id: Number(formData.color_mix_id),
        worker_id: Number(formData.worker_id),
        status: formData.status,
        target: Number(formData.target)
      };

      if (selectedTask) {
        await axios.put(`/tasks/${selectedTask.id}`, data);
        toast.success('Task updated successfully');
      } else {
        await axios.post('/tasks', data);
        toast.success('Task created successfully');
      }

      setShowAddModal(false);
      setSelectedTask(null);
      setFormData({
        name: '',
        description: '',
        machine_id: 0,
        mould_id: 0,
        product_id: 0,
        color_mix_id: 0,
        worker_id: 0,
        status: 'pending',
        target: 0
      });
      fetchTasks();
    } catch (err: any) {
      console.error('Error saving task:', err);
      toast.error(err.response?.data?.message || 'Failed to save task');
    }
  };

  const handleStatusUpdate = async (taskId: number, newStatus: string) => {
    try {
      await axios.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success('Task status updated successfully');
      fetchTasks();
    } catch (err) {
      toast.error('Failed to update task status');
    }
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowAddModal(true);
  };

  const handleDeleteTask = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await axios.delete(`/tasks/${id}`);
      toast.success('Task deleted');
      fetchTasks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete task');
    }
  };

  const goToHourlyProduction = (taskId: number) => {
    if (state.user?.role === 'worker') {
      navigate(`/hourly-production-log/${taskId}`);
    } else {
      navigate(`/production-logs/${taskId}`);
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Machine', accessor: 'machine_name' },
    { header: 'Mould', accessor: 'mould_name' },
    { header: 'Product', accessor: 'product_name' },
    { header: 'Color Mix', accessor: 'color_mix_name' },
    { header: 'Worker', accessor: 'worker_name' },
    { header: 'Target', accessor: 'target' },
    { header: 'Completed', accessor: 'completed_pieces' },
    { header: 'Progress', accessor: 'progress', cell: (row: Task) => {
      const progress = (row.completed_pieces / row.target) * 100;
      let colorClass = 'bg-red-500'; // Default color for low progress
      
      if (progress >= 100) {
        colorClass = 'bg-green-500'; // Completed
      } else if (progress >= 75) {
        colorClass = 'bg-green-400'; // Good progress
      } else if (progress >= 50) {
        colorClass = 'bg-yellow-500'; // Moderate progress
      } else if (progress >= 25) {
        colorClass = 'bg-orange-500'; // Fair progress
      }
      
      return (
        <div className="relative w-full">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`${colorClass} h-2.5 rounded-full transition-all duration-300`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <span className="text-xs text-gray-600 mt-1">
            {Math.round(progress)}%
          </span>
        </div>
      );
    }},
    { header: 'Status', accessor: 'status' },
    { header: 'Created At', accessor: 'created_at', cell: (value: string) => new Date(value).toLocaleString() },
    { header: 'Actions', accessor: 'actions' }
  ];

  return (
    <Layout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
          {t('Task')}
        </h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          {state.user?.role === 'super_admin' && (
            <Button
              variant="primary"
              onClick={() => setShowAddModal(true)}
              className="flex items-center"
            >
              <Plus size={16} className="mr-2" />
              {t('CreateTask')}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={fetchTasks}
            className="flex items-center"
          >
            <RefreshCw size={16} className="mr-2" />
            {t('Refresh')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <Card key={task.id} className="flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="text-lg font-semibold text-blue-700">{task.name}</h2>
                  <p className="text-sm text-gray-500 mb-1">{task.description}</p>
                </div>
                <OptionsMenu
                  options={[
                    { label: 'Edit', onClick: () => handleEditTask(task) },
                    { label: 'Delete', onClick: () => handleDeleteTask(task.id) }
                  ]}
                />
              </div>
              <div className="mb-2">
                <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mr-2">Machine: {task.machine_name}</span>
                <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mr-2">Mould: {task.mould_name}</span>
                <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mr-2">Product: {task.product_name}</span>
                <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mr-2">Worker: {task.worker_name}</span>
                <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mr-2">Status: {task.status}</span>
                <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Target: {task.target}</span>
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <Button variant="primary" size="sm" onClick={() => goToHourlyProduction(task.id)}>
                Go to Hourly Production
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={showAddModal || !!selectedTask}
        onClose={() => { setShowAddModal(false); setSelectedTask(null); }}
        title={selectedTask ? t('EditTask') : t('CreateTask')}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="name"
              label={t('name')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
              placeholder="Enter task name"
            />
            <Input
              id="description"
              label={t('description')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              placeholder="Enter task description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              id="machine"
              label={t('machine')}
              value={formData.machine_id.toString()}
              onChange={(value) => setFormData({ ...formData, machine_id: Number(value) })}
              required
              fullWidth
              options={[
                { value: '', label: t('selectMachine') },
                ...machines.map(machine => ({
                  value: machine.id.toString(),
                  label: machine.name
                }))
              ]}
            />
            <Select
              id="mould"
              label={t('mould')}
              value={formData.mould_id.toString()}
              onChange={(value) => setFormData({ ...formData, mould_id: Number(value) })}
              required
              fullWidth
              options={[
                { value: '', label: t('selectMould') },
                ...moulds.map(mould => ({
                  value: mould.id.toString(),
                  label: mould.name
                }))
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              id="product"
              label={t('product')}
              value={formData.product_id.toString()}
              onChange={(value) => setFormData({ ...formData, product_id: Number(value) })}
              required
              fullWidth
              options={[
                { value: '', label: t('selectProduct') },
                ...products.map(product => ({
                  value: product.id.toString(),
                  label: product.name
                }))
              ]}
            />
            <Select
              id="colorMix"
              label={t('colorMix')}
              value={formData.color_mix_id.toString()}
              onChange={(value) => setFormData({ ...formData, color_mix_id: Number(value) })}
              required
              fullWidth
              options={[
                { value: '', label: t('selectColorMix') },
                ...colorMixes.map(colorMix => ({
                  value: colorMix.id.toString(),
                  label: colorMix.name
                }))
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              id="worker"
              label={t('worker')}
              value={formData.worker_id.toString()}
              onChange={(value) => setFormData({ ...formData, worker_id: Number(value) })}
              required
              fullWidth
              options={[
                { value: '', label: t('selectWorker') },
                ...workers.map(worker => ({
                  value: worker.id.toString(),
                  label: worker.name
                }))
              ]}
            />
            <Select
              id="status"
              label={t('status')}
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value as Task['status'] })}
              required
              fullWidth
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              id="target"
              label={t('target')}
              type="number"
              min="1"
              value={formData.target.toString()}
              onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })}
              required
              fullWidth
              placeholder="Enter target pieces"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setShowAddModal(false); setSelectedTask(null); }}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary">
              {selectedTask ? t('updateTask') : t('createTask')}
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default TasksPage;