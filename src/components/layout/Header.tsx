import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, ChevronDown, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Button from '../ui/Button';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const { state, logout } = useAuth();
  const { currentLanguage, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleLangMenu = () => setIsLangMenuOpen(!isLangMenuOpen);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'gu', name: 'ગુજરાતી' },
    { code: 'hi', name: 'हिंदी' }
  ];

  return (
    <header className="bg-blue-800 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Raamestha Electro Plasta</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {state.isAuthenticated && (
              <>
                <nav className="flex space-x-4">

                  <Link
                    to="/tasks"
                    className={`px-3 py-2 rounded-md transition ${isActive('/tasks') ? 'bg-blue-700' : 'hover:bg-blue-700'
                      }`}
                  >
                    Tasks
                  </Link>

                  <Link
                    to="/inventory"
                    className={`px-3 py-2 rounded-md transition ${isActive('/inventory') ? 'bg-blue-700' : 'hover:bg-blue-700'
                      }`}
                  >
                    {t('app.inventory')}
                  </Link>
                  {/* Only show color-mix, materials, machines, moulds, users for admin/super_admin */}
                  {(state.user?.role === 'admin' || state.user?.role === 'super_admin') && (
                    <>
                      <Link
                        to="/dashboard"
                        className={`px-3 py-2 rounded-md transition ${isActive('/dashboard') ? 'bg-blue-700' : 'hover:bg-blue-700'
                          }`}
                      >
                        {t('app.dashboard')}
                      </Link>

                      <Link
                        to="/products"
                        className={`px-3 py-2 rounded-md transition ${isActive('/products') ? 'bg-blue-700' : 'hover:bg-blue-700'
                          }`}
                      >
                        Products
                      </Link>
                      <Link
                        to="/color-mix"
                        className={`px-3 py-2 rounded-md transition ${isActive('/color-mix') ? 'bg-blue-700' : 'hover:bg-blue-700'
                          }`}
                      >
                        Color Mix
                      </Link>
                      <Link
                        to="/materials"
                        className={`px-3 py-2 rounded-md transition ${isActive('/materials') ? 'bg-blue-700' : 'hover:bg-blue-700'
                          }`}
                      >
                        {t('Materials')}
                      </Link>
                      <Link
                        to="/machines"
                        className={`px-3 py-2 rounded-md transition ${isActive('/machines') ? 'bg-blue-700' : 'hover:bg-blue-700'
                          }`}
                      >
                        Machines
                      </Link>
                      <Link
                        to="/moulds"
                        className={`px-3 py-2 rounded-md transition ${isActive('/moulds') ? 'bg-blue-700' : 'hover:bg-blue-700'
                          }`}
                      >
                        Moulds
                      </Link>
                      <Link
                        to="/users"
                        className={`px-3 py-2 rounded-md transition ${isActive('/users') ? 'bg-blue-700' : 'hover:bg-blue-700'
                          }`}
                      >
                        {t('app.users')}
                      </Link>
                    </>
                  )}
                </nav>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <button
                      className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-blue-700 transition"
                      onClick={toggleLangMenu}
                    >
                      <Globe size={16} />
                      <span>{languages.find(l => l.code === currentLanguage)?.name || 'English'}</span>
                      <ChevronDown size={16} />
                    </button>
                    {isLangMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              changeLanguage(lang.code);
                              setIsLangMenuOpen(false);
                            }}
                          >
                            {lang.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="text-white border-white hover:bg-blue-700"
                  >
                    {t('app.logout')}
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              className="text-white focus:outline-none"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && state.isAuthenticated && (
          <div className="md:hidden pb-4">
            <nav className="flex flex-col space-y-2">
              {/* Only show dashboard, color-mix, materials, machines, moulds, users for admin/super_admin */}
              {(state.user?.role === 'admin' || state.user?.role === 'super_admin') && (
                <>
                  <Link
                    to="/dashboard"
                    className={`px-3 py-2 rounded-md transition ${isActive('/dashboard') ? 'bg-blue-700' : 'hover:bg-blue-700'
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('app.dashboard')}
                  </Link>
                  <Link
                    to="/tasks"
                    className={`px-3 py-2 rounded-md transition ${isActive('/tasks') ? 'bg-blue-700' : 'hover:bg-blue-700'
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Tasks
                  </Link>
                  <Link
                    to="/products"
                    className={`px-3 py-2 rounded-md transition ${isActive('/products') ? 'bg-blue-700' : 'hover:bg-blue-700'
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Products
                  </Link>
                  <Link
                    to="/color-mix"
                    className={`px-3 py-2 rounded-md transition ${isActive('/color-mix') ? 'bg-blue-700' : 'hover:bg-blue-700'
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Color Mix
                  </Link>
                  <Link
                    to="/materials"
                    className={`px-3 py-2 rounded-md transition ${isActive('/materials') ? 'bg-blue-700' : 'hover:bg-blue-700'
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('app.materials')}
                  </Link>
                  <Link
                    to="/machines"
                    className={`px-3 py-2 rounded-md transition ${isActive('/machines') ? 'bg-blue-700' : 'hover:bg-blue-700'
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Machines
                  </Link>
                  <Link
                    to="/moulds"
                    className={`px-3 py-2 rounded-md transition ${isActive('/moulds') ? 'bg-blue-700' : 'hover:bg-blue-700'
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Moulds
                  </Link>
                  <Link
                    to="/users"
                    className={`px-3 py-2 rounded-md transition ${isActive('/users') ? 'bg-blue-700' : 'hover:bg-blue-700'
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('app.users')}
                  </Link>
                </>
              )}
              {/* Only show tasks, products, inventory for worker */}
              {state.user?.role === 'worker' && (
                <>
                  <Link
                    to="/tasks"
                    className={`px-3 py-2 rounded-md transition ${isActive('/tasks') ? 'bg-blue-700' : 'hover:bg-blue-700'
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Tasks
                  </Link>
                  <Link
                    to="/inventory"
                    className={`px-3 py-2 rounded-md transition ${isActive('/inventory') ? 'bg-blue-700' : 'hover:bg-blue-700'
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('app.inventory')}
                  </Link>
                </>
              )}
            </nav>
            <div className="mt-4 space-y-2">
              <div className="relative">
                <button
                  className="flex items-center space-x-1 w-full px-3 py-2 rounded-md hover:bg-blue-700 transition"
                  onClick={toggleLangMenu}
                >
                  <Globe size={16} />
                  <span>{languages.find(l => l.code === currentLanguage)?.name || 'English'}</span>
                  <ChevronDown size={16} className="ml-auto" />
                </button>
                {isLangMenuOpen && (
                  <div className="mt-2 w-full bg-blue-700 rounded-md shadow-lg py-1 z-10">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-blue-600"
                        onClick={() => {
                          changeLanguage(lang.code);
                          setIsLangMenuOpen(false);
                        }}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                fullWidth
                onClick={handleLogout}
                className="text-white border-white hover:bg-blue-700"
              >
                {t('app.logout')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;