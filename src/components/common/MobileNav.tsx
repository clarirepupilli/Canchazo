import React from 'react';
import { useApp } from '../../context/AppContext';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  ownerMode?: 'client' | 'admin';
  setOwnerMode?: (mode: 'client' | 'admin') => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab, ownerMode = 'admin', setOwnerMode }) => {
  const { userRole } = useApp();
  const isOwnerClientMode = userRole === 'owner' && ownerMode === 'client';

  const navButtonClass = (active: boolean): string =>
    `flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all ${
      active ? 'text-[#10b981] font-bold scale-105' : 'text-gray-500 hover:text-gray-900'
    }`;

  const toggleButtonClass = 'flex flex-col items-center justify-center w-14 h-12 rounded-xl text-[#006c49] dark:text-[#6ffbbe] bg-[#10b981]/10 border border-[#10b981]/30 transition-all';

  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center h-16 pb-safe px-4 bg-white dark:bg-[#111c2d] rounded-t-2xl shadow-[0_-4px_12px_rgba(0,0,0,0.1)] border-t border-[#bbcabf]/30">
      {userRole === 'player' ? (
        <>
          <button
            onClick={() => setActiveTab('search')}
            className={navButtonClass(activeTab === 'search')}
          >
            <span className={`material-symbols-outlined text-2xl ${activeTab === 'search' ? 'fill' : ''}`}>
              search
            </span>
            <span className="text-[11px] font-semibold mt-0.5">Buscar</span>
          </button>

          <button
            onClick={() => setActiveTab('my-bookings')}
            className={navButtonClass(activeTab === 'my-bookings')}
          >
            <span className={`material-symbols-outlined text-2xl ${activeTab === 'my-bookings' ? 'fill' : ''}`}>
              event_available
            </span>
            <span className="text-[11px] font-semibold mt-0.5">Reservas</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={navButtonClass(activeTab === 'favorites')}
          >
            <span className={`material-symbols-outlined text-2xl ${activeTab === 'favorites' ? 'fill' : ''}`}>
              favorite
            </span>
            <span className="text-[11px] font-semibold mt-0.5">Favoritos</span>
          </button>
        </>
      ) : isOwnerClientMode ? (
        <>
          <button
            onClick={() => setOwnerMode && setOwnerMode('admin')}
            className={toggleButtonClass}
            title="Ir al Panel de Administración"
          >
            <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
            <span className="text-[11px] font-semibold mt-0.5">Panel</span>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={navButtonClass(activeTab === 'search')}
          >
            <span className={`material-symbols-outlined text-2xl ${activeTab === 'search' ? 'fill' : ''}`}>
              search
            </span>
            <span className="text-[11px] font-semibold mt-0.5">Buscar</span>
          </button>

          <button
            onClick={() => setActiveTab('my-bookings')}
            className={navButtonClass(activeTab === 'my-bookings')}
          >
            <span className={`material-symbols-outlined text-2xl ${activeTab === 'my-bookings' ? 'fill' : ''}`}>
              event_available
            </span>
            <span className="text-[11px] font-semibold mt-0.5">Reservas</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={navButtonClass(activeTab === 'favorites')}
          >
            <span className={`material-symbols-outlined text-2xl ${activeTab === 'favorites' ? 'fill' : ''}`}>
              favorite
            </span>
            <span className="text-[11px] font-semibold mt-0.5">Favoritos</span>
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => setOwnerMode && setOwnerMode('client')}
            className={toggleButtonClass}
            title="Ver la vista de cliente"
          >
            <span className="material-symbols-outlined text-2xl">storefront</span>
            <span className="text-[11px] font-semibold mt-0.5">Cliente</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={navButtonClass(activeTab === 'dashboard')}
          >
            <span className={`material-symbols-outlined text-2xl ${activeTab === 'dashboard' ? 'fill' : ''}`}>
              dashboard
            </span>
            <span className="text-[11px] font-semibold mt-0.5">Panel</span>
          </button>

          <button
            onClick={() => setActiveTab('complex')}
            className={navButtonClass(activeTab === 'complex')}
          >
            <span className={`material-symbols-outlined text-2xl ${activeTab === 'complex' ? 'fill' : ''}`}>
              domain
            </span>
            <span className="text-[11px] font-semibold mt-0.5">Mi Complejo</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={navButtonClass(activeTab === 'reviews')}
          >
            <span className={`material-symbols-outlined text-2xl ${activeTab === 'reviews' ? 'fill' : ''}`}>
              rate_review
            </span>
            <span className="text-[11px] font-semibold mt-0.5">Reseñas</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={navButtonClass(activeTab === 'users')}
          >
            <span className={`material-symbols-outlined text-2xl ${activeTab === 'users' ? 'fill' : ''}`}>
              group
            </span>
            <span className="text-[11px] font-semibold mt-0.5">Usuarios</span>
          </button>
        </>
      )}
    </nav>
  );
};
