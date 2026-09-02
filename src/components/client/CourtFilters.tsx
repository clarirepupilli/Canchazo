import React from 'react';
import { useApp } from '../../context/AppContext';
import { SportType, TimeSlotCategory, NO_MAX_PRICE } from '../../types';

export const CourtFilters: React.FC = () => {
  const { filters, setFilters, resetFilters, showFilterModal, setShowFilterModal, showToast, courts } = useApp();
  const maxCourtPrice = courts.reduce((m, c) => Math.max(m, c.pricePerHour), 0);
  const sliderMax = Math.max(maxCourtPrice, 500000);

  if (!showFilterModal) return null;

  const handleSportChange = (sport: SportType | 'all') => {
    setFilters((prev) => ({ ...prev, sport }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }));
  };

  const handleCategoryToggle = (cat: TimeSlotCategory) => {
    setFilters((prev) => {
      const exists = prev.timeCategories.includes(cat);
      const updated = exists
        ? prev.timeCategories.filter((c) => c !== cat)
        : [...prev.timeCategories, cat];
      return { ...prev, timeCategories: updated };
    });
  };

  const handleApply = () => {
    setShowFilterModal(false);
    showToast('Filtros aplicados');
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-[#111c2d]/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="font-headline text-lg font-bold text-[#111c2d]">Filtros Avanzados</h2>
          <button
            type="button"
            onClick={() => setShowFilterModal(false)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 focus:outline-none"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Sport Selection */}
          <section className="space-y-3">
            <h3 className="font-headline text-xs font-bold text-gray-500 uppercase tracking-wider">
              Deporte
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <label className="cursor-pointer relative">
                <input
                  type="radio"
                  name="sport"
                  checked={filters.sport === 'all'}
                  onChange={() => handleSportChange('all')}
                  className="peer sr-only"
                />
                <div className="p-3 rounded-xl border border-gray-300 peer-checked:border-[#10b981] peer-checked:bg-[#f0fdf4] flex items-center justify-center gap-2 transition-all">
                  <span className="font-medium text-xs text-[#111c2d]">Todos</span>
                </div>
              </label>

              <label className="cursor-pointer relative">
                <input
                  type="radio"
                  name="sport"
                  checked={filters.sport === 'futbol'}
                  onChange={() => handleSportChange('futbol')}
                  className="peer sr-only"
                />
                <div className="p-3 rounded-xl border border-gray-300 peer-checked:border-[#10b981] peer-checked:bg-[#f0fdf4] flex items-center justify-center gap-2 transition-all">
                  <span className="material-symbols-outlined text-sm text-[#10b981]">sports_soccer</span>
                  <span className="font-medium text-xs text-[#111c2d]">Fútbol 5</span>
                </div>
              </label>

              <label className="cursor-pointer relative">
                <input
                  type="radio"
                  name="sport"
                  checked={filters.sport === 'padel'}
                  onChange={() => handleSportChange('padel')}
                  className="peer sr-only"
                />
                <div className="p-3 rounded-xl border border-gray-300 peer-checked:border-[#10b981] peer-checked:bg-[#f0fdf4] flex items-center justify-center gap-2 transition-all">
                  <span className="material-symbols-outlined text-sm text-[#10b981]">sports_tennis</span>
                  <span className="font-medium text-xs text-[#111c2d]">Pádel</span>
                </div>
              </label>
            </div>
          </section>

          {/* Price Range Slider */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-xs font-bold text-gray-500 uppercase tracking-wider">
                Rango de Precio
              </h3>
              <span className="text-sm font-bold text-[#10b981]">
                {filters.maxPrice === NO_MAX_PRICE
                  ? 'Sin límite'
                  : `Hasta $${filters.maxPrice.toLocaleString('es-AR')}`}
              </span>
            </div>
            <div className="px-2 pt-2">
              <input
                type="range"
                min={1000}
                max={sliderMax}
                step={1000}
                value={filters.maxPrice === NO_MAX_PRICE ? sliderMax : Math.min(filters.maxPrice, sliderMax)}
                onChange={handlePriceChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#10b981]"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
                <span>$1.000</span>
                <span>${sliderMax.toLocaleString('es-AR')}+</span>
              </div>
            </div>
          </section>

          {/* Time Slot Checkboxes */}
          <section className="space-y-3">
            <h3 className="font-headline text-xs font-bold text-gray-500 uppercase tracking-wider">
              Turnos Horarios
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {/* Morning */}
              <label
                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  filters.timeCategories.includes('morning')
                    ? 'border-[#10b981] bg-[#f0fdf4]'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => handleCategoryToggle('morning')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    <span className="material-symbols-outlined text-lg">light_mode</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#111c2d]">Mañana (Morning)</div>
                    <div className="text-xs text-gray-500">08:00 - 12:00</div>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    filters.timeCategories.includes('morning')
                      ? 'border-[#10b981] bg-[#10b981] text-white'
                      : 'border-gray-300'
                  }`}
                >
                  {filters.timeCategories.includes('morning') && (
                    <span className="material-symbols-outlined text-xs">check</span>
                  )}
                </div>
              </label>

              {/* Afternoon */}
              <label
                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  filters.timeCategories.includes('afternoon')
                    ? 'border-[#10b981] bg-[#f0fdf4]'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => handleCategoryToggle('afternoon')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#10b981]/20 flex items-center justify-center text-[#10b981]">
                    <span className="material-symbols-outlined text-lg">wb_sunny</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#111c2d]">Tarde (Afternoon)</div>
                    <div className="text-xs text-gray-500">12:00 - 18:00</div>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    filters.timeCategories.includes('afternoon')
                      ? 'border-[#10b981] bg-[#10b981] text-white'
                      : 'border-gray-300'
                  }`}
                >
                  {filters.timeCategories.includes('afternoon') && (
                    <span className="material-symbols-outlined text-xs">check</span>
                  )}
                </div>
              </label>

              {/* Night */}
              <label
                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  filters.timeCategories.includes('night')
                    ? 'border-[#10b981] bg-[#f0fdf4]'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => handleCategoryToggle('night')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <span className="material-symbols-outlined text-lg">dark_mode</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#111c2d]">Noche (Night)</div>
                    <div className="text-xs text-gray-500">18:00 - 00:00</div>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    filters.timeCategories.includes('night')
                      ? 'border-[#10b981] bg-[#10b981] text-white'
                      : 'border-gray-300'
                  }`}
                >
                  {filters.timeCategories.includes('night') && (
                    <span className="material-symbols-outlined text-xs">check</span>
                  )}
                </div>
              </label>
            </div>
          </section>

          {/* Exact Time Input */}
          <section className="space-y-2">
            <h3 className="font-headline text-xs font-bold text-gray-500 uppercase tracking-wider">
              Hora Exacta
            </h3>
            <div className="relative">
              <input
                type="time"
                value={filters.exactTime}
                onChange={(e) => setFilters((prev) => ({ ...prev, exactTime: e.target.value }))}
                className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 font-medium text-sm text-[#111c2d] focus:border-[#10b981] focus:outline-none"
              />
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 bg-white flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-bold text-gray-500 hover:text-[#10b981] transition-colors px-4 py-3"
          >
            Limpiar Todo
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 bg-[#10b981] text-white font-headline text-sm font-bold py-3 rounded-xl hover:bg-[#0e9f6f] transition-all shadow-md active:scale-95"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>
  );
};
