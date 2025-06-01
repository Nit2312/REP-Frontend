// MachineForm.tsx - Form for adding/editing a machine
import React, { useState } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

interface MachineFormProps {
  machine?: any;
  onSubmit: (data: any) => void;
}

const MachineForm: React.FC<MachineFormProps> = ({ machine, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: machine?.name || '',
    description: machine?.description || '',
    status: machine?.status || 'active',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit(formData);
      }}
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
      <Select
        id="status"
        label="Status"
        options={[
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
          { value: 'maintenance', label: 'Maintenance' },
        ]}
        value={formData.status}
        onChange={val => setFormData({ ...formData, status: val })}
        fullWidth
      />
      <div className="flex justify-end space-x-2">
        <Button type="submit" variant="primary">
          {machine ? 'Update' : 'Save'}
        </Button>
      </div>
    </form>
  );
};

export default MachineForm;
