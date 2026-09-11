import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createHome,
  listHomes,
  updateHome,
  type Home,
} from '../../../shared/api/homes.api';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardContent } from '../../../components/ui/Card';

export const Homes = () => {
  const navigate = useNavigate();

  const [homes, setHomes] = useState<Home[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isCreating, setIsCreating] = useState(false);
  const [newHomeName, setNewHomeName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [editingHomeId, setEditingHomeId] = useState<string | null>(null);
  const [editingHomeName, setEditingHomeName] = useState('');

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

  const enterHome = (homeId: string) => {
    localStorage.setItem('activeHomeId', homeId);

    navigate(`/homes/${homeId}/dashboard`);
  };

  return (
    <main className="min-h-screen bg-[#f4f7fe] p-6 dark:bg-[#0f111a]">
      <div className="mx-auto max-w-6xl space-y-7">

        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1b254b] dark:text-white">
              Mis hogares
            </h1>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Administra los hogares asociados a tu cuenta.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={() => {
              setIsCreating((current) => !current);
              setError('');
            }}
          >
            + Crear hogar
          </Button>
        </header>

        {isCreating && (
          <Card className="rounded-2xl border border-gray-100 dark:border-gray-800">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-[#1b254b] dark:text-white">
                Crear nuevo hogar
              </h2>

              <div className="mt-4 space-y-4">
                <Input
                  label="Nombre del hogar"
                  type="text"
                  value={newHomeName}
                  onChange={(e) => setNewHomeName(e.target.value)}
                  maxLength={100}
                  required
                />

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="primary"
                    disabled={isSaving}
                    onClick={() => void handleCreateHome()}
                  >
                    {isSaving ? 'Guardando...' : 'Crear hogar'}
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    disabled={isSaving}
                    onClick={() => {
                      setIsCreating(false);
                      setNewHomeName('');
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300"
          >
            {error}
          </div>
        )}

        {isLoading && (
          <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm dark:bg-[#151824] dark:text-gray-400">
            Cargando hogares...
          </div>
        )}

        {!isLoading && homes.length === 0 && (
          <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm dark:bg-[#151824] dark:text-gray-400">
            No tienes hogares registrados.
          </div>
        )}

        {!isLoading && homes.length > 0 && (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {homes.map((home) => {
              const isEditing = editingHomeId === home.id;

              return (
                <Card
                  key={home.id}
                  className="rounded-2xl border border-gray-100 dark:border-gray-800"
                >
                  <CardContent className="p-6">

                    {!isEditing ? (
                      <>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h2 className="text-xl font-semibold text-[#1b254b] dark:text-white">
                              {home.name}
                            </h2>

                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                              Estado: {home.status}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 space-y-3">
                          <Button
                            type="button"
                            variant="primary"
                            className="w-full"
                            onClick={() => enterHome(home.id)}
                          >
                            Entrar al hogar
                          </Button>

                          <Button
                            type="button"
                            variant="secondary"
                            className="w-full"
                            onClick={() => startEditing(home)}
                          >
                            Editar
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <h2 className="text-lg font-semibold text-[#1b254b] dark:text-white">
                          Editar hogar
                        </h2>

                        <div className="mt-4 space-y-4">
                          <Input
                            label="Nombre del hogar"
                            type="text"
                            value={editingHomeName}
                            onChange={(e) =>
                              setEditingHomeName(e.target.value)
                            }
                            maxLength={100}
                            required
                          />

                          <div className="flex gap-3">
                            <Button
                              type="button"
                              variant="primary"
                              disabled={isSaving}
                              onClick={() =>
                                void handleUpdateHome(home.id)
                              }
                            >
                              {isSaving ? 'Guardando...' : 'Guardar'}
                            </Button>

                            <Button
                              type="button"
                              variant="secondary"
                              disabled={isSaving}
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
    </main>
  );
};