import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Court, PaymentMethod } from '../../types';
import { formatDateDisplay } from '../../utils/date';

interface BookingModalProps {
  court: Court;
  timeSlot: string;
  date: string; // YYYY-MM-DD
  onClose: () => void;
  onSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ court, timeSlot, date, onClose, onSuccess }) => {
  const { addBooking, authUser, setShowAuthModal, showToast } = useApp();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const paymentOptions =
    court.paymentMethods && court.paymentMethods.length > 0
      ? court.paymentMethods
      : ['Efectivo', 'Transferencia Bancaria'];
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(() =>
    court.paymentMethods && court.paymentMethods.length > 0 ? court.paymentMethods[0] : 'Efectivo'
  );

  const dateDisplay = formatDateDisplay(date);

  const handleConfirmReservation = () => {
    if (isSubmitting) return;
    if (!authUser) {
      setShowAuthModal(true);
      showToast('Iniciá sesión para confirmar tu reserva.');
      return;
    }
    if (!customerName.trim()) {
      showToast('Por favor, ingresa tu nombre y apellido.');
      return;
    }
    if (!customerPhone.trim()) {
      showToast('Por favor, ingresa un teléfono de contacto.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Save to context state
      addBooking({
        courtId: court.id,
        courtName: court.name,
        complexName: court.complexName,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        sport: court.sport,
        date,
        dateDisplay,
        timeSlot,
        price: court.pricePerHour,
        paymentMethod,
        status: 'Pendiente',
        whatsappNumber: court.whatsappNumber,
      });

      onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-[#111c2d]/80 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-[24px] w-full max-w-md shadow-2xl overflow-hidden relative flex flex-col my-6">
        {/* Header */}
        <div className="bg-[#111c2d] text-white px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-headline text-base font-bold uppercase tracking-wide">
            Confirmar Reserva
          </h1>
          <div className="w-8"></div>
        </div>

        {/* Content */}
        <div className="px-6 pt-6 pb-6 flex-1 flex flex-col bg-white overflow-y-auto">
          <p className="text-xs text-gray-500 text-center mb-6 font-medium">
            Revisa los detalles antes de confirmar tu reserva
          </p>

          {/* User Inputs (Name & Phone) */}
          <div className="space-y-3 mb-5">
            <div>
              <label className="text-xs font-bold text-[#111c2d] uppercase tracking-wider block mb-1">
                Tu Nombre
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:border-[#10b981] outline-none"
                placeholder="Nombre y Apellido"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#111c2d] uppercase tracking-wider block mb-1">
                Teléfono de Contacto
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:border-[#10b981] outline-none"
                placeholder="+54 9 11 0000-0000"
              />
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-200 flex flex-col gap-4 shadow-sm">
            <div className="flex flex-col pb-3 border-b border-gray-200">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                Cancha / Complejo
              </span>
              <span className="font-headline text-base text-[#111c2d] font-bold">
                {court.name}
              </span>
              <span className="text-xs text-gray-500">{court.complexName}</span>
            </div>

            <div className="flex flex-col pb-3 border-b border-gray-200">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Método de Pago
              </span>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-white border border-gray-300 rounded-lg p-2 text-sm font-semibold text-[#111c2d] focus:border-[#10b981] outline-none"
              >
                {paymentOptions.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>

            {/* Grid metrics */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-2">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#10b981] text-2xl">calendar_month</span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Fecha</span>
                  <span className="text-xs text-[#111c2d] font-bold">{dateDisplay}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#10b981] text-2xl">schedule</span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Horario</span>
                  <span className="text-xs text-[#111c2d] font-bold">{timeSlot}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#10b981] text-2xl">group</span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Deporte</span>
                  <span className="text-xs text-[#111c2d] font-bold">{court.sportLabel}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#10b981] text-2xl">payments</span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Precio</span>
                  <span className="text-xs text-[#10b981] font-extrabold">
                    ${court.pricePerHour.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-auto space-y-2">
            <button
              type="button"
              onClick={handleConfirmReservation}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#0e9f6f] text-white py-4 px-6 rounded-xl font-headline text-sm font-extrabold tracking-wide uppercase transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">check_circle</span>
              <span>RESERVAR</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-6 rounded-xl font-headline text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
