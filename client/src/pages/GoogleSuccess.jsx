import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Receives the app JWT from the Google OAuth callback via the URL fragment
const GoogleSuccess = () => {
  const navigate = useNavigate();
  const { hash } = useLocation();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const run = async () => {
      const token = new URLSearchParams(hash.replace(/^#/, '')).get('token');
      if (token) {
        localStorage.setItem('token', token);
        await refreshUser();
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/login?error=google', { replace: true });
      }
    };
    run();
  }, [hash, navigate, refreshUser]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50">
      <p className="text-sm font-semibold text-slate-500">Completing sign-in…</p>
    </div>
  );
};

export default GoogleSuccess;
