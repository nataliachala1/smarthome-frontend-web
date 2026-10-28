import { Outlet } from 'react-router-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { Navbar } from '../../components/layout/Navbar';
import { OfflineBanner } from '../../components/layout/OfflineBanner';

export const DashboardLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigationTriggerRef = useRef<HTMLButtonElement>(null);
  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
    window.requestAnimationFrame(() => navigationTriggerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!isSidebarOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeSidebar();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeSidebar, isSidebarOpen]);

  return (
    <div className="sh-app-shell flex overflow-hidden bg-background text-foreground">
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Cerrar navegación"
          onClick={closeSidebar}
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden sh-animate-fade-in"
        />
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <OfflineBanner />
        <Navbar
          isNavigationOpen={isSidebarOpen}
          menuButtonRef={navigationTriggerRef}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="min-h-0 flex-1 overflow-y-auto bg-background p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
