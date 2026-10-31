import { useRef, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  reactivateAccount,
  requestAccountReactivation,
} from '../../../shared/api/auth.api';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export const AccountReactivationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);
  const reactivationInFlight = useRef(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleReactivate = async () => {
    if (!token || reactivationInFlight.current) return;

    reactivationInFlight.current = true;
    setIsReactivating(true);
    setFormError('');

    try {
      await reactivateAccount(token);
      setSuccessMessage('Tu cuenta fue reactivada. Ya puedes iniciar sesión.');
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'No fue posible reactivar la cuenta con este enlace.',
      );
    } finally {
      reactivationInFlight.current = false;
      setIsReactivating(false);
    }
  };

  const handleRequestLink = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      await requestAccountReactivation(email.trim());
      setSuccessMessage(
        'Si hay una cuenta desactivada asociada a ese correo, enviaremos un enlace para reactivarla.',
      );
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'No fue posible solicitar el enlace de reactivación.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="sh-auth-viewport flex items-center justify-center p-4 bg-[radial-gradient(circle,_rgba(24,102,193,0.12),_transparent_25%),radial-gradient(circle_at_top_right,_rgba(135,206,235,0.08),_transparent_18%)] dark:bg-[#05060a]">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-[#dce8f8] bg-white/95 p-6 shadow-[0_20px_55px_rgba(22,82,155,0.10)] dark:border-slate-800 dark:bg-[#111827] dark:shadow-black/20 sm:rounded-[24px] sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-[-0.03em] text-[#1866C1]">Smart Home</h1>
            <h2 className="mt-4 text-xl font-semibold tracking-tight text-[#162544] dark:text-white">
              Reactivar cuenta
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#667895] dark:text-slate-400">
              Solicita un enlace por correo para recuperar el acceso a tu cuenta.
            </p>
          </div>

          {token && !successMessage && (
            <div className="mb-5 rounded-xl border border-[#dce8f8] bg-[#f7faff] p-4 dark:border-slate-700 dark:bg-slate-900/50">
              <p className="mb-3 text-sm text-[#50658c] dark:text-slate-300">
                Confirma para reactivar tu cuenta con este enlace.
              </p>
              <Button
                type="button"
                variant="primary"
                className="w-full"
                disabled={isReactivating}
                onClick={() => void handleReactivate()}
              >
                {isReactivating ? 'Reactivando…' : 'Confirmar reactivación'}
              </Button>
            </div>
          )}

          {formError && (
            <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
              {formError}
            </div>
          )}

          {successMessage && (
            <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm leading-5 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleRequestLink} className="space-y-4">
            <Input
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando…' : 'Enviar enlace de reactivación'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex min-h-11 items-center rounded-md px-2 text-sm font-medium text-[#1866C1] transition-colors duration-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1866C1]/40 focus-visible:ring-offset-2 motion-reduce:transition-none"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
