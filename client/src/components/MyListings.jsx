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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Alert,
    CircularProgress,
    Tabs,
    Tab
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Inventory as InventoryIcon
} from '@mui/icons-material';
import { 
    getAllBooks, 
    getMyListings, 
    createListing, 
    updateListing, 
    deleteListing,
    getReceivedExchangeRequests,
    getSentExchangeRequests,
    updateExchangeRequest,
    getPurchases,
    getSales
} from '../api';
import { useAuth } from '../context/AuthContext';

function MyListings() {
    const { token } = useAuth();
    const [tabValue, setTabValue] = useState(0);
    const [listings, setListings] = useState([]);
    const [myBooks, setMyBooks] = useState([]);
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        book_id: '',
        listing_type: 'sell',
        price: '',
        condition: 'good',
        description: ''
    });

    useEffect(() => {
        fetchData();
    }, [tabValue]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const booksResponse = await getAllBooks();
            setMyBooks(booksResponse.data);

            const listingsResponse = await getMyListings(token);
            setListings(listingsResponse.data);

            if (tabValue === 1) {
                const receivedResponse = await getReceivedExchangeRequests(token);
                setReceivedRequests(receivedResponse.data);
            } else if (tabValue === 2) {
                const sentResponse = await getSentExchangeRequests(token);
                setSentRequests(sentResponse.data);
            } else if (tabValue === 3) {
                const purchasesResponse = await getPurchases(token);
                setPurchases(purchasesResponse.data);
            } else if (tabValue === 4) {
                const salesResponse = await getSales(token);
                setSales(salesResponse.data);
            }
        } catch (err) {
            setError('Failed to load data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateListing = async () => {
        try {
            await createListing(formData, token);
            setSuccess('Listing created successfully!');
            setDialogOpen(false);
            setFormData({
                book_id: '',
                listing_type: 'sell',
                price: '',
                condition: 'good',
                description: ''
            });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create listing');
        }
    };

    const handleDeleteListing = async (id) => {
        if (!window.confirm('Are you sure you want to delete this listing?')) return;

        try {
            await deleteListing(id, token);
            setSuccess('Listing deleted successfully!');
            fetchData();
        } catch (err) {
            setError('Failed to delete listing');
        }
    };

    const handleExchangeResponse = async (id, status) => {
        try {
            await updateExchangeRequest(id, status, token);
            setSuccess(`Exchange request ${status}!`);
            fetchData();
        } catch (err) {
            setError('Failed to update exchange request');
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <InventoryIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                    <Typography variant="h4" component="h1">
                        My Marketplace
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setDialogOpen(true)}
                >
                    Create Listing
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
                <Tab label="My Listings" />
                <Tab label="Exchange Requests Received" />
                <Tab label="Exchange Requests Sent" />
                <Tab label="My Purchases" />
                <Tab label="My Sales" />
            </Tabs>

            {/* My Listings Tab */}
            {tabValue === 0 && (
                <Grid container spacing={3}>
                    {listings.length === 0 ? (
                        <Grid item xs={12}>
                            <Alert severity="info">You haven't created any listings yet.</Alert>
                        </Grid>
                    ) : (
                        listings.map((listing) => (
                            <Grid item xs={12} sm={6} md={4} key={listing.id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            {listing.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            by {listing.author}
                                        </Typography>
                                        <Box sx={{ mt: 2 }}>
                                            <Chip
                                                label={listing.listing_type}
                                                color={listing.listing_type === 'sell' ? 'success' : 'info'}
                                                size="small"
                                                sx={{ mr: 1 }}
                                            />
                                            <Chip
                                                label={listing.status}
                                                color={listing.status === 'active' ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </Box>
                                        {listing.listing_type === 'sell' && (
                                            <Typography variant="h5" color="primary" sx={{ mt: 2 }}>
                                                ${parseFloat(listing.price).toFixed(2)}
                                            </Typography>
                                        )}
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            size="small"
                                            color="error"
                                            startIcon={<DeleteIcon />}
                                            onClick={() => handleDeleteListing(listing.id)}
                                        >
                                            Delete
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            )}

            {/* Exchange Requests Received Tab */}
            {tabValue === 1 && (
                <Grid container spacing={3}>
                    {receivedRequests.length === 0 ? (
                        <Grid item xs={12}>
                            <Alert severity="info">No exchange requests received.</Alert>
                        </Grid>
                    ) : (
                        receivedRequests.map((request) => (
                            <Grid item xs={12} sm={6} key={request.id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            {request.requester_name} wants to exchange
                                        </Typography>
                                        <Typography variant="body2">
                                            Your book: <strong>{request.listing_book_title}</strong>
                                        </Typography>
                                        <Typography variant="body2">
                                            For: <strong>{request.offered_book_title}</strong> by {request.offered_book_author}
                                        </Typography>
                                        <Chip
                                            label={request.status}
                                            color={request.status === 'pending' ? 'warning' : 'default'}
                                            size="small"
                                            sx={{ mt: 2 }}
                                        />
                                    </CardContent>
                                    {request.status === 'pending' && (
                                        <CardActions>
                                            <Button
                                                size="small"
                                                color="success"
                                                onClick={() => handleExchangeResponse(request.id, 'accepted')}
                                            >
                                                Accept
                                            </Button>
                                            <Button
                                                size="small"
                                                color="error"
                                                onClick={() => handleExchangeResponse(request.id, 'rejected')}
                                            >
                                                Reject
                                            </Button>
                                        </CardActions>
                                    )}
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            )}

            {/* Exchange Requests Sent Tab */}
            {tabValue === 2 && (
                <Grid container spacing={3}>
                    {sentRequests.length === 0 ? (
                        <Grid item xs={12}>
                            <Alert severity="info">No exchange requests sent.</Alert>
                        </Grid>
                    ) : (
                        sentRequests.map((request) => (
                            <Grid item xs={12} sm={6} key={request.id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Request to {request.seller_name}
                                        </Typography>
                                        <Typography variant="body2">
                                            Their book: <strong>{request.listing_book_title}</strong>
                                        </Typography>
                                        <Typography variant="body2">
                                            Your offer: <strong>{request.offered_book_title}</strong>
                                        </Typography>
                                        <Chip
                                            label={request.status}
                                            color={
                                                request.status === 'pending' ? 'warning' :
                                                request.status === 'accepted' ? 'success' : 'error'
                                            }
                                            size="small"
                                            sx={{ mt: 2 }}
                                        />
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            )}

            {/* Purchases Tab */}
            {tabValue === 3 && (
                <Grid container spacing={3}>
                    {purchases.length === 0 ? (
                        <Grid item xs={12}>
                            <Alert severity="info">No purchases yet.</Alert>
                        </Grid>
                    ) : (
                        purchases.map((purchase) => (
                            <Grid item xs={12} sm={6} key={purchase.id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6">{purchase.title}</Typography>
                                        <Typography variant="body2">by {purchase.author}</Typography>
                                        <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                                            ${parseFloat(purchase.amount).toFixed(2)}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            From: {purchase.seller_name}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            )}

            {/* Sales Tab */}
            {tabValue === 4 && (
                <Grid container spacing={3}>
                    {sales.length === 0 ? (
                        <Grid item xs={12}>
                            <Alert severity="info">No sales yet.</Alert>
                        </Grid>
                    ) : (
                        sales.map((sale) => (
                            <Grid item xs={12} sm={6} key={sale.id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6">{sale.title}</Typography>
                                        <Typography variant="body2">by {sale.author}</Typography>
                                        <Typography variant="h6" color="success.main" sx={{ mt: 1 }}>
                                            ${parseFloat(sale.amount).toFixed(2)}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            To: {sale.buyer_name}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            )}

            {/* Create Listing Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Listing</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        select
                        label="Select Book"
                        value={formData.book_id}
                        onChange={(e) => setFormData({ ...formData, book_id: e.target.value })}
                        sx={{ mt: 2 }}
                        required
                    >
                        {myBooks.map((book) => (
                            <MenuItem key={book.id} value={book.id}>
                                {book.title} by {book.author}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        fullWidth
                        select
                        label="Listing Type"
                        value={formData.listing_type}
                        onChange={(e) => setFormData({ ...formData, listing_type: e.target.value })}
                        sx={{ mt: 2 }}
                    >
                        <MenuItem value="sell">Sell</MenuItem>
                        <MenuItem value="exchange">Exchange</MenuItem>
                    </TextField>

                    {formData.listing_type === 'sell' && (
                        <TextField
                            fullWidth
                            label="Price"
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            sx={{ mt: 2 }}
                            required
                        />
                    )}

                    <TextField
                        fullWidth
                        select
                        label="Condition"
                        value={formData.condition}
                        onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                        sx={{ mt: 2 }}
                    >
                        <MenuItem value="new">New</MenuItem>
                        <MenuItem value="like-new">Like New</MenuItem>
                        <MenuItem value="good">Good</MenuItem>
                        <MenuItem value="fair">Fair</MenuItem>
                        <MenuItem value="poor">Poor</MenuItem>
                    </TextField>

                    <TextField
                        fullWidth
                        label="Description (Optional)"
                        multiline
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateListing} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default MyListings;
