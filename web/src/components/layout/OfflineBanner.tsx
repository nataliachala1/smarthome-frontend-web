import { useOffline } from '../../app/contexts/OfflineContext';

export const OfflineBanner = () => {
  const { isOnline } = useOffline();

  if (isOnline) return null;

  return (
    <div role="status" aria-live="polite" className="flex min-h-10 items-center justify-center gap-2 border-b border-[#f2d28a] bg-[#fffbeb] px-4 py-2 text-center text-sm text-[#92400e] shadow-sm motion-reduce:animate-none dark:border-amber-700 dark:bg-[#78350f] dark:text-[#fde68a] sh-animate-fade-in-down">
      <span aria-hidden="true" className="shrink-0">🌐</span>
      Sin conexión a internet. Trabajando en modo offline.
    </div>
  );
};
