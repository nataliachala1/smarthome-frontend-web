import type { ReactNode } from 'react';

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

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
import { AccountReactivationPage } from '../features/auth/pages/AccountReactivationPage';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage';
import { TermsPage } from '../features/experience/pages/TermsPage';

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
import { ShellyPairingPage } from '../features/devices/pages/ShellyPairingPage';

// OTHERS
import { Notifications } from '../features/notifications/pages/Notifications';
import { InvitationsPage } from '../features/notifications/pages/InvitationsPage';
import { Consumption } from '../features/consumption/pages/Consumption';
import {
  AboutPage,
  AccountPage,
  AlertsPage,
  FavoritesPage,
  HelpPage,
  ProfilePage,
} from '../features/experience/pages/MobileParityPages';
import { AccessPage } from '../features/experience/pages/AccessPage';

const ReportsRedirect = () => {
  const activeHomeId = localStorage.getItem('activeHomeId');

  return (
    <Navigate
      to={
        activeHomeId
          ? '/homes/' + activeHomeId + '/consumption'
          : '/homes'
      }
      replace
    />
  );
};
interface RouteGuardProps {
  children: ReactNode;
}

const AuthInitializationStatus = () => {
  const { t } = useTranslation();

  return (
    <div className="sh-route-loading" role="status">
      <span className="sh-route-loading__indicator" aria-hidden="true" />
      <span>{t('common.loading')}</span>
    </div>
  );
};

const PrivateRoute = ({
  children,
}: RouteGuardProps) => {
  const {
    isAuthenticated,
    initialized,
  } = useAuth();

  if (!initialized) {
    return <AuthInitializationStatus />;
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
    return <AuthInitializationStatus />;
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
        path="/terms"
        element={<TermsPage />}
      />

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
        path="/reactivate-account"
        element={
          <PublicRoute>
            <AccountReactivationPage />
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
        {/* CONSUMO / ENERGÍA                     */}
        {/* ====================================== */}

        <Route
          path="homes/:homeId/consumption"
          element={
            <Consumption />
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

        <Route path="homes/:homeId/devices/add/pairing" element={<ShellyPairingPage />} />

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
            <ReportsRedirect />
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
        <Route
          path="notifications/invitations"
          element={
            <InvitationsPage />
          }
        />

        {/* ====================================== */}
        {/* CONFIGURACIÓN                         */}
        {/* ====================================== */}

        <Route path="profile/settings" element={<Navigate to="/profile#profile-settings" replace />} />
        <Route path="settings" element={<Navigate to="/profile#profile-settings" replace />} />

        {/* Vistas web adaptadas desde la organización de la app móvil */}
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="access" element={<AccessPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="account/:page" element={<AccountPage />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="about" element={<AboutPage />} />
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
                  background: 'var(--card)',
                  color: 'var(--card-foreground)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
                },
              }}
            />
          </AuthProvider>
        </OfflineProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
