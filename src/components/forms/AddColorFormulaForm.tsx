import React, { useState } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

interface AddColorFormulaFormProps {
  materials: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

const AddColorFormulaForm: React.FC<AddColorFormulaFormProps> = ({ materials, onSubmit, onCancel, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [materialRows, setMaterialRows] = useState(
    initialData?.formula
      ? Object.entries(JSON.parse(initialData.formula)).map(([materialId, weight]) => ({ materialId, weight }))
      : [{ materialId: '', weight: '' }]
  );
  const [colorWeight, setColorWeight] = useState(initialData?.colorWeight || '');
  const [error, setError] = useState('');

  const handleAddRow = () => setMaterialRows([...materialRows, { materialId: '', weight: '' }]);
  const handleRemoveRow = (idx: number) => setMaterialRows(materialRows.filter((_row: any, i: number) => i !== idx));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return setError('Formula name is required');
    if (materialRows.some((m: any) => !m.materialId || !m.weight)) return setError('All materials and weights are required');
    if (!colorWeight) return setError('Color weight is required');
    setError('');
    onSubmit({
      name,
      materialCount: materialRows.length,
      formula: JSON.stringify(Object.fromEntries(materialRows.map((m: any) => [m.materialId, m.weight]))),
      colorWeight,
      createdBy: 1 // TODO: Replace with actual user id from context
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input id="formula-name" label="Formula Name" value={name} onChange={e => setName(e.target.value)} required />
      <div>
        <div className="font-semibold mb-2">Materials</div>
        {materialRows.map((row: any, idx: number) => (
          <div key={idx} className="flex space-x-2 mb-2">
            <Select
              id={`material-${idx}`}
              label="Material"
              options={[
                { value: '', label: 'Select Material' },
                ...materials.map((m: any) => ({ value: m.id, label: m.name }))
              ]}
              value={row.materialId}
              onChange={val => {
                const arr = [...materialRows];
                arr[idx].materialId = val;
                setMaterialRows(arr);
              }}
              fullWidth
            />
            <Input
              id={`weight-${idx}`}
              label="Weight (kg)"
              type="number"
              value={row.weight}
              onChange={e => {
                const arr = [...materialRows];
                arr[idx].weight = e.target.value;
                setMaterialRows(arr);
              }}
              min={0}
              fullWidth
            />
            {materialRows.length > 1 && (
              <Button variant="danger" onClick={() => handleRemoveRow(idx)} type="button">-</Button>
            )}
            {idx === materialRows.length - 1 && (
              <Button variant="outline" onClick={handleAddRow} type="button">+</Button>
            )}
          </div>
        ))}
      </div>
      <Input
        id="color-weight"
        label="Color Weight (g)"
        type="number"
        step="any"
        value={colorWeight}
        onChange={e => setColorWeight(e.target.value)}
        min={0}
        required
      />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="flex space-x-2 justify-end">
        <Button variant="outline" onClick={onCancel} type="button">Cancel</Button>
        <Button variant="primary" type="submit">Save Formula</Button>
      </div>
    </form>
  );
};

export default AddColorFormulaForm;
