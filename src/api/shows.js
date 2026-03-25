import api from './axios';
export const getShowsByMovie = (movieId) => api.get(`/api/shows/movie/${movieId}`);