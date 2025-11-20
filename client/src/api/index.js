import axios from 'axios';

const API_BASE_URL = import.meta.env.PROD 
    ? '/api' 
    : 'http://localhost:3001/api';

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
        const response = await api.get('/books');
        return { data: response.data };
    } catch (error) {
        console.error('getAllBooks error:', error);
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
