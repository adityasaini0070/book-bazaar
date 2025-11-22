import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  Typography, 
  CardActions, 
  Button,
  IconButton,
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
  LocalOffer as LocalOfferIcon
} from '@mui/icons-material';
import { getAllBooks, deleteBook } from '../api';

function BookList() {
  const [books, setBooks] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      <Box sx={{ width: '100%', maxWidth: '1200px' }}>
        <Grid container spacing={3} sx={{ display: 'flex', justifyContent: 'center' }}>
          {books.map((book, index) => (
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
