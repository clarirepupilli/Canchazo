import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Court, SportType } from '../../types';

export const MyComplexForm: React.FC = () => {
  const { addCourt, setCurrentOwnerComplexName, currentOwnerComplexName, showToast } = useApp();

  const [complexName, setComplexName] = useState(currentOwnerComplexName || '');
  const [address, setAddress] = useState('');
  const [courtType, setCourtType] = useState<SportType>('futbol');
  const [price, setPrice] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [paymentCash, setPaymentCash] = useState(true);
  const [paymentTransfer, setPaymentTransfer] = useState(true);

  // Predefined or uploaded photo URLs (up to 5)
  const defaultPhotos = [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80',
  ];
  const [courtPhotos, setCourtPhotos] = useState<string[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (courtPhotos.length >= 5) {
        showToast('Máximo 5 fotos por cancha.');
        return;
      }
      const file = e.target.files[0];
      const objectUrl = URL.createObjectURL(file);
      setCourtPhotos((prev) => [...prev, objectUrl].slice(0, 5));
      showToast(`Imagen agregada (${courtPhotos.length + 1}/5): ${file.name}`);
    }
  };

  const removePhoto = (index: number) => {
    if (courtPhotos.length <= 1) {
      showToast('Debes mantener al menos 1 foto.');
      return;
    }
    setCourtPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complexName) {
      showToast('Ingresa un nombre para el complejo');
      return;
    }

    setCurrentOwnerComplexName(complexName);

    const newCourt: Court = {
      id: 'court-' + Date.now(),
      name: `${complexName} - Cancha Principal`,
      complexName,
      sport: courtType,
      sportLabel: courtType === 'futbol' ? 'Fútbol 5' : 'Pádel',
      pricePerHour: Number(price) || 18000,
      currency: '$',
      rating: 5.0,
      reviewCount: 1,
      address,
      imageUrl: courtPhotos[0] || defaultPhotos[0],
      images: courtPhotos,
      amenities: {
        parking: true,
        showers: true,
        cafeteria: true,
        groups: true,
        lighting: true,
      },
      surface: courtType === 'padel' ? 'cristal' : 'sintetico',
      whatsappNumber: whatsapp,
      paymentMethods: [
        ...(paymentCash ? ['Efectivo' as const] : []),
        ...(paymentTransfer ? ['Transferencia Bancaria' as const] : []),
      ],
      timeSlots: [
        { id: 'ts-n1', time: '18:00', displayTime: '18:00 - 19:00', category: 'afternoon', available: true },
        { id: 'ts-n2', time: '19:00', displayTime: '19:00 - 20:00', category: 'night', available: true },
        { id: 'ts-n3', time: '20:00', displayTime: '20:00 - 21:00', category: 'night', available: true },
        { id: 'ts-n4', time: '21:00', displayTime: '21:00 - 22:00', category: 'night', available: true },
      ],
    };

    addCourt(newCourt);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-gray-200">
      {/* Header with User Avatar Icon */}
      <div className="bg-[#0f172a] pt-12 pb-10 rounded-2xl flex justify-center relative mb-8 text-center text-white">
        <div className="absolute -bottom-8 w-16 h-16 bg-[#10b981] rounded-full flex items-center justify-center border-4 border-white shadow-md">
          <span className="material-symbols-outlined text-3xl text-white">person</span>
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="font-headline text-xl font-bold uppercase tracking-wide text-[#111c2d]">
          REGISTRO DE COMPLEJO
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Completa los datos de tu sede deportiva para publicar tus canchas
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Complex Name */}
        <div>
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

        {/* Address */}
        <div>
          <label className="text-xs font-bold text-[#111c2d] block mb-1">Dirección</label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Ej. Av. Juan B. Justo 3200, Villa Crespo"
            className="w-full bg-white text-[#111c2d] border border-gray-300 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-[#10b981]"
          />
        </div>

        {/* Court Type & Price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-[#111c2d] block mb-1">Tipo de Cancha</label>
            <select
              value={courtType}
              onChange={(e) => setCourtType(e.target.value as SportType)}
              className="w-full bg-white text-[#111c2d] border border-gray-300 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-[#10b981] font-medium"
            >
              <option value="futbol">Fútbol 5</option>
              <option value="padel">Pádel</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#111c2d] block mb-1">Precios por Hora ($)</label>
            <input
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="18000"
              className="w-full bg-white text-[#111c2d] border border-gray-300 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-[#10b981] font-bold"
            />
          </div>
        </div>

        {/* WhatsApp Business Number */}
        <div>
          <label className="text-xs font-bold text-[#111c2d] flex items-center gap-1 mb-1">
            WhatsApp Business Number
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="material-symbols-outlined text-emerald-500 text-lg absolute left-4 top-1/2 -translate-y-1/2">
              forum
            </span>
            <input
              type="tel"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+54 (911) 0000-0000"
              className="w-full bg-white text-[#111c2d] border border-gray-300 rounded-full pl-11 pr-5 py-3 text-sm focus:outline-none focus:border-[#10b981]"
            />
          </div>
        </div>

        {/* Photo Upload & Gallery Selector */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-bold text-[#111c2d]">Fotos de la Cancha</label>
            <span className="text-[11px] font-semibold text-emerald-600">
              {courtPhotos.length}/5 fotos
            </span>
          </div>

          <div className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-[#10b981] hover:bg-emerald-50/50 transition-all relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <span className="material-symbols-outlined text-2xl">add_a_photo</span>
              <span className="text-xs font-bold text-gray-700">Subir nueva foto</span>
            </div>
            <p className="text-[11px] text-gray-500">
              Haz clic o arrastra imágenes (máximo 5 fotos)
            </p>
          </div>

          {/* Photo List Preview */}
          <div className="grid grid-cols-5 gap-2 mt-3">
            {courtPhotos.map((img, idx) => (
              <div
                key={idx}
                className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 group bg-gray-100"
              >
                <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 text-white p-0.5 rounded-full transition-opacity"
                  title="Eliminar foto"
                >
                  <span className="material-symbols-outlined text-xs block">close</span>
                </button>
                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1 rounded">
                  {idx + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

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

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-[#10b981] hover:bg-[#0ea5e9] text-white py-4 rounded-full font-headline text-sm font-bold shadow-md transition-all active:scale-98"
          >
            Guardar y Publicar Complejo
          </button>
        </div>
      </form>
    </div>
  );
};
