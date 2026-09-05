import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { TourProvider } from './context/TourContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import TourComponent from './components/TourComponent';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Spinner from './components/ui/Spinner';

// Home and the auth pages are the entry points for almost every visit, so they
// stay in the main bundle. Everything behind a login — the dashboards above all,
// which are the two largest files in the app — is split out and fetched on demand.
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

const GoogleSuccess = lazy(() => import('./pages/GoogleSuccess'));
const PaymentCallback = lazy(() => import('./pages/PaymentCallback'));
const BillingCallback = lazy(() => import('./pages/BillingCallback'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const ServiceDetails = lazy(() => import('./pages/ServiceDetails'));
const ProviderProfile = lazy(() => import('./pages/ProviderProfile'));
const Booking = lazy(() => import('./pages/Booking'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const BookingDetailPage = lazy(() => import('./pages/BookingDetailPage'));
const Payments = lazy(() => import('./pages/Payments'));
const DisputesList = lazy(() => import('./pages/DisputesList'));
const DisputeDetail = lazy(() => import('./pages/DisputeDetail'));
const Dashboard = lazy(() => import('./dashboards/Dashboard'));

/**
 * The homepage absorbed the old /services and /search browse pages. Both had
 * shared links and footer links pointing at them, so they redirect with their
 * query string intact rather than 404ing.
 */
const RedirectToFeed = () => {
  const { search } = useLocation();
  return <Navigate to={{ pathname: '/', search }} replace />;
};

const RouteFallback = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <Spinner size="lg" className="text-trust-600" />
    <span className="sr-only-x">Loading page</span>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <TourProvider>
            <div className="flex min-h-screen flex-col bg-navy-50 text-navy-900">
              <a href="#main-content" className="skip-link">Skip to main content</a>
              <TourComponent />
              <Navbar />
              <main id="main-content" className="flex-grow">
                <ErrorBoundary>
                  <Suspense fallback={<RouteFallback />}>
                    <Routes>
                      {/* Public */}
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/auth/success" element={<GoogleSuccess />} />
                      <Route path="/how-it-works" element={<HowItWorks />} />
                      <Route path="/services" element={<RedirectToFeed />} />
                      <Route path="/search" element={<RedirectToFeed />} />
                      <Route path="/services/:id" element={<ServiceDetails />} />
                      <Route path="/providers/:id" element={<ProviderProfile />} />
                      {/* Public: guests book here and are signed in on submit. */}
                      <Route path="/booking/:serviceId" element={<Booking />} />

                      {/* Requires a session */}
                      <Route path="/payments/callback" element={<ProtectedRoute><PaymentCallback /></ProtectedRoute>} />
                      <Route path="/billing/callback" element={<ProtectedRoute><BillingCallback /></ProtectedRoute>} />
                      <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
                      <Route path="/my-bookings/:id" element={<ProtectedRoute><BookingDetailPage /></ProtectedRoute>} />
                      <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
                      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                      <Route path="/disputes" element={<ProtectedRoute><DisputesList /></ProtectedRoute>} />
                      <Route path="/disputes/:id" element={<ProtectedRoute><DisputeDetail /></ProtectedRoute>} />

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
              </main>
              <Footer />
            </div>
          </TourProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
