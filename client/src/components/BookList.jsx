import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  Typography, 
  CardActions, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Fade,
  Alert,
  CircularProgress,
  Paper,
  Grid
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  MenuBook as MenuBookIcon,
  Person as PersonIcon,
  LocalOffer as LocalOfferIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  TrendingUp as TrendingUpIcon,
  Category as CategoryIcon,
  CalendarToday as CalendarTodayIcon,
  AutoStories as AutoStoriesIcon
} from '@mui/icons-material';
import { getAllBooks, deleteBook } from '../api';

function BookList() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Filter and sort books
  useEffect(() => {
    let result = [...books];

    // Filter by search term
    if (searchTerm) {
      result = result.filter(
        book =>
          book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by genre
    if (selectedGenre !== 'all') {
      result = result.filter(book => book.genre === selectedGenre);
    }

    // Sort books
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'price-low':
        result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-high':
        result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    setFilteredBooks(result);
  }, [books, searchTerm, selectedGenre, sortBy]);

  // Get unique genres for filter
  const genres = ['all', ...new Set(books.map(b => b.genre).filter(Boolean))];

  // Calculate statistics
  const stats = {
    totalBooks: books.length,
    totalValue: books.reduce((sum, book) => sum + parseFloat(book.price), 0),
    totalPages: books.reduce((sum, book) => sum + (parseInt(book.pages) || 0), 0),
    genreCount: new Set(books.map(b => b.genre).filter(Boolean)).size,
    avgPrice: books.length > 0 ? books.reduce((sum, book) => sum + parseFloat(book.price), 0) / books.length : 0,
    mostExpensive: books.length > 0 ? Math.max(...books.map(b => parseFloat(b.price))) : 0,
    cheapest: books.length > 0 ? Math.min(...books.map(b => parseFloat(b.price))) : 0
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await getAllBooks();
      console.log('API Response:', response); // Debug log
      if (response && response.data) {
        // Ensure all books have valid price values
        const validatedBooks = response.data.map(book => ({
          ...book,
          price: typeof book.price === 'number' ? book.price : parseFloat(book.price) || 0
        }));
        setBooks(validatedBooks);
        setFilteredBooks(validatedBooks);
        setError(null);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      setError('Error fetching books. Please try again later.');
      console.error('Error fetching books:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDeleteClick = (book) => {
    setBookToDelete(book);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteBook(bookToDelete.id);
      await fetchBooks();
      setDeleteDialogOpen(false);
      setBookToDelete(null);
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
        width="100%"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }    if (books.length === 0) {
    return (
      <Paper 
        sx={{ 
          p: 4, 
          textAlign: 'center',
          borderRadius: 2,
          bgcolor: 'background.paper',
          mt: 4,
          maxWidth: '600px',
          width: '100%',
          mx: 'auto'
        }}
      >
        <MenuBookIcon sx={{ fontSize: 60, color: 'primary.light', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          No Books Found
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Start by adding some books to your collection
        </Typography>
        <Button
          variant="contained"
          component={Link}
          to="/add"
          size="large"
        >
          Add Your First Book
        </Button>
      </Paper>
    );
  }

  return (
    <Box 
      sx={{ 
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <Box 
        sx={{ 
          mb: 4,
          textAlign: 'center',
          maxWidth: '800px',
          width: '100%'
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Your Book Collection
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and explore your book inventory
        </Typography>
      </Box>

      {/* Search and Filter Section */}
      <Paper 
        elevation={2}
        sx={{ 
          p: 3, 
          mb: 4, 
          width: '100%', 
          borderRadius: 2
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Search Bar */}
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <input
                type="text"
                placeholder="Search by title or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </Box>
          </Grid>

          {/* Genre Filter */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  outline: 'none',
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}
              >
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre === 'all' ? 'All Genres' : genre}
                  </option>
                ))}
              </select>
            </Box>
          </Grid>

          {/* Sort Options */}
          <Grid item xs={12} sm={6} md={4}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                outline: 'none',
                fontFamily: 'inherit',
                cursor: 'pointer'
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="title">Title: A to Z</option>
            </select>
          </Grid>
        </Grid>

        {/* Results Count */}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Showing {filteredBooks.length} of {books.length} books
        </Typography>
      </Paper>

      <Box sx={{ width: '100%' }}>
        {filteredBooks.length === 0 ? (
          <Paper 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              No books match your search
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your filters or search terms
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {/* Books Grid */}
            <Grid item xs={12} md={9}>
              <Grid container spacing={3}>
                {filteredBooks.map((book, index) => (
          <Grid item xs={12} sm={6} md={4} key={book.id}>
            <Fade in timeout={300} style={{ transitionDelay: `${index * 100}ms` }}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" component="div" gutterBottom>
                      {book.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PersonIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {book.author}
                      </Typography>
                    </Box>
                    
                    {book.genre && (
                      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                        📚 {book.genre}
                      </Typography>
                    )}
                    
                    {book.publication_year && (
                      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                        📅 {book.publication_year}
                      </Typography>
                    )}
                    
                    {book.pages && (
                      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                        📄 {book.pages} pages
                      </Typography>
                    )}
                    
                    {book.description && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mt: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {book.description}
                      </Typography>
                    )}
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <LocalOfferIcon sx={{ fontSize: 20, color: 'primary.main', mr: 1 }} />
                      <Typography variant="h6" color="primary.main" fontWeight="bold">
                        ${parseFloat(book.price).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    component={Link}
                    to={`/edit/${book.id}`}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteClick(book)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Fade>
          </Grid>
        ))}
              </Grid>
            </Grid>

            {/* Statistics Dashboard */}
            <Grid item xs={12} md={3}>
              <Paper 
                elevation={3}
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  position: 'sticky',
                  top: 20,
                  bgcolor: 'background.paper'
                }}
              >
                <Typography variant="h6" gutterBottom fontWeight="bold" mb={3}>
                  📊 Collection Stats
                </Typography>

                {/* Total Books */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <MenuBookIcon sx={{ fontSize: 20, color: 'primary.main', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Total Books
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalBooks}
                  </Typography>
                </Box>

                {/* Total Value */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TrendingUpIcon sx={{ fontSize: 20, color: 'success.main', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Collection Value
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight="bold" color="success.main">
                    ${stats.totalValue.toFixed(2)}
                  </Typography>
                </Box>

                {/* Total Pages */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AutoStoriesIcon sx={{ fontSize: 20, color: 'info.main', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Total Pages
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight="bold" color="info.main">
                    {stats.totalPages.toLocaleString()}
                  </Typography>
                </Box>

                {/* Genres */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CategoryIcon sx={{ fontSize: 20, color: 'secondary.main', mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Genres
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight="bold" color="secondary.main">
                    {stats.genreCount}
                  </Typography>
                </Box>

                {/* Price Stats */}
                <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" color="text.secondary" mb={2}>
                    Price Range
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Average:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      ${stats.avgPrice.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Highest:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="error.main">
                      ${stats.mostExpensive.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Lowest:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      ${stats.cheapest.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>Delete Book</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{bookToDelete?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default BookList;
