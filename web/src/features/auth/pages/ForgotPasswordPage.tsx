import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/contexts/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export const ForgotPasswordPage = () => {
  const { forgotPassword } = useAuth();
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
      await forgotPassword(email.trim());

      setSuccessMessage(
        'Si el correo existe y la cuenta está activa, recibirás un enlace para restablecer tu contraseña.',
      );

      setEmail('');
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'No fue posible solicitar la recuperación de contraseña.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="sh-auth-viewport bg-[radial-gradient(circle,_rgba(24,102,193,0.12),_transparent_25%),radial-gradient(circle_at_top_right,_rgba(135,206,235,0.08),_transparent_18%)] dark:bg-[#05060a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/95 dark:bg-[#111111] border border-[#e5e5e5] dark:border-[#111827] p-6 sm:p-8 rounded-2xl sm:rounded-[24px] shadow-lg shadow-slate-900/5 dark:shadow-black/20 sh-animate-scale-in">
          <div className="mb-8 text-center">
            <h1 className="text-[#1866C1] text-3xl font-semibold">
              Recuperar contraseña
            </h1>

            <p className="mt-4 text-sm text-[#666666] dark:text-[#a3a3a3]">
              Ingresa tu correo para recibir un enlace de recuperación.
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
              <div role="alert" className="text-sm text-[#dc2626] sh-animate-fade-in">
                {formError}
              </div>
            )}

            {successMessage && (
              <div role="status" className="text-sm text-emerald-600 sh-animate-fade-in">
                {successMessage}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar enlace'}
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
