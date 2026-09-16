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
    <div className="min-h-screen bg-[radial-gradient(circle,_rgba(24,102,193,0.12),_transparent_25%),radial-gradient(circle_at_top_right,_rgba(135,206,235,0.08),_transparent_18%)] dark:bg-[#05060a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/95 dark:bg-[#111111] border border-[#e5e5e5] dark:border-[#111827] p-8 rounded-[32px] shadow-2xl shadow-slate-900/10">
          <div className="mb-8 text-center">
            <h1 className="text-[#1866C1] text-3xl font-semibold">
              Restablecer contraseña
            </h1>

            <p className="mt-4 text-sm text-[#666666] dark:text-[#a3a3a3]">
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
              disabled={isSubmitting || !token}
            >
              {isSubmitting ? 'Guardando...' : 'Restablecer contraseña'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm text-[#1866C1] hover:underline"
            >
              Ir al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};