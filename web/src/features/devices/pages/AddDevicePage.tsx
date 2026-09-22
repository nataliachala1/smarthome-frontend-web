import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  Card,
  CardContent,
} from '../../../components/ui/Card';

import { Button } from '../../../components/ui/Button';

export const AddDevicePage = () => {
  const navigate =
    useNavigate();

  const { homeId } =
    useParams<{
      homeId: string;
    }>();

  if (!homeId) {
    return (
      <main className="p-6">
        <p>
          No se encontró el hogar.
        </p>
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

        <div className="grid gap-5 md:grid-cols-2">

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