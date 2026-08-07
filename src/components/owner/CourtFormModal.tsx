import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { Court, SportType, TimeSlot, TimeSlotCategory } from '../../types';
import { PhotoGallery } from './PhotoGallery';

interface CourtFormModalProps {
  court?: Court;
  onClose: () => void;
}

type AmenityKey = keyof Court['amenities'];

const AMENITIES: { key: AmenityKey; label: string; icon: string }[] = [
  { key: 'parking', label: 'Estacionamiento', icon: 'local_parking' },
  { key: 'showers', label: 'Vestuarios y Duchas', icon: 'shower' },
  { key: 'cafeteria', label: 'Cafetería / Bar', icon: 'local_cafe' },
  { key: 'groups', label: 'Actividades en grupo', icon: 'groups' },
  { key: 'lighting', label: 'Iluminación LED', icon: 'light_mode' },
];

const DEFAULT_SLOTS: TimeSlot[] = [
  { id: 'ts-n1', time: '18:00', displayTime: '18:00 - 19:00', category: 'afternoon', available: true },
  { id: 'ts-n2', time: '19:00', displayTime: '19:00 - 20:00', category: 'night', available: true },
  { id: 'ts-n3', time: '20:00', displayTime: '20:00 - 21:00', category: 'night', available: true },
  { id: 'ts-n4', time: '21:00', displayTime: '21:00 - 22:00', category: 'night', available: true },
];

const HOUR_OPTIONS = Array.from({ length: 18 }, (_, i) => {
  const h = i + 6; // 06:00 .. 23:00
  return `${String(h).padStart(2, '0')}:00`;
});

const slotCategory = (hour: number): TimeSlotCategory =>
  hour < 12 ? 'morning' : hour < 19 ? 'afternoon' : 'night';

const sortSlots = (slots: TimeSlot[]): TimeSlot[] =>
  [...slots].sort((a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : 0));

