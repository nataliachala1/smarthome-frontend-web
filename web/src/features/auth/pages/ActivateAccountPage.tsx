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
    <div className="sh-auth-viewport flex items-center justify-center p-4 bg-[radial-gradient(circle,_rgba(24,102,193,0.12),_transparent_25%),radial-gradient(circle_at_top_right,_rgba(135,206,235,0.08),_transparent_18%)] dark:bg-[#05060a]">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-[#dce8f8] bg-white/95 p-6 text-center shadow-[0_20px_55px_rgba(22,82,155,0.10)] dark:border-slate-800 dark:bg-[#111827] dark:shadow-black/20 sm:rounded-[24px] sm:p-8 sh-animate-scale-in">

          <h1 className="text-3xl font-bold tracking-[-0.03em] text-[#1866C1]">
            Smart Home
          </h1>

          <h2 className="mt-6 text-xl font-semibold tracking-tight text-[#162544] dark:text-white">
            Activación de cuenta
          </h2>

          {status === 'loading' && (
            <p role="status" className="mt-4 rounded-xl border border-[#dce8f8] bg-[#f5f9ff] px-4 py-3 text-sm leading-6 text-[#526789] dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
              {message}
            </p>
          )}

          {status === 'success' && (
            <div className="mt-4">
              <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
                {message}
              </p>

              <Button
                type="button"
                variant="primary"
                className="mt-6 w-full"
                onClick={() => navigate('/login')}
              >
                Ir a iniciar sesión
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="mt-4">
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                {message}
              </p>

              <Button
                type="button"
                variant="primary"
                className="mt-6 w-full"
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
