import React from 'react';
import { useApp } from '../../context/AppContext';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  const { userRole } = useApp();

  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center h-16 pb-safe px-4 bg-white dark:bg-[#111c2d] rounded-t-2xl shadow-[0_-4px_12px_rgba(0,0,0,0.1)] border-t border-[#bbcabf]/30">
      {userRole === 'player' ? (
        <>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all ${
              activeTab === 'search'
                ? 'text-[#10b981] font-bold scale-105'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span className={`material-symbols-outlined text-2xl ${activeTab === 'search' ? 'fill' : ''}`}>
              search
            </span>
            <span className="text-[11px] font-semibold mt-0.5">Buscar</span>
          </button>

          <button
            onClick={() => setActiveTab('my-bookings')}
            className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all ${
              activeTab === 'my-bookings'
                ? 'text-[#10b981] font-bold scale-105'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span className={`material-symbols-outlined text-2xl ${activeTab === 'my-bookings' ? 'fill' : ''}`}>
              event_available
            </span>
            <span className="text-[11px] font-semibold mt-0.5">Reservas</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all ${
              activeTab === 'favorites'
                ? 'text-[#10b981] font-bold scale-105'
                : 'text-gray-500 hover:text-gray-900'
            }`}
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
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all ${
              activeTab === 'dashboard'
                ? 'text-[#10b981] font-bold scale-105'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span className={`material-symbols-outlined text-2xl ${activeTab === 'dashboard' ? 'fill' : ''}`}>
              dashboard
            </span>
            <span className="text-[11px] font-semibold mt-0.5">Panel</span>
          </button>

          <button
            onClick={() => setActiveTab('complex')}
            className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all ${
              activeTab === 'complex'
                ? 'text-[#10b981] font-bold scale-105'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span className={`material-symbols-outlined text-2xl ${activeTab === 'complex' ? 'fill' : ''}`}>
              domain
            </span>
            <span className="text-[11px] font-semibold mt-0.5">Mi Complejo</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all ${
              activeTab === 'reviews'
                ? 'text-[#10b981] font-bold scale-105'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span className={`material-symbols-outlined text-2xl ${activeTab === 'reviews' ? 'fill' : ''}`}>
              rate_review
            </span>
            <span className="text-[11px] font-semibold mt-0.5">Reseñas</span>
          </button>
        </>
      )}
    </nav>
  );
};
