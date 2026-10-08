import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createHome,
  deleteHome,
  listHomes,
  updateHome,
  type Home,
} from '../../../shared/api/homes.api';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardContent } from '../../../components/ui/Card';
import { useAuth } from '../../../app/contexts/AuthContext';

export const Homes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [homes, setHomes] = useState<Home[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isCreating, setIsCreating] = useState(false);
  const [newHomeName, setNewHomeName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [editingHomeId, setEditingHomeId] = useState<string | null>(null);
  const [editingHomeName, setEditingHomeName] = useState('');
  const [deletingHomeId, setDeletingHomeId] = useState<string | null>(null);

  const loadHomes = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await listHomes();
      setHomes(response);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'No fue posible cargar los hogares.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHomes();
  }, [loadHomes]);

  const handleCreateHome = async () => {
    const name = newHomeName.trim();

    if (!name) {
      setError('Debes ingresar un nombre para el hogar.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await createHome({ name });

      setNewHomeName('');
      setIsCreating(false);

      await loadHomes();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'No fue posible crear el hogar.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = (home: Home) => {
    if (home.createdBy !== user?.id) return;
    setEditingHomeId(home.id);
    setEditingHomeName(home.name);
    setError('');
  };

  const cancelEditing = () => {
    setEditingHomeId(null);
    setEditingHomeName('');
  };

  const handleUpdateHome = async (homeId: string) => {
    const name = editingHomeName.trim();

    if (!name) {
      setError('El nombre del hogar no puede estar vacío.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await updateHome(homeId, { name });

      cancelEditing();

      await loadHomes();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'No fue posible actualizar el hogar.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteHome = async (home: Home) => {
    const confirmed = window.confirm(
      `¿Eliminar el hogar "${home.name}"? Esta acción no se puede deshacer. Solo se pueden eliminar hogares sin dispositivos.`,
    );
    if (!confirmed) return;

    setDeletingHomeId(home.id);
    setError('');

    try {
      await deleteHome(home.id);

      const remainingHomes = homes.filter((item) => item.id !== home.id);
      setHomes(remainingHomes);

      if (localStorage.getItem('activeHomeId') === home.id) {
        if (remainingHomes.length > 0) {
          localStorage.setItem('activeHomeId', remainingHomes[0].id);
        } else {
          localStorage.removeItem('activeHomeId');
        }
      }

      if (editingHomeId === home.id) {
        cancelEditing();
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'No fue posible eliminar el hogar.',
      );
    } finally {
      setDeletingHomeId(null);
    }
  };

  const enterHome = (homeId: string) => {
    localStorage.setItem('activeHomeId', homeId);

    navigate(`/homes/${homeId}/dashboard`);
  };

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[1400px] flex-col px-1 py-3 text-[#0f172a] dark:text-slate-100 sm:px-2 sm:py-4">
      <header className="flex flex-col gap-5 border-b border-[#e2e8f0] pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[30px] font-bold leading-9 tracking-[-0.035em] text-[#0f172a] dark:text-white sm:text-[32px]">
            Mis hogares
          </h1>

          <p className="mt-1 text-base leading-6 text-[#64748b] dark:text-slate-400">
            Administra los hogares asociados a tu cuenta.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsCreating((current) => !current);
            setError('');
          }}
          aria-expanded={isCreating}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[11px] bg-[#0d6efd] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0b5ed7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d6efd]/35 focus-visible:ring-offset-2 sm:self-center"
        >
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
          </svg>
          Crear hogar
        </button>
      </header>

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300"
        >
          {error}
        </div>
      )}

      {isCreating && (
        <form
          className="mx-auto mt-8 w-full max-w-lg"
          onSubmit={(event) => {
            event.preventDefault();
            void handleCreateHome();
          }}
        >
          <h2 className="text-lg font-semibold text-[#0f172a] dark:text-white">
            Crear nuevo hogar
          </h2>

          <div className="mt-4 space-y-4">
            <Input
              label="Nombre del hogar"
              type="text"
              value={newHomeName}
              onChange={(event) => setNewHomeName(event.target.value)}
              maxLength={100}
              required
              className="rounded-lg border-[#e2e8f0] shadow-none focus:border-[#0d6efd] focus:ring-[#0d6efd]/15"
            />

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex h-11 items-center justify-center rounded-[11px] bg-[#0d6efd] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0b5ed7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d6efd]/35 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? 'Guardando...' : 'Crear hogar'}
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={() => {
                  setIsCreating(false);
                  setNewHomeName('');
                  setError('');
                }}
                className="inline-flex h-11 items-center justify-center rounded-[11px] border border-[#e2e8f0] bg-white px-5 text-sm font-medium text-[#475569] transition-colors hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d6efd]/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-[#151824] dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      )}

      {isLoading && (
        <div className="flex flex-1 items-center justify-center py-16 text-sm text-[#64748b] dark:text-slate-400">
          Cargando hogares...
        </div>
      )}

      {!isLoading && !isCreating && homes.length === 0 && (
        <section className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
          <div className="flex h-[84px] w-[84px] items-center justify-center rounded-full bg-[#eff6ff] text-[#0d6efd] dark:bg-[#172b49] dark:text-[#75adff]">
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" d="M12 5v14M5 12h14" />
            </svg>
          </div>

          <h2 className="mt-6 text-[25px] font-bold leading-8 tracking-[-0.025em] text-[#0f172a] dark:text-white sm:text-[28px]">
            Aún no tienes hogares
          </h2>
          <p className="mt-2 max-w-[580px] text-base leading-6 text-[#64748b] dark:text-slate-400">
            Crea tu primer hogar para comenzar a administrar tus dispositivos y controlar todo en un solo lugar.
          </p>

          <button
            type="button"
            onClick={() => {
              setIsCreating(true);
              setError('');
            }}
            className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-[11px] bg-[#0d6efd] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0b5ed7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d6efd]/35 focus-visible:ring-offset-2"
          >
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" d="M12 5v14M5 12h14" />
            </svg>
            Crear mi primer hogar
          </button>
        </section>
      )}

      {!isLoading && homes.length > 0 && (
        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {homes.map((home) => {
            const isEditing = editingHomeId === home.id;

            return (
              <Card
                key={home.id}
                className="rounded-xl border border-[#e2e8f0] shadow-[0_2px_8px_rgba(15,23,42,0.04)] dark:border-slate-700"
              >
                <CardContent className="p-6">
                  {!isEditing ? (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-xl font-semibold text-[#0f172a] dark:text-white">
                            {home.name}
                          </h2>

                          <p className="mt-2 text-sm text-[#64748b] dark:text-slate-400">
                            Estado: {home.status}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 space-y-3">
                        <Button
                          type="button"
                          variant="primary"
                          className="w-full rounded-[11px] bg-[#0d6efd] shadow-none hover:bg-[#0b5ed7]"
                          disabled={deletingHomeId !== null}
                          onClick={() => enterHome(home.id)}
                        >
                          Entrar al hogar
                        </Button>
                        {home.createdBy === user?.id && (
                          <Button
                            type="button"
                            variant="secondary"
                            className="w-full rounded-[11px]"
                            disabled={isSaving || deletingHomeId !== null}
                            onClick={() => startEditing(home)}
                          >
                            Editar nombre
                          </Button>
                        )}

                        {home.createdBy === user?.id && (
                          <Button
                            type="button"
                            variant="secondary"
                            className="w-full rounded-[11px] border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/30"
                            disabled={isSaving || deletingHomeId !== null}
                            onClick={() => void handleDeleteHome(home)}
                          >
                            {deletingHomeId === home.id ? 'Eliminando...' : 'Eliminar hogar'}
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="text-lg font-semibold text-[#0f172a] dark:text-white">
                        Editar hogar
                      </h2>

                      <div className="mt-4 space-y-4">
                        <Input
                          label="Nombre del hogar"
                          type="text"
                          value={editingHomeName}
                          onChange={(event) => setEditingHomeName(event.target.value)}
                          maxLength={100}
                          required
                        />

                        <div className="flex gap-3">
                          <Button
                            type="button"
                            variant="primary"
                            disabled={isSaving || deletingHomeId !== null}
                            onClick={() => void handleUpdateHome(home.id)}
                          >
                            {isSaving ? 'Guardando...' : 'Guardar'}
                          </Button>

                          <Button
                            type="button"
                            variant="secondary"
                            disabled={isSaving || deletingHomeId !== null}
                            onClick={cancelEditing}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
};