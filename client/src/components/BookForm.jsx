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
  Fade
} from '@mui/material';
import { 
  LibraryAdd as LibraryAddIcon,
  Title as TitleIcon,
  Person as PersonIcon,
  AttachMoney as AttachMoneyIcon,
  ArrowBack as ArrowBackIcon,
  MenuBook as MenuBookIcon
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
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      minHeight: '100vh',
      bgcolor: 'background.default'
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
        justifyContent: 'center',
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
            width: '45%',
            minWidth: '400px',
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

        <Paper
          elevation={2}
          sx={{ 
            p: 4,
            borderRadius: 2,
            bgcolor: 'background.paper',
            width: '45%',
            minWidth: '400px',
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
            <MenuBookIcon sx={{ fontSize: 64, color: 'primary.light', mb: 2 }} />
            <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
              Book Guidelines
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Tips for adding a new book to your collection
            </Typography>
          </Box>

          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Book Title
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter the complete title as it appears on the book cover. Include subtitle if present.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Author Name
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Use the author's full name. For multiple authors, separate with commas.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Price
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter the current market price or your purchase price in dollars.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}

export default BookForm;
