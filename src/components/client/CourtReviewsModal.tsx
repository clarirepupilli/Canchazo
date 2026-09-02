import React from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { Court } from '../../types';

interface CourtReviewsModalProps {
  court: Court;
  onClose: () => void;
}

/**
 * Client-facing review list for a single court. Rendered through a portal so
 * `position: fixed` stays anchored to the viewport even when the modal is
 * mounted inside a transformed ancestor (e.g. CourtCard hover translate).
 */
export const CourtReviewsModal: React.FC<CourtReviewsModalProps> = ({ court, onClose }) => {
  const { reviews } = useApp();
  // Match by courtId when available (unique per court); fall back to name for
  // legacy reviews written before courtId was stored.
  const courtReviews = reviews.filter(
    (r) => r.courtId === court.id || (!r.courtId && r.courtName === court.name)
  );

  return createPortal(
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-[#111c2d]/80 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-[24px] w-full max-w-md shadow-2xl overflow-hidden relative flex flex-col my-6">
        {/* Header */}
        <div className="bg-[#111c2d] text-white px-6 py-4 flex items-center justify-between">
          <h2 className="font-headline text-base font-bold uppercase tracking-wide flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400">reviews</span>
            <span>Reseñas de Clientes</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 -mr-1 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Court Info */}
        <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-3 text-center mx-6 mt-5">
          <span className="text-[10px] font-bold text-[#006c49] uppercase tracking-wider block">
            Cancha / Complejo
          </span>
          <h3 className="font-headline text-sm font-bold text-[#111c2d]">{court.name}</h3>
          <p className="text-xs text-gray-500">{court.complexName}</p>
        </div>

        {/* Reviews List */}
        <div className="p-6 pt-4 space-y-4 overflow-y-auto max-h-[50vh]">
          {courtReviews.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-2">
              <span className="material-symbols-outlined text-3xl text-gray-300">rate_review</span>
              <p className="text-xs font-semibold text-gray-600">
                Aún no hay reseñas para esta cancha.
              </p>
              <p className="text-[11px] text-gray-400">
                ¡Sé el primero en dejar tu opinión!
              </p>
            </div>
          ) : (
            courtReviews.map((rev) => (
              <div key={rev.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#476083] text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {rev.avatarLetter}
                    </div>
                    <div>
                      <h4 className="font-headline text-xs font-bold text-[#111c2d]">{rev.author}</h4>
                      <div className="flex text-amber-400 text-xs mt-0.5">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className="material-symbols-outlined text-xs"
                            style={{ fontVariationSettings: `'FILL' ${i < rev.rating ? 1 : 0}` }}
                          >
                            star
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium">{rev.date}</span>
                </div>

                <p className="text-xs text-gray-600 italic">"{rev.comment}"</p>

                {rev.reply && (
                  <div className="mt-2 bg-emerald-50 border-l-2 border-[#10b981] p-2.5 rounded-r-lg">
                    <span className="text-[10px] font-bold text-[#006c49] uppercase block mb-0.5">
                      Respuesta de la Sede
                    </span>
                    <p className="text-xs text-gray-700">{rev.reply}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
