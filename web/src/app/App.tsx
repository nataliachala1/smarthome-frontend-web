import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import '../i18n/config';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { DashboardPage } from '../features/consumption/pages/DashboardPage';
import { Consumption } from '../features/consumption/pages/Consumption';
import { Devices } from '../features/devices/pages/Devices';
import { Reports } from '../features/reports/pages/Reports';
import { Notifications } from '../features/notifications/pages/Notifications';
import { Homes } from '../features/homes/pages/Homes';
import { Settings } from '../features/settings/pages/Settings';
import { DashboardLayout } from './layouts/DashboardLayout';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  // wait until auth finishes initializing to avoid redirecting prematurely
  const { initialized } = useAuth();
  if (!initialized) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, initialized } = useAuth();
  if (!initialized) return null;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="devices" element={<Devices />} />
        <Route path="consumption" element={<Consumption />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="homes" element={<Homes />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <OfflineProvider>
          <AuthProvider>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#1a1a1a',
                  color: '#e5e5e5',
                },
              }}
            />
          </AuthProvider>
        </OfflineProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
