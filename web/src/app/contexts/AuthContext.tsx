import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import * as authApi from '../../shared/api/auth.api';

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
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

      if (!storedUser || !token) {
        setInitialized(true);
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser) as AuthUser;

        // Verifica con el backend que el JWT siga siendo válido.
        await authApi.getCurrentUser();

        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');

        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setInitialized(true);
      }
    };

    void initializeAuth();
  }, []);

  const saveSession = (response: authApi.AuthResponse) => {
    if (!response.accessToken || !response.user) {
      throw new Error('La respuesta de autenticacion no tiene el formato esperado.');
    }
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('token', response.accessToken);
    setUser(response.user);
    setIsAuthenticated(true);
  };

  const login = async (email: string, password: string) => {
    saveSession(await authApi.login({ email, password }));
  };

  const register = async (
  name: string,
  email: string,
  password: string,
  passwordConfirmation: string,
  ) => {
  return authApi.register({
    name,
    email,
    password,
    passwordConfirmation,
  });
};

const forgotPassword = async (email: string) => {
  return authApi.forgotPassword({ email });
};

const resetPassword = async (
  token: string,
  password: string,
  passwordConfirmation: string,
) => {
  return authApi.resetPassword({
    token,
    password,
    passwordConfirmation,
  });
};

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
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
    logout,
  }}
>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
