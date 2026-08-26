import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import ServiceDetails from './pages/ServiceDetails';
import ProviderProfile from './pages/ProviderProfile';
import SearchResults from './pages/SearchResults';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import BookingDetailPage from './pages/BookingDetailPage';
import Payments from './pages/Payments';
import NotFound from './pages/NotFound';

// Dashboards
import Dashboard from './dashboards/Dashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:id" element={<ServiceDetails />} />
              <Route path="/providers/:id" element={<ProviderProfile />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/booking/:serviceId" element={<Booking />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/my-bookings/:id" element={<BookingDetailPage />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
