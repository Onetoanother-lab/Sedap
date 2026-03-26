import axios from 'axios';

const api = axios.create({
    baseURL: 'sedap-nnap.onrender.com/api/',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Unwrap error messages so callers can use err.message directly
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message =
            error.response?.data?.message ||
            error.message ||
            'Something went wrong';
        const enriched = new Error(message);
        enriched.status = error.response?.status;
        enriched.data   = error.response?.data;
        return Promise.reject(enriched);
    }
);

export default api;