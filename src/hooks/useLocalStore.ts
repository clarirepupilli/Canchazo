import { useCallback, useEffect, useState } from 'react';
import type { Booking, BookingStatus, Court, ForumPost, Review } from '../types';
import type { DataStore, ForumPostInput, ReviewInput } from './dataStore';

/**
 * Local data layer: the original localStorage-backed behavior. Kept EXACTLY as
 * before so enabling Firebase never regresses the mock path.
 */
export function useLocalStore(showToast: (msg: string) => void): DataStore {
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

  const [posts, setPosts] = useState<ForumPost[]>(() => {
    const saved = localStorage.getItem('canchazo_posts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

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
    localStorage.setItem('canchazo_posts', JSON.stringify(posts));
  }, [posts]);

  const addCourt = useCallback(
    (newCourt: Court) => {
      setCourts((prev) => [newCourt, ...prev]);
      showToast(`¡Complejo "${newCourt.complexName}" registrado con éxito!`);
    },
    [showToast]
  );

  const updateCourt = useCallback(
    (court: Court) => {
      setCourts((prev) => prev.map((c) => (c.id === court.id ? court : c)));
      showToast('Cancha actualizada');
    },
    [showToast]
  );

  const addBooking = useCallback(
    (bookingData: Omit<Booking, 'id' | 'createdAt'>): Booking => {
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
    },
    [showToast]
  );

  const toggleBookingStatus = useCallback(
    (bookingId: string, targetStatus?: BookingStatus) => {
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
    },
    [bookings, showToast]
  );

  const deleteBooking = useCallback(
    (bookingId: string) => {
      const booking = bookings.find((b) => b.id === bookingId);
      if (!booking) return;

      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      showToast('Reserva eliminada');
    },
    [bookings, showToast]
  );

  const addReview = useCallback(
    (data: ReviewInput) => {
      const authorName = data.author.trim() || 'Jugador Canchazo';
      const newReview: Review = {
        id: 'rev-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8),
        courtId: data.courtId,
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
              const newRating = Number(
                ((c.rating * c.reviewCount + data.rating) / newCount).toFixed(1)
              );
              return { ...c, rating: newRating, reviewCount: newCount };
            }
            return c;
          })
        );
      }

      showToast('¡Reseña publicada con éxito! Muchas gracias.');
    },
    [showToast]
  );

  const addReviewReply = useCallback(
    (reviewId: string, replyText: string) => {
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, reply: replyText } : r))
      );
      showToast('Respuesta enviada a la reseña');
    },
    [showToast]
  );

  const addPost = useCallback(
    (data: ForumPostInput) => {
      const newPost: ForumPost = {
        ...data,
        id: 'p-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8),
        status: 'open',
        createdAt: new Date().toISOString(),
      };
      setPosts((prev) => [newPost, ...prev]);
      showToast('Aviso publicado en el foro');
    },
    [showToast]
  );

  const closePost = useCallback(
    (postId: string) => {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, status: 'closed' } : p))
      );
      showToast('Aviso marcado como completo');
    },
    [showToast]
  );

  return {
    courts,
    addCourt,
    updateCourt,
    bookings,
    addBooking,
    toggleBookingStatus,
    deleteBooking,
    reviews,
    addReview,
    addReviewReply,
    posts,
    addPost,
    closePost,
  };
}
