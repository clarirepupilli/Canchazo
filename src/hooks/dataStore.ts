import type { Booking, BookingStatus, Court, ForumPost, Review } from '../types';

export interface ReviewInput {
  courtId?: string;
  courtName: string;
  rating: number;
  comment: string;
  author: string;
}

export interface ForumPostInput {
  bookingId?: string;
  courtId?: string;
  courtName?: string;
  complexName?: string;
  date?: string;
  dateDisplay?: string;
  timeSlot?: string;
  playersNeeded: number;
  message?: string;
  author: string;
  whatsappContact?: string;
}

/**
 * Contract shared by the local (localStorage) and Firestore data layers.
 * AppProvider picks one implementation; the public context value stays the same.
 */
export interface DataStore {
  courts: Court[];
  addCourt: (court: Court) => void;
  updateCourt: (court: Court) => void;
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Booking;
  toggleBookingStatus: (bookingId: string, targetStatus?: BookingStatus) => void;
  deleteBooking: (bookingId: string) => void;
  reviews: Review[];
  addReview: (data: ReviewInput) => void;
  addReviewReply: (reviewId: string, replyText: string) => void;
  posts: ForumPost[];
  addPost: (data: ForumPostInput) => void;
  closePost: (postId: string) => void;
}
