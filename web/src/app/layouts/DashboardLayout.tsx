import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { Navbar } from '../../components/layout/Navbar';
import { OfflineBanner } from '../../components/layout/OfflineBanner';

export const DashboardLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen overflow-hidden">
      {isSidebarOpen && <button type="button" aria-label="Cerrar navegación" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" />}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <OfflineBanner />
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,_rgba(24,102,193,0.08),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(135,206,235,0.08),_transparent_22%)] dark:bg-[#07080f] p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
