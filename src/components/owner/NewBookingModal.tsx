import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BookingStatus, PaymentMethod } from '../../types';
import { toISODate, formatDateDisplay } from '../../utils/date';
import { computeAvailability } from '../../services/availability';

interface NewBookingModalProps {
  onClose: () => void;
}

export const NewBookingModal: React.FC<NewBookingModalProps> = ({ onClose }) => {
  const { addBooking, courts, bookings, authUser, showToast } = useApp();
  // Owners can only book their own courts; never another complex's.
  const myCourts = courts.filter((c) => c.ownerId === authUser?.uid);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [courtName, setCourtName] = useState(myCourts[0]?.name || '');
  const [timeSlot, setTimeSlot] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState<BookingStatus>('Pagado');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo');

  const selectedCourt = myCourts.find((c) => c.name === courtName) ?? myCourts[0] ?? null;
  const todayIso = toISODate(new Date());
  const dateDisplay = formatDateDisplay(todayIso);

  // Only offer slots that are still free for the selected court today,
  // reusing the same availability derivation the client uses.
  const availableSlots = selectedCourt
    ? computeAvailability(selectedCourt.timeSlots, bookings, selectedCourt.id, todayIso).filter(
        (s) => s.available
      )
    : [];
  const availableKey = availableSlots.map((s) => s.displayTime).join('|');

  // Keep the selected slot and price in sync: the bookings stream arrives
  // async and slot availability changes live.
  useEffect(() => {
    setTimeSlot((current) =>
      current && availableSlots.some((s) => s.displayTime === current)
        ? current
        : availableSlots[0]?.displayTime || ''
    );
    setPrice(selectedCourt ? String(selectedCourt.pricePerHour) : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourt?.id, availableKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName) return;
    if (!timeSlot || !selectedCourt) return;
    // Empty price falls back to the court's own price per hour (the field is
    // pre-filled with it); an explicit value must be a finite non-negative
    // number.
    const priceValue = price.trim() === '' ? selectedCourt.pricePerHour : Number(price);
    if (!Number.isFinite(priceValue) || priceValue < 0) {
      showToast('Ingresá un precio válido.');
      return;
    }
    const finalPrice = priceValue || selectedCourt.pricePerHour;

    addBooking({
      courtId: selectedCourt.id,
      courtName: selectedCourt.name,
      complexName: selectedCourt.complexName,
      customerName,
      customerPhone,
      sport: selectedCourt.sport,
      date: todayIso,
      dateDisplay,
      timeSlot,
      price: finalPrice,
      paymentMethod,
      status,
      whatsappNumber: selectedCourt.whatsappNumber,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-[#111c2d]/80 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#10b981] text-white flex items-center justify-center">
            <span className="material-symbols-outlined">add_task</span>
          </div>
          <div>
            <h2 className="font-headline text-lg font-bold text-[#111c2d]">Crear Nueva Reserva</h2>
            <p className="text-xs text-gray-500">Registra un turno manual para un cliente</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#111c2d] uppercase tracking-wider block mb-1">
              Nombre del Cliente *
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ej. Lucas Silva"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#10b981] outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#111c2d] uppercase tracking-wider block mb-1">
              Teléfono WhatsApp
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="+54 9 11 0000-0000"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#10b981] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#111c2d] uppercase tracking-wider block mb-1">
                Cancha
              </label>
              <select
                value={selectedCourt?.name || ''}
                onChange={(e) => setCourtName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#10b981] outline-none bg-white font-medium"
              >
                {myCourts.length === 0 ? (
                  <option value="">Sin canchas registradas</option>
                ) : (
                  myCourts.map((court) => (
                    <option key={court.id} value={court.name}>
                      {court.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#111c2d] uppercase tracking-wider block mb-1">
                Horario
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                disabled={availableSlots.length === 0}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#10b981] outline-none bg-white font-medium disabled:bg-gray-100 disabled:text-gray-400"
              >
                {availableSlots.length === 0 ? (
                  <option value="">Sin turnos disponibles hoy</option>
                ) : (
                  availableSlots.map((slot) => (
                    <option key={slot.id} value={slot.displayTime}>
                      {slot.displayTime}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#111c2d] uppercase tracking-wider block mb-1">
                Precio ($)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-bold focus:border-[#10b981] outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#111c2d] uppercase tracking-wider block mb-1">
                Estado Pago
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BookingStatus)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm font-bold focus:border-[#10b981] outline-none bg-white"
              >
                <option value="Pagado">Pagado</option>
                <option value="Pendiente">Pendiente</option>
              </select>
            </div>
          </div>

          {availableSlots.length === 0 && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 font-medium">
              Hoy no quedan turnos disponibles para esta cancha.
            </p>
          )}

          <div className="pt-3 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!timeSlot || !selectedCourt || myCourts.length === 0}
              className="flex-1 bg-[#10b981] hover:bg-[#0e9f6f] text-white py-3 rounded-xl text-xs font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Guardar Reserva
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
