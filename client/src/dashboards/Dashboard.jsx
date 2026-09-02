
import { useAuth } from '../context/AuthContext';
import CustomerDashboard from './CustomerDashboard';
import ProviderDashboard from './ProviderDashboard';
import AdminDashboard from './AdminDashboard';
import { Spinner } from '../components/ui';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" className="text-trust-600" />
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
