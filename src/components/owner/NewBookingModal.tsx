import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BookingStatus, PaymentMethod } from '../../types';
import { toISODate, formatDateDisplay } from '../../utils/date';

interface NewBookingModalProps {
  onClose: () => void;
}

export const NewBookingModal: React.FC<NewBookingModalProps> = ({ onClose }) => {
  const { addBooking, courts, currentOwnerComplexName } = useApp();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [courtName, setCourtName] = useState(courts[0]?.name || 'Cancha 1');
  const [timeSlot, setTimeSlot] = useState('18:00 - 19:30');
  const [price, setPrice] = useState('18000');
  const [status, setStatus] = useState<BookingStatus>('Pagado');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo');

  const selectedCourt = courts.find((c) => c.name === courtName);
  const todayIso = toISODate(new Date());
  const dateDisplay = formatDateDisplay(todayIso);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName) return;

    addBooking({
      courtId: selectedCourt?.id || courts[0]?.id || 'court-3',
      courtName,
      complexName: currentOwnerComplexName,
      customerName,
      customerPhone,
      sport: selectedCourt?.sport || 'futbol',
      date: todayIso,
      dateDisplay,
      timeSlot,
      price: Number(price) || 18000,
      paymentMethod,
      status,
      whatsappNumber: selectedCourt?.whatsappNumber,
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
                value={courtName}
                onChange={(e) => setCourtName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#10b981] outline-none bg-white font-medium"
              >
                {courts.length === 0 ? (
                  <option value="Cancha 1">Cancha 1</option>
                ) : (
                  courts.map((court) => (
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
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#10b981] outline-none bg-white font-medium"
              >
                <option value="18:00 - 19:30">18:00 - 19:30</option>
                <option value="19:30 - 21:00">19:30 - 21:00</option>
                <option value="21:00 - 22:30">21:00 - 22:30</option>
                <option value="22:30 - 00:00">22:30 - 00:00</option>
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
              className="flex-1 bg-[#10b981] hover:bg-[#0e9f6f] text-white py-3 rounded-xl text-xs font-bold shadow-md"
            >
              Guardar Reserva
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
