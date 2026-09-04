import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../app/contexts/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

const AuthLogo = () => (
  <div className="grid h-14 w-14 place-items-center rounded-3xl bg-[#eff6ff] text-[#1866C1] shadow-sm shadow-[#1866C1]/10 dark:bg-[#111827] dark:text-[#bfdbfe]">
    <svg viewBox="0 0 64 64" className="h-8 w-8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 24L32 8L56 24V52C56 54.2091 54.2091 56 52 56H12C9.79086 56 8 54.2091 8 52V24Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M36 22L26 36H38L28 50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

export const LoginPage = () => {
  const { t } = useTranslation();
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setFormError('');
    setIsSubmitting(true);

    try {
      if (isRegistering) {
      // Validate name: no numbers or special characters (allow accents and spaces)
      const nameTrim = name.trim();
      const nameValid = /^[A-Za-zÀ-ÿ\s]+$/.test(nameTrim);
      if (!nameValid) {
        setFormError('El nombre no puede contener números ni caracteres especiales');
        return;
      }

      // Validate password match
      if (password !== confirmPassword) {
        setFormError('Las contraseñas no coinciden');
        return;
      }

      // Validate password strength (at least 8 chars, number and special char)
      if (String(password).length < 8) {
        setFormError('La contraseña debe tener al menos 8 caracteres');
        return;
      }
      if (!/\d/.test(password)) {
        setFormError('La contraseña debe incluir al menos un número');
        return;
      }
      if (!/[^A-Za-z0-9]/.test(password)) {
        setFormError('La contraseña debe incluir al menos un carácter especial');
        return;
      }

        await register(nameTrim, email, password);
      } else {
        await login(email.trim(), password);
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No fue posible completar la solicitud.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle,_rgba(24,102,193,0.12),_transparent_25%),radial-gradient(circle_at_top_right,_rgba(135,206,235,0.08),_transparent_18%)] dark:bg-[#05060a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/95 dark:bg-[#111111] border border-[#e5e5e5] dark:border-[#111827] p-8 rounded-[32px] shadow-2xl shadow-slate-900/10">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-4">
              <AuthLogo />
              <h1 className="text-[#1866C1] text-3xl font-semibold">{t('app.name')}</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <Input
                label={t('auth.name')}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                validate={(v) => (/^[A-Za-zÀ-ÿ\s]+$/.test(String(v || '').trim()) ? '' : 'El nombre no puede contener números ni caracteres especiales')}
                validateOn="change"
              />
            )}

            <Input label={t('auth.email')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

            <Input label={t('auth.password')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            {isRegistering && (
              <Input
                label={t('auth.confirmPassword')}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                validate={(v) => (String(v) === String(password) ? '' : 'Las contraseñas no coinciden')}
                validateOn="change"
              />
            )}

            {formError && <div className="text-sm text-[#dc2626]">{formError}</div>}

            <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Procesando... ' : ''}
              {isRegistering ? t('auth.register') : t('auth.login')}
            </Button>

          </form>

          <div className="mt-6 text-center">
            <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="text-sm text-[#1866C1] hover:underline">
              {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>

          {!isRegistering && (
            <div className="mt-4 text-center">
              <button type="button" className="text-sm text-[#666666] dark:text-[#a3a3a3] hover:underline">{t('auth.forgotPassword')}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
