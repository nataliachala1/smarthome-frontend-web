import {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  Card,
  CardContent,
} from '../../../components/ui/Card';

import { Button } from '../../../components/ui/Button';
import { getHome, listMembers, type Home, type HomeMember } from '../../../shared/api/homes.api';
import { useAuth } from '../../../app/contexts/AuthContext';

const ArrowLeftIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5m7 7-7-7 7-7" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14m-7-7 7 7-7 7" />
  </svg>
);

const SearchIllustration = () => (
  <div aria-hidden="true" className="relative flex h-[176px] w-full max-w-[310px] items-center justify-center">
    <div className="absolute h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(219,238,255,0.82)_0%,rgba(239,247,255,0.58)_58%,rgba(255,255,255,0)_75%)]" />
    <svg viewBox="0 0 320 180" fill="none" className="relative h-full w-full overflow-visible">
      <circle cx="160" cy="91" r="59" stroke="#dcecff" strokeWidth="2" />
      <circle cx="160" cy="91" r="39" fill="white" stroke="#1682ef" strokeWidth="7" />
      <path d="m188 120 27 27" stroke="#1682ef" strokeWidth="8" strokeLinecap="round" />
      <circle cx="78" cy="52" r="27" fill="#e9f4ff" />
      <path d="M65 51c7-7 19-7 26 0m-21 6c4-4 12-4 16 0m-9 7h.1" stroke="#1682ef" strokeWidth="4" strokeLinecap="round" />
      <circle cx="68" cy="132" r="25" fill="#e9f4ff" />
      <rect x="57" y="121" width="22" height="22" rx="5" stroke="#54a6f7" strokeWidth="3" />
      <circle cx="63" cy="128" r="2" fill="#1682ef" /><circle cx="73" cy="128" r="2" fill="#1682ef" />
      <circle cx="252" cy="119" r="27" fill="#e9f4ff" />
      <path d="M246 116a6 6 0 1 1 12 0c0 3-2 4-3 7h-6c-1-3-3-4-3-7Zm3 10h6m-5 4h4" stroke="#1682ef" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="111" cy="91" r="3" fill="#bbdcff" /><circle cx="209" cy="91" r="3" fill="#bbdcff" />
    </svg>
  </div>
);

const AccessPointIllustration = () => (
  <div aria-hidden="true" className="relative flex h-[176px] w-full max-w-[310px] items-center justify-center">
    <div className="absolute h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(220,239,255,0.82)_0%,rgba(240,248,255,0.62)_58%,rgba(255,255,255,0)_75%)]" />
    <svg viewBox="0 0 320 180" fill="none" className="relative h-full w-full overflow-visible">
      <circle cx="160" cy="91" r="73" fill="#eff7ff" fillOpacity=".78" />
      <circle cx="160" cy="91" r="53" stroke="#e2f0ff" strokeWidth="2" />
      <path d="M129 48c17-17 45-17 62 0m-51 11c11-11 29-11 40 0m-29 11c5-5 13-5 18 0" stroke="#1682ef" strokeWidth="7" strokeLinecap="round" />
      <path d="M93 104c0-8 7-15 15-15h104c8 0 15 7 15 15v26c0 9-7 16-16 16H109c-9 0-16-7-16-16v-26Z" fill="#fff" stroke="#d8eaff" strokeWidth="2" />
      <path d="M93 105c0-8 7-15 15-15h104c8 0 15 7 15 15v3H93v-3Z" fill="#f7fbff" />
      <circle cx="156" cy="128" r="7" fill="#d4f1ff" /><circle cx="156" cy="128" r="3.5" fill="#20a5e9" />
      <circle cx="195" cy="128" r="3" fill="#b5d9fa" />
      <path d="M115 148h90" stroke="#dcecff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  </div>
);

