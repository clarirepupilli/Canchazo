export type UserRole = 'player' | 'owner' | null;

export type SportType = 'futbol' | 'padel' | 'tenis';

export type TimeSlotCategory = 'morning' | 'afternoon' | 'night';

export type SurfaceType = 'sintetico' | 'cristal' | 'cemento' | 'cesped';

export type PaymentMethod = 'Efectivo' | 'Transferencia Bancaria' | 'Mercado Pago' | 'Efectivo en Cancha / Transferencia';

export type BookingStatus = 'Pagado' | 'Pendiente' | 'Cancelado';

export interface TimeSlot {
  id: string;
  time: string; // e.g. "18:00"
  displayTime: string; // e.g. "18:00 - 19:00"
  category: TimeSlotCategory;
  available: boolean;
  price?: number;
}

export interface Court {
  id: string;
  ownerId?: string;
  name: string;
  complexName: string;
  sport: SportType;
  sportLabel: string;
  pricePerHour: number;
  currency: string;
  rating: number;
  reviewCount: number;
  address: string;
  coordinates?: { lat: number; lng: number };
  imageUrl: string;
  images?: string[];
  amenities: {
    parking: boolean;
    showers: boolean;
    cafeteria: boolean;
    groups: boolean;
    lighting: boolean;
  };
  surface: SurfaceType;
  timeSlots: TimeSlot[];
  whatsappNumber: string;
  paymentMethods: PaymentMethod[];
}

export interface Booking {
  id: string;
  userId?: string;
  courtId: string;
  courtName: string;
  complexName: string;
  customerName: string;
  customerPhone?: string;
  whatsappNumber?: string;
  sport: SportType;
  date: string; // YYYY-MM-DD
  dateDisplay: string; // e.g. "Lun, 28 Oct"
  timeSlot: string; // e.g. "19:00 - 20:00"
  price: number;
  paymentMethod: PaymentMethod;
  status: BookingStatus;
  createdAt: string;
}

export interface Review {
  id: string;
  userId?: string;
  courtId?: string;
  author: string;
  avatarLetter: string;
  rating: number;
  comment: string;
  date: string;
  courtName: string;
  reply?: string;
}

export interface FilterState {
  sport: SportType | 'all';
  minPrice: number;
  maxPrice: number;
  timeCategories: TimeSlotCategory[];
  exactTime: string;
  surfaces: SurfaceType[];
  searchQuery: string;
}
