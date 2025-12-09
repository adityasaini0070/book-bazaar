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
import { useAuth } from '../context/AuthContext';

function BookForm() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    price: '',
    genre: '',
    publicationYear: '',
    publisher: '',
    pages: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const searchBooks = async () => {
    if (!searchQuery || searchQuery.trim() === '') {
      return;
    }

    setSearching(true);
    
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=5`);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const results = data.items.map(item => ({
          id: item.id,
          title: item.volumeInfo.title,
          authors: item.volumeInfo.authors?.join(', ') || 'Unknown Author',
          publishedDate: item.volumeInfo.publishedDate,
          thumbnail: item.volumeInfo.imageLinks?.thumbnail,
          volumeInfo: item.volumeInfo
        }));
        setSearchResults(results);
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const selectBook = (book) => {
    const volumeInfo = book.volumeInfo;
    
    setFormData({
      title: volumeInfo.title || '',
      author: volumeInfo.authors ? volumeInfo.authors.join(', ') : '',
      price: '',
      genre: volumeInfo.categories ? volumeInfo.categories[0] : '',
      publicationYear: volumeInfo.publishedDate ? volumeInfo.publishedDate.substring(0, 4) : '',
      publisher: volumeInfo.publisher || '',
      pages: volumeInfo.pageCount?.toString() || '',
      description: volumeInfo.description || ''
    });

    setShowSearchResults(false);
    setSearchQuery('');
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createBook(formData, token);
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

          {/* Book Search Section */}
          <Paper 
            elevation={1} 
            sx={{ 
              p: 3, 
              mb: 3, 
              bgcolor: 'primary.50',
              borderLeft: '4px solid',
              borderColor: 'primary.main'
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SearchIcon /> Quick Search
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Search for a book by title or author to auto-fill all details
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, position: 'relative' }}>
              <TextField
                fullWidth
                placeholder="e.g., Harry Potter, 1984, or J.K. Rowling"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchBooks()}
              />
              <Button 
                variant="contained" 
                onClick={searchBooks}
                disabled={searching || !searchQuery}
                sx={{ minWidth: '120px' }}
              >
                {searching ? <CircularProgress size={24} /> : 'Search'}
              </Button>
            </Box>

            {/* Search Results Dropdown */}
            {showSearchResults && (
              <Paper 
                elevation={4}
                sx={{ 
                  mt: 2, 
                  maxHeight: '400px', 
                  overflowY: 'auto',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                {searchResults.length > 0 ? (
                  searchResults.map((book) => (
                    <Box
                      key={book.id}
                      onClick={() => selectBook(book)}
                      sx={{
                        p: 2,
                        display: 'flex',
                        gap: 2,
                        cursor: 'pointer',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }}
                    >
                      {book.thumbnail && (
                        <img 
                          src={book.thumbnail} 
                          alt={book.title}
                          style={{ width: '60px', height: '90px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {book.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {book.authors}
                        </Typography>
                        {book.publishedDate && (
                          <Typography variant="caption" color="text.secondary">
                            Published: {book.publishedDate}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                      No results found. Try a different search term.
                    </Typography>
                  </Box>
                )}
              </Paper>
            )}
          </Paper>

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

            {/* Row 2: Genre */}
            <TextField
              fullWidth
              label="Genre (Optional)"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              placeholder="e.g., Fiction, Science, Biography"
            />

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
