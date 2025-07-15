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
} from '@mui/material';
import { 
  LibraryAdd as LibraryAddIcon,
  Title as TitleIcon,
  Person as PersonIcon,
  AttachMoney as AttachMoneyIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { createBook } from '../api';

function BookForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    price: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      
      await createBook(bookData);
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred while creating the book');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <LibraryAddIcon 
              sx={{ 
                fontSize: 48, 
                color: 'primary.main',
                mb: 2
              }} 
            />
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Add New Book
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enter the details of the book you want to add to your collection
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
                placeholder="Enter the book title"
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
                placeholder="Enter the author's name"
              />
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
                placeholder="0.00"
                inputProps={{ 
                  min: 0, 
                  step: "0.01",
                  inputMode: 'decimal'
                }}
              />

              <Box sx={{ mt: 2 }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  size="large"
                  fullWidth
                  disabled={isSubmitting}
                  sx={{ 
                    py: 1.5,
                    fontSize: '1.1rem',
                  }}
                >
                  {isSubmitting ? 'Adding Book...' : 'Add Book to Collection'}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Fade>
  );
}

export default BookForm;