const IpIllustration = () => (
  <div aria-hidden="true" className="relative flex h-[176px] w-full max-w-[310px] items-center justify-center">
    <div className="absolute h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(222,240,255,0.78)_0%,rgba(241,248,255,0.6)_58%,rgba(255,255,255,0)_75%)]" />
    <svg viewBox="0 0 320 180" fill="none" className="relative h-full w-full overflow-visible">
      <circle cx="160" cy="91" r="62" stroke="#bfddff" strokeWidth="2.5" strokeDasharray="5 6" />
      <circle cx="160" cy="91" r="43" stroke="#d9ecff" strokeWidth="2.5" strokeDasharray="5 6" />
      <path d="M203 75V54a5 5 0 0 1 10 0v21" stroke="#b5d8ff" strokeWidth="7" strokeLinecap="round" />
      <rect x="186" y="78" width="58" height="54" rx="13" fill="#e8f4ff" stroke="#d4e9ff" strokeWidth="2" />
      <circle cx="232" cy="94" r="4" fill="#bddcff" />
      <path d="M198 108h34m-28 9h23" stroke="#c8e2ff" strokeWidth="3" strokeLinecap="round" />
      <path d="M91 88c0-11 9-20 20-20s20 9 20 20c0 14-20 33-20 33S91 102 91 88Z" fill="white" stroke="#1682ef" strokeWidth="4" />
      <circle cx="111" cy="88" r="6" stroke="#1682ef" strokeWidth="3" />
      <path d="m131 110 19-10" stroke="#9fcaff" strokeWidth="2" strokeDasharray="4 5" />
      <circle cx="153" cy="98" r="4" fill="#1682ef" />
    </svg>
    <div className="absolute bottom-[25px] left-1/2 flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-[#d8eaff] bg-white/95 px-4 py-2 text-sm font-semibold text-[#1674d1] shadow-[0_8px_22px_rgba(34,111,194,0.12)]">
      <span className="h-2 w-2 rounded-full bg-[#50a7f5]" />
      Dirección IP
    </div>
  </div>
);

