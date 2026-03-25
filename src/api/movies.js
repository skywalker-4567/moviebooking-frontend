import api from './axios';

export const getMovies = (page = 0, size = 12) =>
  api.get(`/api/movies?page=${page}&size=${size}`);
export const getMovie = (id) => api.get(`/api/movies/${id}`);
export const getReviews = (id) => api.get(`/api/reviews/movie/${id}`);
export const submitReview = (data) => api.post('/api/reviews', data);