import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        const message = err.response?.data?.message || err.message || 'Something went wrong';
        const enriched = new Error(message);
        enriched.status = err.response?.status;
        return Promise.reject(enriched);
    }
);

export default api;
