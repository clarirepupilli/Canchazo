import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const AuthModal: React.FC = () => {
  const { userRole, setUserRole, showAuthModal, setShowAuthModal, showToast } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>(userRole || 'player');
  const [phoneInput, setPhoneInput] = useState('');
  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState('admin@f5goles.com');
  const [ownerPassword, setOwnerPassword] = useState('');

  if (!showAuthModal) return null;

  const handleGoogleLogin = () => {
    setUserRole('player');
    setShowAuthModal(false);
    showToast('¡Sesión iniciada con Google!');
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput) {
      showToast('Por favor ingresa un número de teléfono');
      return;
    }
    setUserRole('player');
    setShowAuthModal(false);
    showToast(`¡Sesión iniciada con teléfono ${phoneInput}!`);
  };

  const handleOwnerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerEmail) {
      showToast('Por favor ingresa tu correo de dueño');
      return;
    }
    setUserRole('owner');
    setShowAuthModal(false);
    showToast(`¡Bienvenido al Panel de Administración!`);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-[#0A1628]/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-[440px] bg-white rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Modal Close Button */}
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Modal Content */}
        <div className="p-6 md:p-8 flex flex-col">
          {/* Header Brand */}
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#10b981] flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined fill text-2xl">sports_soccer</span>
            </div>
            <h1 className="font-headline text-2xl text-[#0A1628] font-extrabold tracking-tight">
              Canchazo
            </h1>
          </div>

          <h2 className="font-headline text-xl text-[#0A1628] font-bold mb-1">
            Inicio de Sesión
          </h2>
          <p className="text-sm text-[#0A1628]/70 mb-6">
            Selecciona tu perfil para continuar a la plataforma.
          </p>

          {/* Role Selection Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6" role="radiogroup">
            {/* Player Role Card */}
            <button
              type="button"
              onClick={() => setSelectedRole('player')}
              className={`relative overflow-hidden p-4 rounded-2xl flex flex-col items-center text-center gap-2 transition-all border-2 text-left ${
                selectedRole === 'player'
                  ? 'border-[#10b981] bg-[#f0fdf4] shadow-sm'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              {selectedRole === 'player' && (
                <div className="absolute top-2 right-2 text-[#10b981]">
                  <span className="material-symbols-outlined fill text-lg">check_circle</span>
                </div>
              )}
              <div className="w-12 h-12 rounded-full bg-[#10b981]/20 flex items-center justify-center text-[#10b981]">
                <span className="material-symbols-outlined fill text-2xl">sports_kabaddi</span>
              </div>
              <div>
                <span className="font-headline text-sm font-bold text-[#0A1628] block">Soy Jugador</span>
                <span className="text-xs text-[#0A1628]/60 block mt-0.5">Reserva canchas</span>
              </div>
            </button>

            {/* Owner Role Card */}
            <button
              type="button"
              onClick={() => setSelectedRole('owner')}
              className={`relative overflow-hidden p-4 rounded-2xl flex flex-col items-center text-center gap-2 transition-all border-2 text-left ${
                selectedRole === 'owner'
                  ? 'border-[#10b981] bg-[#f0fdf4] shadow-sm'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              {selectedRole === 'owner' && (
                <div className="absolute top-2 right-2 text-[#10b981]">
                  <span className="material-symbols-outlined fill text-lg">check_circle</span>
                </div>
              )}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                selectedRole === 'owner' ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-gray-100 text-gray-500'
              }`}>
                <span className="material-symbols-outlined fill text-2xl">stadium</span>
              </div>
              <div>
                <span className="font-headline text-sm font-bold text-[#0A1628] block">Soy Dueño</span>
                <span className="text-xs text-[#0A1628]/60 block mt-0.5">Gestiona tu sede</span>
              </div>
            </button>
          </div>

          <div className="h-[1px] bg-gray-200 mb-6"></div>

          {/* Dynamic Forms */}
          {selectedRole === 'player' ? (
            <div className="flex flex-col gap-3">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white text-[#0A1628] border border-gray-300 rounded-full py-3 px-4 hover:bg-gray-50 transition-colors shadow-sm font-medium text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Continuar con Google</span>
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-[1px] bg-gray-200"></div>
                <span className="text-xs text-gray-400 uppercase tracking-wider">o</span>
                <div className="flex-1 h-[1px] bg-gray-200"></div>
              </div>

              {!showPhoneForm ? (
                <button
                  type="button"
                  onClick={() => setShowPhoneForm(true)}
                  className="w-full flex items-center justify-center gap-2 bg-[#10b981] text-white rounded-full py-3 px-4 hover:bg-[#0e9f6f] transition-all shadow-sm font-semibold text-sm"
                >
                  <span className="material-symbols-outlined fill text-xl">smartphone</span>
                  <span>Entrar con Número de Teléfono</span>
                </button>
              ) : (
                <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-3">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                      phone
                    </span>
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="+54 9 11 5555-0000"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-sm focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] outline-none"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPhoneForm(false)}
                      className="px-4 py-2.5 rounded-full border border-gray-300 text-sm font-medium hover:bg-gray-50"
                    >
                      Volver
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-[#10b981] text-white rounded-full py-2.5 px-4 hover:bg-[#0e9f6f] text-sm font-bold shadow-sm"
                    >
                      Confirmar Teléfono
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <form onSubmit={handleOwnerLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#0A1628] uppercase tracking-wider">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                    mail
                  </span>
                  <input
                    type="email"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder="admin@tucomplejo.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm text-[#0A1628] focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#0A1628] uppercase tracking-wider">
                  Contraseña
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                    lock
                  </span>
                  <input
                    type="password"
                    value={ownerPassword}
                    onChange={(e) => setOwnerPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm text-[#0A1628] focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded text-[#10b981] focus:ring-[#10b981] border-gray-300"
                  />
                  <span className="text-gray-600">Recordarme</span>
                </label>
                <a href="#" className="text-[#10b981] font-semibold hover:underline" onClick={(e) => { e.preventDefault(); showToast('Instrucciones de recuperación enviadas a tu correo'); }}>
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <button
                type="submit"
                className="w-full mt-2 flex items-center justify-center gap-2 bg-[#10b981] text-white rounded-full py-3 px-4 hover:bg-[#0e9f6f] transition-all shadow-md font-bold text-sm"
              >
                <span className="material-symbols-outlined fill text-xl">admin_panel_settings</span>
                <span>Acceso Administrativo</span>
              </button>
            </form>
          )}

          <p className="text-center text-xs text-gray-500 mt-6">
            Al continuar, aceptas nuestros{' '}
            <a href="#" className="text-[#10b981] font-semibold hover:underline" onClick={(e) => e.preventDefault()}>
              Términos de Servicio
            </a>{' '}
            y{' '}
            <a href="#" className="text-[#10b981] font-semibold hover:underline" onClick={(e) => e.preventDefault()}>
              Política de Privacidad
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
};