export const CourtFormModal: React.FC<CourtFormModalProps> = ({ court, onClose }) => {
  const { addCourt, updateCourt, showToast, currentOwnerComplexName, setCurrentOwnerComplexName } = useApp();
  const editing = !!court;

  const [complexName, setComplexName] = useState(court?.complexName || currentOwnerComplexName || '');
  const [name, setName] = useState(court?.name || '');
  const [address, setAddress] = useState(court?.address || '');
  const [sport, setSport] = useState<SportType>(court?.sport || 'futbol');
  const [price, setPrice] = useState(court ? String(court.pricePerHour) : '');
  const [whatsapp, setWhatsapp] = useState(court?.whatsappNumber || '');
  const [paymentCash, setPaymentCash] = useState(
    court ? court.paymentMethods.includes('Efectivo') : true
  );
  const [paymentTransfer, setPaymentTransfer] = useState(
    court ? court.paymentMethods.includes('Transferencia Bancaria') : true
  );
  const [photos, setPhotos] = useState<string[]>(
    court ? (court.images && court.images.length > 0 ? court.images : [court.imageUrl]) : []
  );
  const [amenities, setAmenities] = useState<Court['amenities']>(
    court?.amenities ?? { parking: false, showers: false, cafeteria: false, groups: false, lighting: false }
  );
  const [slots, setSlots] = useState<TimeSlot[]>(court ? sortSlots(court.timeSlots) : DEFAULT_SLOTS);
  const [newHour, setNewHour] = useState('18:00');

  const toggleAmenity = (key: AmenityKey) =>
    setAmenities((prev) => ({ ...prev, [key]: !prev[key] }));

  const addSlot = () => {
    const startHour = Number(newHour.split(':')[0]);
    const endHour = startHour + 1;
    const displayTime = `${newHour} - ${String(endHour).padStart(2, '0')}:00`;
    if (slots.some((s) => s.displayTime === displayTime)) {
      showToast('Ese horario ya existe.');
      return;
    }
    const newSlot: TimeSlot = {
      id: 'ts-' + Date.now().toString(36),
      time: newHour,
      displayTime,
      category: slotCategory(startHour),
      available: true,
    };
    setSlots((prev) => sortSlots([...prev, newSlot]));
  };

  const removeSlot = (slotId: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== slotId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complexName.trim() || !name.trim()) {
      showToast('Completá el nombre del complejo y el de la cancha.');
      return;
    }
    if (photos.length === 0) {
      showToast('Elegí al menos 1 foto de la galería.');
      return;
    }
    if (slots.length === 0) {
      showToast('Agregá al menos 1 horario.');
      return;
    }
    const priceValue = Number(price);
    if (!priceValue || priceValue <= 0) {
      showToast('Ingresá un precio válido.');
      return;
    }

    setCurrentOwnerComplexName(complexName);

    const courtData: Court = {
      id: court?.id ?? 'court-' + Date.now(),
      ownerId: court?.ownerId,
      name: name.trim(),
      complexName: complexName.trim(),
      sport,
      sportLabel: sport === 'futbol' ? 'Fútbol 5' : sport === 'padel' ? 'Pádel' : 'Tenis',
      pricePerHour: priceValue,
      currency: '$',
      rating: court?.rating ?? 0,
      reviewCount: court?.reviewCount ?? 0,
      address: address.trim(),
      imageUrl: photos[0],
      images: photos,
      amenities,
      surface: sport === 'padel' ? 'cristal' : sport === 'tenis' ? 'cemento' : 'sintetico',
      whatsappNumber: whatsapp.trim(),
      paymentMethods: [
        ...(paymentCash ? ['Efectivo' as const] : []),
        ...(paymentTransfer ? ['Transferencia Bancaria' as const] : []),
      ],
      timeSlots: slots.map((s) => ({ ...s, available: true })),
    };

    if (editing) {
      updateCourt(courtData);
    } else {
      addCourt(courtData);
    }
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-[#111c2d]/80 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-[24px] w-full max-w-2xl shadow-2xl overflow-hidden relative flex flex-col my-6">
        {/* Header */}
        <div className="bg-[#111c2d] text-white px-6 py-4 flex items-center justify-between">
          <h2 className="font-headline text-base font-bold uppercase tracking-wide flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400">
              {editing ? 'edit_location_alt' : 'add_business'}
            </span>
            <span>{editing ? 'Editar Cancha' : 'Añadir Nueva Cancha'}</span>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-[#111c2d] block mb-1">Nombre del Complejo</label>
              <input
                type="text"
                required
                value={complexName}
                onChange={(e) => setComplexName(e.target.value)}
                placeholder="Ej. F5 Goles Palace"
                className="w-full bg-white text-[#111c2d] border border-gray-300 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-[#10b981]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#111c2d] block mb-1">Nombre de la Cancha</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Cancha Principal"
                className="w-full bg-white text-[#111c2d] border border-gray-300 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-[#10b981]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#111c2d] block mb-1">Dirección</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ej. Av. Juan B. Justo 3200"
                className="w-full bg-white text-[#111c2d] border border-gray-300 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-[#10b981]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#111c2d] block mb-1">Tipo de Cancha</label>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value as SportType)}
                className="w-full bg-white text-[#111c2d] border border-gray-300 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-[#10b981] font-medium"
              >
                <option value="futbol">Fútbol 5</option>
                <option value="padel">Pádel</option>
                <option value="tenis">Tenis</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#111c2d] block mb-1">Precio por Hora ($)</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="18000"
                className="w-full bg-white text-[#111c2d] border border-gray-300 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-[#10b981] font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-[#111c2d] block mb-1">
                WhatsApp para contacto
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+54 (911) 0000-0000"
                className="w-full bg-white text-[#111c2d] border border-gray-300 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-[#10b981]"
              />
            </div>
          </div>

          {/* Amenities — owner picks what the court actually has */}
          <div>
            <label className="text-xs font-bold text-[#111c2d] block mb-2">Servicios de la Cancha</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {AMENITIES.map((a) => (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => toggleAmenity(a.key)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    amenities[a.key]
                      ? 'bg-emerald-50 border-[#10b981] text-[#006c49]'
                      : 'bg-white border-gray-200 text-gray-500 hover:border-[#10b981]/50'
                  }`}
                >
                  <span className={`material-symbols-outlined text-base ${amenities[a.key] ? 'text-[#10b981]' : ''}`}>
                    {a.icon}
                  </span>
                  <span>{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-[#111c2d]">Horarios de Apertura</label>
              <span className="text-[11px] font-semibold text-gray-400">
                {slots.length} horarios
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full pl-3 pr-1.5 py-1"
                >
                  <span className="text-xs font-bold text-[#111c2d]">{slot.displayTime}</span>
                  <button
                    type="button"
                    onClick={() => removeSlot(slot.id)}
                    className="text-gray-400 hover:text-red-600 rounded-full p-0.5 transition-colors"
                    title="Quitar horario"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-2.5">
              <select
                value={newHour}
                onChange={(e) => setNewHour(e.target.value)}
                className="bg-white text-[#111c2d] border border-gray-300 rounded-full px-4 py-2 text-xs font-medium focus:outline-none focus:border-[#10b981]"
              >
                {HOUR_OPTIONS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              <span className="text-xs text-gray-500 font-medium">a {Number(newHour.split(':')[0]) + 1}:00 hs</span>
              <button
                type="button"
                onClick={addSlot}
                className="flex items-center gap-1 bg-[#10b981]/10 hover:bg-[#10b981]/20 text-[#006c49] border border-[#10b981]/40 px-3.5 py-2 rounded-full text-xs font-bold transition-all"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Agregar horario
              </button>
            </div>
          </div>

          {/* Photos */}
          <PhotoGallery sport={sport} selected={photos} onChange={setPhotos} />

          {/* Payment Methods */}
          <div>
            <label className="text-xs font-bold text-[#111c2d] block mb-2">Métodos de Pago</label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentCash}
                  onChange={(e) => setPaymentCash(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-[#10b981] focus:ring-[#10b981]"
                />
                <span className="text-sm text-gray-700 font-medium">Efectivo</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentTransfer}
                  onChange={(e) => setPaymentTransfer(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-[#10b981] focus:ring-[#10b981]"
                />
                <span className="text-sm text-gray-700 font-medium">Transferencia Bancaria</span>
              </label>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#0e9f6f] text-white py-3.5 px-6 rounded-xl font-headline text-xs font-extrabold tracking-wide uppercase transition-all shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">
                {editing ? 'save' : 'add_business'}
              </span>
              <span>{editing ? 'GUARDAR CAMBIOS' : 'PUBLICAR CANCHA'}</span>
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
