import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Paper, 
  TextField, 
  Button, 
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { getBook, updateBook } from '../api';

function EditBook() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    price: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await getBook(id);
        setFormData({
          title: response.data.title,
          author: response.data.author,
          price: response.data.price.toString()
        });
      } catch (error) {
        setError('Error fetching book details');
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const bookData = {
        ...formData,
        price: parseFloat(formData.price)
      };
      
      await updateBook(id, bookData);
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred while updating the book');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Edit Book
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Author"
          name="author"
          value={formData.author}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Price"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          margin="normal"
          required
          inputProps={{ min: 0, step: "0.01" }}
        />
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            fullWidth
          >
            Update Book
          </Button>
          <Button 
            variant="outlined" 
            color="secondary"
            fullWidth
            onClick={() => navigate('/')}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default EditBook;
