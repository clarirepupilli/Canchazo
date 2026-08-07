import React, { useRef, useState } from 'react';
import type { SportType } from '../../types';
import { useApp } from '../../context/AppContext';

/**
 * Curated gallery of real court photos per sport, plus the option to upload ONE
 * photo from the owner's own device. Without Firebase Storage the photo is
 * compressed to a small JPEG data-URL stored inside the court document (the
 * owner's cover photo); Firestore caps documents at 1 MiB, so one uploaded
 * photo per court is the safe limit.
 */
const GALLERY: Record<string, string[]> = {
  futbol: [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80',
  ],
  padel: [
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
  ],
  tenis: [
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
  ],
};

const MAX_PHOTOS = 5;
// Uploaded photo is compressed and stored as a data-URL inside the court doc
// (Firestore document limit is 1 MiB), so keep it well below that.
const UPLOAD_MAX_WIDTH = 900;
const UPLOAD_JPEG_QUALITY = 0.68;
const MAX_DATA_URL_LENGTH = 500_000;

interface PhotoGalleryProps {
  sport: SportType;
  selected: string[];
  onChange: (photos: string[]) => void;
}

/**
 * Read a device image, downscale it and encode as a JPEG data-URL.
 * Returns the data URL string (never a blob: URL, which does not survive reloads).
 */
function imageToDataUrl(file: File, maxWidth = UPLOAD_MAX_WIDTH, quality = UPLOAD_JPEG_QUALITY): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('El archivo no es una imagen válida.'))
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('No se pudo procesar la imagen.'))
          return
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ sport, selected, onChange }) => {
  const { authUser, showToast } = useApp();
  const pool = GALLERY[sport] || GALLERY.futbol;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);

  const hasOwnPhoto = selected.some((u) => u.startsWith('data:'));

  const toggle = (url: string) => {
    if (selected.includes(url)) {
      onChange(selected.filter((u) => u !== url));
    } else if (selected.length < MAX_PHOTOS) {
      onChange([...selected, url]);
    }
  };

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('El archivo no es una imagen.');
      return;
    }
    if (!authUser?.uid) {
      showToast('Necesitás iniciar sesión para subir fotos.');
      return;
    }
    if (selected.length >= MAX_PHOTOS) {
      showToast(`Podés elegir hasta ${MAX_PHOTOS} fotos.`);
      return;
    }
    if (hasOwnPhoto) {
      showToast('Solo se puede subir 1 foto propia por cancha.');
      return;
    }

    setProcessing(true);
    try {
      const dataUrl = await imageToDataUrl(file);
      if (dataUrl.length > MAX_DATA_URL_LENGTH) {
        showToast('La foto es muy pesada. Probá con una imagen más liviana.');
        return;
      }
      // The owner's own photo is most likely their cover: put it first.
      onChange([dataUrl, ...selected]);
      showToast('Foto lista. Se guarda como portada.');
    } catch (err) {
      console.error('Upload failed:', err);
      showToast(err instanceof Error ? err.message : 'No se pudo procesar la foto.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-xs font-bold text-[#111c2d]">Fotos de la Cancha</label>
        <span className="text-[11px] font-semibold text-emerald-600">
          {selected.length}/{MAX_PHOTOS} fotos
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {pool.map((url) => {
          const isSelected = selected.includes(url);
          return (
            <button
              key={url}
              type="button"
              onClick={() => toggle(url)}
              className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all group ${
                isSelected
                  ? 'border-[#10b981] ring-2 ring-[#10b981]/30'
                  : 'border-gray-200 hover:border-[#10b981]/50'
              } ${selected.length >= MAX_PHOTOS && !isSelected ? 'opacity-40 cursor-not-allowed' : ''}`}
              title={isSelected ? 'Quitar foto' : 'Elegir foto'}
            >
              <img
                src={url}
                alt="Opción de galería"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {isSelected && (
                <span className="absolute top-1 right-1 bg-[#10b981] text-white rounded-full p-0.5 shadow-sm">
                  <span className="material-symbols-outlined text-[11px] block">check</span>
                </span>
              )}
              <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {isSelected ? 'Quitar' : 'Elegir'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Upload from device */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleUpload(file);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={processing || selected.length >= MAX_PHOTOS || hasOwnPhoto}
        className="mt-3 w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#10b981]/50 bg-emerald-50/50 hover:bg-emerald-50 text-[#006c49] py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? (
          <>
            <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
            Procesando foto…
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-base">add_photo_alternate</span>
            {hasOwnPhoto ? 'Foto propia ya agregada' : 'Subir una foto de mi dispositivo'}
          </>
        )}
      </button>

      <p className="text-[11px] text-gray-500 mt-1.5">
        Elegí hasta {MAX_PHOTOS} fotos de la galería y podés subir 1 foto propia. La primera
        seleccionada será la portada.
      </p>
    </div>
  );
};
