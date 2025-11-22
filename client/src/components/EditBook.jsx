import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Paper, 
  TextField, 
  Button, 
  Typography,
  Box,
  Alert,
  CircularProgress,
  Stack,
  InputAdornment,
  Fade
} from '@mui/material';
import { 
  Edit as EditIcon,
  Title as TitleIcon,
  Person as PersonIcon,
  AttachMoney as AttachMoneyIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { getBook, updateBook } from '../api';

function EditBook() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await getBook(id);
        setFormData({
          title: response.data.title,
          author: response.data.author,
          price: response.data.price.toString(),
          isbn: response.data.isbn || '',
          genre: response.data.genre || '',
          publicationYear: response.data.publication_year || '',
          publisher: response.data.publisher || '',
          pages: response.data.pages || '',
          description: response.data.description || ''
        });
        setError('');
      } catch (error) {
        setError('Error fetching book details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user makes changes
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const bookData = {
        ...formData,
        price: parseFloat(formData.price)
      };
      
      await updateBook(id, bookData);
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred while updating the book');
    } finally {
      setIsSubmitting(false);
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
    <Fade in timeout={500}>
      <Box maxWidth={600} mx="auto">
        <Button
          component={Link}
          to="/"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 4 }}
        >
          Back to Books
        </Button>

        <Paper 
          elevation={0} 
          sx={{ 
            p: 4,
            borderRadius: 2,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <EditIcon 
              sx={{ 
                fontSize: 48, 
                color: 'primary.main',
                mb: 2
              }} 
            />
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Edit Book
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Update the details of your book
            </Typography>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* Row 1: Title and Author */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Book Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TitleIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Author Name"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Row 2: Genre and ISBN */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Genre"
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  label="ISBN"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleChange}
                />
              </Box>

              {/* Row 3: Price, Year, Pages */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{ 
                    min: 0, 
                    step: "0.01",
                    inputMode: 'decimal'
                  }}
                />
                <TextField
                  fullWidth
                  label="Publication Year"
                  name="publicationYear"
                  type="number"
                  value={formData.publicationYear}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  label="Pages"
                  name="pages"
                  type="number"
                  value={formData.pages}
                  onChange={handleChange}
                />
              </Box>

              {/* Row 4: Publisher */}
              <TextField
                fullWidth
                label="Publisher"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
              />

              {/* Row 5: Description */}
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
              />

              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  size="large"
                  fullWidth
                  disabled={isSubmitting}
                  startIcon={<SaveIcon />}
                  sx={{ 
                    py: 1.5,
                    fontSize: '1.1rem',
                  }}
                >
                  {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                </Button>
                <Button 
                  variant="outlined" 
                  color="secondary"
                  size="large"
                  fullWidth
                  onClick={() => navigate('/')}
                  sx={{ 
                    py: 1.5,
                    fontSize: '1.1rem',
                  }}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Fade>
  );
}

export default EditBook;
