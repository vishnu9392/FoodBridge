import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ScrollToTop } from './components/ScrollToTop';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { HomePage } from './pages/HomePage';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { DonateFoodPage } from './pages/DonateFoodPage';
import { AvailableFoodPage } from './pages/AvailableFoodPage';
import { ExpiryDetectionPage } from './pages/ExpiryDetectionPage';
import { PickupManagementPage } from './pages/PickupManagementPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

// Styles
import './styles/global.css';
import './styles/components.css';
import './styles/pages.css';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="app-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/available-food" element={<AvailableFoodPage />} />
              <Route path="/expiry-detection" element={<ExpiryDetectionPage />} />

              {/* Authenticated Dashboard (Supports both Donor and Recipient) */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Donor-Specific Route */}
              <Route
                path="/donate"
                element={
                  <ProtectedRoute allowedRoles={['donor']}>
                    <DonateFoodPage />
                  </ProtectedRoute>
                }
              />

              {/* Shared Authenticated Routes */}
              <Route
                path="/pickups"
                element={
                  <ProtectedRoute>
                    <PickupManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Catch-All */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
