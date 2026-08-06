import React from 'react';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  ownerMode?: 'client' | 'admin';
  setOwnerMode?: (mode: 'client' | 'admin') => void;
}

const pillButtonClass = (active: boolean): string =>
  `px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
    active ? 'bg-[#10b981] text-white shadow-sm' : 'text-gray-300 hover:text-white hover:bg-white/5'
  }`;

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, ownerMode = 'admin', setOwnerMode }) => {
  const { userRole, authUser, signOutUser, setShowAuthModal, currentOwnerComplexName } = useApp();
  const isClientMode = userRole === 'player' || ownerMode === 'client';

  const handleLoginClick = () => {
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
            {userRole === 'owner' && ownerMode === 'admin'
              ? `Vista Dueño • ${currentOwnerComplexName}`
              : 'Reserva de Canchas'}
          </span>
        </div>
      </div>

      {/* Center Navigation (Desktop) */}
      {isClientMode && setActiveTab && (
        <div className="hidden md:flex items-center gap-2 bg-[#001226]/60 p-1 rounded-full border border-white/10">
          <button
            onClick={() => setActiveTab('search')}
            className={pillButtonClass(activeTab === 'search')}
          >
            Buscar Canchas
          </button>
          <button
            onClick={() => setActiveTab('my-bookings')}
            className={pillButtonClass(activeTab === 'my-bookings')}
          >
            Mis Reservas
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={pillButtonClass(activeTab === 'favorites')}
          >
            Favoritos
          </button>
          {userRole === 'owner' && setOwnerMode && (
            <button
              onClick={() => setOwnerMode('admin')}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all bg-white/10 text-white border border-white/10 hover:bg-white/20"
            >
              Panel
            </button>
          )}
        </div>
      )}

      {/* Owner mode toggle when on the admin panel */}
      {userRole === 'owner' && ownerMode === 'admin' && setOwnerMode && (
        <div className="hidden md:flex items-center gap-1 bg-[#001226]/60 p-1 rounded-full border border-white/10">
          <button
            onClick={() => setOwnerMode('client')}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all text-gray-300 hover:text-white hover:bg-white/5"
          >
            Vista Cliente
          </button>
        </div>
      )}

      {/* Session / Auth Actions */}
      <div className="flex items-center gap-3">
        {authUser ? (
          <>
            <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-full pl-1.5 pr-3 py-1">
              {authUser.photoURL ? (
                <img
                  src={authUser.photoURL}
                  alt={authUser.displayName ?? 'Usuario'}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#10b981] flex items-center justify-center text-white text-xs font-bold">
                  {(authUser.displayName ?? 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-xs text-gray-200 font-semibold max-w-[120px] truncate">
                {authUser.displayName}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10b981] text-white font-bold uppercase">
                {userRole === 'owner' ? 'Dueño' : 'Jugador'}
              </span>
            </div>
            <button
              onClick={() => void signOutUser()}
              className="bg-white/10 hover:bg-white/20 text-white font-headline font-semibold text-sm px-4 py-2 rounded-xl transition-all active:scale-95 border border-white/10 flex items-center gap-2 shadow-sm"
              title="Cerrar sesión"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              <span className="hidden sm:inline">Salir</span>
            </button>
          </>
        ) : (
          <button
            onClick={handleLoginClick}
            className="bg-white/10 hover:bg-white/20 text-white font-headline font-semibold text-sm px-4 py-2 rounded-xl transition-all active:scale-95 border border-white/10 flex items-center gap-2 shadow-sm"
            title="Iniciar sesión"
          >
            <span className="material-symbols-outlined text-lg">login</span>
            <span className="hidden sm:inline">Iniciar Sesión</span>
          </button>
        )}
      </div>
    </header>
  );
};
