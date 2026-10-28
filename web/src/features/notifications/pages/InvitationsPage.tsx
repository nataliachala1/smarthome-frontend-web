import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  acceptInvitation,
  listInvitations,
  rejectInvitation,
  type Invitation,
} from '../../../shared/api/homes.api';

export const InvitationsPage = () => {
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyInvitationId, setBusyInvitationId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadInvitations = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      setInvitations(await listInvitations());
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'No fue posible cargar tus invitaciones.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInvitations();
  }, [loadInvitations]);

  const respondToInvitation = async (
    invitation: Invitation,
    action: 'accept' | 'reject',
  ) => {
    setBusyInvitationId(invitation.id);
    setError('');
    setSuccess('');

    try {
      if (action === 'accept') {
        await acceptInvitation(invitation.id);
        setSuccess('Aceptaste la invitación. El hogar ya está disponible en tu cuenta.');
      } else {
        await rejectInvitation(invitation.id);
        setSuccess('La invitación fue rechazada.');
      }

      setInvitations((current) =>
        current.filter((item) => item.id !== invitation.id),
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'No fue posible responder a la invitación.',
      );
    } finally {
      setBusyInvitationId(null);
    }
  };

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));

  return (
    <div className="min-h-full bg-[#f8fafc] px-4 py-6 dark:bg-[#0f111a] sm:px-6 lg:px-8 sh-page-enter">
      <div className="mx-auto min-h-[calc(100vh-7rem)] w-full max-w-[1240px]">
        <header className="mb-6">
          <h1 className="text-[30px] font-bold leading-9 tracking-[-0.035em] text-[#0f172a] dark:text-white sm:text-[34px]">
            Invitaciones
          </h1>
          <p className="mt-1 text-[15px] leading-6 text-[#64748b] dark:text-slate-400">
            Revisa las invitaciones que recibiste para acceder a un hogar.
          </p>
        </header>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/access')}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0d6efd] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b5ed7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d6efd]/35 focus-visible:ring-offset-2"
          >
            Invitar a una persona
          </button>
          <p className="text-sm text-[#64748b] dark:text-slate-400">
            Para enviar invitaciones y administrar accesos, ve a Accesos del hogar.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300"
          >
            <p>{error}</p>
            {!invitations.length && (
              <button
                type="button"
                onClick={() => void loadInvitations()}
                className="mt-2 font-semibold underline"
              >
                Intentar de nuevo
              </button>
            )}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300"
          >
            {success}
          </div>
        )}

        {isLoading ? (
          <div
            role="status"
            className="flex min-h-72 items-center justify-center rounded-2xl border border-[#e2e8f0] bg-white p-8 text-center text-sm text-[#64748b] dark:border-slate-700 dark:bg-[#151824] dark:text-slate-400"
          >
            Cargando invitaciones...
          </div>
        ) : error && invitations.length === 0 ? (
          <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-[#e2e8f0] bg-white px-5 py-12 text-center dark:border-slate-700 dark:bg-[#151824] sm:px-10">
            <h2 className="text-xl font-bold text-[#0f172a] dark:text-white">
              No fue posible cargar las invitaciones
            </h2>
            <button
              type="button"
              onClick={() => void loadInvitations()}
              className="mt-5 rounded-lg bg-[#0d6efd] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0b5ed7]"
            >
              Reintentar
            </button>
          </section>
        ) : invitations.length === 0 ? (
          <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-[#e2e8f0] bg-white px-5 py-12 text-center dark:border-slate-700 dark:bg-[#151824] sm:px-10">
            <span
              aria-hidden="true"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eff6ff] text-[#0d6efd] dark:bg-[#172b49] dark:text-[#75adff]"
            >
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="10" cy="7" r="4" />
                <path d="M20 8v6m3-3h-6" />
              </svg>
            </span>
            <h2 className="mt-5 text-xl font-bold text-[#0f172a] dark:text-white">
              No tienes invitaciones pendientes
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-[#64748b] dark:text-slate-400">
              Cuando alguien te invite a compartir un hogar, podrás aceptarla o rechazarla desde aquí.
            </p>
          </section>
        ) : (
          <section aria-label="Invitaciones pendientes" className="space-y-4">
            {invitations.map((invitation) => {
              const isBusy = busyInvitationId === invitation.id;

              return (
                <article
                  key={invitation.id}
                  className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#151824] sm:p-6"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-[#0f172a] dark:text-white">
                          Invitación a un hogar
                        </h2>
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                          Pendiente
                        </span>
                      </div>
                      <dl className="mt-3 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="text-[#64748b] dark:text-slate-400">
                            Identificador del hogar
                          </dt>
                          <dd className="mt-0.5 break-all font-mono text-xs text-[#334155] dark:text-slate-200">
                            {invitation.homeId}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[#64748b] dark:text-slate-400">
                            Acceso solicitado
                          </dt>
                          <dd className="mt-0.5 font-medium text-[#334155] dark:text-slate-200">
                            {invitation.role === 'GUEST' ? 'Invitado' : 'Miembro'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[#64748b] dark:text-slate-400">
                            Fecha de invitación
                          </dt>
                          <dd className="mt-0.5 text-[#334155] dark:text-slate-200">
                            {formatDate(invitation.invitedAt)}
                          </dd>
                        </div>
                        {invitation.invitedBy && (
                          <div>
                            <dt className="text-[#64748b] dark:text-slate-400">
                              Invitado por (ID)
                            </dt>
                            <dd className="mt-0.5 break-all font-mono text-xs text-[#334155] dark:text-slate-200">
                              {invitation.invitedBy}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 sm:min-w-36">
                      <button
                        type="button"
                        disabled={isBusy || busyInvitationId !== null}
                        onClick={() => void respondToInvitation(invitation, 'accept')}
                        className="min-h-10 rounded-lg bg-[#0d6efd] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0b5ed7] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isBusy ? 'Procesando...' : 'Aceptar'}
                      </button>
                      <button
                        type="button"
                        disabled={isBusy || busyInvitationId !== null}
                        onClick={() => void respondToInvitation(invitation, 'reject')}
                        className="min-h-10 rounded-lg border border-[#e2e8f0] bg-white px-4 py-2 text-sm font-semibold text-[#475569] transition hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
};
