import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
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

export const LoginPage = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setFormError('');
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'No fue posible iniciar sesión.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="sh-login-page sh-login-page--fullscreen">
      <section className="sh-login-card sh-login-card--fullscreen sh-animate-scale-in" aria-label="Acceso a Smart Home">
        <div className="sh-login-form">
          <div className="sh-login-content">
            <div className="sh-login-brand">
              <AuthLogo />
              <span>{t('app.name')}</span>
            </div>

            <header className="sh-login-heading">
              <h1>{t('auth.login')}</h1>
              <p>Accede para administrar tus hogares y dispositivos.</p>
            </header>

            <form onSubmit={handleSubmit} className="sh-login-fields">
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
                className="sh-login-input sh-login-input--icon"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label={t('auth.password')}
                type="password"
                autoComplete="current-password"
                placeholder="Ingresa tu contraseña"
                leadingIcon={(
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <rect x="4.5" y="10" width="15" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                )}
                passwordToggle="icon"
                className="sh-login-input sh-login-input--icon sh-login-input--password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {formError && (
                <div role="alert" className="sh-login-error sh-animate-fade-in">
                  {formError}
                </div>
              )}

              <div className="sh-login-options">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="sh-login-link"
                >
                  {t('auth.forgotPassword')}
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full sh-login-submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                <span>{isSubmitting ? 'Iniciando sesión...' : t('auth.login')}</span>
                {!isSubmitting && (
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </Button>
            </form>

            <div className="sh-login-divider" aria-hidden="true"><span /></div>

            <p className="sh-login-register">
              ¿No tienes cuenta?{' '}
              <button type="button" onClick={() => navigate('/register')}>
                Regístrate
              </button>
            </p>

            <nav className="sh-login-secondary-links" aria-label="Opciones adicionales de cuenta">
              <button type="button" onClick={() => navigate('/resend-activation')}>
                ¿No recibiste el correo de activación?
              </button>
              <button type="button" onClick={() => navigate('/reactivate-account')}>
                ¿Tu cuenta está desactivada? Solicita reactivarla
              </button>
            </nav>
          </div>
        </div>

        <aside className="sh-login-abstract-panel" aria-labelledby="sh-login-message-title">
          <div className="sh-login-abstract-copy">
            <h2 id="sh-login-message-title">
              Tu hogar inteligente,<br />
              <span>más simple.</span>
            </h2>
            <p>Controla, monitorea y administra tus dispositivos desde un solo lugar.</p>
          </div>
        </aside>
      </section>
    </main>
  );
};
