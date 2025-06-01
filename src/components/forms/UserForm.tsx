import React from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

interface UserFormProps {
  onSubmit: (data: any) => void;
  user?: any;
}

const UserForm: React.FC<UserFormProps> = ({ onSubmit, user }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = React.useState({
    userId: user?.userId || '',
    name: user?.name || '',
    role: user?.role || 'worker',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="userId"
        label={t('users.userId')}
        value={formData.userId}
        onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
        fullWidth
        required
        disabled={!!user}
      />

      <Input
        id="name"
        label={t('users.name')}
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        fullWidth
        required
      />

      <Select
        id="role"
        label={t('users.role')}
        options={[
          { value: 'super_admin', label: t('roles.super_admin') },
          { value: 'admin', label: t('roles.admin') },
          { value: 'worker', label: t('roles.worker') },
        ]}
        value={formData.role}
        onChange={(value) => setFormData({ ...formData, role: value })}
        fullWidth
        required
      />

      <div className="flex justify-end space-x-2">
        <Button type="submit" variant="primary">
          {user ? t('common.update') : t('common.save')}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;