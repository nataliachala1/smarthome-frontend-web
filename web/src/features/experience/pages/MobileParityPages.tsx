import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { listNotifications, type Notification } from '../../../shared/api/notifications.api';
import appPackage from '../../../../package.json';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../app/contexts/AuthContext';
import { Settings } from '../../settings/pages/Settings';
import { getMyProfile } from '../../../shared/api/users.api';

type IconName =
  | 'alert'
  | 'star'
  | 'users'
  | 'user'
  | 'shield'
  | 'key'
  | 'devices'
  | 'globe'
  | 'help'
  | 'info'
  | 'settings'
  | 'home'
  | 'chevron';

const iconPaths: Record<IconName, ReactNode> = {
  alert: <><path d="M10.3 3.9 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4m0 4h.01" /></>,
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m6-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm6-7.8a4 4 0 0 1 0 7.6m6 10v-2a4 4 0 0 0-3-3.9" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
  shield: <><path d="m12 22 1.5-.7C18.3 19 21 15.5 21 10V5l-9-3-9 3v5c0 5.5 2.7 9 7.5 11.3L12 22Z" /><path d="m9 12 2 2 4-4" /></>,
  key: <><circle cx="8" cy="15" r="5" /><path d="m11.5 11.5 9-9M17 6l2 2m-5 1 2 2" /></>,
  devices: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8m-4-4v4" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18m0-18a15 15 0 0 0 0 18" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.6 9a2.5 2.5 0 1 1 4.2 1.8c-1 .9-1.8 1.2-1.8 2.7m0 3h.01" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></>,
  settings: <><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" /><path d="m19.4 15 .1.1a1.7 1.7 0 1 1-2.4 2.4l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a1.7 1.7 0 1 1-3.4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a1.7 1.7 0 1 1-2.4-2.4l.1-.1a1.7 1.7 0 0 0-1.2-2.9H4a1.7 1.7 0 1 1 0-3.4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a1.7 1.7 0 1 1 2.4-2.4l.1.1a1.7 1.7 0 0 0 2.9-1.2V4a1.7 1.7 0 1 1 3.4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a1.7 1.7 0 1 1 2.4 2.4l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a1.7 1.7 0 1 1 0 3.4h-.2a1.7 1.7 0 0 0-1.2.9Z" /></>,
  home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1V10Z" /></>,
  chevron: <path d="m9 18 6-6-6-6" />,
};

const Icon = ({ name, className = 'h-5 w-5' }: { name: IconName; className?: string }) => (
  <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {iconPaths[name]}
  </svg>
);

const pageTitle: Record<string, { title: string; description: string }> = {
  alerts: { title: 'Alertas', description: 'Revisa los eventos que requieren atención en tus hogares.' },
  favorites: { title: 'Favoritos', description: 'Accede rápidamente a tus hogares guardados.' },
  access: { title: 'Accesos del hogar', description: 'Organiza miembros e invitaciones de tus hogares.' },
  profile: { title: 'Perfil', description: 'Administra tu cuenta y preferencias.' },
  personal: { title: 'Información personal', description: 'Consulta la información de tu cuenta.' },
  security: { title: 'Seguridad de la cuenta', description: 'Revisa las opciones para proteger tu cuenta.' },
  sessions: { title: 'Dónde iniciaste sesión', description: 'Consulta la actividad de acceso de tu cuenta.' },
  activity: { title: 'Actividad de inicio de sesión', description: 'Revisa los dispositivos asociados a tu cuenta.' },
  'close-sessions': { title: 'Cerrar sesiones', description: 'Administra las sesiones activas de tu cuenta.' },
  language: { title: 'Idioma', description: 'Elige el idioma de la aplicación.' },
  help: { title: 'Centro de ayuda', description: 'Resuelve dudas sobre tu hogar inteligente.' },
  about: { title: 'Acerca de Smart Home', description: 'Información de la aplicación.' },
};

const contentClass = 'mx-auto w-full max-w-[1200px] text-[#0f172a] dark:text-slate-100 sh-page-enter';
const panelClass = 'rounded-xl border border-[#e2e8f0] bg-white dark:border-slate-700 dark:bg-[#151824]';

