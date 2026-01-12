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

// User Profiles API
export const getUserProfile = (username) => axios.get(`${API_URL}/profiles/${username}`);
export const updateUserProfile = (profileData, token) => axios.put(`${API_URL}/profiles/me`, profileData, {
    headers: { Authorization: `Bearer ${token}` }
});
export const followUser = (userId, token) => axios.post(`${API_URL}/profiles/follow/${userId}`, {}, {
    headers: { Authorization: `Bearer ${token}` }
});
export const unfollowUser = (userId, token) => axios.delete(`${API_URL}/profiles/follow/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
});
export const checkFollowStatus = (userId, token) => axios.get(`${API_URL}/profiles/follow/check/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
});
export const getUserFollowers = (userId) => axios.get(`${API_URL}/profiles/${userId}/followers`);
export const getUserFollowing = (userId) => axios.get(`${API_URL}/profiles/${userId}/following`);

// Messages API
export const getConversations = (token) => axios.get(`${API_URL}/messages/conversations`, {
    headers: { Authorization: `Bearer ${token}` }
});
export const getConversation = (userId, token) => axios.get(`${API_URL}/messages/conversation/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
});
export const sendMessage = (messageData, token) => axios.post(`${API_URL}/messages/send`, messageData, {
    headers: { Authorization: `Bearer ${token}` }
});
export const getUnreadCount = (token) => axios.get(`${API_URL}/messages/unread-count`, {
    headers: { Authorization: `Bearer ${token}` }
});
export const markMessageAsRead = (messageId, token) => axios.put(`${API_URL}/messages/${messageId}/read`, {}, {
    headers: { Authorization: `Bearer ${token}` }
});

// Negotiations API
export const createNegotiation = (negotiationData, token) => axios.post(`${API_URL}/negotiations`, negotiationData, {
    headers: { Authorization: `Bearer ${token}` }
});
export const getMyOffers = (token) => axios.get(`${API_URL}/negotiations/my-offers`, {
    headers: { Authorization: `Bearer ${token}` }
});
export const getReceivedNegotiations = (token) => axios.get(`${API_URL}/negotiations/received`, {
    headers: { Authorization: `Bearer ${token}` }
});
export const counterOffer = (id, counterPrice, message, token) => axios.put(`${API_URL}/negotiations/${id}/counter`,
    { counter_price: counterPrice, message },
    { headers: { Authorization: `Bearer ${token}` } }
);
export const acceptNegotiation = (id, token) => axios.put(`${API_URL}/negotiations/${id}/accept`, {}, {
    headers: { Authorization: `Bearer ${token}` }
});
export const rejectNegotiation = (id, token) => axios.put(`${API_URL}/negotiations/${id}/reject`, {}, {
    headers: { Authorization: `Bearer ${token}` }
});

// Book Clubs API
export const getAllBookClubs = () => axios.get(`${API_URL}/book-clubs`);
export const getBookClub = (id) => axios.get(`${API_URL}/book-clubs/${id}`);
export const createBookClub = (clubData, token) => axios.post(`${API_URL}/book-clubs`, clubData, {
    headers: { Authorization: `Bearer ${token}` }
});
export const joinBookClub = (id, token) => axios.post(`${API_URL}/book-clubs/${id}/join`, {}, {
    headers: { Authorization: `Bearer ${token}` }
});
export const leaveBookClub = (id, token) => axios.delete(`${API_URL}/book-clubs/${id}/leave`, {
    headers: { Authorization: `Bearer ${token}` }
});
export const setCurrentBook = (id, bookData, token) => axios.post(`${API_URL}/book-clubs/${id}/current-book`, bookData, {
    headers: { Authorization: `Bearer ${token}` }
});
export const getMyBookClubs = (token) => axios.get(`${API_URL}/book-clubs/my/clubs`, {
    headers: { Authorization: `Bearer ${token}` }
});

// Forums API
export const getAllForums = (filters = {}) => {
    const params = new URLSearchParams(filters);
    return axios.get(`${API_URL}/forums?${params}`);
};
export const getForum = (id) => axios.get(`${API_URL}/forums/${id}`);
export const createForum = (forumData, token) => axios.post(`${API_URL}/forums`, forumData, {
    headers: { Authorization: `Bearer ${token}` }
});
export const replyToForum = (id, replyData, token) => axios.post(`${API_URL}/forums/${id}/reply`, replyData, {
    headers: { Authorization: `Bearer ${token}` }
});
export const likeReply = (replyId, token) => axios.post(`${API_URL}/forums/reply/${replyId}/like`, {}, {
    headers: { Authorization: `Bearer ${token}` }
});
export const deleteForum = (id, token) => axios.delete(`${API_URL}/forums/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
});

// Activity Feed API
export const getActivityFeed = (token) => axios.get(`${API_URL}/activity`, {
    headers: { Authorization: `Bearer ${token}` }
});
export const getUserActivity = (userId) => axios.get(`${API_URL}/activity/user/${userId}`);
export const createActivity = (activityData, token) => axios.post(`${API_URL}/activity`, activityData, {
    headers: { Authorization: `Bearer ${token}` }
});

// Password Reset API
export const forgotPassword = (email) => axios.post(`${API_URL}/auth/forgot-password`, { email });
export const resetPassword = (token, new_password) => axios.post(`${API_URL}/auth/reset-password`, { token, new_password });
