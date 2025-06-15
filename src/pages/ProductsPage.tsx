import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, RefreshCw } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import ProductForm from '../components/forms/ProductForm';
import axios from '../config/axios';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';

const ProductsPage = () => {
  const { t } = useTranslation();
  const { state } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
    // Also refresh when modals close (after add/edit)
  }, [showAddModal, selectedProduct]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/products');
      setProducts(response.data);
      setError(null);
    } catch (error: any) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (data: Partial<Product>) => {
    try {
      setError(null);
      // Ensure required fields are present
      if (!data.name || !data.category) {
        setError('Name and category are required');
        return;
      }
      await axios.post('/products', {
        name: data.name,
        description: data.description || null,
        category: data.category,
        status: data.status || 'active',
        per_hour_production: data.per_hour_production || null,
      });
      setShowAddModal(false);
      fetchProducts();
    } catch (error: any) {
      if (error.response) {
        setError(error.response.data?.message || 'Failed to add product');
      } else {
        setError('Failed to add product');
      }
      console.error('Error adding product:', error);
    }
  };

  const handleUpdateProduct = async (id: number, data: Partial<Product>) => {
    try {
      setError(null);
      if (!data.name || !data.category) {
        setError('Name and category are required');
        return;
      }
      await axios.put(`/products/${id}`, {
        name: data.name,
        description: data.description || null,
        category: data.category,
        status: data.status || 'active',
        per_hour_production: data.per_hour_production || null,
      });
      setSelectedProduct(null);
      fetchProducts();
    } catch (error: any) {
      if (error.response) {
        setError(error.response.data?.message || 'Failed to update product');
      } else {
        setError('Failed to update product');
      }
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`/products/${id}`);
      fetchProducts();
    } catch (error: any) {
      if (error.response) {
        setError(error.response.data?.message || 'Failed to delete product');
      } else {
        setError('Failed to delete product');
      }
      console.error('Error deleting product:', error);
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Products</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={fetchProducts}
            className="flex items-center"
          >
            <RefreshCw size={16} className="mr-2" />
            {t('common.refresh')}
          </Button>
          <Button 
            variant="primary" 
            onClick={() => setShowAddModal(true)}
            className="flex items-center"
          >
            <Plus size={16} className="mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <Card>
        <DataTable
          columns={[
            { header: 'Name', accessor: 'name' },
            { header: 'Description', accessor: 'description' },
            { header: 'Category', accessor: 'category' },
            { header: 'Production/Hour', accessor: 'per_hour_production' },
            { header: 'Status', accessor: 'status' },
            {
              header: 'Actions',
              accessor: 'id',
              cell: (value: any, row: any) => (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedProduct(row)}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDeleteProduct(value)}>Delete</Button>
                </div>
              ),
            },
          ]}
          data={products}
          loading={loading}
          emptyMessage="No products found."
        />
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Product">
        <ProductForm onSubmit={handleAddProduct} />
      </Modal>

      <Modal isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} title="Edit Product">
        {selectedProduct && (
          <ProductForm
            product={selectedProduct}
            onSubmit={async (data) => {
              await handleUpdateProduct(selectedProduct.id, data);
            }}
          />
        )}
      </Modal>
    </Layout>
  );
};

export default ProductsPage;