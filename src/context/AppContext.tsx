import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { Court, Booking, Review, UserRole, FilterState, BookingStatus } from '../types';
import { auth, db, isFirebaseConfigured } from '../firebase';
import { useLocalStore } from '../hooks/useLocalStore';
import { useFirestoreStore } from '../hooks/useFirestoreStore';

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
  authUser: User | null;
  signOutUser: () => Promise<void>;
  userRole: UserRole;
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
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [userRole, setUserRoleState] = useState<UserRole>('player');

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

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

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  // Data layer selection: Firebase (realtime Firestore) or local (localStorage).
  // isFirebaseConfigured is a compile-time constant derived from VITE_* env, so
  // the same hook is always selected across renders (rules-of-hooks safe).
  const dataLayer = isFirebaseConfigured
    ? useFirestoreStore(showToast, authUser?.uid ?? null)
    : useLocalStore(showToast);

  const { courts, addCourt, bookings, addBooking, toggleBookingStatus, reviews, addReview, addReviewReply } = dataLayer;

  // Firebase auth session. In local (non-Firebase) mode there is no session,
  // so the app keeps the legacy player view.
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;
    return onAuthStateChanged(auth, (user) => setAuthUser(user));
  }, []);

  // Role is derived from the users/{uid} profile document, not from the auth
  // token, so promotions propagate live (owner grants appear without re-login).
  useEffect(() => {
    if (!authUser || !isFirebaseConfigured || !db) {
      setUserRoleState('player');
      return;
    }
    return onSnapshot(
      doc(db, 'users', authUser.uid),
      (snap) => {
        const role = snap.exists() ? snap.data().role : 'player';
        setUserRoleState(role === 'owner' ? 'owner' : 'player');
      },
      () => setUserRoleState('player')
    );
  }, [authUser]);

  const signOutUser = useCallback(async () => {
    if (auth && isFirebaseConfigured) {
      await signOut(auth);
    }
    setAuthUser(null);
    setUserRoleState('player');
    showToast('Sesión cerrada');
  }, [showToast]);

  useEffect(() => {
    localStorage.setItem('canchazo_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('canchazo_owner_complex', currentOwnerComplexName);
  }, [currentOwnerComplexName]);

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
        authUser,
        signOutUser,
        userRole,
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
