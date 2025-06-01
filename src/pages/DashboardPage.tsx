import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/layout/Layout';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import axios from '../config/axios';

interface Filter {
  machine_id: string;
  mould_id: string;
  product_id: string;
  worker_id: string;
  status: string;
}
interface Option { id: number; name: string; }
interface WorkerOption { id: number; name: string; role: string; }

const DashboardPage = () => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<Filter>({
    machine_id: '',
    mould_id: '',
    product_id: '',
    worker_id: '',
    status: '',
  });
  const [machines, setMachines] = useState<Option[]>([]);
  const [moulds, setMoulds] = useState<Option[]>([]);
  const [products, setProducts] = useState<Option[]>([]);
  const [workers, setWorkers] = useState<WorkerOption[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch dropdown data
    const fetchDropdownData = async () => {
      const [machinesRes, mouldsRes, productsRes, workersRes] = await Promise.all([
        axios.get('/machines'),
        axios.get('/moulds'),
        axios.get('/products'),
        axios.get('/users'),
      ]);
      setMachines(machinesRes.data);
      setMoulds(mouldsRes.data);
      setProducts(productsRes.data);
      setWorkers((workersRes.data as WorkerOption[]).filter((u) => u.role === 'worker'));
    };
    fetchDropdownData();
  }, []);

  const handleFilterChange = (key: keyof Filter, value: string) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filter.machine_id) params.machine_id = filter.machine_id;
      if (filter.mould_id) params.mould_id = filter.mould_id;
      if (filter.product_id) params.product_id = filter.product_id;
      if (filter.worker_id) params.worker_id = filter.worker_id;
      if (filter.status) params.status = filter.status;
      const res = await axios.get('/dashboard/stats', { params });
      setDashboardData(res.data);
    } catch (err) {
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">{t('Dashboard')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Select
          id="filter-machine"
          label={t('machine')}
          value={filter.machine_id}
          onChange={(v) => handleFilterChange('machine_id', v)}
          options={[
            { value: '', label: t('selectMachine') },
            ...machines.map((m) => ({ value: m.id.toString(), label: m.name })),
          ]}
          fullWidth
        />
        <Select
          id="filter-mould"
          label={t('mould')}
          value={filter.mould_id}
          onChange={(v) => handleFilterChange('mould_id', v)}
          options={[
            { value: '', label: t('selectMould') },
            ...moulds.map((m) => ({ value: m.id.toString(), label: m.name })),
          ]}
          fullWidth
        />
        <Select
          id="filter-product"
          label={t('product')}
          value={filter.product_id}
          onChange={(v) => handleFilterChange('product_id', v)}
          options={[
            { value: '', label: t('selectProduct') },
            ...products.map((p) => ({ value: p.id.toString(), label: p.name })),
          ]}
          fullWidth
        />
        <Select
          id="filter-worker"
          label={t('worker')}
          value={filter.worker_id}
          onChange={(v) => handleFilterChange('worker_id', v)}
          options={[
            { value: '', label: t('selectWorker') },
            ...workers.map((w) => ({ value: w.id.toString(), label: w.name })),
          ]}
          fullWidth
        />
        <Select
          id="filter-status"
          label={t('status') || 'Status'}
          value={filter.status}
          onChange={(v) => handleFilterChange('status', v)}
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'pending', label: 'Pending' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
          fullWidth
        />
      </div>
      <div className="mb-4 flex justify-end">
        <Button variant="primary" onClick={handleSearch}>{t('Search') || 'Search'}</Button>
      </div>
      {loading && <div>Loading...</div>}
      {dashboardData && (
        <div>
          {/* Render dashboard stats and production logs here */}
          <pre>{JSON.stringify(dashboardData, null, 2)}</pre>
        </div>
      )}
    </Layout>
  );
};

export default DashboardPage;