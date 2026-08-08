import { useCallback, useEffect, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { INITIAL_COURTS } from '../data/mockCourts';
import type { Booking, BookingStatus, Court, Review } from '../types';
import type { DataStore, ReviewInput } from './dataStore';
import {
  hasActiveBooking,
  migrateLocalData,
  seedCourts,
  toBooking,
  toBookingDoc,
  toCourt,
  toCourtDoc,
  toReview,
} from '../services/firestoreService';

// Module-level guards so seed + migration run at most once per session even
// under React StrictMode double-mounting.
let migrationPromise: Promise<void> | null = null;
let seedAttempted = false;

function ensureMigration(firestore: Firestore, onError: (msg: string) => void): Promise<void> {
  if (!migrationPromise) {
    migrationPromise = migrateLocalData(firestore).catch(() => {
      onError('Error al migrar tus datos locales.');
    });
  }
  return migrationPromise;
}

function recomputeCourtRating(
  court: Court,
  ratingValue: number
): Pick<Court, 'rating' | 'reviewCount'> {
  const reviewCount = court.reviewCount + 1;
  const rating = Number(
    ((court.rating * court.reviewCount + ratingValue) / reviewCount).toFixed(1)
  );
  return { rating, reviewCount };
}

/**
 * Firestore data layer. Availability is never stored: courts hold template
 * slots only, and slot availability is derived from the live bookings stream
 * (see computeAvailability). Mutations are optimistic with rollback on write
 * failure.
 */
export function useFirestoreStore(showToast: (msg: string) => void, uid: string | null): DataStore {
  if (!db || !isFirebaseConfigured) {
    throw new Error('useFirestoreStore requires Firebase configuration');
  }
  const firestore = db;

  const [courts, setCourtsState] = useState<Court[]>([]);
  const [bookings, setBookingsState] = useState<Booking[]>([]);
  const [reviews, setReviewsState] = useState<Review[]>([]);

  const toast = showToast;

  // Realtime subscriptions + seed + one-time migration.
  // `uid` drives re-subscription: Firestore closes the bookings listener when
  // the session ends (permission denied), so signing back in must re-attach it.
  useEffect(() => {
    // One-time migration of pre-Firestore localStorage data. Runs on mount
    // regardless of the courts snapshot so local data is never stranded when
    // Firestore already has courts (migrateLocalData is a no-op when the
    // localStorage keys are absent).
    void ensureMigration(firestore, toast);

    const courtsUnsub = onSnapshot(
      collection(firestore, 'courts'),
      (snapshot) => {
        const docs = snapshot.docs.map((d) => toCourt(d.id, d.data()));
        setCourtsState(docs);

        if (docs.length === 0 && !seedAttempted) {
          seedAttempted = true;
          // Wait for the one-time migration to settle before deciding to seed,
          // so migrated courts are never replaced by mock data.
          void ensureMigration(firestore, toast).then(() => {
            void getDocs(collection(firestore, 'courts')).then((after) => {
              if (after.size === 0) {
                void seedCourts(firestore, INITIAL_COURTS);
              }
            });
          });
        }
      },
      (error) => {
        // eslint-disable-next-line no-console
        console.error('[canchazo] courts subscription error', error);
      }
    );

    // Availability is derived from the full bookings stream, so the client
    // needs booking reads (rules require an authenticated session). Guests
    // are denied by rules and see an empty list until they sign in.
    const bookingsUnsub = onSnapshot(
      collection(firestore, 'bookings'),
      (snapshot) => {
        setBookingsState(snapshot.docs.map((d) => toBooking(d.id, d.data())));
      },
      (error) => {
        setBookingsState([]);
        // eslint-disable-next-line no-console
        console.error('[canchazo] bookings subscription error', error);
      }
    );

    const reviewsUnsub = onSnapshot(collection(firestore, 'reviews'), (snapshot) => {
      setReviewsState(snapshot.docs.map((d) => toReview(d.id, d.data())));
    });

    return () => {
      courtsUnsub();
      bookingsUnsub();
      reviewsUnsub();
    };
  }, [firestore, toast, uid]);

  const addCourt = useCallback(
    (newCourt: Court) => {
      const courtWithOwner: Court = uid ? { ...newCourt, ownerId: uid } : newCourt;
      setCourtsState((prev) => [courtWithOwner, ...prev]);
      toast(`¡Complejo "${courtWithOwner.complexName}" registrado con éxito!`);
      void setDoc(
        doc(collection(firestore, 'courts'), courtWithOwner.id),
        toCourtDoc(courtWithOwner)
      ).catch(() => {
        setCourtsState((prev) => prev.filter((c) => c.id !== courtWithOwner.id));
        toast('Error al guardar el complejo. Intentá de nuevo.');
      });
    },
    [firestore, toast, uid]
  );

  const updateCourt = useCallback(
    (court: Court) => {
      const previousCourt = courts.find((c) => c.id === court.id);
      if (!previousCourt) return;

      setCourtsState((prev) => prev.map((c) => (c.id === court.id ? court : c)));
      toast('Cancha actualizada');

      void updateDoc(doc(collection(firestore, 'courts'), court.id), toCourtDoc(court)).catch(
        () => {
          setCourtsState((prev) =>
            prev.map((c) => (c.id === court.id ? previousCourt : c))
          );
          toast('Error al actualizar la cancha. Intentá de nuevo.');
        }
      );
    },
    [courts, firestore, toast]
  );

  const addBooking = useCallback(
    (bookingData: Omit<Booking, 'id' | 'createdAt'>): Booking => {
      const newBooking: Booking = {
        ...bookingData,
        id: 'b-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8),
        userId: uid ?? undefined,
        createdAt: new Date().toISOString(),
      };

      setBookingsState((prev) => [newBooking, ...prev]);
      toast(`Reserva confirmada para ${newBooking.customerName}`);

      void (async () => {
        try {
          const conflict = await hasActiveBooking(
            firestore,
            newBooking.courtId,
            newBooking.date,
            newBooking.timeSlot
          );
          if (conflict) {
            setBookingsState((prev) => prev.filter((b) => b.id !== newBooking.id));
            toast('Ese horario ya fue reservado.');
            return;
          }
          await setDoc(doc(collection(firestore, 'bookings'), newBooking.id), toBookingDoc(newBooking));
        } catch {
          setBookingsState((prev) => prev.filter((b) => b.id !== newBooking.id));
          toast('Error al guardar la reserva. Intentá de nuevo.');
        }
      })();

      return newBooking;
    },
    [firestore, toast, uid]
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

      const previousStatus = booking.status;
      setBookingsState((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: nextStatus } : b))
      );
      toast(`Estado de reserva cambiado a ${nextStatus}`);

      // Availability is derived from bookings: only the booking doc changes.
      void updateDoc(doc(collection(firestore, 'bookings'), bookingId), {
        status: nextStatus,
      }).catch(() => {
        setBookingsState((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: previousStatus } : b))
        );
        toast('Error al cambiar el estado de la reserva. Intentá de nuevo.');
      });
    },
    [bookings, firestore, toast]
  );

  const deleteBooking = useCallback(
    (bookingId: string) => {
      const booking = bookings.find((b) => b.id === bookingId);
      if (!booking) return;

      const previousBookings = bookings;
      setBookingsState((prev) => prev.filter((b) => b.id !== bookingId));
      toast('Reserva eliminada');

      void deleteDoc(doc(collection(firestore, 'bookings'), bookingId)).catch(() => {
        setBookingsState(previousBookings);
        toast('Error al eliminar la reserva. Intentá de nuevo.');
      });
    },
    [bookings, firestore, toast]
  );

  const addReview = useCallback(
    (data: ReviewInput) => {
      const authorName = data.author.trim() || 'Jugador Canchazo';
      const newReview: Review = {
        id: 'rev-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8),
        userId: uid ?? undefined,
        courtId: data.courtId,
        author: authorName,
        avatarLetter: authorName.charAt(0).toUpperCase(),
        rating: data.rating,
        comment: data.comment,
        date: 'Hoy',
        courtName: data.courtName,
      };

      const targetCourt = data.courtId ? courts.find((c) => c.id === data.courtId) : undefined;
      const previousCourt = targetCourt ? { ...targetCourt } : undefined;

      setReviewsState((prev) => [newReview, ...prev]);
      toast('¡Reseña publicada con éxito! Muchas gracias.');

      if (targetCourt) {
        const updated = recomputeCourtRating(targetCourt, data.rating);
        setCourtsState((prev) =>
          prev.map((c) => (c.id === targetCourt.id ? { ...c, ...updated } : c))
        );
      }

      void (async () => {
        try {
          // Batch: write the review and denormalize the court's rating/count atomically.
          const batch = writeBatch(firestore);
          const reviewData: Record<string, unknown> = { ...newReview };
          if (data.courtId) {
            reviewData.courtId = data.courtId;
          }
          batch.set(doc(collection(firestore, 'reviews'), newReview.id), reviewData);
          if (previousCourt) {
            const updated = recomputeCourtRating(previousCourt, data.rating);
            batch.update(doc(collection(firestore, 'courts'), previousCourt.id), {
              rating: updated.rating,
              reviewCount: updated.reviewCount,
            });
          }
          await batch.commit();
        } catch {
          setReviewsState((prev) => prev.filter((r) => r.id !== newReview.id));
          if (previousCourt) {
            setCourtsState((prev) =>
              prev.map((c) => (c.id === previousCourt.id ? previousCourt : c))
            );
          }
          toast('Error al publicar la reseña. Intentá de nuevo.');
        }
      })();
    },
    [courts, firestore, toast, uid]
  );

  const addReviewReply = useCallback(
    (reviewId: string, replyText: string) => {
      const previous = reviews.find((r) => r.id === reviewId);
      setReviewsState((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, reply: replyText } : r))
      );
      toast('Respuesta enviada a la reseña');
      void updateDoc(doc(collection(firestore, 'reviews'), reviewId), { reply: replyText }).catch(
        () => {
          if (previous) {
            setReviewsState((prev) => prev.map((r) => (r.id === reviewId ? previous : r)));
          }
          toast('Error al enviar la respuesta. Intentá de nuevo.');
        }
      );
    },
    [firestore, reviews, toast]
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
  };
}
