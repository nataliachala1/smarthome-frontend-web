import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../app/contexts/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

const AuthLogo = () => (
  <div className="sh-login-logo-mark" aria-hidden="true">
    <svg
      viewBox="0 0 64 64"
      className="h-14 w-14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 24L32 8L56 24V52C56 54.2091 54.2091 56 52 56H12C9.79086 56 8 54.2091 8 52V24Z"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M36 22L26 36H38L28 50"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

export const RegisterPage = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [formError, setFormError] = useState('');
  const [registrationMessage, setRegistrationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setFormError('');
    setRegistrationMessage('');

    const nameTrim = name.trim();
    const emailTrim = email.trim();

    const nameValid = /^[A-Za-zÀ-ÿ\s]+$/.test(nameTrim);

    if (!nameValid) {
      setFormError(
        'El nombre no puede contener números ni caracteres especiales',
      );
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      setFormError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setFormError('La contraseña debe incluir al menos una letra mayúscula');
      return;
    }

    if (!/\d/.test(password)) {
      setFormError('La contraseña debe incluir al menos un número');
      return;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      setFormError(
        'La contraseña debe incluir al menos un carácter especial',
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await register(nameTrim, emailTrim, password, confirmPassword);

      setRegistrationMessage(
        'Registro exitoso. Revisa tu correo para activar la cuenta antes de iniciar sesión.',
      );

      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'No fue posible completar el registro.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="sh-login-page sh-register-page sh-register-page--fullscreen">
      <section className="sh-login-card sh-register-card sh-register-card--fullscreen" aria-label="Crear cuenta en Smart Home">
        <div className="sh-login-form sh-register-form">
          <div className="sh-login-content sh-register-content">
            <div className="sh-login-brand sh-register-brand sh-register-stagger">
              <AuthLogo />
              <span>{t('app.name')}</span>
            </div>

            <header className="sh-login-heading sh-register-heading sh-register-stagger">
              <h1>Crear cuenta</h1>
              <p>
                Crea tu cuenta para administrar tus hogares y dispositivos inteligentes.{' '}
                <Link className="sh-register-terms-link" to="/terms">Consulta los términos</Link>
              </p>
            </header>

            <form onSubmit={handleSubmit} className="sh-login-fields sh-register-fields">
              <Input
                label={t('auth.name')}
                type="text"
                autoComplete="name"
                placeholder="Nombre completo"
                leadingIcon={(
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M5.5 20c.6-3.1 3.1-5 6.5-5s5.9 1.9 6.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                )}
                className="sh-login-input sh-register-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                validate={(value) =>
                  /^[A-Za-zÀ-ÿ\s]+$/.test(String(value || '').trim())
                    ? ''
                    : 'El nombre no puede contener números ni caracteres especiales'
                }
                validateOn="change"
              />

              <Input
                label={t('auth.email')}
                type="email"
                autoComplete="email"
                placeholder="Correo electrónico"
                leadingIcon={(
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
                    <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                className="sh-login-input sh-register-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label={t('auth.password')}
                type="password"
                autoComplete="new-password"
                placeholder="Crea una contraseña"
                leadingIcon={(
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <rect x="4.5" y="10" width="15" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                )}
                passwordToggle="icon"
                className="sh-login-input sh-login-input--password sh-register-input"
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
                label={t('auth.confirmPassword')}
                type="password"
                autoComplete="new-password"
                placeholder="Confirma tu contraseña"
                leadingIcon={(
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <rect x="4.5" y="10" width="15" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                )}
                passwordToggle="icon"
                className="sh-login-input sh-login-input--password sh-register-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                validate={(value) =>
                  String(value) === password
                    ? ''
                    : 'Las contraseñas no coinciden'
                }
                validateOn="change"
              />

              {formError && (
                <div role="alert" className="sh-login-error sh-animate-fade-in">
                  {formError}
                </div>
              )}

              {registrationMessage && (
                <div role="status" aria-live="polite" className="sh-register-success sh-animate-fade-in">
                  {registrationMessage}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full sh-login-submit sh-register-submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="sh-register-spinner" aria-hidden="true" />
                    <span>Registrando...</span>
                  </>
                ) : (
                  <>
                    <span>Crear cuenta</span>
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                )}
              </Button>
            </form>

            <div className="sh-login-divider sh-register-divider" aria-hidden="true"><span /></div>

            <p className="sh-login-register sh-register-footer">
              ¿Ya tienes una cuenta?{' '}
              <button type="button" onClick={() => navigate('/login')}>
                Inicia sesión
              </button>
            </p>
          </div>
        </div>

        <aside className="sh-login-abstract-panel sh-register-abstract-panel" aria-labelledby="sh-register-message-title">
          <div className="sh-login-abstract-copy sh-register-abstract-copy">
            <h2 id="sh-register-message-title">
              Tu hogar inteligente<br />
              <span>comienza aquí.</span>
            </h2>
            <p>Crea tu cuenta y gestiona tus dispositivos desde un solo lugar.</p>
          </div>
        </aside>
      </section>
    </main>
  );
};
