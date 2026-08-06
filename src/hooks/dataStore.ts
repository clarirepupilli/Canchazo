import type { Booking, BookingStatus, Court, Review } from '../types';

export interface ReviewInput {
  courtId?: string;
  courtName: string;
  rating: number;
  comment: string;
  author: string;
}

/**
 * Contract shared by the local (localStorage) and Firestore data layers.
 * AppProvider picks one implementation; the public context value stays the same.
 */
export interface DataStore {
  courts: Court[];
  addCourt: (court: Court) => void;
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Booking;
  toggleBookingStatus: (bookingId: string, targetStatus?: BookingStatus) => void;
  reviews: Review[];
  addReview: (data: ReviewInput) => void;
  addReviewReply: (reviewId: string, replyText: string) => void;
}
