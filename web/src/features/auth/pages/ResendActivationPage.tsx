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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(circle,_rgba(24,102,193,0.12),_transparent_25%),radial-gradient(circle_at_top_right,_rgba(135,206,235,0.08),_transparent_18%)] dark:bg-[#05060a]">
      <div className="w-full max-w-md">
        <div className="bg-white/95 dark:bg-[#111111] border border-[#e5e5e5] dark:border-[#111827] p-8 rounded-[32px] shadow-2xl shadow-slate-900/10">

          <div className="text-center mb-8">
            <h1 className="text-[#1866C1] text-3xl font-semibold">
              Smart Home
            </h1>

            <h2 className="mt-4 text-xl font-semibold text-[#222222] dark:text-white">
              Reenviar activación
            </h2>

            <p className="mt-2 text-sm text-[#666666] dark:text-[#a3a3a3]">
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
              <div className="text-sm text-[#dc2626]">
                {formError}
              </div>
            )}

            {successMessage && (
              <div className="text-sm text-emerald-600">
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
              className="text-sm text-[#1866C1] hover:underline"
            >
              Volver al inicio de sesión
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};