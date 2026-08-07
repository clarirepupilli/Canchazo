import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { Court } from '../../types';

interface AddReviewModalProps {
  court: Court;
  onClose: () => void;
}

export const AddReviewModal: React.FC<AddReviewModalProps> = ({ court, onClose }) => {
  const { addReview } = useApp();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [author, setAuthor] = useState<string>('');
  const [comment, setComment] = useState<string>('');

  const ratingLabels: Record<number, string> = {
    1: 'Mala',
    2: 'Regular',
    3: 'Buena',
    4: 'Muy Buena',
    5: '¡Excelente!',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert('Por favor, escribe una breve opinión.');
      return;
    }

    addReview({
      courtId: court.id,
      courtName: court.name,
      rating,
      comment: comment.trim(),
      author: author.trim() || 'Jugador Canchazo',
    });

    onClose();
  };

  const activeRating = hoverRating !== null ? hoverRating : rating;

  return createPortal(
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-[#111c2d]/80 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-[24px] w-full max-w-md shadow-2xl overflow-hidden relative flex flex-col my-6">
        {/* Header */}
        <div className="bg-[#111c2d] text-white px-6 py-4 flex items-center justify-between">
          <h2 className="font-headline text-base font-bold uppercase tracking-wide flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400">rate_review</span>
            <span>Añadir Reseña</span>
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
          {/* Court Info */}
          <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-3 text-center">
            <span className="text-[10px] font-bold text-[#006c49] uppercase tracking-wider block">
              Cancha / Complejo
            </span>
            <h3 className="font-headline text-sm font-bold text-[#111c2d]">{court.name}</h3>
            <p className="text-xs text-gray-500">{court.complexName}</p>
          </div>

          {/* Rating Selector */}
          <div className="text-center space-y-2">
            <label className="text-xs font-bold text-[#111c2d] uppercase tracking-wider block">
              Puntuación
            </label>
            <div className="flex justify-center items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 focus:outline-none transition-transform active:scale-125"
                >
                  <span
                    className={`material-symbols-outlined text-3xl transition-colors ${
                      star <= activeRating ? 'text-amber-400 fill' : 'text-gray-300'
                    }`}
                  >
                    star
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs font-bold text-[#006c49] h-4">
              {ratingLabels[activeRating]}
            </p>
          </div>

          {/* Author Input */}
          <div>
            <label className="text-xs font-bold text-[#111c2d] uppercase tracking-wider block mb-1">
              Tu Nombre
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:border-[#10b981] outline-none"
              placeholder="Nombre y Apellido"
              required
            />
          </div>

          {/* Comment Textarea */}
          <div>
            <label className="text-xs font-bold text-[#111c2d] uppercase tracking-wider block mb-1">
              Tu Opinión
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium focus:border-[#10b981] outline-none resize-none"
              placeholder="¿Qué tal las instalaciones, la iluminación y la atención?"
              required
            ></textarea>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#0e9f6f] text-white py-3.5 px-6 rounded-xl font-headline text-xs font-extrabold tracking-wide uppercase transition-all shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">send</span>
              <span>PUBLICAR RESEÑA</span>
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
