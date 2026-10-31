import appPackage from '../../../../package.json';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/contexts/AuthContext';
import { useTheme } from '../../../app/contexts/ThemeContext';
import { getMyPreferences, updateMyPreferences } from '../../../shared/api/users.api';

type IconProps = {
  children: ReactNode;
  className?: string;
};

const Icon = ({ children, className = 'h-5 w-5' }: IconProps) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const IconBox = ({ children }: { children: ReactNode }) => (
  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef5ff] text-[#0877f9] dark:bg-[#152747] dark:text-[#75adff]">
    {children}
  </div>
);

const SectionHeading = ({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) => (
  <div className="mb-4 flex items-center gap-3">
    <IconBox>{icon}</IconBox>
    <div className="min-w-0">
      <h2 className="text-base font-bold leading-5 text-[#0a1740] dark:text-white">{title}</h2>
      <p className="mt-0.5 text-xs leading-4 text-[#687b9e] dark:text-slate-400">{description}</p>
    </div>
  </div>
);

const cardClassName =
  'min-w-0 rounded-2xl border border-[#e5edf8] bg-white p-5 shadow-[0_6px_20px_rgba(26,65,119,0.045)] dark:border-slate-700 dark:bg-[#111b2d] sm:p-7';

export const Settings = () => {
  const { t, i18n } = useTranslation();
  const { logoutAll, changePassword } = useAuth();
  const navigate = useNavigate();
  const { theme: currentTheme, setTheme } = useTheme();
  const [lang, setLang] = useState(i18n.language || 'es');
  const [activeTab, setActiveTab] = useState('general');
  const [preferenceError, setPreferenceError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    let active = true;

    void getMyPreferences()
      .then((preferences) => {
        if (!active) return;

        setLang(preferences.language);
        void i18n.changeLanguage(preferences.language);
        setTheme(
          preferences.theme === 'claro'
            ? 'light'
            : preferences.theme === 'oscuro'
              ? 'dark'
              : 'system',
        );
      })
      .catch((error: unknown) => {
        if (!active) return;
        setPreferenceError(
          error instanceof Error
            ? error.message
            : 'No fue posible cargar tus preferencias.',
        );
      });

    return () => {
      active = false;
    };
  }, [i18n, setTheme]);

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    setTheme(theme);
    setPreferenceError('');

    try {
      await updateMyPreferences({
        theme: theme === 'light' ? 'claro' : theme === 'dark' ? 'oscuro' : 'automatico',
      });
    } catch (error) {
      setPreferenceError(
        error instanceof Error
          ? error.message
          : 'No fue posible guardar el tema.',
      );
    }
  };

  const handleLangChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLanguage = event.target.value;
    setLang(nextLanguage);
    void i18n.changeLanguage(nextLanguage);
    localStorage.setItem('i18nextLng', nextLanguage);
    setPreferenceError('');
    void updateMyPreferences({ language: nextLanguage as 'es' | 'en' | 'fr' | 'de' }).catch(
      (error: unknown) => {
        setPreferenceError(
          error instanceof Error
            ? error.message
            : 'No fue posible guardar el idioma.',
        );
      },
    );
  };

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError('');
    setIsChangingPassword(true);

    try {
      await changePassword({
        currentPassword,
        newPassword,
        newPasswordConfirmation,
      });
      navigate('/login', { replace: true });
    } catch (error) {
      setPasswordError(
        error instanceof Error
          ? error.message
          : 'No fue posible cambiar la contraseña.',
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const tabs = [
    {
      id: 'general',
      label: 'General',
      icon: <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />,
    },
    {
      id: 'security',
      label: 'Seguridad',
      icon: <path d="m12 22 1.5-.7C18.3 19 21 15.5 21 10V5l-9-3-9 3v5c0 5.5 2.7 9 7.5 11.3L12 22Z" />,
    },
    {
      id: 'information',
      label: 'Información',
      icon: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></>,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1440px] pb-2 text-[#0a1740] dark:text-slate-100 sh-page-enter">
      <div className="mb-4">
        <div className="mb-2 flex items-center gap-2 text-[11px] text-[#8090ad]">
          <Link to="/profile" className="transition-colors hover:text-[#0877f9]">Perfil</Link>
          <span aria-hidden="true">›</span>
          <span className="font-medium text-[#50658c] dark:text-slate-300">Configuración</span>
        </div>
        <h1 className="text-[28px] font-extrabold leading-tight tracking-[-0.04em] text-[#09143d] dark:text-white sm:text-[30px]">
          {t('settings.title') || 'Configuración'}
        </h1>
        <p className="mt-1 text-[13px] leading-5 text-[#50658c] dark:text-slate-400">
          Personaliza tu experiencia en Smart Home y gestiona tu cuenta.
        </p>
      </div>

      {preferenceError && (
        <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          {preferenceError}
        </div>
      )}

      <div role="tablist" aria-label="Secciones de configuración" className="mb-4 flex max-w-full gap-2 overflow-x-auto border-b border-[#e5edf8] dark:border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`settings-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex min-h-11 shrink-0 items-center gap-2 rounded-t-lg border-b-2 px-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0877f9]/40 sm:px-4 motion-reduce:transition-none ${
              activeTab === tab.id
                ? 'border-[#0877f9] bg-[#f4f8ff] text-[#0877f9] dark:bg-[#152747]'
                : 'border-transparent text-[#50658c] hover:text-[#0877f9] dark:text-slate-400'
            }`}
          >
            <Icon className="h-[17px] w-[17px]">{tab.icon}</Icon>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <section id="settings-general" role="tabpanel" aria-labelledby="general" hidden={activeTab !== 'general'} className={cardClassName}>
          <SectionHeading
            title="Apariencia"
            description="Elige el tema visual de la aplicación."
            icon={<Icon><path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1.7-3.1 1.7 1.7 0 0 1 1.4-2.6H19a2 2 0 0 0 2-2A10 10 0 0 0 12 3Z" /><path d="M7.5 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm3-4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm5 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" /></Icon>}
          />

          <div className="grid grid-cols-3 gap-3">
            {([
              ['light', 'Claro', <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></>],
              ['dark', 'Oscuro', <path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z" />],
              ['system', 'Sistema', <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8m-4-4v4" /></>],
            ] as const).map(([theme, label, icon]) => {
              const isSelected = currentTheme === theme;
              return (
                <button
                  key={theme}
                  type="button"
                  onClick={() => void handleThemeChange(theme)}
                  aria-pressed={isSelected}
                  className={`relative flex min-h-[84px] flex-col items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-[transform,border-color,background-color,box-shadow,color] duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(26,65,119,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0877f9]/40 focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none ${
                    isSelected
                      ? 'border-[#0877f9] bg-[#edf5ff] text-[#0877f9] shadow-[0_4px_12px_rgba(8,119,249,0.08)] dark:bg-[#172b49]'
                      : 'border-[#e1e9f4] bg-white text-[#18264a] hover:border-[#93bdff] dark:border-slate-600 dark:bg-[#172236] dark:text-slate-200'
                  }`}
                >
                  {isSelected && <span className="absolute right-1.5 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#0877f9] text-white"><Icon className="h-2.5 w-2.5"><path d="m5 12 4 4L19 6" /></Icon></span>}
                  <Icon className="h-6 w-6">{icon}</Icon>
                  {label}
                </button>
              );
            })}
          </div>

          <div className="my-6 h-px bg-[#e7edf6] dark:bg-slate-700" />

          <div className="flex items-center gap-3">
            <IconBox><Icon className="h-5 w-5"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18m0-18a15 15 0 0 0 0 18" /></Icon></IconBox>
            <div className="min-w-0 flex-1">
              <label htmlFor="settings-language" className="mb-1.5 block text-base font-bold text-[#0a1740] dark:text-slate-100">Idioma</label>
              <div className="relative">
                <select
                  id="settings-language"
                  value={lang}
                  onChange={handleLangChange}
                  className="h-11 w-full appearance-none rounded-lg border border-[#dfe7f2] bg-white px-3 pr-9 text-sm font-medium text-[#18264a] outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#0877f9] focus:ring-2 focus:ring-[#0877f9]/15 dark:border-slate-600 dark:bg-[#172236] dark:text-slate-100 motion-reduce:transition-none"
                >
                  <option value="es">ES&nbsp; Español</option>
                  <option value="en">EN&nbsp; English</option>
                  <option value="fr">FR&nbsp; Français</option>
                  <option value="de">DE&nbsp; Deutsch</option>
                </select>
                <Icon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#50658c]"><path d="m6 9 6 6 6-6" /></Icon>
              </div>
            </div>
          </div>
        </section>

        <section id="settings-security" role="tabpanel" aria-labelledby="security" hidden={activeTab !== 'security'} className={cardClassName}>
          <SectionHeading
            title="Seguridad"
            description="Protege tu cuenta y gestiona el acceso."
            icon={<Icon><path d="m12 22 1.5-.7C18.3 19 21 15.5 21 10V5l-9-3-9 3v5c0 5.5 2.7 9 7.5 11.3L12 22Z" /><path d="m9 12 2 2 4-4" /></Icon>}
          />
          <form onSubmit={handleChangePassword} className="max-w-xl space-y-3">
            <h3 className="text-sm font-semibold text-[#0a1740] dark:text-slate-100">
              Cambiar contraseña
            </h3>
            <label className="block text-xs font-medium text-[#50658c] dark:text-slate-300">
              Contraseña actual
              <input
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
                className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe7f2] bg-white px-3 text-sm text-[#18264a] outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#0877f9] focus:ring-2 focus:ring-[#0877f9]/15 dark:border-slate-600 dark:bg-[#172236] dark:text-slate-100 motion-reduce:transition-none"
              />
            </label>
            <label className="block text-xs font-medium text-[#50658c] dark:text-slate-300">
              Nueva contraseña
              <input
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                minLength={8}
                required
                className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe7f2] bg-white px-3 text-sm text-[#18264a] outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#0877f9] focus:ring-2 focus:ring-[#0877f9]/15 dark:border-slate-600 dark:bg-[#172236] dark:text-slate-100 motion-reduce:transition-none"
              />
            </label>
            <label className="block text-xs font-medium text-[#50658c] dark:text-slate-300">
              Confirmar nueva contraseña
              <input
                type="password"
                autoComplete="new-password"
                value={newPasswordConfirmation}
                onChange={(event) => setNewPasswordConfirmation(event.target.value)}
                minLength={8}
                required
                className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe7f2] bg-white px-3 text-sm text-[#18264a] outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#0877f9] focus:ring-2 focus:ring-[#0877f9]/15 dark:border-slate-600 dark:bg-[#172236] dark:text-slate-100 motion-reduce:transition-none"
              />
            </label>
            <p className="text-xs text-[#687b9e] dark:text-slate-400">
              Usa al menos 8 caracteres, una mayúscula, un número y un símbolo. Al cambiarla, se cerrarán tus sesiones.
            </p>
            {passwordError && (
              <p role="alert" className="text-sm text-red-600 dark:text-red-300">
                {passwordError}
              </p>
            )}
            <button
              type="submit"
              disabled={isChangingPassword}
              className="min-h-11 rounded-lg bg-[#0877f9] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#0564d4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0877f9]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
            >
              {isChangingPassword ? 'Actualizando…' : 'Cambiar contraseña'}
            </button>
          </form>
          <div className="mt-4 flex min-h-[54px] flex-col items-start justify-between gap-3 rounded-xl border border-[#ffe0e0] bg-[#fff7f7] px-4 py-3 dark:border-red-900/60 dark:bg-red-950/20 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ffe9e9] text-[#ed2929] dark:bg-red-950/60"><Icon><path d="M10 17l5-5-5-5m5 5H3" /><path d="M12 3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6" /></Icon></span>
              <div>
                <p className="text-xs font-bold text-[#d92121]">Cerrar sesión</p>
                <p className="mt-0.5 text-[11px] text-[#d64a4a]">Cierra tu sesión en todos los dispositivos.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={logoutAll}
              className="min-h-11 w-full shrink-0 rounded-lg bg-[#ed2424] px-4 py-2 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[#d51c1c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:ring-offset-2 motion-reduce:transition-none sm:w-auto"
            >
              Cerrar sesión
            </button>
          </div>
        </section>

        <section id="settings-information" role="tabpanel" aria-labelledby="information" hidden={activeTab !== 'information'} className={cardClassName}>
          <SectionHeading
            title="Información"
            description="Detalles de la aplicación."
            icon={<Icon><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></Icon>}
          />
          <div className="space-y-0.5 rounded-lg bg-[#f7f9fc] px-3 py-1 dark:bg-slate-800/60">
            <div className="flex min-h-[34px] items-center justify-between gap-3 text-xs"><span>Versi\u00f3n instalada</span><strong className="font-bold text-[#0a1740] dark:text-slate-100">{appPackage.version}</strong></div>
            <div className="flex min-h-[34px] items-center gap-3 text-xs">
              <Icon className="h-4 w-4 text-[#26385f] dark:text-slate-300"><path d="M3 12a9 9 0 0 1 18 0v5a2 2 0 0 1-2 2h-2v-6h4M3 13h4v6H5a2 2 0 0 1-2-2v-4Zm4 6a5 5 0 0 0 5 2" /></Icon>
              <span className="flex-1">Soporte</span>
              <Link to="/help" className="inline-flex min-h-11 items-center gap-1 rounded-md font-semibold text-[#0877f9] transition-colors duration-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0877f9]/40 focus-visible:ring-offset-2 motion-reduce:transition-none">
                Contactar
                <Icon className="h-3.5 w-3.5"><path d="M14 4h6v6m-11 5L20 4" /><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" /></Icon>
              </Link>
            </div>
          </div>
        </section>
      </div>

    </div>
  );
};
