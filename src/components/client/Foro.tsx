import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateDisplay, toISODate } from '../../utils/date';
import type { ForumPost } from '../../types';

/**
 * "Foro de Jugadores": a public wall of LFM (looking-for-members) posts that
 * a team publishes from one of its future bookings. Joining goes through a
 * WhatsApp deep link so nobody needs an account.
 */
export const Foro: React.FC = () => {
  const { posts, closePost, authUser, setShowAuthModal } = useApp();

  const todayIso = toISODate(new Date());
  const visiblePosts = posts
    .filter((p) => p.date >= todayIso)
    .sort((a, b) => a.date.localeCompare(b.date) || a.timeSlot.localeCompare(b.timeSlot));

  const handleClosePost = (post: ForumPost) => {
    if (window.confirm('¿Marcar el aviso como completo?')) {
      closePost(post.id);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
      {/* Sticky header */}
      <div className="sticky top-16 z-40 bg-[#f9f9ff] dark:bg-[#111c2d] pt-2 pb-3">
        <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-[#111c2d] dark:text-white">
          Foro
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
          Los equipos buscan jugadores para completar sus partidos
        </p>
      </div>

      {!authUser && (
        <div className="flex items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-[#006c49]">
            Iniciá sesión para publicar tus turnos libres
          </p>
          <button
            type="button"
            onClick={() => setShowAuthModal(true)}
            className="shrink-0 inline-flex items-center gap-1.5 bg-[#10b981] hover:bg-[#0e9f6f] text-white px-3.5 py-2 rounded-full text-xs font-bold transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">login</span>
            <span>Iniciar Sesión</span>
          </button>
        </div>
      )}

      {visiblePosts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm space-y-3">
          <span className="material-symbols-outlined text-5xl text-[#10b981]">group_add</span>
          <h3 className="font-headline text-lg font-bold text-[#111c2d]">
            Todavía no hay avisos
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Cuando un equipo reserve y le falten jugadores, su aviso aparecerá acá.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visiblePosts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Status badge */}
              {post.status === 'open' ? (
                <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                  Faltan {post.playersNeeded} jugadores
                </span>
              ) : (
                <span className="inline-flex items-center bg-gray-100 text-gray-500 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                  Completo
                </span>
              )}

              {/* Title */}
              <h3 className="font-headline text-base font-bold text-[#111c2d] mt-2">
                {post.courtName}
              </h3>
              <p className="text-xs text-gray-600 font-medium">{post.complexName}</p>

              {/* Details */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500 font-medium">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-[#10b981]">calendar_month</span>
                  {formatDateDisplay(post.date)}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-[#10b981]">schedule</span>
                  {post.timeSlot}
                </span>
              </div>

              {post.message && (
                <p className="text-xs text-gray-500 italic mt-2">{post.message}</p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100">
                <span className="text-[11px] text-gray-400 font-medium">
                  Publicado por {post.author}
                </span>
                <div className="flex items-center gap-2">
                  {post.status === 'open' &&
                    (post.whatsappContact ? (
                      <a
                        href={`https://wa.me/${post.whatsappContact}?text=${encodeURIComponent(
                          `Hola! Vi en Canchazo que faltan jugadores para ${post.courtName} (${post.complexName}) el ${post.dateDisplay} de ${post.timeSlot}. Me sumo!`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 bg-[#10b981] hover:bg-[#0e9f6f] text-white px-3 py-2 rounded-full text-xs font-bold transition-all active:scale-95 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-sm">chat</span>
                        <span>Sumarme</span>
                      </a>
                    ) : (
                      <button
                        type="button"
                        disabled
                        title="El equipo no dejó contacto"
                        className="inline-flex items-center gap-1.5 bg-gray-200 text-gray-400 px-3 py-2 rounded-full text-xs font-bold cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-sm">chat</span>
                        <span>Sumarme</span>
                      </button>
                    ))}
                  {post.status === 'open' && post.userId === authUser?.uid && (
                    <button
                      type="button"
                      onClick={() => handleClosePost(post)}
                      className="px-3 py-2 rounded-full text-xs font-semibold text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      Cerrar aviso
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};