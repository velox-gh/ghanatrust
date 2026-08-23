import React from 'react';
import { useAuth } from '../context/AuthContext';
import CustomerDashboard from './CustomerDashboard';
import ProviderDashboard from './ProviderDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user?.role === 'ADMIN') {
    return <AdminDashboard />;
  }

  if (user?.role === 'PROVIDER') {
    return <ProviderDashboard />;
  }

  return <CustomerDashboard />;
};

export default Dashboard;
