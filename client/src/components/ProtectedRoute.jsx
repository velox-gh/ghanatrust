import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './ui/Spinner';

/**
 * Gate for routes that require a session. Optionally narrows to specific roles.
 *
 * Waits for AuthContext to finish its bootstrap `getMe` call before deciding —
 * redirecting during `loading` would bounce every authenticated user on refresh.
 * The attempted location rides along in state so Login can return them to it.
 */
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" className="text-trust-600" />
        <span className="sr-only-x">Checking your session</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
