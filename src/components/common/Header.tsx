import React from 'react';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { userRole, setUserRole, setShowAuthModal, currentOwnerComplexName } = useApp();

  const handleSwitchRoleClick = () => {
    setShowAuthModal(true);
  };

  return (
    <header className="bg-[#001c3a] dark:bg-[#111c2d] border-b border-[#bbcabf]/20 sticky top-0 w-full h-16 z-50 px-4 md:px-8 flex justify-between items-center shadow-md">
      {/* Brand Logo */}
      <div 
        className="flex items-center gap-3 cursor-pointer select-none"
        onClick={() => setActiveTab && setActiveTab('search')}
      >
        <div className="w-10 h-10 rounded-xl bg-[#10b981] flex items-center justify-center text-white shadow-sm">
          <span className="material-symbols-outlined fill text-2xl">sports_soccer</span>
        </div>
        <div className="flex flex-col">
          <span className="font-headline text-2xl font-extrabold text-white tracking-tight leading-none">
            Canchazo
          </span>
          <span className="text-[10px] text-[#6ffbbe] uppercase tracking-wider font-semibold">
            {userRole === 'owner' ? `Vista Dueño • ${currentOwnerComplexName}` : 'Reserva de Canchas'}
          </span>
        </div>
      </div>

      {/* Center Navigation (Desktop) for Player or Owner */}
      {userRole === 'player' && setActiveTab && (
        <div className="hidden md:flex items-center gap-2 bg-[#001226]/60 p-1 rounded-full border border-white/10">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeTab === 'search'
                ? 'bg-[#10b981] text-white shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Buscar Canchas
          </button>
          <button
            onClick={() => setActiveTab('my-bookings')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeTab === 'my-bookings'
                ? 'bg-[#10b981] text-white shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Mis Reservas
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeTab === 'favorites'
                ? 'bg-[#10b981] text-white shadow-sm'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Favoritos
          </button>
        </div>
      )}

      {/* Switch Role Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSwitchRoleClick}
          className="bg-white/10 hover:bg-white/20 text-white font-headline font-semibold text-sm px-4 py-2 rounded-xl transition-all active:scale-95 border border-white/10 flex items-center gap-2 shadow-sm"
          title="Cambiar entre Jugador y Dueño"
        >
          <span className="material-symbols-outlined text-lg">swap_horiz</span>
          <span className="hidden sm:inline">Cambiar Rol</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#10b981] text-white font-bold uppercase">
            {userRole === 'owner' ? 'Dueño' : 'Jugador'}
          </span>
        </button>
      </div>
    </header>
  );
};
