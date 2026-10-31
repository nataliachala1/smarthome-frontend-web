import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { resendActivation } from '../../../shared/api/auth.api';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export const ResendActivationPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setFormError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      await resendActivation(email.trim());

      setSuccessMessage(
        'Si existe una cuenta pendiente asociada a este correo, enviaremos un nuevo enlace de activación.',
      );
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'No fue posible solicitar un nuevo correo de activación.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="sh-auth-viewport flex items-center justify-center p-4 bg-[radial-gradient(circle,_rgba(24,102,193,0.12),_transparent_25%),radial-gradient(circle_at_top_right,_rgba(135,206,235,0.08),_transparent_18%)] dark:bg-[#05060a]">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-[#dce8f8] bg-white/95 p-6 shadow-[0_20px_55px_rgba(22,82,155,0.10)] dark:border-slate-800 dark:bg-[#111827] dark:shadow-black/20 sm:rounded-[24px] sm:p-8 sh-animate-scale-in">

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-[-0.03em] text-[#1866C1]">
              Smart Home
            </h1>

            <h2 className="mt-4 text-xl font-semibold tracking-tight text-[#162544] dark:text-white">
              Reenviar activación
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#667895] dark:text-slate-400">
              Ingresa el correo con el que registraste tu cuenta.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <Input
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {formError && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-700 sh-animate-fade-in dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                {formError}
              </div>
            )}

            {successMessage && (
              <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm leading-5 text-emerald-700 sh-animate-fade-in dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
                {successMessage}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Enviando...'
                : 'Reenviar correo de activación'}
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
