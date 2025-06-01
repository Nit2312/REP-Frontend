import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

interface MaterialFormProps {
  onSubmit: (data: any) => void;
  material?: any;
}

const MaterialForm: React.FC<MaterialFormProps> = ({ onSubmit, material }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: material?.name || '',
    quantity: material?.quantity || '',
    unit: material?.unit || '',
    threshold: material?.threshold || '',
    description: material?.description || '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.name.trim() || formData.quantity === '' || isNaN(Number(formData.quantity)) || !formData.unit.trim()) {
      setError('Name, quantity (number), and unit are required.');
      return;
    }
    onSubmit({
      ...formData,
      quantity: Number(formData.quantity),
      threshold: formData.threshold === '' ? 0 : Number(formData.threshold),
      description: formData.description || '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="name"
        name="name"
        label={t('inventory.name')}
        value={formData.name}
        onChange={handleChange}
        required
        fullWidth
      />

      <Input
        id="quantity"
        name="quantity"
        type="number"
        label={t('inventory.quantity')}
        value={formData.quantity}
        onChange={handleChange}
        required
        fullWidth
      />

      <Select
        id="unit"
        name="unit"
        label={t('inventory.unit')}
        options={[
          { value: '', label: 'Select Unit' },
          { value: 'kg', label: 'Kilograms (KG)' },
          { value: 'g', label: 'Grams (G)' },
          { value: 'l', label: 'Liters (L)' },
          { value: 'ml', label: 'Milliliters (ML)' },
          { value: 'pcs', label: 'Pieces (PCS)' },
        ]}
        value={formData.unit}
        onChange={(value) => setFormData({ ...formData, unit: value })}
        required
        fullWidth
      />

      <Input
        id="threshold"
        name="threshold"
        type="number"
        label={t('inventory.threshold')}
        value={formData.threshold}
        onChange={handleChange}
        fullWidth
      />

      <Input
        id="description"
        name="description"
        label={t('inventory.description')}
        value={formData.description}
        onChange={handleChange}
        fullWidth
      />

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="flex justify-end space-x-2">
        <Button type="submit" variant="primary">
          {material ? t('common.update') : t('common.save')}
        </Button>
      </div>
    </form>
  );
};

export default MaterialForm;