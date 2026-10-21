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

export const AddDevicePage = () => {
  const navigate =
    useNavigate();
  const { user } = useAuth();

  const { homeId } =
    useParams<{
      homeId: string;
    }>();

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
      <main className="p-6">
        <p>
          No se encontró el hogar.
        </p>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="p-6">
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 dark:bg-[#151824] dark:text-gray-400">
          Verificando permisos...
        </div>
      </main>
    );
  }

  if (!isOwner) {
    return (
      <main className="p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          No tienes permisos para agregar dispositivos a este hogar.
        </div>
      </main>
    );
  }
  return (
    <main className="min-h-screen bg-[#f4f7fe] p-6 dark:bg-[#0f111a]">
      <div className="mx-auto max-w-4xl space-y-6">

        <header>
          <button
            type="button"
            onClick={() =>
              navigate(
                `/homes/${homeId}/devices`,
              )
            }
            className="mb-3 text-sm font-semibold text-[#1866C1] hover:underline"
          >
            ← Volver a dispositivos
          </button>

          <h1 className="text-3xl font-bold text-[#1b254b] dark:text-white">
            Agregar dispositivo
          </h1>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Selecciona cómo quieres
            encontrar tu dispositivo.
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-3">

          <Card className="rounded-2xl border-2 border-[#1866C1]/20">
            <CardContent className="p-6">

              <div className="mb-4 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#1866C1] dark:bg-blue-950/30">
                Recomendado
              </div>

              <h2 className="text-xl font-bold text-[#1b254b] dark:text-white">
                Buscar automáticamente
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
                SmartHome buscará
                dispositivos compatibles
                conectados a tu red.
              </p>

              <Button
                type="button"
                variant="primary"
                className="mt-6 w-full"
                onClick={() =>
                  navigate(
                    `/homes/${homeId}/devices/add/discover`,
                  )
                }
              >
                Buscar dispositivos
              </Button>

            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="mb-4 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">Nuevo contrato de backend</div>
              <h2 className="text-xl font-bold text-[#1b254b] dark:text-white">Vinculación por sesión AP</h2>
              <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">Coordina una sesión de alta Shelly con el backend y consulta sus capacidades reales.</p>
              <Button type="button" variant="secondary" className="mt-6 w-full" onClick={() => navigate(`/homes/${homeId}/devices/add/pairing`)}>Abrir sesión AP</Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">

              <h2 className="text-xl font-bold text-[#1b254b] dark:text-white">
                Agregar por IP
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
                Utiliza esta opción si
                ya conoces la dirección IP
                de tu dispositivo.
              </p>

              <Button
                type="button"
                variant="secondary"
                className="mt-6 w-full"
                onClick={() =>
                  navigate(
                    `/homes/${homeId}/devices/add/ip`,
                  )
                }
              >
                Ingresar dirección IP
              </Button>

            </CardContent>
          </Card>

        </div>

      </div>
    </main>
  );
};