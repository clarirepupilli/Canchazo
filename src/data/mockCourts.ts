import type { Court } from '../types';

export const INITIAL_COURTS: Court[] = [
  {
    id: 'court-demo-1',
    name: 'Complejo Demo - Cancha Principal',
    complexName: 'Complejo Demo',
    sport: 'futbol',
    sportLabel: 'Fútbol 5',
    pricePerHour: 18000,
    currency: '$',
    rating: 0,
    reviewCount: 0,
    address: 'Av. de Prueba 123',
    imageUrl:
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    ],
    amenities: {
      parking: true,
      showers: true,
      cafeteria: true,
      groups: true,
      lighting: true,
    },
    surface: 'sintetico',
    whatsappNumber: '5491100000000',
    paymentMethods: ['Efectivo', 'Transferencia Bancaria'],
    timeSlots: [
      { id: 'ts-demo-1', time: '18:00', displayTime: '18:00 - 19:00', category: 'afternoon', available: true },
      { id: 'ts-demo-2', time: '19:00', displayTime: '19:00 - 20:00', category: 'night', available: true },
      { id: 'ts-demo-3', time: '20:00', displayTime: '20:00 - 21:00', category: 'night', available: true },
      { id: 'ts-demo-4', time: '21:00', displayTime: '21:00 - 22:00', category: 'night', available: true },
    ],
  },
];

