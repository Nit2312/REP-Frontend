import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, Filter } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import axios from '../config/axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

interface Filter {
  machine_id: string;
  mould_id: string;
  product_id: string;
  worker_id: string;
  status: string;
  date_range: string;
}

interface DashboardStats {
  overallStats: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    pendingTasks: number;
    totalPieces: number;
    perfectPieces: number;
    defectPieces: number;
    totalPerfectWeight: number;
    totalDefectiveWeight: number;
    totalWastageWeight: number;
    efficiency: number;
    qualityRate: number;
  };
  machineStats: Array<{
    name: string;
    totalTasks: number;
    totalPieces: number;
    perfectPieces: number;
    defectPieces: number;
    efficiency: number;
  }>;
  productStats: Array<{
    name: string;
    totalTasks: number;
    totalPieces: number;
    perfectPieces: number;
    defectPieces: number;
    totalPerfectWeight: number;
    totalDefectiveWeight: number;
    qualityRate: number;
  }>;
  mouldStats: Array<{
    name: string;
    totalTasks: number;
    totalPieces: number;
    perfectPieces: number;
    defectPieces: number;
    successRate: number;
  }>;
  workerStats: Array<{
    name: string;
    totalTasks: number;
    totalPieces: number;
    perfectPieces: number;
    defectPieces: number;
    performanceRate: number;
  }>;
  recentActivity: Array<{
    id: number;
    created_at: string;
    hour: string;
    total_pieces: number;
    perfect_pieces: number;
    defect_pieces: number;
    task_name: string;
    machine_name: string;
    product_name: string;
    worker_name: string;
  }>;
  hourlyStats: Array<{
    hour: string;
    totalPieces: number;
    perfectPieces: number;
    defectPieces: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState<Filter>({
    machine_id: '',
    mould_id: '',
    product_id: '',
    worker_id: '',
    status: '',
    date_range: 'today'
  });
  const [machines, setMachines] = useState<Array<{ id: number; name: string }>>([]);
  const [moulds, setMoulds] = useState<Array<{ id: number; name: string }>>([]);
  const [products, setProducts] = useState<Array<{ id: number; name: string }>>([]);
  const [workers, setWorkers] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    fetchDashboardData();
    fetchDropdownData();
  }, [filter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/dashboard/stats', { params: filter });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [machinesRes, mouldsRes, productsRes, workersRes] = await Promise.all([
        axios.get('/machines'),
        axios.get('/moulds'),
        axios.get('/products'),
        axios.get('/workers')
      ]);

      setMachines(machinesRes.data);
      setMoulds(mouldsRes.data);
      setProducts(productsRes.data);
      setWorkers(workersRes.data);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const handleFilterChange = (key: keyof Filter, value: string) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  const renderStatCard = (title: string, value: number | string, subtitle?: string, color?: string) => (
    <Card className="p-4">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <span className={`text-2xl font-bold mt-1 ${color || 'text-gray-900'}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {subtitle && <span className="text-sm text-gray-500 mt-1">{subtitle}</span>}
      </div>
    </Card>
  );

  const renderBarChart = (data: any[], dataKey: string, nameKey: string, title: string) => (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={nameKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={dataKey} fill="#8884d8" name={t(dataKey)} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );

  const renderLineChart = (data: any[], title: string) => (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="totalPieces" stroke="#8884d8" name={t('Total Pieces')} />
            <Line type="monotone" dataKey="perfectPieces" stroke="#00C49F" name={t('Perfect Pieces')} />
            <Line type="monotone" dataKey="defectPieces" stroke="#FF8042" name={t('Defect Pieces')} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );

  const renderPieChart = (data: any[], dataKey: string, nameKey: string, title: string) => (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, value }) => `${name}: ${value}`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value}`, t('Pieces')]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t('Dashboard')}</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter size={16} className="mr-2" />
              {t('Filters')}
            </Button>
            <Button
              variant="outline"
              onClick={fetchDashboardData}
              className="flex items-center"
              disabled={loading}
            >
              <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              {t('Refresh')}
            </Button>
          </div>
        </div>

        {showFilters && (
          <Card className="mb-6 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                id="machine-filter"
                label={t('Machine')}
                value={filter.machine_id}
                onChange={(value) => handleFilterChange('machine_id', value)}
                options={[
                  { value: '', label: t('All Machines') },
                  ...machines.map(machine => ({
                    value: machine.id.toString(),
                    label: machine.name
                  }))
                ]}
              />
              <Select
                id="mould-filter"
                label={t('Mould')}
                value={filter.mould_id}
                onChange={(value) => handleFilterChange('mould_id', value)}
                options={[
                  { value: '', label: t('All Moulds') },
                  ...moulds.map(mould => ({
                    value: mould.id.toString(),
                    label: mould.name
                  }))
                ]}
              />
              <Select
                id="product-filter"
                label={t('Product')}
                value={filter.product_id}
                onChange={(value) => handleFilterChange('product_id', value)}
                options={[
                  { value: '', label: t('All Products') },
                  ...products.map(product => ({
                    value: product.id.toString(),
                    label: product.name
                  }))
                ]}
              />
              <Select
                id="worker-filter"
                label={t('Worker')}
                value={filter.worker_id}
                onChange={(value) => handleFilterChange('worker_id', value)}
                options={[
                  { value: '', label: t('All Workers') },
                  ...workers.map(worker => ({
                    value: worker.id.toString(),
                    label: worker.name
                  }))
                ]}
              />
              <Select
                id="status-filter"
                label={t('Status')}
                value={filter.status}
                onChange={(value) => handleFilterChange('status', value)}
                options={[
                  { value: '', label: t('All Status') },
                  { value: 'pending', label: t('Pending') },
                  { value: 'in_progress', label: t('In Progress') },
                  { value: 'completed', label: t('Completed') },
                  { value: 'cancelled', label: t('Cancelled') }
                ]}
              />
              <Select
                id="date-range-filter"
                label={t('Date Range')}
                value={filter.date_range}
                onChange={(value) => handleFilterChange('date_range', value)}
                options={[
                  { value: 'today', label: t('Today') },
                  { value: 'yesterday', label: t('Yesterday') },
                  { value: 'this_week', label: t('This Week') },
                  { value: 'last_week', label: t('Last Week') },
                  { value: 'this_month', label: t('This Month') },
                  { value: 'last_month', label: t('Last Month') }
                ]}
              />
            </div>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : dashboardData ? (
          <>
            {/* Overall Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {renderStatCard(t('Total Tasks'), dashboardData.overallStats.totalTasks)}
              {renderStatCard(t('Total Pieces'), dashboardData.overallStats.totalPieces)}
              {renderStatCard(
                t('Efficiency'),
                `${dashboardData.overallStats.efficiency.toFixed(1)}%`,
                undefined,
                dashboardData.overallStats.efficiency >= 80 ? 'text-green-600' : 'text-yellow-600'
              )}
              {renderStatCard(
                t('Quality Rate'),
                `${dashboardData.overallStats.qualityRate.toFixed(1)}%`,
                undefined,
                dashboardData.overallStats.qualityRate >= 90 ? 'text-green-600' : 'text-yellow-600'
              )}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {renderLineChart(dashboardData.hourlyStats, t('Hourly Production'))}
              {renderBarChart(dashboardData.machineStats, 'efficiency', 'name', t('Machine Performance'))}
              {renderBarChart(dashboardData.workerStats, 'performanceRate', 'name', t('Worker Performance'))}
              {renderPieChart(dashboardData.mouldStats, 'totalPieces', 'name', t('Mould Distribution'))}
            </div>

            {/* Recent Activity */}
            <Card className="mb-6">
              <h3 className="text-lg font-semibold mb-4 p-4 border-b">{t('Recent Activity')}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('Time')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('Task')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('Machine')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('Product')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('Worker')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('Pieces')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dashboardData.recentActivity.map((activity) => (
                      <tr key={activity.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(activity.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {activity.task_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {activity.machine_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {activity.product_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {activity.worker_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {activity.total_pieces.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        ) : (
          <div className="text-center p-8">
            <p className="text-gray-500">{t('No data available')}</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DashboardPage;