import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listHomes, type Home } from '../../../shared/api/homes.api';

const ACTIVE_HOME_KEY = 'activeHomeId';

export const Homes = () => {
  const { t } = useTranslation();
  const [homes, setHomes] = useState<Home[]>([]);
  const [activeHomeId, setActiveHomeId] = useState<string | null>(
    () => localStorage.getItem(ACTIVE_HOME_KEY),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadHomes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listHomes();
      setHomes(response);
      setActiveHomeId((currentId) => {
        const selectedId = currentId && response.some((home) => home.id === currentId)
          ? currentId
          : response[0]?.id ?? null;
        if (selectedId) localStorage.setItem(ACTIVE_HOME_KEY, selectedId);
        else localStorage.removeItem(ACTIVE_HOME_KEY);
        return selectedId;
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause : new Error('No fue posible cargar los hogares.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHomes();
  }, [loadHomes]);

  const selectHome = (homeId: string) => {
    setActiveHomeId(homeId);
    localStorage.setItem(ACTIVE_HOME_KEY, homeId);
  };

  return (
    <main className="min-h-screen bg-[#f4f7fe] p-8 dark:bg-[#0f111a]">
      <div className="mx-auto max-w-5xl space-y-7">
        <header>
          <h1 className="text-2xl font-bold text-[#1b254b] dark:text-white">{t('homes.title')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Hogares disponibles para tu cuenta
          </p>
        </header>

        {isLoading && (
          <div role="status" className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm dark:bg-[#151824] dark:text-gray-400">
            Cargando hogares...
          </div>
        )}

        {!isLoading && error && (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
            <p>{error.message}</p>
            <button type="button" onClick={() => void loadHomes()} className="mt-3 font-semibold underline">
              Reintentar
            </button>
          </div>
        )}

        {!isLoading && !error && homes.length === 0 && (
          <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm dark:bg-[#151824] dark:text-gray-400">
            No tienes hogares disponibles.
          </div>
        )}

        {!isLoading && !error && homes.length > 0 && (
          <section aria-label={t('homes.title')} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {homes.map((home) => (
              <button
                type="button"
                key={home.id}
                onClick={() => selectHome(home.id)}
                aria-pressed={home.id === activeHomeId}
                className={`rounded-2xl border p-5 text-left transition focus:outline-none focus:ring-2 focus:ring-[#1866C1]/40 ${
                  home.id === activeHomeId
                    ? 'border-[#1866C1] bg-blue-50 shadow-sm dark:bg-blue-950/30'
                    : 'border-gray-100 bg-white hover:border-blue-200 dark:border-gray-800 dark:bg-[#151824]'
                }`}
              >
                <h2 className="font-semibold text-[#1b254b] dark:text-white">
                  {home.name || home.id}
                </h2>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">ID: {home.id}</p>
              </button>
            ))}
          </section>
        )}
      </div>
    </main>
  );
};
