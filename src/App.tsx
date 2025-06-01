import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import UsersPage from './pages/UsersPage';
import ColorMixPage from './pages/ColorMixPage';
import MaterialsPage from './pages/MaterialsPage';
import MachinesPage from './pages/MachinesPage';
import MouldsPage from './pages/MouldsPage';
import TasksPage from './pages/TasksPage';
import ProductsPage from './pages/ProductsPage';
import ProductionLogsPage from './pages/ProductionLogsPage';
import HourlyProductionLogPage from './pages/HourlyProductionLogPage';

const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { state } = useAuth();

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!state.isAuthenticated) return <Navigate to="/" replace />;

  // Role-based redirect after login
  if (window.location.pathname === "/") {
    return <Navigate to="/dashboard" replace />;
  }

  return element;
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/dashboard" element={<ProtectedRoute element={<DashboardPage />} />} />
            <Route path="/inventory" element={<ProtectedRoute element={<InventoryPage />} />} />
            <Route path="/users" element={<ProtectedRoute element={<UsersPage />} />} />
            <Route path="/color-mix" element={<ProtectedRoute element={<ColorMixPage />} />} />
            <Route path="/materials" element={<ProtectedRoute element={<MaterialsPage />} />} />
            <Route path="/machines" element={<ProtectedRoute element={<MachinesPage />} />} />
            <Route path="/moulds" element={<ProtectedRoute element={<MouldsPage />} />} />
            <Route path="/tasks" element={<ProtectedRoute element={<TasksPage />} />} />
            <Route path="/products" element={<ProtectedRoute element={<ProductsPage />} />} />
            <Route path="/production-logs/:taskId" element={<ProtectedRoute element={<ProductionLogsPage />} />} />
            <Route path="/hourly-production-log/:taskId" element={<ProtectedRoute element={<HourlyProductionLogPage />} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;