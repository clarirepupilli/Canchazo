import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CourtCard } from './CourtCard';
import { CourtFilters } from './CourtFilters';
import { BookingModal } from './BookingModal';
import { Court } from '../../types';

interface CourtSearchProps {
  onlyFavorites?: boolean;
}

const parseTimeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const CourtSearch: React.FC<CourtSearchProps> = ({ onlyFavorites = false }) => {
  const { courts, filters, setFilters, setShowFilterModal, favorites } = useApp();
  const [bookingTarget, setBookingTarget] = useState<{ court: Court; timeSlot: string } | null>(null);

  // Filter courts based on state
  const filteredCourts = courts.filter((court) => {
    // Favorites filter
    if (onlyFavorites && !favorites.includes(court.id)) {
      return false;
    }
    // Sport filter
    if (filters.sport !== 'all' && court.sport !== filters.sport) {
      return false;
    }
    // Max price
    if (court.pricePerHour > filters.maxPrice) {
      return false;
    }
    // Search query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matchName = court.name.toLowerCase().includes(q);
      const matchComplex = court.complexName.toLowerCase().includes(q);
      const matchAddress = court.address.toLowerCase().includes(q);
      if (!matchName && !matchComplex && !matchAddress) {
        return false;
      }
    }
    // Time category filter: at least one available slot in the selected categories
    if (filters.timeCategories.length > 0) {
      const hasMatchingSlot = court.timeSlots.some(
        (ts) => ts.available && filters.timeCategories.includes(ts.category)
      );
      if (!hasMatchingSlot) {
        return false;
      }
    }
    // Exact time filter: at least one available slot whose range contains the time
    if (filters.exactTime) {
      const exact = parseTimeToMinutes(filters.exactTime);
      const hasMatchingSlot = court.timeSlots.some((ts) => {
        if (!ts.available) return false;
        const parts = ts.displayTime.split(' - ');
        if (parts.length !== 2) return false;
        const start = parseTimeToMinutes(parts[0]);
        const end = parseTimeToMinutes(parts[1]);
        return exact >= start && exact < end;
      });
      if (!hasMatchingSlot) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
      {/* Search Header Bar */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-[#111c2d] tracking-tight flex items-center gap-2">
              {onlyFavorites && (
                <span className="material-symbols-outlined text-red-500 fill text-2xl sm:text-3xl">favorite</span>
              )}
              <span>{onlyFavorites ? 'Canchas Favoritas' : 'Buscar Canchas'}</span>
            </h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {onlyFavorites
                ? 'Tus canchas guardadas para reservar rápidamente'
                : 'Encuentra y reserva canchas de fútbol 5, pádel y más en segundos'}
            </p>
          </div>
        </div>

        {/* Input Bar & Filter Trigger */}
        <div className="relative w-full flex gap-3">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">
              search
            </span>
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Buscar por nombre, barrio o complejo..."
              className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#10b981] font-medium text-sm text-[#111c2d] shadow-sm hover:shadow-md transition-all"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-2 text-[#ffffff] bg-[#001c3a] hover:bg-[#002852] active:scale-95 rounded-full px-5 py-3 font-headline text-xs font-bold transition-all shadow-md shrink-0"
          >
            <span className="material-symbols-outlined text-lg">tune</span>
            <span className="hidden sm:inline">Filtros</span>
          </button>
        </div>
      </section>

      {/* Main Content Grid View */}
      {filteredCourts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm space-y-3">
          <span className={`material-symbols-outlined text-5xl ${onlyFavorites ? 'text-red-400' : 'text-gray-400'}`}>
            {onlyFavorites ? 'favorite_border' : courts.length === 0 ? 'domain_disabled' : 'sports_score'}
          </span>
          <h3 className="font-headline text-lg font-bold text-[#111c2d]">
            {onlyFavorites
              ? 'Aún no tienes canchas favoritas'
              : courts.length === 0
              ? 'Aún no hay canchas registradas'
              : 'No encontramos canchas con estos filtros'}
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {onlyFavorites
              ? 'Haz clic en el ícono de corazón en cualquiera de las canchas para guardarla en tus favoritos.'
              : courts.length === 0
              ? 'Sé el primero en publicar un complejo deportivo ingresando como Dueño de Complejo.'
              : 'Prueba borrando los filtros de búsqueda o expandiendo el rango de precio.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourts.map((court) => (
            <CourtCard
              key={court.id}
              court={court}
              onSelectBooking={(c, slot) => setBookingTarget({ court: c, timeSlot: slot })}
            />
          ))}
        </div>
      )}

      {/* Filter Modal */}
      <CourtFilters />

      {/* Booking Modal */}
      {bookingTarget && (
        <BookingModal
          court={bookingTarget.court}
          timeSlot={bookingTarget.timeSlot}
          onClose={() => setBookingTarget(null)}
          onSuccess={() => setBookingTarget(null)}
        />
      )}
    </div>
  );
};