export const AddDevicePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { homeId } = useParams<{ homeId: string }>();

  const [home, setHome] = useState<Home | null>(null);
  const [currentMembership, setCurrentMembership] = useState<HomeMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isOwner =
    home !== null &&
    currentMembership?.homeId === homeId &&
    currentMembership?.userId === user?.id &&
    currentMembership?.status === 'ACTIVE' &&
    currentMembership?.role === 'OWNER';

  useEffect(() => {
    let active = true;

    setIsLoading(true);
    setHome(null);
    setCurrentMembership(null);

    const loadHome = async () => {
      if (!homeId || !user?.id) {
        if (active) setIsLoading(false);
        return;
      }

      try {
        const [homeResponse, members] = await Promise.all([
          getHome(homeId),
          listMembers(homeId),
        ]);

        if (!active) return;

        const membership = members.find(
          (member) =>
            member.homeId === homeId &&
            member.userId === user.id &&
            member.status === 'ACTIVE'
        ) ?? null;

        setHome(homeResponse);
        setCurrentMembership(membership);
      } catch {
        if (active) {
          setHome(null);
          setCurrentMembership(null);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadHome();

    return () => {
      active = false;
    };
  }, [homeId, user?.id]);

  if (!homeId) {
    return (
      <div className="p-6 sh-page-enter">
        <p>No se encontró el hogar.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 sh-page-enter">
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 dark:bg-[#151824] dark:text-gray-400">
          Verificando permisos...
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="p-6 sh-page-enter">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          No tienes permisos para agregar dispositivos a este hogar.
        </div>
      </div>
    );
  }

  const methods = [
    {
      title: 'Buscar automáticamente',
      description: 'SmartHome buscará dispositivos compatibles conectados a tu red local.',
      action: 'Buscar dispositivos',
      destination: '/devices/add/discover',
      recommended: true,
      illustration: <SearchIllustration />,
    },
    {
      title: 'Vinculación por sesión AP',
      description: 'Coordina una sesión de alta Shelly con el backend y consulta sus capacidades reales.',
      action: 'Abrir sesión AP',
      destination: '/devices/add/pairing',
      recommended: false,
      illustration: <AccessPointIllustration />,
    },
    {
      title: 'Agregar por dirección IP',
      description: 'Utiliza esta opción si ya conoces la dirección IP de tu dispositivo.',
      action: 'Ingresar dirección IP',
      destination: '/devices/add/ip',
      recommended: false,
      illustration: <IpIllustration />,
    },
  ];

  return (
    <div className="min-h-full sh-page-enter">
      <div className="mx-auto w-full max-w-[1380px] space-y-7 sm:space-y-8">
        <header>
          <button
            type="button"
            onClick={() => navigate('/homes/' + homeId + '/devices')}
            className="group mb-5 inline-flex min-h-12 items-center gap-3 rounded-xl text-[#60748f] transition-colors duration-200 hover:text-[#126bc5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1866C1]/40 motion-reduce:transition-none dark:text-slate-300 dark:hover:text-sky-300"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf4ff] text-[#145da9] transition-colors duration-200 group-hover:bg-[#dfedfc] dark:bg-slate-800 dark:text-sky-300 dark:group-hover:bg-slate-700">
              <ArrowLeftIcon />
            </span>
            <span className="text-base font-medium">Volver</span>
          </button>

          <h1 className="text-3xl font-bold tracking-tight text-[#132344] sm:text-[2.65rem] dark:text-white">
            Agregar dispositivo
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-[#71829c] sm:text-lg dark:text-slate-300">
            Selecciona cómo quieres encontrar tu dispositivo.
          </p>
        </header>

        <section aria-label="Métodos para agregar un dispositivo" className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
          {methods.map((method, index) => (
            <Card
              key={method.destination}
              noPadding
              className={'group h-full overflow-hidden rounded-[22px] border border-[#e1ebf7] bg-white shadow-[0_10px_30px_rgba(32,92,151,0.07)] transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-[#cbdff5] hover:shadow-[0_14px_34px_rgba(32,92,151,0.11)] motion-reduce:transform-none motion-reduce:transition-none dark:border-slate-700 dark:bg-[#111b2c] dark:shadow-black/20' + (method.recommended ? ' ring-1 ring-[#d9eaff]' : '')}
            >
              <CardContent className="h-full p-6 sm:p-7">
                <div className="flex h-full min-h-[500px] flex-col sh-animate-fade-in-up" style={{ animationDelay: String(index * 65) + 'ms' }}>
                  <div className="relative mb-5 flex h-[176px] shrink-0 items-center justify-center">
                    {method.illustration}
                    {method.recommended && (
                      <span className="absolute right-0 top-0 inline-flex items-center gap-1.5 rounded-full bg-[#eaf4ff] px-3 py-1.5 text-xs font-semibold text-[#126bc5] dark:bg-sky-950/60 dark:text-sky-200">
                        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
                          <path d="m10 2.5 2.2 4.4 4.8.7-3.5 3.4.8 4.8-4.3-2.3-4.3 2.3.8-4.8L3 7.6l4.8-.7L10 2.5Z" />
                        </svg>
                        Recomendado
                      </span>
                    )}
                  </div>

                  <h2 className="min-h-[60px] text-[1.35rem] font-bold leading-7 tracking-tight text-[#142649] dark:text-white">
                    {method.title}
                  </h2>
                  <p className="mt-2 min-h-[84px] text-base leading-7 text-[#71829c] dark:text-slate-300">
                    {method.description}
                  </p>

                  <Button
                    type="button"
                    variant={method.recommended ? 'primary' : 'secondary'}
                    className={method.recommended
                      ? 'mt-auto h-14 w-full justify-between rounded-2xl border-0 bg-gradient-to-r from-[#1686f5] to-[#0874de] px-5 text-base font-semibold text-white shadow-[0_8px_18px_rgba(14,116,221,0.18)] hover:from-[#1178e1] hover:to-[#0966c2] hover:shadow-[0_10px_22px_rgba(14,116,221,0.22)]'
                      : 'mt-auto h-14 w-full justify-between rounded-2xl border border-[#d5e9ff] bg-[#f1f8ff] px-5 text-base font-semibold text-[#0759a8] hover:border-[#b8d9ff] hover:bg-[#e8f3ff] dark:border-slate-600 dark:bg-slate-800 dark:text-sky-200 dark:hover:bg-slate-700'}
                    onClick={() => navigate('/homes/' + homeId + method.destination)}
                  >
                    <span>{method.action}</span>
                    <ArrowRightIcon />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </div>
  );
};
