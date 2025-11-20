import axios from 'axios';

// Dynamic API configuration - v2.0
// Function to get API base URL dynamically at runtime
const getApiBaseUrl = () => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseUrl = isLocal ? 'http://localhost:3001/api' : '/.netlify/functions';
    console.log('=== API Configuration v2.0 ===');
    console.log('Hostname:', window.location.hostname);
    console.log('Is Local:', isLocal);
    console.log('API Base URL:', baseUrl);
    return baseUrl;
};

const api = axios.create({
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add request interceptor to set baseURL dynamically
api.interceptors.request.use((config) => {
    config.baseURL = getApiBaseUrl();
    return config;
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
        console.log('Fetching books from:', `${getApiBaseUrl()}/books`);
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
