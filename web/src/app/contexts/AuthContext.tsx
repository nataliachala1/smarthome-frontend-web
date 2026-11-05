import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import * as authApi from '../../shared/api/auth.api';
import * as usersApi from '../../shared/api/users.api';
import { disconnectRealtimeSocket } from '../../shared/realtime/realtime-client';

export type AuthUser = authApi.AuthUser;

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ) => Promise<authApi.RegisterResponse>;
  forgotPassword: (email: string) => Promise<authApi.ForgotPasswordResponse>;
  resetPassword: (
    token: string,
    password: string,
    passwordConfirmation: string,
  ) => Promise<authApi.ResetPasswordResponse>;
  changePassword: (payload: authApi.ChangePasswordPayload) => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
  deactivateAccount: () => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const clearLocalSession = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        let token = localStorage.getItem('token');

        if (!token) {
          const refreshedSession = await authApi.refreshSession();

          if (!refreshedSession.accessToken) {
            throw new Error('No fue posible renovar la sesión.');
          }

          token = refreshedSession.accessToken;
          localStorage.setItem('token', token);
        }

        const currentUser = await authApi.getCurrentUser();
        const storedUser = localStorage.getItem('user');

        const parsedUser: AuthUser = storedUser
          ? (JSON.parse(storedUser) as AuthUser)
          : {
              id: currentUser.userId,
              email: '',
              role: currentUser.role,
            };

        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch {
        disconnectRealtimeSocket();
        clearLocalSession();
      } finally {
        setInitialized(true);
      }
    };

    void initializeAuth();
  }, []);

  const saveSession = (response: authApi.AuthResponse) => {
    if (!response.accessToken || !response.user) {
      throw new Error(
        'La respuesta de autenticación no tiene el formato esperado.',
      );
    }

    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('token', response.accessToken);
    setUser(response.user);
    setIsAuthenticated(true);
  };

  const login = async (email: string, password: string) => {
    saveSession(await authApi.login({ email, password }));
  };

  const register = (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ) =>
    authApi.register({
      name,
      email,
      password,
      passwordConfirmation,
    });

  const forgotPassword = (email: string) =>
    authApi.forgotPassword({ email });

  const resetPassword = (
    token: string,
    password: string,
    passwordConfirmation: string,
  ) =>
    authApi.resetPassword({
      token,
      password,
      passwordConfirmation,
    });

  const changePassword = async (payload: authApi.ChangePasswordPayload) => {
    const response = await authApi.changePassword(payload);

    if (response.changed) {
      disconnectRealtimeSocket();
      clearLocalSession();
    }
  };

  const updateProfile = async (name: string) => {
    const profile = await usersApi.updateMyProfile({ name });
    if (!user) return;

    const updatedUser = {
      ...user,
      name: profile.name,
      email: profile.email,
      role: profile.role,
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const deactivateAccount = async () => {
    await usersApi.deactivateMyAccount();
    disconnectRealtimeSocket();
    clearLocalSession();
  };

  const logout = async () => {
    disconnectRealtimeSocket();

    try {
      await authApi.logout();
    } catch {
      // Si falla la petición al servidor, se limpia igualmente la sesión local.
    } finally {
      clearLocalSession();
    }
  };

  const logoutAll = async () => {
    disconnectRealtimeSocket();

    try {
      await authApi.logoutAll();
    } catch {
      // Si falla la petición, se cierra la sesión local igualmente.
    } finally {
      clearLocalSession();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        initialized,
        login,
        register,
        forgotPassword,
        resetPassword,
        changePassword,
        updateProfile,
        deactivateAccount,
        logout,
        logoutAll,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
