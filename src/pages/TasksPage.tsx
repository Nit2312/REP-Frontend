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

interface Option {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const TasksPage: React.FC = () => {
  const { t } = useTranslation();
  const { state } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [deletingTask, setDeletingTask] = useState<number | null>(null);

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
      setLoading(true);
      const res = await axios.get('/tasks');
      console.log('API Response:', res.data);
      
      // Remove worker filtering here; always set all tasks
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      toast.error('Failed to fetch tasks');
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

  // Debug: Log user and tasks
  console.log('[TasksPage] state.user:', state.user);
  console.log('[TasksPage] All tasks:', tasks);
  console.log('[TasksPage] Logged-in userId:', state.user?.userId);

  // Patch: filter for worker tasks here
  const filteredTasks = tasks.filter(task => {
    let matchesWorker = true;
    if (state.user?.role === 'worker') {
      const taskWorkerId = task.worker_id;
      const userId = state.user ? state.user.id : null;
      console.log('[TasksPage] Filtering for worker:', userId, 'against', taskWorkerId, 'status:', task.status);
      matchesWorker = taskWorkerId === userId && (task.status === 'in_progress' || task.status === 'completed');
    }
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.machine_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.mould_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.worker_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesWorker && matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        toast.error('Task name is required');
        return;
      }
      if (!formData.machine_id) {
        toast.error('Machine is required');
        return;
      }
      if (!formData.mould_id) {
        toast.error('Mould is required');
        return;
      }
      if (!formData.product_id) {
        toast.error('Product is required');
        return;
      }
      if (!formData.color_mix_id) {
        toast.error('Color mix is required');
        return;
      }
      if (!formData.worker_id) {
        toast.error('Worker is required');
        return;
      }
      if (formData.target <= 0) {
        toast.error('Target must be greater than 0');
        return;
      }

      const data = {
        name: formData.name.trim(),
        description: formData.description.trim(),
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (taskId: number, newStatus: string) => {
    // Validate status
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      toast.error('Invalid status');
      return;
    }

    setUpdatingStatus(taskId);
    try {
      await axios.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success('Task status updated successfully');
      fetchTasks();
    } catch (err) {
      toast.error('Failed to update task status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowAddModal(true);
  };

  const handleDeleteTask = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) return;
    
    setDeletingTask(id);
    try {
      await axios.delete(`/tasks/${id}`);
      toast.success('Task deleted successfully');
      fetchTasks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete task');
    } finally {
      setDeletingTask(null);
    }
  };

  const goToHourlyProduction = (taskId: number) => {
    if (state.user?.role === 'worker') {
      navigate(`/hourly-production-log/${taskId}`);
    } else {
      navigate(`/production-logs/${taskId}`);
    }
  };

  const calculateProgress = (completed: number, target: number) => {
    if (!target) return 0;
    const progress = (completed / target) * 100;
    return Math.min(Math.round(progress), 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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
      const progress = calculateProgress(row.completed_pieces, row.target);
      const progressColor = getProgressColor(progress);
      
      return (
        <div className="relative w-full">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`${progressColor} h-2.5 rounded-full transition-all duration-300`}
              style={{ width: `${progress}%` }}
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
          {state.user?.role !== 'worker' && (
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
            disabled={loading}
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t('Refresh')}
          </Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="task-search"
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
        <Select
          id="status-filter"
          value={statusFilter}
          onChange={(value) => setStatusFilter(value)}
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'pending', label: 'Pending' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' }
          ]}
          className="w-full"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* No Results State */}
      {!loading && !error && filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No tasks found</p>
          {searchQuery && (
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
          )}
        </div>
      )}

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-2">
        {filteredTasks.map((task) => {
          const progress = calculateProgress(task.completed_pieces, task.target);
          const progressColor = getProgressColor(progress);
          const statusColor = getStatusColor(task.status);

          return (
            <Card key={task.id} className="flex flex-col justify-between h-full hover:shadow-lg transition-shadow duration-200">
              <>
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold text-gray-900 truncate" title={task.name}>
                        {task.name}
                      </h2>
                      {task.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2" title={task.description}>
                          {task.description}
                        </p>
                      )}
                    </div>
                    {state.user?.role !== 'worker' && (
                      <OptionsMenu
                        options={[
                          { 
                            label: 'Edit', 
                            onClick: () => handleEditTask(task)
                          },
                          { 
                            label: deletingTask === task.id ? 'Deleting...' : 'Delete', 
                            onClick: () => handleDeleteTask(task.id)
                          }
                        ]}
                      />
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="min-w-0">
                        <span className="text-xs font-medium text-gray-500 block mb-1">Machine</span>
                        <p className="text-sm font-medium text-gray-900 truncate" title={task.machine_name || 'Not assigned'}>
                          {task.machine_name || (task.machine_id ? `ID: ${task.machine_id}` : <span className="text-gray-400 italic">Unassigned</span>)}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-medium text-gray-500 block mb-1">Mould</span>
                        <p className="text-sm font-medium text-gray-900 truncate" title={task.mould_name || 'Not assigned'}>
                          {task.mould_name || (task.mould_id ? `ID: ${task.mould_id}` : <span className="text-gray-400 italic">Unassigned</span>)}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-medium text-gray-500 block mb-1">Product</span>
                        <p className="text-sm font-medium text-gray-900 truncate" title={task.product_name || 'Not assigned'}>
                          {task.product_name || (task.product_id ? `ID: ${task.product_id}` : <span className="text-gray-400 italic">Unassigned</span>)}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-medium text-gray-500 block mb-1">Worker</span>
                        <p className="text-sm font-medium text-gray-900 truncate" title={task.worker_name || 'Not assigned'}>
                          {task.worker_name || (task.worker_id ? `ID: ${task.worker_id}` : <span className="text-gray-400 italic">Unassigned</span>)}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500 block mb-1">Status</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                          {formatStatus(task.status)}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500 block mb-1">Target</span>
                        <p className="text-sm font-medium text-gray-900">{(task.target || 0).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-500">Progress</span>
                        <span className="text-xs font-medium text-gray-900">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${progressColor} transition-all duration-300`}
                          style={{ width: `${progress}%` }}
                          role="progressbar"
                          aria-valuenow={progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {(task.completed_pieces || 0).toLocaleString()} / {(task.target || 0).toLocaleString()} pieces
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-4 pt-3 border-t border-gray-100">
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    {state.user?.role !== 'worker' && (
                      <Select
                        id={`task-status-${task.id}`}
                        value={task.status}
                        onChange={(value) => handleStatusUpdate(task.id, value)}
                        options={[
                          { value: 'pending', label: 'Pending' },
                          { value: 'in_progress', label: 'In Progress' },
                          { value: 'completed', label: 'Completed' },
                          { value: 'cancelled', label: 'Cancelled' }
                        ]}
                        className="w-full sm:w-auto"
                        disabled={updatingStatus === task.id}
                      />
                    )}
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => goToHourlyProduction(task.id)}
                      className="w-full sm:w-auto"
                      disabled={updatingStatus === task.id || deletingTask === task.id}
                    >
                      {updatingStatus === task.id ? 'Updating...' : 'Go to Hourly Production'}
                    </Button>
                  </div>
                </div>
              </>
            </Card>
          );
        })}
      </div>

      <Modal
        isOpen={showAddModal || !!selectedTask}
        onClose={() => {
          setShowAddModal(false);
          setSelectedTask(null);
        }}
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
              value={formData.target.toString()}
              onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })}
              required
              fullWidth
              min="0"
              placeholder="Enter target pieces"
            />
          </div>

          <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                setSelectedTask(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="flex items-center"
            >
              {isSubmitting && (
                <RefreshCw size={16} className="animate-spin mr-2" />
              )}
              {selectedTask ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default TasksPage;