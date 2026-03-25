import api from './axios';

export const getFoodMenu = (theatreId) => api.get(`/api/food/menu/${theatreId}`);
export const placeFoodOrder = (data) => api.post('/api/food/order', data);