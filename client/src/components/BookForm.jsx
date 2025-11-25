import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Paper, 
  TextField, 
  Button, 
  Typography,
  Box,
  Alert,
  Stack,
  InputAdornment,
  Fade,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  LibraryAdd as LibraryAddIcon,
  Title as TitleIcon,
  Person as PersonIcon,
  AttachMoney as AttachMoneyIcon,
  ArrowBack as ArrowBackIcon,
  MenuBook as MenuBookIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { createBook } from '../api';

function BookForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    price: '',
    isbn: '',
    genre: '',
    publicationYear: '',
    publisher: '',
    pages: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isbnLoading, setIsbnLoading] = useState(false);
  const [isbnError, setIsbnError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const lookupISBN = async () => {
    if (!formData.isbn || formData.isbn.trim() === '') {
      setIsbnError('Please enter an ISBN first');
      return;
    }

    setIsbnLoading(true);
    setIsbnError('');
    
    try {
      const cleanISBN = formData.isbn.replace(/[-\s]/g, '');
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanISBN}`);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const book = data.items[0].volumeInfo;
        
        setFormData(prev => ({
          ...prev,
          title: book.title || prev.title,
          author: book.authors ? book.authors.join(', ') : prev.author,
          genre: book.categories ? book.categories[0] : prev.genre,
          publicationYear: book.publishedDate ? book.publishedDate.substring(0, 4) : prev.publicationYear,
          publisher: book.publisher || prev.publisher,
          pages: book.pageCount?.toString() || prev.pages,
          description: book.description || prev.description
        }));
        
        setIsbnError('');
      } else {
        setIsbnError('No book found with this ISBN');
      }
    } catch (err) {
      setIsbnError('Failed to fetch book details. Please try again.');
      console.error('ISBN lookup error:', err);
    } finally {
      setIsbnLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createBook(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to add book');
    }
  };

  return (
    <Box sx={{ 
      p: 3,
      width: '100%'
    }}>
      <Button
        component={Link}
        to="/"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 4 }}
      >
        Back to Books
      </Button>

      <Box sx={{ 
        display: 'flex',
        gap: 4,
        flexWrap: 'wrap'
      }}>
        <Paper
          component="form"
          onSubmit={handleSubmit}
          elevation={2}
          sx={{ 
            p: 4,
            borderRadius: 2,
            bgcolor: 'background.paper',
            flex: 1,
            height: 'fit-content',
            boxShadow: theme => `0 2px 24px ${theme.palette.mode === 'dark' 
              ? 'rgba(0,0,0,0.2)' 
              : 'rgba(0,0,0,0.08)'}`,
            transition: 'box-shadow 0.3s ease-in-out',
            '&:hover': {
              boxShadow: theme => `0 4px 32px ${theme.palette.mode === 'dark'
                ? 'rgba(0,0,0,0.3)'
                : 'rgba(0,0,0,0.12)'}`
            }
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <LibraryAddIcon sx={{ fontSize: 64, color: 'primary.light', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Add New Book
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enter the details of your book below
            </Typography>
          </Box>

          <Stack spacing={3}>
            {/* Row 1: Title and Author */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                required
                fullWidth
                label="Book Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TitleIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                required
                fullWidth
                label="Author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Row 2: Genre and ISBN with Lookup */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Genre (Optional)"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                placeholder="e.g., Fiction, Science, Biography"
              />

              <TextField
                fullWidth
                label="ISBN (Optional)"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                placeholder="e.g., 978-3-16-148410-0"
                error={!!isbnError}
                helperText={isbnError}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Auto-fill details from ISBN">
                        <IconButton 
                          onClick={lookupISBN}
                          disabled={isbnLoading || !formData.isbn}
                          color="primary"
                        >
                          {isbnLoading ? <CircularProgress size={24} /> : <SearchIcon />}
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            
            {/* ISBN Lookup Info */}
            {!isbnError && formData.isbn && (
              <Alert severity="info" sx={{ mt: -1 }}>
                💡 Click the search icon to auto-fill book details from ISBN
              </Alert>
            )}

            {/* Row 3: Price, Year, Pages */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                required
                fullWidth
                label="Price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Publication Year (Optional)"
                name="publicationYear"
                type="number"
                value={formData.publicationYear}
                onChange={handleChange}
                placeholder="e.g., 2023"
              />

              <TextField
                fullWidth
                label="Pages (Optional)"
                name="pages"
                type="number"
                value={formData.pages}
                onChange={handleChange}
                placeholder="e.g., 320"
              />
            </Box>

            {/* Row 4: Publisher */}
            <TextField
              fullWidth
              label="Publisher (Optional)"
              name="publisher"
              value={formData.publisher}
              onChange={handleChange}
              placeholder="e.g., Penguin Random House"
            />

            {/* Row 5: Description */}
            <TextField
              fullWidth
              label="Description (Optional)"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              placeholder="Brief summary or notes about this book..."
            />

            {error && (
              <Fade in>
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              </Fade>
            )}

            {success && (
              <Fade in>
                <Alert severity="success" sx={{ mt: 2 }}>
                  Book added successfully!
                </Alert>
              </Fade>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<LibraryAddIcon />}
              sx={{ mt: 2 }}
            >
              Add Book
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}

export default BookForm;
