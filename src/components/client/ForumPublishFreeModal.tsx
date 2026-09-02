import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';

interface ForumPublishFreeModalProps {
  onClose: () => void;
}

/**
 * Publish a free-text LFM post in the Foro WITHOUT a booking. The user provides
 * their name, WhatsApp contact, how many players they need, and a free-text
 * message. No court/date/time fields — this is a generic "busco jugadores" notice.
 */
export const ForumPublishFreeModal: React.FC<ForumPublishFreeModalProps> = ({ onClose }) => {
  const { addPost, showToast } = useApp();
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [playersNeeded, setPlayersNeeded] = useState<number>(2);
  const [message, setMessage] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Ingresá tu nombre.');
      return;
    }
    if (!phone.trim()) {
      showToast('Ingresá tu número de WhatsApp.');
      return;
    }
    if (!Number.isInteger(playersNeeded) || playersNeeded < 1 || playersNeeded > 20) {
      showToast('Ingresá cuántos jugadores faltan (1 a 20).');
      return;
    }

    addPost({
      playersNeeded,
      message: message.trim() || undefined,
      author: name.trim(),
      whatsappContact: phone.trim(),
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
          {/* Name */}
          <div>
            <label className="text-xs font-bold text-[#111c2d] uppercase tracking-wider block mb-1">
              Tu Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:border-[#10b981] outline-none"
              placeholder="Nombre y Apellido"
              required
            />
          </div>

          {/* WhatsApp phone */}
          <div>
            <label className="text-xs font-bold text-[#111c2d] uppercase tracking-wider block mb-1">
              Teléfono WhatsApp
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:border-[#10b981] outline-none"
              placeholder="+54 9 11 0000-0000"
              required
            />
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

          {/* Free-text message */}
          <div>
            <label className="text-xs font-bold text-[#111c2d] uppercase tracking-wider block mb-1">
              Mensaje (texto libre)
            </label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={160}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:border-[#10b981] outline-none"
              placeholder="Ej: busco 2 jugadores para el sábado a la tarde en Nuñez"
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
