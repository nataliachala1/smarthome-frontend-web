import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import LoginIcon from '@mui/icons-material/Login';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  createHome,
  deleteHome,
  listHomes,
  listMembers,
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
  const [ownerHomeIds, setOwnerHomeIds] = useState<Set<string>>(new Set());
  const homesRequestId = useRef(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isCreating, setIsCreating] = useState(false);
  const [newHomeName, setNewHomeName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [editingHomeId, setEditingHomeId] = useState<string | null>(null);
  const [editingHomeName, setEditingHomeName] = useState('');
  const [deletingHomeId, setDeletingHomeId] = useState<string | null>(null);

  const loadHomes = useCallback(async () => {
    const requestId = ++homesRequestId.current;

    setIsLoading(true);
    setError('');
    setOwnerHomeIds(new Set());

    try {
      const response = await listHomes();

      if (requestId !== homesRequestId.current) return;

      setHomes(response);

      const membershipChecks = await Promise.all(
        response.map(async (home) => {
          if (!user?.id) {
            return {
              homeId: home.id,
              isOwner: false,
              verificationFailed: false,
            };
          }

          try {
            const members = await listMembers(home.id);
            const membership = members.find(
              (member) =>
                member.homeId === home.id &&
                member.userId === user.id &&
                member.status === 'ACTIVE',
            );

            return {
              homeId: home.id,
              isOwner: membership?.role === 'OWNER',
              verificationFailed: false,
            };
          } catch {
            return {
              homeId: home.id,
              isOwner: false,
              verificationFailed: true,
            };
          }
        }),
      );

      if (requestId !== homesRequestId.current) return;

      setOwnerHomeIds(
        new Set(
          membershipChecks
            .filter((result) => result.isOwner)
            .map((result) => result.homeId),
        ),
      );

      if (membershipChecks.some((result) => result.verificationFailed)) {
        setError(
          'No fue posible verificar los permisos de uno o más hogares. Las acciones administrativas permanecerán ocultas.',
        );
      }
    } catch (cause) {
      if (requestId !== homesRequestId.current) return;

      setHomes([]);
      setOwnerHomeIds(new Set());
      setError(
        cause instanceof Error
          ? cause.message
          : 'No fue posible cargar los hogares.',
      );
    } finally {
      if (requestId === homesRequestId.current) {
        setIsLoading(false);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    void loadHomes();
  }, [loadHomes]);
  const isHomeOwner = (homeId: string) =>
    ownerHomeIds.has(homeId);

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
    if (!isHomeOwner(home.id)) return;
    setEditingHomeId(home.id);
    setEditingHomeName(home.name);
    setError('');
  };

  const cancelEditing = () => {
    setEditingHomeId(null);
    setEditingHomeName('');
  };

  const handleUpdateHome = async (homeId: string) => {
    if (!isHomeOwner(homeId)) {
      setError('Solo el propietario activo puede modificar este hogar.');
      return;
    }

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
    if (!isHomeOwner(home.id)) {
      setError('Solo el propietario activo puede eliminar este hogar.');
      return;
    }

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
    <div className="mx-auto flex min-h-full w-full max-w-[1400px] flex-col px-1 py-3 text-[#0f172a] dark:text-slate-100 sm:px-2 sm:py-4 sh-page-enter">
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
        <section className="mt-8 grid gap-5 md:grid-cols-2">
          {homes.map((home) => {
            const isEditing = editingHomeId === home.id;

            return (
              <Card
                key={home.id}
                noPadding
                className="h-full rounded-[26px] border-[#e5edf7] shadow-[0_12px_30px_-24px_rgba(15,55,100,0.38)] transition-[border-color,box-shadow] duration-200 ease-out hover:border-[#d5e5f8] hover:shadow-[0_18px_36px_-25px_rgba(15,55,100,0.42)] motion-reduce:transition-none dark:border-slate-700 dark:hover:border-slate-600"
              >
                <CardContent className="flex h-full min-h-[356px] flex-col p-5 sm:min-h-[382px] sm:p-7">
                  {!isEditing ? (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-[#edf6ff] text-[#1683ec] sm:h-[68px] sm:w-[68px] dark:bg-[#172b49] dark:text-[#75adff]">
                            <HomeOutlinedIcon aria-hidden="true" className="h-8 w-8 sm:h-9 sm:w-9" />
                          </span>
                          <div className="min-w-0">
                            <h2 className="break-words text-xl font-semibold tracking-[-0.02em] text-[#10294f] dark:text-white sm:text-2xl">
                              {home.name}
                            </h2>

                            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#71829d] dark:text-slate-400 sm:text-base">
                              <span
                                aria-hidden="true"
                                className={`h-2.5 w-2.5 shrink-0 rounded-full ${home.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`}
                              />
                              <span>Estado: {home.status}</span>
                            </p>
                          </div>
                        </div>
                        <span aria-hidden="true" className="mt-0.5 flex shrink-0 text-[#60799d] dark:text-slate-400">
                          <MoreVertIcon className="h-6 w-6" />
                        </span>
                      </div>

                      <div className="mt-auto space-y-3 pt-6">
                        <Button
                          type="button"
                          variant="primary"
                          className="flex min-h-[54px] w-full items-center justify-start rounded-[18px] border border-transparent bg-[#1866C1] px-4 py-2 text-left text-[15px] font-semibold text-white shadow-sm shadow-[#1866C1]/15 transition-[background-color,box-shadow] duration-200 ease-out hover:bg-[#165bb0] hover:shadow-md hover:shadow-[#1866C1]/15 focus-visible:ring-2 focus-visible:ring-[#1683ec]/40 focus-visible:ring-offset-2 motion-reduce:transition-none sm:min-h-14"
                          disabled={deletingHomeId !== null}
                          onClick={() => enterHome(home.id)}
                        >
                          <span className="grid w-full grid-cols-[44px_minmax(0,1fr)_20px] items-center gap-3">
                            <span className="flex h-8 w-11 shrink-0 items-center justify-center">
                              <LoginIcon aria-hidden="true" className="h-5 w-5" />
                            </span>
                            <span className="min-w-0">Entrar al hogar</span>
                            <ChevronRightIcon aria-hidden="true" className="h-5 w-5 shrink-0" />
                          </span>
                        </Button>
                        {isHomeOwner(home.id) && (
                          <Button
                            type="button"
                            variant="secondary"
                            className="flex min-h-[54px] w-full items-center justify-start rounded-[18px] border border-[#deebf8] bg-[#f7faff] px-4 py-2 text-left text-[15px] font-semibold text-[#19355e] transition-[background-color,border-color] duration-200 ease-out hover:border-[#d2e2f2] hover:bg-[#f0f6fd] focus-visible:ring-2 focus-visible:ring-[#1683ec]/35 focus-visible:ring-offset-2 motion-reduce:transition-none dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-800 sm:min-h-14"
                            disabled={isSaving || deletingHomeId !== null}
                            onClick={() => startEditing(home)}
                          >
                            <span className="grid w-full grid-cols-[44px_minmax(0,1fr)_20px] items-center gap-3">
                              <span className="flex h-8 w-11 shrink-0 items-center justify-center">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f1fb] text-[#5279a7] dark:bg-slate-800 dark:text-blue-300">
                                  <EditOutlinedIcon aria-hidden="true" className="h-4 w-4" />
                                </span>
                              </span>
                              <span className="min-w-0">Editar nombre</span>
                              <ChevronRightIcon aria-hidden="true" className="h-5 w-5 shrink-0 text-[#7890aa] dark:text-slate-400" />
                            </span>
                          </Button>
                        )}

                        {isHomeOwner(home.id) && (
                          <Button
                            type="button"
                            variant="secondary"
                            className="flex min-h-[54px] w-full items-center justify-start rounded-[18px] border border-[#f2dfe2] bg-[#fff6f7] px-4 py-2 text-left text-[15px] font-semibold text-[#cf4e59] transition-[background-color,border-color] duration-200 ease-out hover:border-[#ebd2d6] hover:bg-[#fff1f3] focus-visible:ring-2 focus-visible:ring-rose-300/50 focus-visible:ring-offset-2 motion-reduce:transition-none dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-300 dark:hover:border-red-900 dark:hover:bg-red-950/35 sm:min-h-14"
                            disabled={isSaving || deletingHomeId !== null}
                            onClick={() => void handleDeleteHome(home)}
                          >
                            <span className="grid w-full grid-cols-[44px_minmax(0,1fr)_20px] items-center gap-3">
                              <span className="flex h-8 w-11 shrink-0 items-center justify-center">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fbe8ea] text-[#d65a64] dark:bg-red-950/60 dark:text-red-300">
                                  <DeleteOutlineIcon aria-hidden="true" className="h-4 w-4" />
                                </span>
                              </span>
                              <span className="min-w-0">
                                {deletingHomeId === home.id ? 'Eliminando...' : 'Eliminar hogar'}
                              </span>
                              <ChevronRightIcon aria-hidden="true" className="h-5 w-5 shrink-0 text-[#d8868d] dark:text-red-300" />
                            </span>
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
