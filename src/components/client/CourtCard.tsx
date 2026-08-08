import React, { useState } from 'react';
import { Court, TimeSlot } from '../../types';
import { useApp } from '../../context/AppContext';
import { AddReviewModal } from './AddReviewModal';
import { CourtReviewsModal } from './CourtReviewsModal';

interface CourtCardProps {
  court: Court;
  locked?: boolean;
  onSelectBooking: (court: Court, timeSlot: string) => void;
}

export const CourtCard: React.FC<CourtCardProps> = ({ court, locked = false, onSelectBooking }) => {
  const { favorites, toggleFavorite, setShowAuthModal } = useApp();
  const isFav = favorites.includes(court.id);
  const [showAddReview, setShowAddReview] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(
    court.timeSlots.find((ts) => ts.available)?.displayTime || null
  );

  // Fallback photo collection for sports if images array has fewer than 2 items
  const sportFallbacks: Record<string, string[]> = {
    padel: [
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
    ],
    futbol: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80',
    ],
    default: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=800&q=80',
    ],
  };

  const courtImages = (() => {
    let list = (court.images && court.images.length > 0) ? [...court.images] : [court.imageUrl];
    if (list.length < 2) {
      const fallbacks = sportFallbacks[court.sport] || sportFallbacks.default;
      for (const fb of fallbacks) {
        if (!list.includes(fb) && list.length < 5) {
          list.push(fb);
        }
      }
    }
    return list.slice(0, 5);
  })();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % courtImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + courtImages.length) % courtImages.length);
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (locked || !slot.available) return;
    setSelectedSlot(slot.displayTime);
  };

  const handleReserveClick = () => {
    if (locked) {
      onSelectBooking(court, '');
      return;
    }
    const slotToBook = selectedSlot || court.timeSlots.find((ts) => ts.available)?.displayTime;
    if (!slotToBook) {
      alert('No hay horarios disponibles para esta cancha.');
      return;
    }
    onSelectBooking(court, slotToBook);
  };

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-[#bbcabf]/30 overflow-hidden flex flex-col transition-all hover:-translate-y-1 hover:shadow-md duration-200">
      {/* Court Image Carousel Header */}
      <div className="relative h-48 w-full bg-gray-900 overflow-hidden group">
        <img
          src={courtImages[currentImageIndex] || court.imageUrl}
          alt={`${court.name} - Foto ${currentImageIndex + 1}`}
          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Carousel controls if more than 1 image */}
        {courtImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black text-white p-1.5 rounded-full backdrop-blur-xs transition-opacity opacity-90 sm:opacity-0 group-hover:opacity-100 z-10"
              title="Foto anterior"
            >
              <span className="material-symbols-outlined text-base block">chevron_left</span>
            </button>

            <button
              type="button"
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black text-white p-1.5 rounded-full backdrop-blur-xs transition-opacity opacity-90 sm:opacity-0 group-hover:opacity-100 z-10"
              title="Siguiente foto"
            >
              <span className="material-symbols-outlined text-base block">chevron_right</span>
            </button>

            {/* Photo Counter Badge */}
            <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1 z-10">
              <span className="material-symbols-outlined text-xs">photo_camera</span>
              <span>{currentImageIndex + 1}/{courtImages.length}</span>
            </div>

            {/* Dots Indicator */}
            <div className="absolute bottom-2.5 inset-x-0 flex justify-center items-center gap-1.5 z-10">
              {courtImages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentImageIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                  }`}
                  title={`Ver foto ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(court.id);
          }}
          className="absolute top-3 right-3 text-white bg-black/40 hover:bg-black/60 rounded-full p-2 backdrop-blur-sm transition-transform active:scale-90 z-10"
          title={isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
        >
          <span className={`material-symbols-outlined text-xl ${isFav ? 'fill text-red-500' : ''}`}>
            favorite
          </span>
        </button>

        {/* Sport Badge */}
        <div className="absolute bottom-0 left-0 bg-[#10b981] text-white px-3 py-1 rounded-tr-lg font-headline text-xs font-bold uppercase tracking-wider shadow-sm z-10">
          {court.sportLabel}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex justify-between items-start gap-2">
            <div>
              <h2 className="font-headline text-lg font-bold text-[#111c2d] leading-snug">
                {court.name}
              </h2>
              <p className="text-xs text-[#3c4a42] font-medium flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-sm text-[#10b981]">location_on</span>
                {court.address}
              </p>
              {/* Rating */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <div className="flex text-amber-400 text-sm">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined text-sm"
                      style={{ fontVariationSettings: `'FILL' ${i < Math.floor(court.rating) ? 1 : 0}` }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <span className="text-xs font-bold text-[#111c2d]">{court.rating}</span>
                <span className="text-xs text-[#3c4a42]">({court.reviewCount})</span>

                {/* Review actions: always side by side, never split by wrapping */}
                <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                  <button
                    type="button"
                    onClick={() => setShowReviews(true)}
                    className="text-[11px] font-bold text-[#445d80] hover:text-[#006c49] bg-[#bdd6ff]/40 hover:bg-[#bdd6ff]/60 px-2.5 py-1 rounded-full border border-[#bdd6ff]/60 transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-xs">reviews</span>
                    <span>Ver reseñas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => (locked ? setShowAuthModal(true) : setShowAddReview(true))}
                    className="text-[11px] font-bold text-[#006c49] hover:text-[#10b981] bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200/60 transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-xs">rate_review</span>
                    <span>Añadir reseña</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="text-right whitespace-nowrap">
              <p className="font-headline text-lg font-extrabold text-[#111c2d]">
                {court.currency} {court.pricePerHour.toLocaleString('es-AR')}
              </p>
              <span className="text-[11px] text-gray-500 uppercase font-semibold">por hora</span>
            </div>
          </div>

          {/* Amenities Icons */}
          <div className="flex gap-3 text-gray-600 border-t border-b border-gray-100 py-2 my-2.5 text-xs">
            {court.amenities.parking && (
              <span className="flex items-center gap-1" title="Estacionamiento">
                <span className="material-symbols-outlined text-base text-[#10b981]">local_parking</span>
                <span>Parking</span>
              </span>
            )}
            {court.amenities.showers && (
              <span className="flex items-center gap-1" title="Vestuarios y Duchas">
                <span className="material-symbols-outlined text-base text-[#10b981]">shower</span>
                <span>Duchas</span>
              </span>
            )}
            {court.amenities.cafeteria && (
              <span className="flex items-center gap-1" title="Cafetería / Bar">
                <span className="material-symbols-outlined text-base text-[#10b981]">local_cafe</span>
                <span>Bar</span>
              </span>
            )}
            {court.amenities.lighting && (
              <span className="flex items-center gap-1" title="Iluminación LED">
                <span className="material-symbols-outlined text-base text-[#10b981]">light_mode</span>
                <span>Luz LED</span>
              </span>
            )}
          </div>

          {/* Available Time Slots Grid */}
          <div className="pt-1">
            <p className="font-headline text-xs font-bold text-[#111c2d] mb-2 uppercase tracking-wider">
              {locked ? 'Disponibilidad' : 'Horarios Disponibles'}
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
              {court.timeSlots.map((ts) => {
                const isSelected = selectedSlot === ts.displayTime;
                return (
                  <button
                    key={ts.id}
                    type="button"
                    disabled={!ts.available}
                    onClick={() => handleSlotClick(ts)}
                    className={`text-center rounded-lg py-1.5 px-1 flex flex-col items-center transition-all border ${
                      locked
                        ? 'bg-gray-50 border-gray-200 text-gray-400 opacity-70 cursor-not-allowed'
                        : !ts.available
                        ? 'bg-red-50 border-red-200 text-red-400 opacity-60 cursor-not-allowed'
                        : isSelected
                        ? 'bg-[#10b981] border-[#10b981] text-white shadow-md scale-105'
                        : 'bg-[#10b981]/10 border-[#10b981]/40 hover:bg-[#10b981]/20 text-[#111c2d]'
                    }`}
                  >
                    <span className="font-headline text-xs font-bold">{ts.time}</span>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider ${
                        locked
                          ? 'text-gray-400 flex items-center gap-0.5'
                          : !ts.available
                          ? 'text-red-600'
                          : isSelected
                          ? 'text-white'
                          : 'text-[#10b981]'
                      }`}
                    >
                      {locked ? (
                        <>
                          <span className="material-symbols-outlined text-[10px]">lock</span>
                          <span>Sesión</span>
                        </>
                      ) : ts.available ? (
                        'Libre'
                      ) : (
                        'Ocupado'
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Reserve Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleReserveClick}
            className="w-full sm:w-auto bg-[#10b981] hover:bg-[#0e9f6f] active:scale-95 text-white font-headline text-xs font-bold py-2.5 px-8 rounded-full transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">{locked ? 'lock' : 'event_available'}</span>
            <span>{locked ? 'INICIAR SESIÓN' : 'RESERVAR'}</span>
          </button>
        </div>
      </div>

      {/* Add Review Modal */}
      {showAddReview && (
        <AddReviewModal court={court} onClose={() => setShowAddReview(false)} />
      )}

      {/* Court Reviews Modal */}
      {showReviews && (
        <CourtReviewsModal court={court} onClose={() => setShowReviews(false)} />
      )}
    </article>
  );
};
