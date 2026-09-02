import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { toISODate } from '../../utils/date';
import { ForumPublishModal } from './ForumPublishModal';
import type { Booking } from '../../types';

export const MyBookings: React.FC = () => {
  const { bookings, authUser, setShowAuthModal, toggleBookingStatus, posts, addPost } = useApp();
  const [publishTarget, setPublishTarget] = useState<Booking | null>(null);
  const myBookings = authUser ? bookings.filter((b) => b.userId === authUser.uid) : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
      <div>
        <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-[#111c2d]">
          Mis Reservas
        </h1>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          Consulta y administra tus turnos reservados
        </p>
      </div>

      {!authUser ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm space-y-4">
          <span className="material-symbols-outlined text-5xl text-[#10b981]">account_circle</span>
          <h3 className="font-headline text-lg font-bold text-[#111c2d]">
            Iniciá sesión para ver tus reservas
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Tus turnos quedan asociados a tu cuenta. Accedé con Google para consultarlos.
          </p>
          <button
            type="button"
            onClick={() => setShowAuthModal(true)}
            className="inline-flex items-center gap-2 bg-[#10b981] hover:bg-[#0e9f6f] text-white px-5 py-2.5 rounded-full font-headline text-sm font-bold transition-all active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-lg">login</span>
            <span>Iniciar Sesión</span>
          </button>
        </div>
      ) : myBookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm space-y-3">
          <span className="material-symbols-outlined text-5xl text-[#10b981]">event_busy</span>
          <h3 className="font-headline text-lg font-bold text-[#111c2d]">
            Aún no tienes reservas realizadas
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Explora las canchas disponibles y realiza tu primera reserva fácil y rápido.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {myBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#10b981]/15 text-[#10b981] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl fill">sports_soccer</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-headline text-base font-bold text-[#111c2d]">
                      {booking.courtName}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        booking.status === 'Pagado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : booking.status === 'Pendiente'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">{booking.complexName}</p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500 font-medium">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-[#10b981]">calendar_month</span>
                      {booking.dateDisplay}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-[#10b981]">schedule</span>
                      {booking.timeSlot}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-[#10b981]">payments</span>
                      ${booking.price.toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 justify-end">
                {(booking.status === 'Pendiente' || booking.status === 'Pagado') &&
                  booking.date >= toISODate(new Date()) &&
                  !posts.some((p) => p.bookingId === booking.id) && (
                    <button
                      type="button"
                      onClick={() => setPublishTarget(booking)}
                      className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">campaign</span>
                      <span>Publicar en el foro</span>
                    </button>
                  )}

                <button
                  type="button"
                  onClick={() => {
                    const msg = encodeURIComponent(
                      `Hola! Consulto por la reserva #${booking.id} a nombre de ${booking.customerName} para el turno ${booking.timeSlot}.`
                    );
                    const waLink = booking.whatsappNumber
                      ? `https://wa.me/${booking.whatsappNumber.replace(/[^0-9]/g, '')}?text=${msg}`
                      : `https://wa.me/?text=${msg}`;
                    window.open(waLink, '_blank');
                  }}
                  className="px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm text-[#10b981]">chat</span>
                  <span>Contactar Sede</span>
                </button>

                {booking.status === 'Cancelado' ? (
                  <button
                    type="button"
                    onClick={() => toggleBookingStatus(booking.id, 'Pendiente')}
                    className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200 transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">undo</span>
                    <span>Reactivar Turno</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleBookingStatus(booking.id, 'Cancelado')}
                    className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold border border-red-200 transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">cancel</span>
                    <span>Cancelar Reserva</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {publishTarget && (
        <ForumPublishModal booking={publishTarget} onClose={() => setPublishTarget(null)} />
      )}
    </div>
  );
};
