import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { activateAccount } from '../../../shared/api/auth.api';
import { Button } from '../../../components/ui/Button';

export const ActivateAccountPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState<
    'loading' | 'success' | 'error'
  >('loading');

  const [message, setMessage] = useState(
    'Estamos activando tu cuenta...',
  );

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage(
        'El enlace de activación no contiene un token válido.',
      );
      return;
    }

    const activate = async () => {
      try {
        const response = await activateAccount(token);

        if (response.activated) {
          setStatus('success');
          setMessage(
            'Tu cuenta fue activada correctamente. Ya puedes iniciar sesión.',
          );
          return;
        }

        setStatus('error');
        setMessage('No fue posible activar la cuenta.');
      } catch (error) {
        setStatus('error');
        setMessage(
          error instanceof Error
            ? error.message
            : 'El enlace de activación es inválido o ha expirado.',
        );
      }
    };

    void activate();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(circle,_rgba(24,102,193,0.12),_transparent_25%),radial-gradient(circle_at_top_right,_rgba(135,206,235,0.08),_transparent_18%)] dark:bg-[#05060a]">
      <div className="w-full max-w-md">
        <div className="bg-white/95 dark:bg-[#111111] border border-[#e5e5e5] dark:border-[#111827] p-8 rounded-[32px] shadow-2xl shadow-slate-900/10 text-center">

          <h1 className="text-[#1866C1] text-3xl font-semibold">
            Smart Home
          </h1>

          <h2 className="mt-6 text-xl font-semibold text-[#222222] dark:text-white">
            Activación de cuenta
          </h2>

          {status === 'loading' && (
            <p className="mt-4 text-sm text-[#666666] dark:text-[#a3a3a3]">
              {message}
            </p>
          )}

          {status === 'success' && (
            <div className="mt-4">
              <p className="text-sm text-emerald-600">
                {message}
              </p>

              <Button
                type="button"
                variant="primary"
                className="w-full mt-6"
                onClick={() => navigate('/login')}
              >
                Ir a iniciar sesión
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="mt-4">
              <p className="text-sm text-[#dc2626]">
                {message}
              </p>

              <Button
                type="button"
                variant="primary"
                className="w-full mt-6"
                onClick={() => navigate('/login')}
              >
                Volver al inicio de sesión
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};