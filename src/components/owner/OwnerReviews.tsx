import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const OwnerReviews: React.FC = () => {
  const { reviews, addReviewReply } = useApp();
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleReplySubmit = (reviewId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    addReviewReply(reviewId, replyText);
    setReplyText('');
    setActiveReplyId(null);
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-headline text-base sm:text-lg font-bold text-[#006c49]">
          RESEÑAS DE LA GENTE
        </h3>
        <span className="material-symbols-outlined text-gray-400">rate_review</span>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <span className="material-symbols-outlined text-3xl text-gray-300 mb-1">rate_review</span>
            <p className="text-xs font-semibold text-gray-500">Aún no hay reseñas registradas.</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Las reseñas que dejen los jugadores aparecerán aquí.</p>
          </div>
        ) : (
          reviews.map((rev) => (
          <div key={rev.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#476083] text-white flex items-center justify-center font-bold text-sm">
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

            {!rev.reply && (
              <div className="pt-1">
                {activeReplyId === rev.id ? (
                  <form onSubmit={(e) => handleReplySubmit(rev.id, e)} className="flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Escribe tu respuesta..."
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:border-[#10b981] outline-none"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="bg-[#10b981] text-white px-3 py-1.5 text-xs font-bold rounded-lg hover:bg-[#0e9f6f]"
                    >
                      Responder
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveReplyId(null)}
                      className="text-xs text-gray-500 px-2 hover:underline"
                    >
                      Cancelar
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveReplyId(rev.id)}
                    className="text-[11px] font-bold text-[#006c49] hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-xs">reply</span>
                    <span>Responder reseña</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ))
      )}
      </div>
    </div>
  );
};
