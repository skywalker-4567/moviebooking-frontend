import api from './axios';

export const createMovie = (data) => api.post('/api/movies', data);
export const createShow = (data) => api.post('/api/shows', data);
export const getTheatres = () => api.get('/api/theatres');
export const getScreensByTheatre = (theatreId) => api.get(`/api/screens/theatre/${theatreId}`);