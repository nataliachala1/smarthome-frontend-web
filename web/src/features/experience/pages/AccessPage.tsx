import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useAuth } from '../../../app/contexts/AuthContext';
import {
  inviteMember,
  listHomes,
  listMembers,
  revokeMember,
  updateMemberRole,
  type Home,
  type HomeMember,
} from '../../../shared/api/homes.api';

const panelClass =
  'rounded-2xl border border-[#e2e8f0] bg-white shadow-sm dark:border-slate-700 dark:bg-[#151824]';

const roleLabel = (role: string) => {
  if (role === 'OWNER') return 'Propietario';
  if (role === 'GUEST') return 'Invitado';
  return 'Miembro';
};

const statusLabel = (status: string) => {
  if (status === 'PENDING') return 'Invitación pendiente';
  if (status === 'ACTIVE') return 'Acceso activo';
  return 'Acceso no activo';
};

const PersonIcon = () => (
  <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M5 21a7 7 0 0 1 14 0" />
  </svg>
);

const HomeIcon = () => (
  <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 10 9-7 9 7" />
    <path d="M5 9v11h14V9M9 20v-6h6v6" />
  </svg>
);

export const AccessPage = () => {
  const { user } = useAuth();
  const [homes, setHomes] = useState<Home[]>([]);
  const [selectedHomeId, setSelectedHomeId] = useState('');
  const [members, setMembers] = useState<HomeMember[]>([]);
  const membersRequestId = useRef(0);
  const [isLoadingHomes, setIsLoadingHomes] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [homesLoadError, setHomesLoadError] = useState('');
  const [membersLoadError, setMembersLoadError] = useState('');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'MEMBER' | 'GUEST'>('MEMBER');
  const [isSaving, setIsSaving] = useState(false);
  const [busyMemberId, setBusyMemberId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedHome = useMemo(
    () => homes.find((home) => home.id === selectedHomeId) ?? null,
    [homes, selectedHomeId],
  );

  const currentMembership = members.find(
    (member) =>
      member.homeId === selectedHomeId &&
      member.userId === user?.id &&
      member.status === 'ACTIVE',
  );
  const isOwner = currentMembership?.role === 'OWNER';

  const loadHomes = useCallback(async () => {
    setIsLoadingHomes(true);
    setHomesLoadError('');
    setError('');

    try {
      const availableHomes = await listHomes();
      setHomes(availableHomes);
      setSelectedHomeId((currentId) => {
        const storedHomeId = localStorage.getItem('activeHomeId');
        const preferredId = currentId || storedHomeId || '';
        const selectedId = availableHomes.some((home) => home.id === preferredId)
          ? preferredId
          : availableHomes[0]?.id ?? '';

        if (selectedId) {
          localStorage.setItem('activeHomeId', selectedId);
        }

        return selectedId;
      });
    } catch (cause) {
      setHomesLoadError(
        cause instanceof Error
          ? cause.message
          : 'No fue posible cargar tus hogares.',
      );
    } finally {
      setIsLoadingHomes(false);
    }
  }, []);

  const loadMembers = useCallback(async (homeId: string) => {
    const requestId = ++membersRequestId.current;

    setMembers([]);
    setMembersLoadError('');
    setError('');

    if (!homeId) {
      setIsLoadingMembers(false);
      return;
    }

    setIsLoadingMembers(true);

    try {
      const response = await listMembers(homeId);

      if (requestId !== membersRequestId.current) return;
      if (homeId !== selectedHomeId) return;

      setMembers(response);
    } catch (cause) {
      if (requestId !== membersRequestId.current) return;

      setMembers([]);
      setMembersLoadError(
        cause instanceof Error
          ? cause.message
          : 'No fue posible verificar los accesos del hogar.',
      );
    } finally {
      if (requestId === membersRequestId.current) {
        setIsLoadingMembers(false);
      }
    }
  }, [selectedHomeId]);

  useEffect(() => {
    void loadHomes();
  }, [loadHomes]);

  useEffect(() => {
    if (selectedHomeId) {
      void loadMembers(selectedHomeId);
    }
  }, [loadMembers, selectedHomeId]);

  const handleInvite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedHomeId || !isOwner) {
      setError('Selecciona un hogar antes de enviar una invitación.');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      await inviteMember(selectedHomeId, { email: email.trim(), role });
      setEmail('');
      setIsInviteOpen(false);
      setSuccess('La invitación se envió correctamente por correo.');
      await loadMembers(selectedHomeId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible enviar la invitación.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRoleChange = async (member: HomeMember, nextRole: 'MEMBER' | 'GUEST') => {
    if (!selectedHomeId || !isOwner) return;

    setBusyMemberId(member.id);
    setError('');
    setSuccess('');

    try {
      await updateMemberRole(selectedHomeId, member.id, nextRole);
      setSuccess('El rol se actualizó correctamente.');
      await loadMembers(selectedHomeId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible actualizar el rol.');
    } finally {
      setBusyMemberId(null);
    }
  };

  const handleRevoke = async (member: HomeMember) => {
    if (!selectedHomeId || !isOwner) return;

    const confirmed = window.confirm('¿Quieres retirar este acceso al hogar?');
    if (!confirmed) return;

    setBusyMemberId(member.id);
    setError('');
    setSuccess('');

    try {
      await revokeMember(selectedHomeId, member.id);
      setMembers((current) => current.filter((item) => item.id !== member.id));
      setSuccess('El acceso se retiró correctamente.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible retirar el acceso.');
    } finally {
      setBusyMemberId(null);
    }
  };

  const visibleMembers = members.filter(
    (member) => member.status === 'ACTIVE' || member.status === 'PENDING',
  );
  const canManageMember = (member: HomeMember) =>
    isOwner && member.role !== 'OWNER' && (member.status === 'ACTIVE' || member.status === 'PENDING');

  return (
    <div className="mx-auto w-full max-w-[1000px] text-[#0f172a] dark:text-slate-100">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#71819b] dark:text-slate-400">Hogares</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#0f172a] dark:text-white sm:text-[34px]">Accesos del hogar</h1>
        <p className="mt-1 text-[15px] leading-6 text-[#64748b] dark:text-slate-400">
          Comparte tu hogar y administra quién puede acceder.
        </p>
      </header>

      {error && (
        <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300">
          {success}
        </div>
      )}

      {isLoadingHomes ? (
        <div className={`${panelClass} px-5 py-12 text-center text-sm text-[#64748b] dark:text-slate-400`}>
          Cargando hogares...
        </div>
      ) : homesLoadError ? (
        <section role="alert" className={`${panelClass} flex min-h-72 flex-col items-center justify-center px-6 py-10 text-center`}>
          <h2 className="text-lg font-semibold text-[#0f172a] dark:text-white">No fue posible cargar tus hogares</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-[#64748b] dark:text-slate-400">{homesLoadError}</p>
          <button
            type="button"
            onClick={() => void loadHomes()}
            className="mt-4 rounded-lg bg-[#0d6efd] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0b5ed7]"
          >
            Reintentar
          </button>
        </section>
      ) : homes.length === 0 ? (
        <section className={`${panelClass} flex min-h-72 flex-col items-center justify-center px-6 py-10 text-center`}>
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eff6ff] text-[#1677f2] dark:bg-[#172b49] dark:text-[#75adff]">
            <HomeIcon />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-[#0f172a] dark:text-white">Aún no tienes hogares</h2>
          <p className="mt-1 max-w-md text-sm leading-6 text-[#64748b] dark:text-slate-400">
            Crea un hogar primero y luego podrás invitar a otras personas a compartir el acceso.
          </p>
        </section>
      ) : (
        <>
          <section className={`${panelClass} mb-5 p-4 sm:p-5`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#eff6ff] text-[#1677f2] dark:bg-[#172b49] dark:text-[#75adff]">
                  <HomeIcon />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-[#71819b] dark:text-slate-400">Hogar actual</p>
                  <p className="truncate text-base font-semibold text-[#0f172a] dark:text-white">{selectedHome?.name ?? 'Selecciona un hogar'}</p>
                  <p className="mt-0.5 text-xs text-[#64748b] dark:text-slate-400">Aquí puedes revisar y compartir el acceso.</p>
                </div>
              </div>

              {homes.length > 1 && (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <label className="sr-only" htmlFor="access-home-select">Seleccionar hogar</label>
                  <select
                    id="access-home-select"
                    value={selectedHomeId}
                    onChange={(event) => {
                      setSelectedHomeId(event.target.value);
                      localStorage.setItem('activeHomeId', event.target.value);
                      setSuccess('');
                    }}
                    className="h-11 min-w-0 rounded-xl border border-[#e2e8f0] bg-white px-3 text-sm text-[#334155] outline-none focus:border-[#1677f2] focus:ring-2 focus:ring-[#1677f2]/15 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 sm:min-w-48"
                  >
                    {homes.map((home) => <option key={home.id} value={home.id}>{home.name}</option>)}
                  </select>
                </div>
              )}
            </div>
          </section>

          <section className={`${panelClass} p-5 sm:p-6`} aria-labelledby="members-heading">
              <div className="flex flex-col gap-4 border-b border-[#edf1f5] pb-5 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 id="members-heading" className="text-xl font-bold text-[#0f172a] dark:text-white">Compartir acceso al hogar</h2>
                  <p className="mt-1 text-sm leading-6 text-[#64748b] dark:text-slate-400">
                    Invita personas a usar {selectedHome?.name ?? 'este hogar'} y administra sus accesos.
                  </p>
                </div>
                {isOwner && (

                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setSuccess('');
                    setIsInviteOpen(true);
                  }}
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0d6efd] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0b5ed7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1677f2]/40 focus-visible:ring-offset-2"
                >
                  <span aria-hidden="true" className="text-xl leading-none">+</span>
                  Invitar a una persona
                </button>
                )}
              </div>
              <div className="mb-4 mt-5">
                <h3 className="text-base font-semibold text-[#0f172a] dark:text-white">Personas con acceso</h3>
                <p className="mt-1 text-sm text-[#64748b] dark:text-slate-400">
                  Revisa quién puede entrar y qué tipo de acceso tiene.
                </p>
              </div>

            {isLoadingMembers ? (
              <div className="py-10 text-center text-sm text-[#64748b] dark:text-slate-400">Cargando accesos...</div>
            ) : membersLoadError ? (
              <div role="alert" className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-red-200 px-5 py-8 text-center dark:border-red-900/50">
                <p className="text-sm text-red-700 dark:text-red-300">{membersLoadError}</p>
                <button
                  type="button"
                  onClick={() => void loadMembers(selectedHomeId)}
                  className="mt-3 rounded-lg bg-[#0d6efd] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0b5ed7]"
                >
                  Reintentar
                </button>
              </div>
            ) : visibleMembers.length === 0 ? (
              <div className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed border-[#d8e0eb] px-5 py-8 text-center dark:border-slate-700">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f1f5f9] text-[#64748b] dark:bg-slate-800 dark:text-slate-300"><PersonIcon /></span>
                <h3 className="mt-3 text-base font-semibold text-[#0f172a] dark:text-white">Aún no hay accesos compartidos</h3>
                <p className="mt-1 max-w-md text-sm leading-6 text-[#64748b] dark:text-slate-400">Invita a una persona para que pueda acceder a este hogar.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {visibleMembers.map((member) => (
                  <li key={member.id} className="flex flex-col gap-3 rounded-xl border border-[#e6ebf2] bg-[#f8fafc] p-4 dark:border-slate-700 dark:bg-slate-900/50 sm:flex-row sm:items-center">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#d9f4e1] text-lg font-semibold text-[#258348] dark:bg-emerald-950/50 dark:text-emerald-300">
                      <PersonIcon />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#0f172a] dark:text-white">{roleLabel(member.role)}</p>
                      <p className="mt-0.5 text-xs text-[#64748b] dark:text-slate-400">{statusLabel(member.status)}</p>
                    </div>
                    {canManageMember(member) && (
                      <div className="flex items-center gap-2">
                        <label className="sr-only" htmlFor={`member-role-${member.id}`}>Rol del acceso</label>
                        <select
                          id={`member-role-${member.id}`}
                          value={member.role === 'GUEST' ? 'GUEST' : 'MEMBER'}
                          disabled={busyMemberId === member.id}
                          onChange={(event) => {
                            const nextRole = event.target.value;
                            if (nextRole === 'MEMBER' || nextRole === 'GUEST') {
                              void handleRoleChange(member, nextRole);
                            }
                          }}
                          className="h-10 min-w-32 rounded-lg border border-[#dce4ef] bg-white px-2.5 text-sm text-[#334155] outline-none focus:border-[#1677f2] disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        >
                          <option value="MEMBER">Miembro</option>
                          <option value="GUEST">Invitado</option>
                        </select>
                        <button
                          type="button"
                          disabled={busyMemberId === member.id}
                          onClick={() => void handleRevoke(member)}
                          aria-label={`Retirar acceso de ${roleLabel(member.role).toLowerCase()}`}
                          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/30"
                        >
                          <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18m-2 0-.9 14H5.9L5 6m3 0V4h8v2m-7 4v6m4-6v6" />
                          </svg>
                        </button>
                      </div>
                    )}
                    {!canManageMember(member) && (
                      <span className="self-start rounded-full bg-[#eaf2ff] px-3 py-1 text-xs font-semibold text-[#1764b0] dark:bg-[#172b49] dark:text-[#9cc4ff] sm:self-center">
                        {roleLabel(member.role)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {isInviteOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/65 sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSaving) setIsInviteOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-heading"
            className="max-h-[92dvh] w-full overflow-y-auto rounded-t-[24px] border border-[#e2e8f0] bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl dark:border-slate-700 dark:bg-[#151824] sm:max-w-xl sm:rounded-2xl sm:p-7"
          >
            <div className="mx-auto mb-5 h-1.5 w-14 rounded-full bg-[#d2d7df] sm:hidden" />
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="invite-heading" className="text-xl font-bold text-[#0f172a] dark:text-white">Invitación a casa</h2>
                <p className="mt-1 text-sm text-[#64748b] dark:text-slate-400">{selectedHome?.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                disabled={isSaving}
                aria-label="Cerrar invitación"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#64748b] hover:bg-[#f1f5f9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1677f2]/30 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" /></svg>
              </button>
            </div>

            <div className="mb-5 flex gap-3 rounded-xl bg-[#eaf4ff] p-4 text-sm leading-6 text-[#245780] dark:bg-[#172b49] dark:text-[#bedaff]">
              <svg aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#1677f2]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" d="M12 11v5m0-8h.01" /></svg>
              <p>La invitación se enviará al correo de una cuenta activa de Smart Home. El rol define el tipo de acceso al hogar.</p>
            </div>

            <form onSubmit={(event) => void handleInvite(event)} className="space-y-4">
              <div>
                <label htmlFor="invite-email" className="mb-1.5 block text-sm font-medium text-[#334155] dark:text-slate-200">Correo electrónico</label>
                <input
                  id="invite-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nombre@ejemplo.com"
                  className="h-12 w-full rounded-xl border border-[#cfd8e5] bg-white px-4 text-base text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#1677f2] focus:ring-2 focus:ring-[#1677f2]/15 dark:border-slate-700 dark:bg-[#111827] dark:text-white dark:placeholder:text-slate-500"
                />
              </div>

              <fieldset>
                <legend className="mb-1.5 block text-sm font-medium text-[#334155] dark:text-slate-200">
                  Tipo de acceso
                </legend>
                <div
                  role="group"
                  aria-label="Rol de la persona invitada"
                  className="grid grid-cols-2 gap-3"
                >
                  {([
                    ['MEMBER', 'Miembro'],
                    ['GUEST', 'Invitado'],
                  ] as const).map(([value, label]) => {
                    const isSelected = role === value;

                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setRole(value)}
                        className={`min-h-12 rounded-xl border px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1677f2]/30 ${
                          isSelected
                            ? 'border-[#1677f2] bg-[#eaf4ff] text-[#1455a0] dark:bg-[#172b49] dark:text-[#bedaff]'
                            : 'border-[#cfd8e5] bg-white text-[#475569] hover:bg-[#f8fafc] dark:border-slate-700 dark:bg-[#111827] dark:text-slate-200'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1.5 text-xs leading-5 text-[#64748b] dark:text-slate-400">
                  La persona invitada será Miembro o Invitado. Propietario es el rol de quien administra y envía la invitación.
                </p>
              </fieldset>

              {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  disabled={isSaving}
                  className="h-11 rounded-xl border border-[#dce4ef] px-5 text-sm font-semibold text-[#475569] transition hover:bg-[#f8fafc] disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="h-11 rounded-xl bg-[#0d6efd] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0b5ed7] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? 'Enviando...' : 'Enviar invitación'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};
