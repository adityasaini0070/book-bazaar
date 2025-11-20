import axios from 'axios';

// Dynamic API URL configuration - evaluates at runtime
const getApiUrl = () => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const apiUrl = isLocal ? 'http://localhost:3001/api' : '/.netlify/functions';
    console.log('=== API Configuration ===');
    console.log('Hostname:', window.location.hostname);
    console.log('Is Local:', isLocal);
    console.log('API URL:', apiUrl);
    return apiUrl;
};

export const getAllBooks = () => {
    const url = `${getApiUrl()}/books`;
    console.log('Fetching all books from:', url);
    return axios.get(url);
};

export const getBook = (id) => axios.get(`${getApiUrl()}/books/${id}`);
export const createBook = (book) => axios.post(`${getApiUrl()}/books`, book);
export const updateBook = (id, book) => axios.put(`${getApiUrl()}/books/${id}`, book);
export const deleteBook = (id) => axios.delete(`${getApiUrl()}/books/${id}`);
