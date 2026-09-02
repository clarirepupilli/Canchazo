import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateDisplay } from '../../utils/date';
import { Booking, BookingStatus } from '../../types';

const sortByDateTime = (a: { date: string; timeSlot: string }, b: { date: string; timeSlot: string }) => {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  return a.timeSlot < b.timeSlot ? -1 : a.timeSlot > b.timeSlot ? 1 : 0;
};

export const BookingsList: React.FC = () => {
  const { bookings: allBookings, toggleBookingStatus, deleteBooking, courts, authUser, showToast } = useApp();
  const [dayFilter, setDayFilter] = useState<string>('all');
  const [slotFilter, setSlotFilter] = useState<string>('all');

  // Owners only see bookings for the courts they actually own; a court's
  // ownerId is the source of truth (the booking itself carries no owner ref).
  const ownerCourtIds = useMemo(
    () =>
      new Set(
        (authUser ? courts.filter((c) => c.ownerId === authUser.uid) : courts).map((c) => c.id)
      ),
    [courts, authUser]
  );
  const bookings = useMemo(
    () => allBookings.filter((b) => ownerCourtIds.has(b.courtId)),
    [allBookings, ownerCourtIds]
  );

  const handleToggleStatus = (booking: Booking, targetStatus: BookingStatus) => {
    if (!ownerCourtIds.has(booking.courtId)) {
      showToast('No podés modificar reservas de otras canchas.');
      return;
    }
    toggleBookingStatus(booking.id, targetStatus);
  };

  const handleDeleteBooking = (booking: Booking) => {
    if (!ownerCourtIds.has(booking.courtId)) {
      showToast('No podés eliminar reservas de otras canchas.');
      return;
    }
    if (
      window.confirm(
        `¿Eliminar definitivamente la reserva de ${booking.customerName}? Esta acción no se puede deshacer.`
      )
    ) {
      deleteBooking(booking.id);
    }
  };

  const availableDays = useMemo(
    () => [...new Set(bookings.map((b) => b.date))].sort().reverse(),
    [bookings]
  );
  const availableSlots = useMemo(
    () => [...new Set(bookings.map((b) => b.timeSlot))].sort(),
    [bookings]
  );

  const displayList = useMemo(() => {
    const filtered = bookings.filter(
      (b) =>
        (dayFilter === 'all' || b.date === dayFilter) &&
        (slotFilter === 'all' || b.timeSlot === slotFilter)
    );
    return [...filtered].sort(sortByDateTime);
  }, [bookings, dayFilter, slotFilter]);

  const hasActiveFilter = dayFilter !== 'all' || slotFilter !== 'all';

  const clearFilters = () => {
    setDayFilter('all');
    setSlotFilter('all');
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
        <div>
          <h3 className="font-headline text-base sm:text-lg font-extrabold text-[#006c49] flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">event_available</span>
            <span>Reservas</span>
          </h3>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            {bookings.length === 0
              ? 'Administra los turnos de tu complejo y su estado de pago'
              : `Mostrando ${displayList.length} de ${bookings.length} reservas`}
          </p>
        </div>

        {/* Day & Time Slot Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500">
            <span className="material-symbols-outlined text-base">calendar_today</span>
            <select
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-[#111c2d] focus:outline-none focus:ring-2 focus:ring-[#10b981]"
            >
              <option value="all">Todos los días</option>
              {availableDays.map((d) => (
                <option key={d} value={d}>
                  {formatDateDisplay(d)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500">
            <span className="material-symbols-outlined text-base">schedule</span>
            <select
              value={slotFilter}
              onChange={(e) => setSlotFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-[#111c2d] focus:outline-none focus:ring-2 focus:ring-[#10b981]"
            >
              <option value="all">Todos los horarios</option>
              {availableSlots.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          {hasActiveFilter && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-bold text-[#006c49] hover:underline flex items-center gap-1 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200/60"
            >
              <span>Ver todas</span>
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {displayList.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-2">
            <span className="material-symbols-outlined text-3xl text-gray-400">event_busy</span>
            <p className="text-xs font-semibold text-gray-600">
              {hasActiveFilter
                ? 'No hay reservas para el día u horario seleccionado.'
                : 'Aún no hay reservas registradas en el sistema.'}
            </p>
            {hasActiveFilter && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-bold text-[#006c49] hover:underline"
              >
                Ver todas las reservas
              </button>
            )}
          </div>
        ) : (
          displayList.map((booking) => {
          const status = booking.status;
          const isPaid = status === 'Pagado';
          const isPending = status === 'Pendiente';
          const isCanceled = status === 'Cancelado';

          return (
            <div
              key={booking.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl transition-all border ${
                isCanceled
                  ? 'bg-red-50/50 border-red-200/80'
                  : isPending
                  ? 'bg-amber-50/40 border-amber-200/80'
                  : 'bg-gray-50/80 hover:bg-gray-100/80 border-gray-200/60'
              }`}
            >
              <div className="flex items-center gap-3.5 mb-3 sm:mb-0">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-bold ${
                    isPaid
                      ? 'bg-emerald-100 text-emerald-700'
                      : isPending
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl">
                    {isCanceled ? 'block' : 'sports_soccer'}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-headline text-sm font-bold text-[#111c2d]">
                      {booking.customerName}
                    </h4>
                    {booking.customerPhone && (
                      <a
                        href={`https://wa.me/${booking.customerPhone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 p-0.5"
                        title="Enviar WhatsApp"
                      >
                        <span className="material-symbols-outlined text-sm">chat</span>
                      </a>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 font-medium mt-0.5">
                    {booking.courtName} • <span className="font-bold text-[#111c2d]">{booking.timeSlot}</span>
                  </p>

                  <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                    <span>{booking.dateDisplay || formatDateDisplay(booking.date)}</span>
                    <span>•</span>
                    <span className="font-bold text-gray-700">${booking.price.toLocaleString('es-AR')}</span>
                  </div>
                </div>
              </div>

              {/* Status Actions & Dropdown */}
              <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200/60 justify-end">
                {/* Status selector buttons */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(booking, 'Pagado')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      isPaid
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'text-gray-500 hover:text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    Pagado
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(booking, 'Pendiente')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      isPending
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-gray-500 hover:text-amber-700 hover:bg-amber-50'
                    }`}
                  >
                    Pendiente
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(booking, 'Cancelado')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      isCanceled
                        ? 'bg-red-500 text-white shadow-xs'
                        : 'text-gray-500 hover:text-red-700 hover:bg-red-50'
                    }`}
                  >
                    Cancelar
                  </button>
                </div>

                {/* Delete permanently — only for canceled bookings, so they stop occupying space */}
                {isCanceled && (
                  <button
                    type="button"
                    onClick={() => handleDeleteBooking(booking)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                    title="Eliminar reserva"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
      </div>
    </div>
  );
};
