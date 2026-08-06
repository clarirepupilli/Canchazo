import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { signInWithGoogle } from '../../services/authService';

export const AuthModal: React.FC = () => {
  const { userRole, showAuthModal, setShowAuthModal, showToast } = useApp();
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (!showAuthModal) return null;

  const handleGoogleLogin = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
      setShowAuthModal(false);
      showToast(userRole === 'owner' ? '¡Bienvenido al Panel de Administración!' : '¡Sesión iniciada!');
    } catch (error) {
      const code = (error as { code?: string })?.code;
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        showToast('No se pudo iniciar sesión. Intentá de nuevo.');
      }
    } finally {
      setIsSigningIn(false);
    }
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
            Accedé con tu cuenta de Google para reservar canchas o administrar tu complejo.
          </p>

          <button
            onClick={() => void handleGoogleLogin()}
            disabled={isSigningIn}
            className="w-full flex items-center justify-center gap-3 bg-white text-[#0A1628] border border-gray-300 rounded-full py-3 px-4 hover:bg-gray-50 transition-colors shadow-sm font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSigningIn ? (
              <>
                <span className="w-5 h-5 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin" />
                <span>Iniciando sesión...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Continuar con Google</span>
              </>
            )}
          </button>

          <div className="mt-5 rounded-xl bg-gray-50 border border-gray-200 p-4">
            <p className="text-xs text-gray-600 leading-relaxed">
              <span className="font-bold text-[#0A1628]">¿Cómo se asigna el rol?</span> Tu cuenta define tu
              acceso: las cuentas nuevas son <span className="font-bold text-[#0A1628]">Jugadores</span>. Los{' '}
              <span className="font-bold text-[#0A1628]">Dueños</span> son habilitados desde el panel de
              administración por otro dueño.
            </p>
          </div>

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
