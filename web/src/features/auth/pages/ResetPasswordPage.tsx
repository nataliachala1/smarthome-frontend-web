import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../app/contexts/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export const ResetPasswordPage = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams]);

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePassword = () => {
    if (!token) {
      return 'El enlace de recuperación no tiene token.';
    }

    if (password !== passwordConfirmation) {
      return 'Las contraseñas no coinciden';
    }

    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }

    if (!/[A-Z]/.test(password)) {
      return 'La contraseña debe incluir al menos una letra mayúscula';
    }

    if (!/\d/.test(password)) {
      return 'La contraseña debe incluir al menos un número';
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      return 'La contraseña debe incluir al menos un carácter especial';
    }

    return '';
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setFormError('');
    setSuccessMessage('');

    const validationError = validatePassword();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword(token, password, passwordConfirmation);

      setSuccessMessage(
        'Contraseña restablecida correctamente. Ya puedes iniciar sesión.',
      );

      setPassword('');
      setPasswordConfirmation('');
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'No fue posible restablecer la contraseña.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="sh-auth-viewport bg-[radial-gradient(circle,_rgba(24,102,193,0.12),_transparent_25%),radial-gradient(circle_at_top_right,_rgba(135,206,235,0.08),_transparent_18%)] dark:bg-[#05060a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-[#dce8f8] bg-white/95 p-6 shadow-[0_20px_55px_rgba(22,82,155,0.10)] dark:border-slate-800 dark:bg-[#111827] dark:shadow-black/20 sm:rounded-[24px] sm:p-8 sh-animate-scale-in">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-[-0.03em] text-[#1866C1]">
              Restablecer contraseña
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#667895] dark:text-slate-400">
              Ingresa tu nueva contraseña.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nueva contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              showPasswordStrength
              validate={(value) => {
                const candidate = String(value);
                if (candidate.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
                if (!/[A-Z]/.test(candidate)) return 'La contraseña debe incluir al menos una letra mayúscula';
                if (!/\d/.test(candidate)) return 'La contraseña debe incluir al menos un número';
                if (!/[^A-Za-z0-9]/.test(candidate)) return 'La contraseña debe incluir al menos un carácter especial';
                return '';
              }}
              validateOn="change"
            />

            <Input
              label="Confirmar contraseña"
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              validate={(value) =>
                String(value) === password
                  ? ''
                  : 'Las contraseñas no coinciden'
              }
              validateOn="change"
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
              disabled={isSubmitting || !token}
            >
              {isSubmitting ? 'Guardando...' : 'Restablecer contraseña'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex min-h-11 items-center rounded-md px-2 text-sm font-medium text-[#1866C1] transition-colors duration-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1866C1]/40 focus-visible:ring-offset-2 motion-reduce:transition-none"
            >
              Ir al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
