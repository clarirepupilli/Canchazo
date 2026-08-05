import React, { createContext, useContext, useState, useEffect } from 'react';
import { Court, Booking, Review, UserRole, FilterState, SportType, BookingStatus } from '../types';
import { INITIAL_COURTS } from '../data/mockCourts';
import { INITIAL_BOOKINGS } from '../data/mockBookings';
import { INITIAL_REVIEWS } from '../data/mockReviews';

const DEFAULT_FILTERS: FilterState = {
  sport: 'all',
  minPrice: 1000,
  maxPrice: 30000,
  timeCategories: ['morning', 'afternoon', 'night'],
  exactTime: '',
  surfaces: ['sintetico'],
  searchQuery: '',
};

interface AppContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  courts: Court[];
  addCourt: (court: Court) => void;
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Booking;
  toggleBookingStatus: (bookingId: string, targetStatus?: BookingStatus) => void;
  reviews: Review[];
  addReview: (data: { courtId?: string; courtName: string; rating: number; comment: string; author: string }) => void;
  addReviewReply: (reviewId: string, replyText: string) => void;
  favorites: string[];
  toggleFavorite: (courtId: string) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  showFilterModal: boolean;
  setShowFilterModal: (show: boolean) => void;
  selectedCourtForBooking: { court: Court; timeSlot: string } | null;
  setSelectedCourtForBooking: (val: { court: Court; timeSlot: string } | null) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  currentOwnerComplexName: string;
  setCurrentOwnerComplexName: (name: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem('canchazo_user_role');
    return (saved as UserRole) || 'player';
  });

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const [courts, setCourts] = useState<Court[]>(() => {
    const saved = localStorage.getItem('canchazo_courts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('canchazo_bookings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('canchazo_reviews');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('canchazo_favorites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [selectedCourtForBooking, setSelectedCourtForBooking] = useState<{ court: Court; timeSlot: string } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentOwnerComplexName, setCurrentOwnerComplexName] = useState<string>(
    () => localStorage.getItem('canchazo_owner_complex') || ''
  );

  useEffect(() => {
    localStorage.setItem('canchazo_user_role', userRole || '');
  }, [userRole]);

  useEffect(() => {
    const sanitizedCourts = courts.map((c) => ({
      ...c,
      imageUrl: c.imageUrl.startsWith('blob:') ? '' : c.imageUrl,
      images: (c.images || []).filter((img) => !img.startsWith('blob:')),
    }));
    localStorage.setItem('canchazo_courts', JSON.stringify(sanitizedCourts));
  }, [courts]);

  useEffect(() => {
    localStorage.setItem('canchazo_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('canchazo_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('canchazo_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('canchazo_owner_complex', currentOwnerComplexName);
  }, [currentOwnerComplexName]);

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    showToast(`Rol cambiado a ${role === 'owner' ? 'Dueño de Complejo' : 'Jugador'}`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const addCourt = (newCourt: Court) => {
    setCourts((prev) => [newCourt, ...prev]);
    showToast(`¡Complejo "${newCourt.complexName}" registrado con éxito!`);
  };

  const addBooking = (bookingData: Omit<Booking, 'id' | 'createdAt'>): Booking => {
    const newBooking: Booking = {
      ...bookingData,
      id: 'b-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8),
      createdAt: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);

    // Also mark timeSlot as unavailable on the court
    setCourts((prevCourts) =>
      prevCourts.map((c) => {
        if (c.id === bookingData.courtId) {
          return {
            ...c,
            timeSlots: c.timeSlots.map((ts) =>
              ts.displayTime === bookingData.timeSlot ? { ...ts, available: false } : ts
            ),
          };
        }
        return c;
      })
    );

    showToast(`Reserva confirmada para ${newBooking.customerName}`);
    return newBooking;
  };

  const toggleBookingStatus = (bookingId: string, targetStatus?: BookingStatus) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    let nextStatus: BookingStatus;
    if (targetStatus) {
      nextStatus = targetStatus;
    } else if (booking.status === 'Pagado') {
      nextStatus = 'Pendiente';
    } else if (booking.status === 'Pendiente') {
      nextStatus = 'Cancelado';
    } else {
      nextStatus = 'Pendiente';
    }

    const isCanceling = nextStatus === 'Cancelado' && booking.status !== 'Cancelado';
    const isReactivating = booking.status === 'Cancelado' && nextStatus !== 'Cancelado';

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: nextStatus } : b))
    );

    if (isCanceling || isReactivating) {
      setCourts((prevCourts) =>
        prevCourts.map((c) => {
          if (c.id === booking.courtId) {
            return {
              ...c,
              timeSlots: c.timeSlots.map((ts) =>
                ts.displayTime === booking.timeSlot ? { ...ts, available: isCanceling } : ts
              ),
            };
          }
          return c;
        })
      );
    }

    showToast(`Estado de reserva cambiado a ${nextStatus}`);
  };

  const addReview = (data: { courtId?: string; courtName: string; rating: number; comment: string; author: string }) => {
    const authorName = data.author.trim() || 'Jugador Canchazo';
    const newReview: Review = {
      id: 'rev-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8),
      author: authorName,
      avatarLetter: authorName.charAt(0).toUpperCase(),
      rating: data.rating,
      comment: data.comment,
      date: 'Hoy',
      courtName: data.courtName,
    };

    setReviews((prev) => [newReview, ...prev]);

    if (data.courtId) {
      setCourts((prevCourts) =>
        prevCourts.map((c) => {
          if (c.id === data.courtId) {
            const newCount = c.reviewCount + 1;
            const newRating = Number((((c.rating * c.reviewCount) + data.rating) / newCount).toFixed(1));
            return { ...c, rating: newRating, reviewCount: newCount };
          }
          return c;
        })
      );
    }

    showToast('¡Reseña publicada con éxito! Muchas gracias.');
  };

  const addReviewReply = (reviewId: string, replyText: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, reply: replyText } : r))
    );
    showToast('Respuesta enviada a la reseña');
  };

  const toggleFavorite = (courtId: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(courtId);
      return exists ? prev.filter((id) => id !== courtId) : [...prev, courtId];
    });
    showToast(favorites.includes(courtId) ? 'Quitado de favoritos' : 'Guardado en favoritos');
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    showToast('Filtros reiniciados');
  };

  return (
    <AppContext.Provider
      value={{
        userRole,
        setUserRole,
        showAuthModal,
        setShowAuthModal,
        courts,
        addCourt,
        bookings,
        addBooking,
        toggleBookingStatus,
        reviews,
        addReview,
        addReviewReply,
        favorites,
        toggleFavorite,
        filters,
        setFilters,
        resetFilters,
        showFilterModal,
        setShowFilterModal,
        selectedCourtForBooking,
        setSelectedCourtForBooking,
        toastMessage,
        showToast,
        currentOwnerComplexName,
        setCurrentOwnerComplexName,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
