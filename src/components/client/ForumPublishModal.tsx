import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import type { Booking } from '../../types';
import { formatDateDisplay } from '../../utils/date';

interface ForumPublishModalProps {
  booking: Booking;
  onClose: () => void;
}

/**
 * Publish an LFM post in the Foro. Court/date/time are copied verbatim from an
 * existing future booking (never typed by hand); only playersNeeded and an
 * optional message come from the user.
 */
export const ForumPublishModal: React.FC<ForumPublishModalProps> = ({ booking, onClose }) => {
  const { addPost, showToast } = useApp();
  const [playersNeeded, setPlayersNeeded] = useState<number>(2);
  const [message, setMessage] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!Number.isInteger(playersNeeded) || playersNeeded < 1 || playersNeeded > 20) {
      showToast('Ingresá cuántos jugadores faltan (1 a 20).');
      return;
    }

    addPost({
      bookingId: booking.id,
      courtId: booking.courtId,
      courtName: booking.courtName,
      complexName: booking.complexName,
      date: booking.date,
      dateDisplay: booking.dateDisplay,
      timeSlot: booking.timeSlot,
      playersNeeded,
      message: message.trim() || undefined,
      author: booking.customerName,
      whatsappContact: booking.customerPhone || booking.whatsappNumber || '',
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-[#111c2d]/80 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-[24px] w-full max-w-md shadow-2xl overflow-hidden relative flex flex-col my-6">
        {/* Header */}
        <div className="bg-[#111c2d] text-white px-6 py-4 flex items-center justify-between">
          <h2 className="font-headline text-base font-bold uppercase tracking-wide flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400">campaign</span>
            <span>Publicar en el foro</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 -mr-1 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white">
          {/* Booking summary (read-only, source of truth for the post) */}
          <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-3 text-center">
            <span className="text-[10px] font-bold text-[#006c49] uppercase tracking-wider block">
              Tu turno reservado
            </span>
            <h3 className="font-headline text-sm font-bold text-[#111c2d]">
              {booking.courtName}
            </h3>
            <p className="text-xs text-gray-500">
              {formatDateDisplay(booking.date)} • {booking.timeSlot}
            </p>
          </div>

          {/* Players needed */}
          <div>
            <label className="text-xs font-bold text-[#111c2d] uppercase tracking-wider block mb-1">
              ¿Cuántos jugadores faltan?
            </label>
            <input
              type="number"
              min={1}
              max={20}
              step={1}
              value={playersNeeded}
              onChange={(e) => setPlayersNeeded(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:border-[#10b981] outline-none"
              placeholder="2"
              required
            />
          </div>

          {/* Optional message */}
          <div>
            <label className="text-xs font-bold text-[#111c2d] uppercase tracking-wider block mb-1">
              Mensaje (opcional)
            </label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={120}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:border-[#10b981] outline-none"
              placeholder="Ej: nos juntamos temprano para picar pelota"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#0e9f6f] text-white py-3.5 px-6 rounded-xl font-headline text-xs font-extrabold tracking-wide uppercase transition-all shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">campaign</span>
              <span>Publicar aviso</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-6 rounded-xl font-headline text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};