import React, { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

interface AddColorMixFormProps {
  formulas: any[];
  materials: any[];
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const AddColorMixForm: React.FC<AddColorMixFormProps> = ({ formulas, materials, initialData, onSubmit, onCancel }) => {
  // Patch: always normalize initialData.materialWeights to array of { materialId, quantity }
  const normalizeMaterialWeights = (mw: any) => {
    if (!mw) return [{ materialId: '', quantity: '' }];
    if (typeof mw === 'string') {
      try {
        mw = JSON.parse(mw);
      } catch {
        return [{ materialId: '', quantity: '' }];
      }
    }
    if (Array.isArray(mw)) {
      return mw.map(entry => ({
        materialId: String(entry.materialId),
        quantity: String(entry.quantity)
      }));
    } else if (typeof mw === 'object' && mw !== null) {
      // If object, treat as { materialId: quantity, ... }
      return Object.entries(mw).map(([materialId, quantity]) => ({
        materialId: String(materialId),
        quantity: String(quantity)
      }));
    }
    return [{ materialId: '', quantity: '' }];
  };

  const [formulaId, setFormulaId] = useState(initialData?.formulaId || initialData?.formula_id || '');
  const [activityId, setActivityId] = useState(initialData?.activityId || '');
  const [mixMaterials, setMixMaterials] = useState(
    normalizeMaterialWeights(initialData?.materialWeights || initialData?.material_weights)
  );
  const [colorRequirement, setColorRequirement] = useState(initialData?.colorRequirement || initialData?.color_requirement || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData?.materialWeights || initialData?.material_weights) {
      setMixMaterials(normalizeMaterialWeights(initialData.materialWeights || initialData.material_weights));
    }
    if (initialData?.formulaId || initialData?.formula_id) {
      setFormulaId(initialData.formulaId || initialData.formula_id);
    }
    if (initialData?.colorRequirement || initialData?.color_requirement) {
      setColorRequirement(initialData.colorRequirement || initialData.color_requirement);
    }
  }, [initialData]);

  const handleAddRow = () => setMixMaterials([...mixMaterials, { materialId: '', quantity: '' }]);
  const handleRemoveRow = (idx: number) => setMixMaterials(mixMaterials.filter((_: any, i: number) => i !== idx));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formulaId) return setError('Formula is required');
    if (mixMaterials.some((m: { materialId: string; quantity: string }) => !m.materialId || !m.quantity)) return setError('All materials and quantities are required');
    if (!colorRequirement) return setError('Color requirement is required');
    setError('');
    onSubmit({
      formulaId: Number(formulaId),
      materialWeights: mixMaterials, // send as native array, not JSON string
      colorRequirement: Number(colorRequirement)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        id="formula"
        label="Color Formula"
        options={[
          { value: '', label: 'Select Formula' },
          ...formulas.map((f: any) => ({ value: f.id, label: f.name }))
        ]}
        value={formulaId}
        onChange={setFormulaId}
        fullWidth
      />
      <div>
        <div className="font-semibold mb-2">Materials Used</div>
        {mixMaterials.map((row: { materialId: string; quantity: string }, idx: number) => (
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
                const arr = [...mixMaterials];
                arr[idx].materialId = val;
                setMixMaterials(arr);
              }}
              fullWidth
            />
            <Input
              id={`quantity-${idx}`}
              label="Quantity (kg)"
              type="number"
              value={row.quantity}
              onChange={e => {
                const arr = [...mixMaterials];
                arr[idx].quantity = e.target.value;
                setMixMaterials(arr);
              }}
              min={0}
              fullWidth
            />
            {mixMaterials.length > 1 && (
              <Button variant="danger" onClick={() => handleRemoveRow(idx)} type="button">-</Button>
            )}
            {idx === mixMaterials.length - 1 && (
              <Button variant="outline" onClick={handleAddRow} type="button">+</Button>
            )}
          </div>
        ))}
      </div>
      <Input
        id="color-requirement"
        label="Color Requirement (kg)"
        type="number"
        value={colorRequirement}
        onChange={e => setColorRequirement(e.target.value)}
        min={0}
        step="any"
        required
      />
      {/* Show suggested color amount if available */}
      {formulaId && formulas.length > 0 && (
        (() => {
          const selectedFormula = formulas.find(f => f.id === formulaId);
          if (selectedFormula && selectedFormula.color_weight_grams) {
            return (
              <div className="text-sm text-blue-700">
                Suggested Color Amount: <span className="font-semibold">{selectedFormula.color_weight_grams} g</span>
              </div>
            );
          }
          return null;
        })()
      )}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="flex space-x-2 justify-end">
        <Button variant="outline" onClick={onCancel} type="button">Cancel</Button>
        <Button variant="primary" type="submit">Save Mix</Button>
      </div>
    </form>
  );
};

export default AddColorMixForm;

// --- MaterialsPage admin/super_admin restriction ---
// In src/pages/MaterialsPage.tsx, add role check at the top:
// import { useAuth } from '../context/AuthContext';
// ...existing code...
// const { state } = useAuth();
// if (state.user?.role !== 'admin' && state.user?.role !== 'super_admin') {
//   return (
//     <Layout>
//       <div className="flex items-center justify-center h-full">
//         <p className="text-red-500">Unauthorized: Only admin and super admin can access this page.</p>
//       </div>
//     </Layout>
//   );
// }
// ...existing code...
