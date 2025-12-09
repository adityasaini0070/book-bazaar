import { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    TextField,
    MenuItem,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Store as StoreIcon,
    SwapHoriz as ExchangeIcon,
    ShoppingCart as CartIcon,
    FilterList as FilterIcon
} from '@mui/icons-material';
import { getMarketplaceListings, createTransaction, createExchangeRequest, getAllBooks } from '../api';
import { useAuth } from '../context/AuthContext';

function Marketplace() {
    const { token, user, isAuthenticated } = useAuth();
    const [listings, setListings] = useState([]);
    const [myBooks, setMyBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filters, setFilters] = useState({
        type: '',
        condition: '',
        max_price: '',
        genre: ''
    });
    const [exchangeDialog, setExchangeDialog] = useState({ open: false, listing: null });
    const [selectedBook, setSelectedBook] = useState('');

    useEffect(() => {
        fetchListings();
        if (isAuthenticated) {
            fetchMyBooks();
        }
    }, [isAuthenticated]);

    const fetchListings = async () => {
        try {
            setLoading(true);
            const response = await getMarketplaceListings(filters);
            setListings(response.data);
        } catch (err) {
            setError('Failed to load marketplace listings');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyBooks = async () => {
        try {
            const response = await getAllBooks();
            // Filter books that belong to current user (if user_id exists)
            setMyBooks(response.data);
        } catch (err) {
            console.error('Failed to load books:', err);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const handleApplyFilters = () => {
        fetchListings();
    };

    const handleBuyClick = async (listingId) => {
        if (!isAuthenticated) {
            setError('Please login to purchase books');
            return;
        }

        try {
            await createTransaction(listingId, token);
            setSuccess('Purchase successful! Check your purchases tab.');
            fetchListings();
        } catch (err) {
            setError(err.response?.data?.error || 'Purchase failed');
        }
    };

    const handleExchangeClick = (listing) => {
        if (!isAuthenticated) {
            setError('Please login to exchange books');
            return;
        }
        setExchangeDialog({ open: true, listing });
    };

    const handleExchangeSubmit = async () => {
        if (!selectedBook) {
            setError('Please select a book to offer');
            return;
        }

        try {
            await createExchangeRequest({
                listing_id: exchangeDialog.listing.id,
                offered_book_id: selectedBook,
                message: `Exchange request for ${exchangeDialog.listing.title}`
            }, token);
            
            setSuccess('Exchange request sent successfully!');
            setExchangeDialog({ open: false, listing: null });
            setSelectedBook('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send exchange request');
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <StoreIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                <Typography variant="h4" component="h1">
                    Book Marketplace
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            {/* Filters */}
            <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FilterIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Filters</Typography>
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            fullWidth
                            select
                            label="Type"
                            name="type"
                            value={filters.type}
                            onChange={handleFilterChange}
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="sell">For Sale</MenuItem>
                            <MenuItem value="exchange">For Exchange</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            fullWidth
                            select
                            label="Condition"
                            name="condition"
                            value={filters.condition}
                            onChange={handleFilterChange}
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="new">New</MenuItem>
                            <MenuItem value="like-new">Like New</MenuItem>
                            <MenuItem value="good">Good</MenuItem>
                            <MenuItem value="fair">Fair</MenuItem>
                            <MenuItem value="poor">Poor</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField
                            fullWidth
                            label="Max Price"
                            name="max_price"
                            type="number"
                            value={filters.max_price}
                            onChange={handleFilterChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleApplyFilters}
                            sx={{ height: '56px' }}
                        >
                            Apply Filters
                        </Button>
                    </Grid>
                </Grid>
            </Box>

            {/* Listings */}
            {listings.length === 0 ? (
                <Alert severity="info">No listings available at the moment.</Alert>
            ) : (
                <Grid container spacing={3}>
                    {listings.map((listing) => (
                        <Grid item xs={12} sm={6} md={4} key={listing.id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" gutterBottom>
                                        {listing.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        by {listing.author}
                                    </Typography>
                                    
                                    <Box sx={{ mt: 2, mb: 2 }}>
                                        <Chip
                                            icon={listing.listing_type === 'sell' ? <StoreIcon /> : <ExchangeIcon />}
                                            label={listing.listing_type === 'sell' ? 'For Sale' : 'For Exchange'}
                                            color={listing.listing_type === 'sell' ? 'success' : 'info'}
                                            size="small"
                                            sx={{ mr: 1 }}
                                        />
                                        <Chip
                                            label={listing.condition}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Box>

                                    {listing.genre && (
                                        <Typography variant="body2" color="text.secondary">
                                            Genre: {listing.genre}
                                        </Typography>
                                    )}

                                    {listing.description && (
                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                            {listing.description}
                                        </Typography>
                                    )}

                                    {listing.listing_type === 'sell' && (
                                        <Typography variant="h5" color="primary" sx={{ mt: 2 }}>
                                            ${parseFloat(listing.price).toFixed(2)}
                                        </Typography>
                                    )}

                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                        Seller: {listing.seller_name}
                                    </Typography>
                                </CardContent>

                                <CardActions>
                                    {listing.listing_type === 'sell' ? (
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            startIcon={<CartIcon />}
                                            onClick={() => handleBuyClick(listing.id)}
                                            disabled={!isAuthenticated || listing.user_id === user?.id}
                                        >
                                            Buy Now
                                        </Button>
                                    ) : (
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            color="info"
                                            startIcon={<ExchangeIcon />}
                                            onClick={() => handleExchangeClick(listing)}
                                            disabled={!isAuthenticated || listing.user_id === user?.id}
                                        >
                                            Request Exchange
                                        </Button>
                                    )}
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Exchange Dialog */}
            <Dialog open={exchangeDialog.open} onClose={() => setExchangeDialog({ open: false, listing: null })}>
                <DialogTitle>Request Book Exchange</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        You want to exchange with: <strong>{exchangeDialog.listing?.title}</strong>
                    </Typography>
                    <TextField
                        fullWidth
                        select
                        label="Select Your Book to Offer"
                        value={selectedBook}
                        onChange={(e) => setSelectedBook(e.target.value)}
                        sx={{ mt: 2 }}
                    >
                        {myBooks.map((book) => (
                            <MenuItem key={book.id} value={book.id}>
                                {book.title} by {book.author}
                            </MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setExchangeDialog({ open: false, listing: null })}>
                        Cancel
                    </Button>
                    <Button onClick={handleExchangeSubmit} variant="contained">
                        Send Request
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default Marketplace;
