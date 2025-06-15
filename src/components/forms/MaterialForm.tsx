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

    // Validate required fields
    if (!formData.name.trim()) {
      setError(t('inventory.errors.nameRequired'));
      return;
    }
    if (formData.quantity === '' || isNaN(Number(formData.quantity))) {
      setError(t('inventory.errors.quantityRequired'));
      return;
    }
    if (!formData.unit.trim()) {
      setError(t('inventory.errors.unitRequired'));
      return;
    }

    // Validate numeric fields
    const quantity = Number(formData.quantity);
    const threshold = formData.threshold === '' ? 0 : Number(formData.threshold);

    if (quantity < 0) {
      setError(t('inventory.errors.quantityPositive'));
      return;
    }
    if (threshold < 0) {
      setError(t('inventory.errors.thresholdPositive'));
      return;
    }

    onSubmit({
      ...formData,
      quantity,
      threshold,
      description: formData.description.trim(),
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
        min="0"
        step="any"
        fullWidth
      />

      <Select
        id="unit"
        name="unit"
        label={t('inventory.unit')}
        options={[
          { value: '', label: t('inventory.selectUnit') },
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
        min="0"
        step="any"
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