const PageHeading = ({ page }: { page: string }) => {
  const info = pageTitle[page] ?? pageTitle.profile;
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight text-[#0f172a] dark:text-white sm:text-[34px]">{info.title}</h1>
      <p className="mt-1 text-[15px] leading-6 text-[#64748b] dark:text-slate-400">{info.description}</p>
    </header>
  );
};

const EmptyState = ({ icon, title, description, action }: {
  icon: IconName;
  title: string;
  description: string;
  action?: { label: string; to: string };
}) => (
  <div className={`${panelClass} flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center sh-animate-fade-in`}>
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eff6ff] text-[#1677f2] dark:bg-[#172b49] dark:text-[#75adff]">
      <Icon name={icon} className="h-7 w-7" />
    </div>
    <h2 className="mt-5 text-xl font-semibold text-[#0f172a] dark:text-white">{title}</h2>
    <p className="mt-2 max-w-xl text-sm leading-6 text-[#64748b] dark:text-slate-400">{description}</p>
    {action && (
      <Link to={action.to} className="mt-5 text-sm font-semibold text-[#0d6efd] hover:underline">
        {action.label}
      </Link>
    )}
  </div>
);

const PageLink = ({ icon, title, description, to }: {
  icon: IconName;
  title: string;
  description: string;
  to: string;
}) => (
  <Link to={to} className="group flex min-h-[76px] items-center gap-3 border-b border-[#edf1f5] px-4 py-3 last:border-0 hover:bg-[#f8fafc] dark:border-slate-700 dark:hover:bg-slate-800/60 sm:px-5">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f1f5f9] text-[#47617f] dark:bg-slate-800 dark:text-slate-300">
      <Icon name={icon} className="h-[18px] w-[18px]" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-semibold text-[#0f172a] dark:text-white">{title}</span>
      <span className="mt-0.5 block text-xs leading-5 text-[#64748b] dark:text-slate-400">{description}</span>
    </span>
    <Icon name="chevron" className="h-4 w-4 shrink-0 text-[#94a3b8] transition-transform group-hover:translate-x-0.5" />
  </Link>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1 border-b border-[#edf1f5] px-4 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:px-5">
    <span className="text-sm text-[#64748b] dark:text-slate-400">{label}</span>
    <span className="break-all text-sm font-medium text-[#0f172a] dark:text-slate-100">{value}</span>
  </div>
);

export const AlertsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let live = true;
    listNotifications({ limit: 50 }).then((items) => { if (live) setNotifications(items); })
      .catch((reason: unknown) => { if (live) setError(reason instanceof Error ? reason.message : 'No se pudieron cargar las notificaciones.'); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, []);
  return <div className={contentClass}><PageHeading page="alerts" />
    {loading ? <p role="status" className={panelClass + ' p-5'}>Cargando notificaciones...</p>
      : error ? <p role="alert" className={panelClass + ' p-5 text-red-700'}>{error}</p>
      : notifications.length === 0 ? <EmptyState icon="alert" title="No hay notificaciones" description="El backend no reporta notificaciones para tu cuenta." action={{ label: 'Ver notificaciones', to: '/notifications' }} />
      : <section aria-label="Notificaciones" className={panelClass + ' divide-y divide-slate-100 dark:divide-slate-700'}>{notifications.map((item) => <article key={item.id} className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold">{item.title}</h2><span className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</span></div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.message}</p><p className="mt-2 text-xs text-slate-500">{item.homeName || 'Hogar'} ? {item.priority} ? {item.status}</p>
      </article>)}</section>}
  </div>;
};


export const FavoritesPage = () => (
  <div className={contentClass}><PageHeading page="favorites" />
    <EmptyState icon="star" title="Favoritos no disponible" description="El backend actual no ofrece un contrato para consultar o guardar hogares favoritos en la web." action={{ label: 'Explorar hogares', to: '/homes' }} />
  </div>
);


export const ProfilePage = () => {
  const { user } = useAuth();
  const name = user?.name || 'Usuario';
  const email = user?.email || 'Correo no disponible';

  return (
    <div className={contentClass}>
      <PageHeading page="profile" />
      <Link
        to="/account/personal"
        aria-label={`Ver información de la cuenta de ${name}`}
        className={`${panelClass} group mb-6 flex items-center gap-4 p-5 transition-colors hover:border-[#b8d2f5] hover:bg-[#fbfdff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1677f2]/40 dark:hover:bg-slate-800/60 sm:p-6`}
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#eff6ff] text-lg font-bold text-[#1677f2] dark:bg-[#172b49] dark:text-[#75adff]">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold text-[#0f172a] dark:text-white">{name}</h2>
          <p className="truncate text-sm text-[#64748b] dark:text-slate-400">{email}</p>
        </div>
        <Icon name="chevron" className="h-5 w-5 shrink-0 text-[#94a3b8] transition-transform group-hover:translate-x-0.5" />
      </Link>
      <section id="profile-settings" className="mt-8 scroll-mt-6">
        <Settings />
      </section>
    </div>
  );
};

export const AccountPage = () => {
  const { page = 'personal' } = useParams<{ page: string }>();
  const navigate = useNavigate();
  const { user, updateProfile, deactivateAccount } = useAuth();
  const [profileName, setProfileName] = useState(user?.name || 'Usuario');
  const [profileEmail, setProfileEmail] = useState(user?.email || 'Correo no disponible');
  const [nameDraft, setNameDraft] = useState(user?.name || '');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const supportedAccountPages = ['personal', 'security', 'sessions', 'activity', 'close-sessions', 'language'];
  const currentPage = page;

  useEffect(() => {
    if (currentPage !== 'personal') return;

    let active = true;
    void getMyProfile()
      .then((profile) => {
        if (!active) return;
        setProfileName(profile.name);
        setProfileEmail(profile.email);
        setNameDraft(profile.name);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setProfileError(
          error instanceof Error
            ? error.message
            : 'No fue posible cargar el perfil.',
        );
      });

    return () => {
      active = false;
    };
  }, [currentPage]);

  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextName = nameDraft.trim();
    if (nextName.length < 2) {
      setProfileError('El nombre debe tener al menos 2 caracteres.');
      return;
    }

    setProfileError('');
    setProfileSuccess('');
    setIsSavingProfile(true);

    try {
      await updateProfile(nextName);
      setProfileName(nextName);
      setProfileSuccess('Tu nombre fue actualizado.');
    } catch (error) {
      setProfileError(
        error instanceof Error
          ? error.message
          : 'No fue posible actualizar el perfil.',
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDeactivateAccount = async () => {
    const confirmed = window.confirm(
      '¿Desactivar temporalmente tu cuenta? Se cerrará tu sesión y podrás solicitar la reactivación por correo.',
    );
    if (!confirmed) return;

    setProfileError('');
    setIsDeactivating(true);
    try {
      await deactivateAccount();
      navigate('/login', { replace: true });
    } catch (error) {
      setProfileError(
        error instanceof Error
          ? error.message
          : 'No fue posible desactivar la cuenta.',
      );
      setIsDeactivating(false);
    }
  };

  if (!supportedAccountPages.includes(currentPage)) {
    return <Navigate to="/account/personal" replace />;
  }

  if (currentPage === 'personal') {
    return (
      <div className={contentClass}>
        <PageHeading page={currentPage} />
        <section className={`${panelClass} space-y-4`}>
          <form onSubmit={handleSaveProfile} className="max-w-xl space-y-3">
            <label className="block text-sm font-medium text-[#334155] dark:text-slate-200">
              Nombre
              <input
                value={nameDraft}
                onChange={(event) => setNameDraft(event.target.value)}
                minLength={2}
                maxLength={100}
                required
                className="mt-1.5 h-11 w-full rounded-lg border border-[#dfe7f2] bg-white px-3 text-sm text-[#18264a] outline-none focus:border-[#0877f9] focus:ring-2 focus:ring-[#0877f9]/15 dark:border-slate-600 dark:bg-[#172236] dark:text-slate-100"
              />
            </label>
            {profileError && <p role="alert" className="text-sm text-red-600 dark:text-red-300">{profileError}</p>}
            {profileSuccess && <p role="status" className="text-sm text-emerald-600">{profileSuccess}</p>}
            <button
              type="submit"
              disabled={isSavingProfile}
              className="rounded-lg bg-[#0877f9] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0564d4] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingProfile ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </form>
          <InfoRow label="Correo electrónico" value={profileEmail} />
          <InfoRow label="Rol" value={user?.role || 'No disponible'} />
          <div className="border-t border-[#edf1f5] pt-4 dark:border-slate-700">
            <h2 className="text-sm font-semibold text-red-700 dark:text-red-300">Desactivar cuenta</h2>
            <p className="mt-1 text-sm text-[#64748b] dark:text-slate-400">
              La desactivación cerrará tu sesión. Puedes pedir un enlace por correo para reactivar tu cuenta.
            </p>
            <button
              type="button"
              onClick={() => void handleDeactivateAccount()}
              disabled={isDeactivating}
              className="mt-3 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/30"
            >
              {isDeactivating ? 'Desactivando…' : 'Desactivar cuenta'}
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (currentPage === 'security') {
    return (
      <div className={contentClass}>
        <PageHeading page={currentPage} />
        <section className={`${panelClass} mb-5 p-5 sm:p-6`}>
          <p className="text-sm font-medium text-[#334155] dark:text-slate-200">Estado de seguridad</p>
          <p className="mt-1 text-sm text-[#64748b] dark:text-slate-400">La información de sesiones y verificaciones aún no está disponible en la web.</p>
        </section>
        <section className={panelClass}>
          <PageLink icon="devices" title="Dónde iniciaste sesión" description="Dispositivos y actividad de cuenta" to="/account/sessions" />
        </section>
      </div>
    );
  }

  if (currentPage === 'sessions' || currentPage === 'activity' || currentPage === 'close-sessions') {
    return (
      <div className={contentClass}>
        <PageHeading page={currentPage} />
        {currentPage === 'sessions' && (
          <section className={`${panelClass} mb-5`}>
            <PageLink icon="user" title={profileName} description={profileEmail} to="/account/activity" />
          </section>
        )}
        <EmptyState
          icon="devices"
          title={currentPage === 'close-sessions' ? 'No hay sesiones para mostrar' : 'Actividad no disponible'}
          description="La web todavía no recibe información de sesiones activas ni de actividad de inicio de sesión."
          action={{ label: 'Volver a seguridad', to: '/account/security' }}
        />
      </div>
    );
  }

  if (currentPage === 'language') return <Navigate to="/profile#profile-settings" replace />;

  return <Navigate to="/account/personal" replace />;
};

export const HelpPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqItems = [
    ['¿Cómo agrego un hogar?', 'Entra en Mis hogares y selecciona Crear hogar.'],
    ['¿Cómo agrego un dispositivo?', 'Abre un hogar y utiliza las opciones de dispositivos disponibles.'],
    ['¿Qué significa una alerta?', 'Las alertas señalan eventos que pueden requerir atención en un dispositivo o en el consumo.'],
    ['¿Cómo cambio el tema?', 'Puedes seleccionar el modo claro u oscuro desde el control de tema del encabezado.'],
  ];

  return (
    <div className={contentClass}>
      <PageHeading page="help" />
      <section className={`${panelClass} px-4 sm:px-5`}>
        <h2 className="py-4 text-base font-semibold text-[#0f172a] dark:text-white">Preguntas frecuentes</h2>
        {faqItems.map(([question, answer], index) => (
          <div key={question} className="border-t border-[#edf1f5] dark:border-slate-700">
            <button type="button" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex min-h-14 w-full items-center justify-between gap-4 py-3 text-left text-sm font-medium text-[#0f172a] dark:text-slate-100">
              {question}<Icon name="chevron" className={`h-4 w-4 shrink-0 text-[#64748b] transition-transform ${openFaq === index ? 'rotate-90' : ''}`} />
            </button>
            {openFaq === index && <p className="pb-4 pr-8 text-sm leading-6 text-[#64748b] dark:text-slate-400">{answer}</p>}
          </div>
        ))}
      </section>
      <p className="mt-5 text-sm text-[#64748b] dark:text-slate-400">El contacto con soporte todavía no está configurado para la web.</p>
    </div>
  );
};

export const AboutPage = () => (
  <div className={contentClass}>
    <PageHeading page="about" />
    <section className={panelClass}>
      <InfoRow label="Aplicación" value="Smart Home" />
      <InfoRow label="Versi\u00f3n" value={appPackage.version} />
      <InfoRow label="Plataforma" value="Web" />
    </section>
  </div>
);
