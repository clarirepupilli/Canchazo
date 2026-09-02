import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  writeBatch,
  where,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore';
import type { Booking, Court, ForumPost, Review, TimeSlot } from '../types';

// Firestore collection names in the canchazo-app project.
const COURTS_COLLECTION = 'courts';
const BOOKINGS_COLLECTION = 'bookings';
const REVIEWS_COLLECTION = 'reviews';

// localStorage keys used by the pre-Firestore (mock) data layer.
const LS_COURTS = 'canchazo_courts';
const LS_BOOKINGS = 'canchazo_bookings';
const LS_REVIEWS = 'canchazo_reviews';
const LS_MIGRATED = 'canchazo_migrated';

/** A court time slot WITHOUT the ephemeral `available` flag (template only). */
export interface TemplateSlot {
  id: string;
  time: string;
  displayTime: string;
  category: TimeSlot['category'];
  price?: number;
}

// --- Field sanitization ---------------------------------------------

/**
 * Firestore rejects `undefined` field values. Some Court/Booking optional
 * fields can be `undefined` in the UI (e.g. NewBookingModal sends
 * `whatsappNumber: undefined` when no court is selected), so drop them.
 */
export function stripUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) clean[key] = value;
  }
  return clean;
}

// --- Document <-> entity conversion ---------------------------------

/** Template-only slots for storage: `available` is never persisted. */
export function stripAvailable(slots: TimeSlot[]): TemplateSlot[] {
  return slots.map(({ id, time, displayTime, category, price }) =>
    price === undefined
      ? { id, time, displayTime, category }
      : { id, time, displayTime, category, price }
  );
}

/** Rehydrate template slots with a default `available` (derived later). */
function toTemplateSlots(raw: unknown): TimeSlot[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((slot) => {
    const s = (slot ?? {}) as Partial<TimeSlot>;
    return {
      id: s.id ?? '',
      time: s.time ?? '',
      displayTime: s.displayTime ?? '',
      category: s.category ?? 'night',
      price: typeof s.price === 'number' ? s.price : undefined,
      available: true,
    };
  });
}

export function toCourt(id: string, data: DocumentData): Court {
  const rest = data as unknown as Omit<Court, 'id' | 'timeSlots'>;
  return { ...rest, id, timeSlots: toTemplateSlots(data.timeSlots) };
}

export function toBooking(id: string, data: DocumentData): Booking {
  return { ...(data as unknown as Booking), id };
}

export function toReview(id: string, data: DocumentData): Review {
  return { ...(data as unknown as Review), id };
}

export function toPost(id: string, data: Record<string, unknown>): ForumPost {
  // `message` stays undefined when absent (stripUndefined never stores it).
  return { ...(data as unknown as ForumPost), id };
}

/** Court doc for storage: full entity, template slots, no undefined fields. */
export function toCourtDoc(court: Court): Record<string, unknown> {
  return stripUndefined({ ...court, timeSlots: stripAvailable(court.timeSlots) });
}

/** Booking doc for storage: entity as-is, no undefined fields. */
export function toBookingDoc(booking: Booking): Record<string, unknown> {
  return stripUndefined({ ...booking });
}

// --- Reads ----------------------------------------------------------

/**
 * Read-before-write guard: true if a non-canceled booking already exists for
 * court + date + slot. Uses a single-field query (no composite index needed)
 * and filters status/date/time in memory.
 */
export async function hasActiveBooking(
  firestore: Firestore,
  courtId: string,
  date: string,
  timeSlot: string
): Promise<boolean> {
  const q = query(collection(firestore, BOOKINGS_COLLECTION), where('courtId', '==', courtId));
  const snapshot = await getDocs(q);
  return snapshot.docs.some((d) => {
    const b = d.data() as Partial<Booking>;
    return b.date === date && b.timeSlot === timeSlot && b.status !== 'Cancelado';
  });
}

/** Number of documents in a collection (seed/migration decisions). */
export async function collectionSize(firestore: Firestore, name: string): Promise<number> {
  const snapshot = await getDocs(collection(firestore, name));
  return snapshot.size;
}

// --- Writes ---------------------------------------------------------

/** Writes template courts (available stripped), idempotent per court id. */
export async function seedCourts(firestore: Firestore, courts: Court[]): Promise<void> {
  if (courts.length === 0) return;
  const batch = writeBatch(firestore);
  for (const court of courts) {
    batch.set(doc(collection(firestore, COURTS_COLLECTION), court.id), toCourtDoc(court));
  }
  await batch.commit();
}

/**
 * One-time migration of the pre-Firestore localStorage data into Firestore,
 * preserving document ids. Runs only when 'canchazo_migrated' is not set.
 *
 * - courts: migrated ONLY if Firestore has no courts yet (avoids clobbering).
 * - bookings/reviews: always written (setDoc is idempotent by id).
 * On success the migrated keys are cleared and 'canchazo_migrated' is set.
 */
export async function migrateLocalData(firestore: Firestore): Promise<void> {
  let courts: Court[] = [];
  let bookings: Booking[] = [];
  let reviews: Review[] = [];

  const rawCourts = localStorage.getItem(LS_COURTS);
  const rawBookings = localStorage.getItem(LS_BOOKINGS);
  const rawReviews = localStorage.getItem(LS_REVIEWS);

  try {
    if (rawCourts) courts = JSON.parse(rawCourts) as Court[];
    if (rawBookings) bookings = JSON.parse(rawBookings) as Booking[];
    if (rawReviews) reviews = JSON.parse(rawReviews) as Review[];
  } catch {
    // Corrupt local data is treated as absent; migration still completes.
  }

  if (courts.length > 0 && (await collectionSize(firestore, COURTS_COLLECTION)) === 0) {
    for (const court of courts) {
      await setDoc(doc(collection(firestore, COURTS_COLLECTION), court.id), toCourtDoc(court));
    }
  }

  for (const booking of bookings) {
    await setDoc(doc(collection(firestore, BOOKINGS_COLLECTION), booking.id), toBookingDoc(booking));
  }

  for (const review of reviews) {
    await setDoc(doc(collection(firestore, REVIEWS_COLLECTION), review.id), stripUndefined({ ...review }));
  }

  localStorage.removeItem(LS_COURTS);
  localStorage.removeItem(LS_BOOKINGS);
  localStorage.removeItem(LS_REVIEWS);
  localStorage.setItem(LS_MIGRATED, '1');
}
