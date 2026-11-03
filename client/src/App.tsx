import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './layouts';
import { ProtectedRoute } from './components/ProtectedRoute';

// Application Pages
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

// Modular Stylesheets
import './styles/global.css';
import './styles/components.css';
import './styles/pages.css';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <MainLayout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/available-food" element={<AvailableFoodPage />} />
            <Route path="/expiry-detection" element={<ExpiryDetectionPage />} />

            {/* Authenticated Dashboard (Unified Donor & Recipient View) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Donor-Specific Donation Creation */}
            <Route
              path="/donate"
              element={
                <ProtectedRoute allowedRoles={['donor']}>
                  <DonateFoodPage />
                </ProtectedRoute>
              }
            />

            {/* Shared Authenticated Workflow Routes */}
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

            {/* 404 Not Found Catch-All */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </MainLayout>
      </Router>
    </AuthProvider>
  );
};

export default App;
