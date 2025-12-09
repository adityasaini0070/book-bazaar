import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// Books API
export const getAllBooks = () => axios.get(`${API_URL}/books`);
export const getBook = (id) => axios.get(`${API_URL}/books/${id}`);
export const createBook = (book, token) => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    return axios.post(`${API_URL}/books`, book, config);
};
export const updateBook = (id, book) => axios.put(`${API_URL}/books/${id}`, book);
export const deleteBook = (id) => axios.delete(`${API_URL}/books/${id}`);

// Auth API
export const register = (userData) => axios.post(`${API_URL}/auth/register`, userData);
export const login = (credentials) => axios.post(`${API_URL}/auth/login`, credentials);
export const getProfile = (token) => axios.get(`${API_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` }
});
export const updateProfile = (profileData, token) => axios.put(`${API_URL}/auth/profile`, profileData, {
    headers: { Authorization: `Bearer ${token}` }
});

// Marketplace API
export const getMarketplaceListings = (filters = {}) => {
    const params = new URLSearchParams(filters);
    return axios.get(`${API_URL}/marketplace/listings?${params}`);
};

export const getMyListings = (token) => axios.get(`${API_URL}/marketplace/my-listings`, {
    headers: { Authorization: `Bearer ${token}` }
});

export const createListing = (listingData, token) => axios.post(`${API_URL}/marketplace/listings`, listingData, {
    headers: { Authorization: `Bearer ${token}` }
});

export const updateListing = (id, listingData, token) => axios.put(`${API_URL}/marketplace/listings/${id}`, listingData, {
    headers: { Authorization: `Bearer ${token}` }
});

export const deleteListing = (id, token) => axios.delete(`${API_URL}/marketplace/listings/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
});

// Exchange requests
export const createExchangeRequest = (requestData, token) => axios.post(`${API_URL}/marketplace/exchange-requests`, requestData, {
    headers: { Authorization: `Bearer ${token}` }
});

export const getReceivedExchangeRequests = (token) => axios.get(`${API_URL}/marketplace/exchange-requests/received`, {
    headers: { Authorization: `Bearer ${token}` }
});

export const getSentExchangeRequests = (token) => axios.get(`${API_URL}/marketplace/exchange-requests/sent`, {
    headers: { Authorization: `Bearer ${token}` }
});

export const updateExchangeRequest = (id, status, token) => axios.put(`${API_URL}/marketplace/exchange-requests/${id}`, { status }, {
    headers: { Authorization: `Bearer ${token}` }
});

// Transactions
export const createTransaction = (listingId, token) => axios.post(`${API_URL}/marketplace/transactions`, { listing_id: listingId }, {
    headers: { Authorization: `Bearer ${token}` }
});

export const getPurchases = (token) => axios.get(`${API_URL}/marketplace/transactions/purchases`, {
    headers: { Authorization: `Bearer ${token}` }
});

export const getSales = (token) => axios.get(`${API_URL}/marketplace/transactions/sales`, {
    headers: { Authorization: `Bearer ${token}` }
});
