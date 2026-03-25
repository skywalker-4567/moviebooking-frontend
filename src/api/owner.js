import api from './axios';

export const createTheatre = (data) => api.post('/api/theatres', data);
export const getMyTheatres = () => api.get('/api/theatres/my');
export const createScreen = (data) => api.post('/api/screens', data);
export const createSeat = (data) => api.post('/api/seats', data);