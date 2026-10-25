import { useOffline } from '../../app/contexts/OfflineContext';

export const OfflineBanner = () => {
  const { isOnline } = useOffline();

  if (isOnline) return null;

  return (
    <div className="bg-[#fffbeb] text-[#92400e] dark:bg-[#78350f] dark:text-[#fde68a] px-4 py-2 text-sm border-b border-[#f59e0b] shadow-sm">
      <span className="mr-2">🌐</span>
      Sin conexión a internet. Trabajando en modo offline.
    </div>
  );
};
