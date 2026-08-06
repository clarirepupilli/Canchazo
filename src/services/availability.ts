import type { Booking, TimeSlot } from '../types';

/**
 * Derives slot availability from active bookings.
 *
 * Availability is NEVER stored: a slot is available for a court+date when no
 * non-canceled booking occupies that exact displayTime. Canceled bookings
 * release the slot immediately. Callers pass the court template slots and the
 * live bookings list; the returned slots are enriched with the `available`
 * flag for rendering/filtering.
 */
export function computeAvailability(
  templateSlots: TimeSlot[],
  bookings: Booking[],
  courtId: string,
  date: string
): TimeSlot[] {
  return templateSlots.map((slot) => ({
    ...slot,
    available: !bookings.some(
      (b) =>
        b.courtId === courtId &&
        b.date === date &&
        b.timeSlot === slot.displayTime &&
        b.status !== 'Cancelado'
    ),
  }));
}
