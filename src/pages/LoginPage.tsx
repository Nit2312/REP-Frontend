import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Factory } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { state, login } = useAuth();
  const { currentLanguage, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[Login] Form submission started', { userId, name });
    setFormError('');
    
    if (!userId.trim() || !name.trim()) {
      console.log('[Login] Form validation failed - empty fields');
      setFormError('User ID and Name are required');
      return;
    }
    
    try {
      console.log('[Login] Attempting login...');
      await login(userId, name);
      
      // Wait for state to be updated
      const checkState = setInterval(() => {
        if (state.user) {
          clearInterval(checkState);
          console.log('[Login] Login successful, current state:', state);
          
          if (state.user.role === 'worker') {
            console.log('[Login] Redirecting to tasks page for worker');
            navigate('/tasks');
          } else {
            console.log('[Login] Redirecting to dashboard for admin/super_admin');
            navigate('/dashboard');
          }
        } else if (state.error) {
          clearInterval(checkState);
          console.error('[Login] Login failed:', state.error);
          setFormError(state.error);
        }
      }, 100);

      // Clear interval after 5 seconds to prevent infinite checking
      setTimeout(() => {
        clearInterval(checkState);
        if (!state.user && !state.error) {
          console.error('[Login] Login timeout - no response received');
          setFormError('Login request timed out. Please try again.');
        }
      }, 5000);
    } catch (error) {
      console.error('[Login] Login error:', error);
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError(t('auth.loginError'));
      }
    }
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'gu', name: 'ગુજરાતી' },
    { code: 'hi', name: 'हिंदी' }
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-5">
            <Factory className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-2">
            {t('app.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('auth.login')}
          </p>
        </div>
        
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
            <form className="mb-0 space-y-6" onSubmit={handleSubmit}>
              <Input
                id="userId"
                label={t('auth.userId')}
                type="text"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                }}
                fullWidth
                autoFocus
                required
              />
              <Input
                id="name"
                label={t('auth.name')}
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                fullWidth
                required
              />
              {(state.error || formError) && (
                <div className="text-red-500 text-sm">
                  {state.error || formError}
                </div>
              )}
              <div>
                <Button 
                  type="submit" 
                  fullWidth 
                  isLoading={state.loading}
                >
                  {t('auth.login')}
                </Button>
              </div>
            </form>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    {t('common.language')}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-3 gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    className={`py-2 px-3 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      currentLanguage === lang.code
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => changeLanguage(lang.code)}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-10 text-center">
        <p className="text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Factory Production Management System
        </p>
      </div>
    </div>
  );
};

export default LoginPage;