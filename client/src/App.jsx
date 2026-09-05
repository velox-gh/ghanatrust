
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { TourProvider } from './context/TourContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import TourComponent from './components/TourComponent';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import GoogleSuccess from './pages/GoogleSuccess';
import PaymentCallback from './pages/PaymentCallback';
import BillingCallback from './pages/BillingCallback';
import Services from './pages/Services';
import ServiceDetails from './pages/ServiceDetails';
import ProviderProfile from './pages/ProviderProfile';
import SearchResults from './pages/SearchResults';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import BookingDetailPage from './pages/BookingDetailPage';
import Payments from './pages/Payments';
import NotFound from './pages/NotFound';
import DisputesList from './pages/DisputesList';
import DisputeDetail from './pages/DisputeDetail';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SavedProviders from './pages/SavedProviders';
import Notifications from './pages/Notifications';
import About from './pages/About';
import Help from './pages/Help';

// Dashboards
import Dashboard from './dashboards/Dashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <TourProvider>
            <div className="min-h-screen flex flex-col bg-navy-50 text-navy-900">
              <a href="#main-content" className="skip-link">Skip to main content</a>
              <TourComponent />
            <Navbar />
            <main id="main-content" className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/auth/success" element={<GoogleSuccess />} />
                <Route path="/payments/callback" element={<PaymentCallback />} />
                <Route path="/billing/callback" element={<BillingCallback />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/:id" element={<ServiceDetails />} />
                <Route path="/providers/:id" element={<ProviderProfile />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/booking/:serviceId" element={<Booking />} />
                <Route path="/my-bookings" element={<MyBookings />} />
                <Route path="/my-bookings/:id" element={<BookingDetailPage />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/disputes" element={<DisputesList />} />
                <Route path="/disputes/:id" element={<DisputeDetail />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/saved" element={<SavedProviders />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/about" element={<About />} />
                <Route path="/help" element={<Help />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
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
