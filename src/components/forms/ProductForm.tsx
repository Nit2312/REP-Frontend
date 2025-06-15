import React, { useState } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { Product } from '../../types';

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: Partial<Product>) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || '',
    status: product?.status || 'active',
    per_hour_production: product?.per_hour_production?.toString() || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? e.target.value : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      per_hour_production: formData.per_hour_production ? parseFloat(formData.per_hour_production) : null,
    };
    onSubmit(submitData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <Input
        id="name"
        name="name"
        label="Name"
        value={formData.name}
        onChange={handleChange}
        required
        fullWidth
      />
      <Input
        id="description"
        name="description"
        label="Description"
        value={formData.description}
        onChange={handleChange}
        fullWidth
      />
      <Input
        id="category"
        name="category"
        label="Category"
        value={formData.category}
        onChange={handleChange}
        required
        fullWidth
      />
      <Input
        id="per_hour_production"
        name="per_hour_production"
        label="Production per Hour"
        type="number"
        step="0.01"
        min="0"
        value={formData.per_hour_production}
        onChange={handleChange}
        required
        fullWidth
      />
      <Select
        id="status"
        label="Status"
        options={[
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' }
        ]}
        value={formData.status}
        onChange={val => setFormData({ ...formData, status: val })}
        fullWidth
      />
      <div className="flex justify-end space-x-2">
        <Button type="submit" variant="primary">
          {product ? 'Update' : 'Save'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm; 