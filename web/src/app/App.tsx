import type { ReactNode } from 'react';

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import { Toaster } from 'react-hot-toast';

import '../i18n/config';

import {
  AuthProvider,
  useAuth,
} from './contexts/AuthContext';

import { ThemeProvider } from './contexts/ThemeContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { DashboardLayout } from './layouts/DashboardLayout';

// AUTH
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { ActivateAccountPage } from '../features/auth/pages/ActivateAccountPage';
import { ResendActivationPage } from '../features/auth/pages/ResendActivationPage';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage';

// DASHBOARD
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';

// HOMES
import { Homes } from '../features/homes/pages/Homes';
import { HomeDashboardPage } from '../features/homes/pages/HomeDashboardPage';

// DEVICES
import { Devices } from '../features/devices/pages/Devices';
import { DeviceDetailPage } from '../features/devices/pages/DeviceDetailPage';
import { EditDevicePage } from '../features/devices/pages/EditDevicePage';
import { AddDevicePage } from '../features/devices/pages/AddDevicePage';
import { DiscoverDevicePage } from '../features/devices/pages/DiscoverDevicePage';
import { AddDeviceByIpPage } from '../features/devices/pages/AddDeviceByIpPage';

// OTHERS
import { Reports } from '../features/reports/pages/Reports';
import { Notifications } from '../features/notifications/pages/Notifications';
import { Settings } from '../features/settings/pages/Settings';

interface RouteGuardProps {
  children: ReactNode;
}

const PrivateRoute = ({
  children,
}: RouteGuardProps) => {
  const {
    isAuthenticated,
    initialized,
  } = useAuth();

  if (!initialized) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
};

const PublicRoute = ({
  children,
}: RouteGuardProps) => {
  const {
    isAuthenticated,
    initialized,
  } = useAuth();

  if (!initialized) {
    return null;
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* ====================================== */}
      {/* RUTAS PÚBLICAS                        */}
      {/* ====================================== */}

      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      <Route
        path="/activate-account"
        element={
          <PublicRoute>
            <ActivateAccountPage />
          </PublicRoute>
        }
      />

      <Route
        path="/resend-activation"
        element={
          <PublicRoute>
            <ResendActivationPage />
          </PublicRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />

      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        }
      />

      {/* ====================================== */}
      {/* RUTAS PRIVADAS                        */}
      {/* ====================================== */}

      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        {/* Inicio */}
        <Route
          index
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        {/* Dashboard general */}
        <Route
          path="dashboard"
          element={
            <DashboardPage />
          }
        />

        {/* ====================================== */}
        {/* HOGARES                               */}
        {/* ====================================== */}

        <Route
          path="homes"
          element={
            <Homes />
          }
        />

        <Route
          path="homes/:homeId/dashboard"
          element={
            <HomeDashboardPage />
          }
        />

        {/* ====================================== */}
        {/* DISPOSITIVOS                          */}
        {/* ====================================== */}

        {/* Lista de dispositivos del hogar */}
        <Route
          path="homes/:homeId/devices"
          element={
            <Devices />
          }
        />

        {/* Pantalla: seleccionar método */}
        <Route
          path="homes/:homeId/devices/add"
          element={
            <AddDevicePage />
          }
        />

        {/* Pantalla: búsqueda automática */}
        <Route
          path="homes/:homeId/devices/add/discover"
          element={
            <DiscoverDevicePage />
          }
        />

        {/* Pantalla: agregar por IP */}
        <Route
          path="homes/:homeId/devices/add/ip"
          element={
            <AddDeviceByIpPage />
          }
        />

        {/* Detalle */}
        <Route
          path="homes/:homeId/devices/:deviceId"
          element={
            <DeviceDetailPage />
          }
        />

        {/* Editar */}
        <Route
          path="homes/:homeId/devices/:deviceId/edit"
          element={
            <EditDevicePage />
          }
        />

        {/* ====================================== */}
        {/* REPORTES                              */}
        {/* ====================================== */}

        <Route
          path="reports"
          element={
            <Reports />
          }
        />

        {/* ====================================== */}
        {/* NOTIFICACIONES                        */}
        {/* ====================================== */}

        <Route
          path="notifications"
          element={
            <Notifications />
          }
        />

        {/* ====================================== */}
        {/* CONFIGURACIÓN                         */}
        {/* ====================================== */}

        <Route
          path="settings"
          element={
            <Settings />
          }
        />
      </Route>

      {/* ====================================== */}
      {/* RUTA NO ENCONTRADA                    */}
      {/* ====================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />
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