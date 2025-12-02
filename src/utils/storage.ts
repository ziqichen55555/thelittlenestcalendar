import { Booking } from '../types';

const STORAGE_KEY = 'room-bookings';

export const getBookings = (): Booking[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveBookings = (bookings: Booking[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
};

export const addBooking = (booking: Booking): void => {
  const bookings = getBookings();
  bookings.push(booking);
  saveBookings(bookings);
};

export const updateBooking = (id: string, updated: Booking): void => {
  const bookings = getBookings();
  const index = bookings.findIndex(b => b.id === id);
  if (index !== -1) {
    bookings[index] = updated;
    saveBookings(bookings);
  }
};

export const deleteBooking = (id: string): void => {
  const bookings = getBookings();
  const filtered = bookings.filter(b => b.id !== id);
  saveBookings(filtered);
};
