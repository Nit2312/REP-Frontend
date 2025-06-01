import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, RefreshCw } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import DataTable from '../components/ui/DataTable';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import axios from '../config/axios';
import { useAuth } from '../context/AuthContext';
// Remove unused import errors (these imports are correct, so force TypeScript to recognize them)
// @ts-ignore
import AddColorFormulaForm from '../components/forms/AddColorFormulaForm';
// @ts-ignore
import AddColorMixForm from '../components/forms/AddColorMixForm';
import ErrorBoundary from '../components/ui/ErrorBoundary';

const ColorMixPage: React.FC = () => {
  const [colorMixes, setColorMixes] = useState<any[]>([]);
  const [formulas, setFormulas] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [showAddMixModal, setShowAddMixModal] = useState(false);
  const [showAddFormulaModal, setShowAddFormulaModal] = useState(false);
  const [selectedMix, setSelectedMix] = useState<any>(null);
  const [selectedFormula, setSelectedFormula] = useState<any>(null);

  // For dynamic material input
  const [mixMaterials, setMixMaterials] = useState([{ materialId: '', quantity: '' }]);
  const [selectedFormulaId, setSelectedFormulaId] = useState('');
  const [suggestedColor, setSuggestedColor] = useState<number | null>(null);

  const { state } = useAuth();

  useEffect(() => {
    fetchColorMixes();
    fetchFormulas();
    fetchMaterials();
  }, []);

  const fetchColorMixes = async () => {
    const res = await axios.get('/color-mix-entries');
    setColorMixes(res.data);
  };
  const fetchFormulas = async () => {
    const res = await axios.get('/color-mix-formulas');
    setFormulas(res.data);
  };
  const fetchMaterials = async () => {
    const res = await axios.get('/materials');
    setMaterials(res.data);
  };

  // Suggest color amount based on selected formula and entered materials
  useEffect(() => {
    if (!selectedFormulaId || mixMaterials.some(m => !m.materialId || !m.quantity)) {
      setSuggestedColor(null);
      return;
    }
    const formula = formulas.find(f => f.id === Number(selectedFormulaId));
    if (!formula) return;
    // Assume formula.formula is a JSON string: { materialId: weight, ... }, colorWeight: grams
    try {
      const formulaObj = JSON.parse(formula.formula);
      let total = 0;
      Object.values(formulaObj).forEach((w: any) => {
        total += Number(w);
      });
      setSuggestedColor(Number(formula.colorWeight));
    } catch {
      setSuggestedColor(null);
    }
  }, [selectedFormulaId, mixMaterials, formulas]);

  // CRUD handlers for color mixes
  const handleAddMix = async (data: any) => {
    try {
      // Parse materialWeights if it's a string
      const materialWeightsArr = typeof data.materialWeights === 'string'
        ? JSON.parse(data.materialWeights)
        : data.materialWeights;
      // Send as native array (not JSON string)
      await axios.post('/color-mix-entries', {
        ...data,
        materialWeights: materialWeightsArr
      });
      // Update materials inventory
      for (const material of materialWeightsArr) {
        const existingMaterial = materials.find(m => String(m.id) === String(material.materialId));
        if (existingMaterial) {
          const newQuantity = existingMaterial.quantity - Number(material.quantity);
          if (newQuantity < 0) {
            throw new Error(`Not enough ${existingMaterial.name} in stock`);
          }
          await axios.put(`/materials/${material.materialId}`, {
            ...existingMaterial,
            quantity: newQuantity
          });
        }
      }
      setShowAddMixModal(false);
      // Refresh both color mixes and materials data
      await Promise.all([fetchColorMixes(), fetchMaterials()]);
    } catch (error) {
      console.error('Error adding color mix:', error);
      alert(error instanceof Error ? error.message : 'Error creating color mix. Please check if you have enough materials in stock.');
    }
  };
  const handleUpdateMix = async (id: number, data: any) => {
    try {
      // Get the old mix data to calculate quantity differences
      const oldMix = colorMixes.find(mix => mix.id === id);
      if (!oldMix) throw new Error('Mix not found');
      // Parse materialWeights if it's a string
      const materialWeightsArr = typeof data.materialWeights === 'string'
        ? JSON.parse(data.materialWeights)
        : data.materialWeights;
      // Send as native array (not JSON string)
      await axios.put(`/color-mix-entries/${id}`, {
        ...data,
        materialWeights: materialWeightsArr
      });
      // Parse old material weights
      const oldMaterialWeights = typeof oldMix.materialWeights === 'string' 
        ? JSON.parse(oldMix.materialWeights) 
        : oldMix.materialWeights;
      // Update each material's quantity
      for (const material of materialWeightsArr) {
        const existingMaterial = materials.find(m => String(m.id) === String(material.materialId));
        if (existingMaterial) {
          const oldQuantity = oldMaterialWeights[material.materialId] || 0;
          const quantityDiff = Number(material.quantity) - Number(oldQuantity);
          const newQuantity = existingMaterial.quantity - quantityDiff;
          if (newQuantity < 0) {
            throw new Error(`Not enough ${existingMaterial.name} in stock`);
          }
          await axios.put(`/materials/${material.materialId}`, {
            ...existingMaterial,
            quantity: newQuantity
          });
        }
      }
      setSelectedMix(null);
      // Refresh both color mixes and materials data
      await Promise.all([fetchColorMixes(), fetchMaterials()]);
    } catch (error) {
      console.error('Error updating color mix:', error);
      alert(error instanceof Error ? error.message : 'Error updating color mix. Please check if you have enough materials in stock.');
    }
  };
  const handleDeleteMix = async (id: number) => {
    if (window.confirm('Delete this color mix?')) {
      await axios.delete(`/color-mix-entries/${id}`);
      fetchColorMixes();
    }
  };

  // CRUD handlers for color formulas
  const handleAddFormula = async (data: any) => {
    try {
      await axios.post('/color-mix-formulas', {
        ...data,
        createdBy: state.user?.id // ensure createdBy is set
      });
      setShowAddFormulaModal(false);
      fetchFormulas();
    } catch (error) {
      console.error('Error adding color formula:', error);
    }
  };
  const handleUpdateFormula = async (id: number, data: any) => {
    try {
      await axios.put(`/color-mix-formulas/${id}`, data);
      setSelectedFormula(null);
      fetchFormulas();
    } catch (error) {
      console.error('Error updating color formula:', error);
    }
  };
  const handleDeleteFormula = async (id: number) => {
    if (!window.confirm('Delete this color formula?')) return;
    try {
      await axios.delete(`/color-mix-formulas/${id}`);
      fetchFormulas();
    } catch (error) {
      console.error('Error deleting color formula:', error);
    }
  };

  // Helper: map colorMixes to add readable materials string
  const getMaterialName = (id: string | number) => {
    const mat = materials.find((m: any) => String(m.id) === String(id));
    return mat ? mat.name : id;
  };
  const colorMixesWithMaterials = colorMixes.map(mix => {
    let materialsStr = '';
    try {
      let weights = mix.materialWeights;
      if (typeof weights === 'string') weights = JSON.parse(weights);
      if (Array.isArray(weights)) {
        // Handle array format: [{ materialId, quantity }]
        materialsStr = weights.map((mw: any) => `${getMaterialName(mw.materialId)}: ${mw.quantity}kg`).join(', ');
      } else if (weights && typeof weights === 'object' && Object.keys(weights).length > 0) {
        // Handle object format: { materialId: quantity, ... }
        materialsStr = Object.entries(weights)
          .map(([mid, qty]) => `${getMaterialName(mid)}: ${qty}kg`).join(', ');
      } else {
        materialsStr = 'No materials';
      }
    } catch (e) {
      console.warn('Invalid materialWeights for mix', mix.id, mix.materialWeights, e);
      materialsStr = 'No materials';
    }
    return { ...mix, materials: materialsStr };
  });

  // Render
  return (
    <Layout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Color Mix Management</h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button variant="primary" onClick={() => setShowAddMixModal(true)}>Add Color Mix</Button>
          <Button variant="primary" onClick={() => setShowAddFormulaModal(true)}>Add Color Formula</Button>
        </div>
      </div>
      <Card>
        <DataTable
          columns={[
            { header: 'Formula', accessor: 'formulaName' },
            { header: 'Materials', accessor: 'materials' },
            { header: 'Color Required (g)', accessor: 'colorRequirement' },
            {
              header: 'Actions',
              accessor: 'id',
              cell: (value: any, row: any) => (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedMix(row)}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDeleteMix(value)}>Delete</Button>
                </div>
              ),
            },
          ]}
          data={colorMixesWithMaterials}
          loading={false}
          emptyMessage="No color mixes found."
        />
      </Card>
      <Card className="mt-6">
        <h2 className="text-xl font-bold mb-2">Color Formulas</h2>
        <DataTable
          columns={[
            { header: 'Name', accessor: 'name' },
            { header: 'Materials', accessor: 'materials' },
            { header: 'Color Weight (g)', accessor: 'colorWeight' },
            {
              header: 'Actions',
              accessor: 'id',
              cell: (value: any, row: any) => (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedFormula(row)}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={async () => { await handleDeleteFormula(value); }}>Delete</Button>
                </div>
              ),
            },
          ]}
          data={formulas.map(f => {
            let materialsStr = '';
            try {
              const formulaObj = typeof f.formula === 'string' ? JSON.parse(f.formula) : f.formula;
              if (formulaObj && typeof formulaObj === 'object') {
                materialsStr = Object.entries(formulaObj).map(([mid, qty]) => {
                  const mat = materials.find((m: any) => String(m.id) === String(mid));
                  return `${mat ? mat.name : mid}: ${qty}kg`;
                }).join(', ');
              }
            } catch {}
            return { ...f, materials: materialsStr };
          })}
          loading={false}
          emptyMessage="No formulas found."
        />
      </Card>
      <Card className="mt-6">
        <h2 className="text-xl font-bold mb-2">Suggest Color Amount</h2>
        <div className="mb-2">
          <Select
            id="formula"
            label="Color Formula"
            options={[
              { value: '', label: 'Select Formula' },
              ...formulas.map((f: any) => ({ value: f.id, label: f.name }))
            ]}
            value={selectedFormulaId}
            onChange={setSelectedFormulaId}
            fullWidth
          />
        </div>
        {mixMaterials.map((mat, idx) => (
          <div key={idx} className="flex space-x-2 mb-2">
            <Select
              id={`material-${idx}`}
              label={`Material ${idx + 1}`}
              options={[
                { value: '', label: 'Select Material' },
                ...materials.map((m: any) => ({ value: m.id, label: m.name }))
              ]}
              value={mat.materialId}
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
              value={mat.quantity}
              onChange={e => {
                const arr = [...mixMaterials];
                arr[idx].quantity = e.target.value;
                setMixMaterials(arr);
              }}
              fullWidth
            />
            {idx === mixMaterials.length - 1 && (
              <Button variant="outline" onClick={() => setMixMaterials([...mixMaterials, { materialId: '', quantity: '' }])}>+</Button>
            )}
            {mixMaterials.length > 1 && (
              <Button variant="danger" onClick={() => setMixMaterials(mixMaterials.filter((_, i) => i !== idx))}>-</Button>
            )}
          </div>
        ))}
        <Button
          variant="primary"
          className="mt-2"
          onClick={() => {
            if (!selectedFormulaId || mixMaterials.some(m => !m.materialId || !m.quantity)) {
              setSuggestedColor(null);
              return;
            }
            const formula = formulas.find(f => f.id === Number(selectedFormulaId));
            if (!formula) return;
            try {
              const formulaObj = JSON.parse(formula.formula);
              // Calculate ratio based on total formula weights and entered weights
              let formulaTotal = 0;
              Object.values(formulaObj).forEach((w: any) => { formulaTotal += Number(w); });
              let enteredTotal = 0;
              mixMaterials.forEach((m: any) => { enteredTotal += Number(m.quantity); });
              // Calculate color needed proportionally
              const colorWeight = Number(formula.colorWeight);
              const suggested = formulaTotal > 0 ? (enteredTotal / formulaTotal) * colorWeight : 0;
              setSuggestedColor(suggested);
            } catch {
              setSuggestedColor(null);
            }
          }}
        >
          Calculate Color Needed
        </Button>
        {suggestedColor !== null && (
          <div className="mt-2 text-green-700 font-bold">Suggested Color: {suggestedColor.toFixed(2)} kg</div>
        )}
      </Card>
      {/* Add Color Formula Modal */}
      <Modal isOpen={showAddFormulaModal} onClose={() => setShowAddFormulaModal(false)} title="Add Color Formula">
        <AddColorFormulaForm
          materials={materials}
          onSubmit={async (data: any) => {
            await handleAddFormula(data);
          }}
          onCancel={() => setShowAddFormulaModal(false)}
        />
      </Modal>
      {/* Edit Color Formula Modal */}
      <Modal isOpen={!!selectedFormula} onClose={() => setSelectedFormula(null)} title="Edit Color Formula">
        {selectedFormula && (
          <AddColorFormulaForm
            materials={materials}
            onSubmit={async (data: any) => {
              await handleUpdateFormula(selectedFormula.id, data);
            }}
            onCancel={() => setSelectedFormula(null)}
            initialData={selectedFormula}
          />
        )}
      </Modal>
      {/* Add/Edit Color Mix Modal */}
      <Modal isOpen={showAddMixModal || !!selectedMix} onClose={() => { setShowAddMixModal(false); setSelectedMix(null); }} title={selectedMix ? "Edit Color Mix" : "Add Color Mix"}>
        <ErrorBoundary>
          <AddColorMixForm
            formulas={formulas}
            materials={materials}
            initialData={selectedMix}
            onSubmit={async (data: any) => {
              if (selectedMix) {
                await handleUpdateMix(selectedMix.id, data);
                setSelectedMix(null);
              } else {
                await handleAddMix(data);
                setShowAddMixModal(false);
              }
            }}
            onCancel={() => { setShowAddMixModal(false); setSelectedMix(null); }}
          />
        </ErrorBoundary>
      </Modal>
    </Layout>
  );
};

export default ColorMixPage;
