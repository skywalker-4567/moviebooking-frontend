import api from './axios';

export const getSeats = (screenId) => api.get(`/api/seats/screen/${screenId}`);
export const holdSeats = (data) => api.post('/api/bookings/hold', data);
export const confirmBooking = (data) => api.post('/api/bookings/confirm', data);
export const getMyBookings = () => api.get('/api/bookings/my');
export const cancelBooking = (id) => api.post(`/api/bookings/${id}/cancel`);