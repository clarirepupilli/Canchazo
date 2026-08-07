import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Court } from '../../types';
import { CourtFormModal } from './CourtFormModal';

/**
 * "Mi Complejo": lists every court owned by the current owner and lets them
 * edit each one (price, slots, amenities, photos) or add a new court.
 */
export const MyComplex: React.FC = () => {
  const { courts, authUser } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);

  // Owners manage their own courts; in local (non-Firebase) mode every court
  // is treated as editable.
  const myCourts = authUser ? courts.filter((c) => c.ownerId === authUser.uid) : courts;

  const openAdd = () => {
    setEditingCourt(null);
    setShowForm(true);
  };

  const openEdit = (court: Court) => {
    setEditingCourt(court);
    setShowForm(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header + Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-gray-400 font-medium">
          {myCourts.length === 0
            ? 'Todavía no tenés canchas publicadas.'
            : `Administrás ${myCourts.length} ${myCourts.length === 1 ? 'cancha' : 'canchas'}.`}
        </p>
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center justify-center gap-2 bg-[#006c49] hover:bg-[#10b981] text-white px-5 py-2.5 rounded-full font-headline text-xs font-bold transition-transform active:scale-95 shadow-md"
        >
          <span className="material-symbols-outlined text-lg">add_business</span>
          <span>Añadir Nueva Cancha</span>
        </button>
      </div>

      {/* Courts grid */}
      {myCourts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm space-y-3">
          <span className="material-symbols-outlined text-5xl text-gray-300">sports_soccer</span>
          <h3 className="font-headline text-lg font-bold text-[#111c2d]">
            Publicá tu primera cancha
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Tocá "Añadir Nueva Cancha" para cargar el nombre, los horarios, las fotos y los
            servicios de tu primera cancha. Después vas a poder editarla cuando quieras.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {myCourts.map((court) => (
            <article
              key={court.id}
              className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm flex flex-col"
            >
              <div className="relative h-40 bg-gray-900">
                <img
                  src={court.imageUrl}
                  alt={court.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <span className="absolute bottom-0 left-0 bg-[#10b981] text-white px-3 py-1 rounded-tr-lg font-headline text-xs font-bold uppercase tracking-wider">
                  {court.sportLabel}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col gap-3">
                <div>
                  <h3 className="font-headline text-base font-bold text-[#111c2d]">{court.name}</h3>
                  <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-sm text-[#10b981]">location_on</span>
                    {court.address || 'Sin dirección'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className="bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1 text-[11px] font-bold text-[#111c2d]">
                    {court.currency} {court.pricePerHour.toLocaleString('es-AR')}/h
                  </span>
                  <span className="bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1 text-[11px] font-bold text-[#111c2d]">
                    {court.timeSlots.length} horarios
                  </span>
                  {court.paymentMethods.map((pm) => (
                    <span key={pm} className="bg-emerald-50 border border-emerald-200/60 rounded-full px-2.5 py-1 text-[11px] font-bold text-[#006c49]">
                      {pm}
                    </span>
                  ))}
                </div>

                {/* Amenities summary */}
                <div className="flex gap-3 text-gray-600 border-t border-b border-gray-100 py-2 text-xs">
                  {court.amenities.parking && (
                    <span className="flex items-center gap-1" title="Estacionamiento">
                      <span className="material-symbols-outlined text-base text-[#10b981]">local_parking</span>
                    </span>
                  )}
                  {court.amenities.showers && (
                    <span className="flex items-center gap-1" title="Vestuarios y Duchas">
                      <span className="material-symbols-outlined text-base text-[#10b981]">shower</span>
                    </span>
                  )}
                  {court.amenities.cafeteria && (
                    <span className="flex items-center gap-1" title="Cafetería / Bar">
                      <span className="material-symbols-outlined text-base text-[#10b981]">local_cafe</span>
                    </span>
                  )}
                  {court.amenities.groups && (
                    <span className="flex items-center gap-1" title="Actividades en grupo">
                      <span className="material-symbols-outlined text-base text-[#10b981]">groups</span>
                    </span>
                  )}
                  {court.amenities.lighting && (
                    <span className="flex items-center gap-1" title="Iluminación LED">
                      <span className="material-symbols-outlined text-base text-[#10b981]">light_mode</span>
                    </span>
                  )}
                  {!Object.values(court.amenities).some(Boolean) && (
                    <span className="text-[11px] text-gray-400 italic">Sin servicios extra</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => openEdit(court)}
                  className="mt-auto flex items-center justify-center gap-2 bg-[#001c3a] hover:bg-[#002852] text-white py-2.5 rounded-xl font-headline text-xs font-bold transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-base">edit</span>
                  Editar Cancha
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      {showForm && (
        <CourtFormModal court={editingCourt ?? undefined} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
};
