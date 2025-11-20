import axios from 'axios';

// API Base URL configuration for Netlify
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api' 
    : '/.netlify/functions';

console.log('=== API Configuration ===');
console.log('Hostname:', window.location.hostname);
console.log('API Base URL:', API_BASE_URL);
console.log('Full origin:', window.location.origin);

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add response interceptor
api.interceptors.response.use(
    (response) => {
        // Any status code that lies within the range of 2xx
        console.log('API Response:', response);
        return response;
    },
    (error) => {
        // Any status codes outside the range of 2xx
        console.error('API Error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        return Promise.reject(error);
    }
);

export const getAllBooks = async () => {
    try {
        console.log('Fetching books from:', `${API_BASE_URL}/books`);
        const response = await api.get('/books');
        console.log('Books fetched successfully:', response.data);
        return { data: response.data };
    } catch (error) {
        console.error('getAllBooks error:', error);
        console.error('Error details:', {
            message: error.message,
            response: error.response,
            request: error.request,
            config: error.config
        });
        throw error;
    }
};

export const getBook = async (id) => {
    try {
        const response = await api.get(`/books/${id}`);
        return { data: response.data };
    } catch (error) {
        console.error('getBook error:', error);
        throw error;
    }
};

export const createBook = async (book) => {
    try {
        const response = await api.post('/books', book);
        return { data: response.data };
    } catch (error) {
        console.error('createBook error:', error);
        throw error;
    }
};

export const updateBook = async (id, book) => {
    try {
        const response = await api.put(`/books/${id}`, book);
        return { data: response.data };
    } catch (error) {
        console.error('updateBook error:', error);
        throw error;
    }
};

export const deleteBook = async (id) => {
    try {
        const response = await api.delete(`/books/${id}`);
        return { data: response.data };
    } catch (error) {
        console.error('deleteBook error:', error);
        throw error;
    }
};

export default api;
