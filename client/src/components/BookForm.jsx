import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Paper, 
  TextField, 
  Button, 
  Typography,
  Box,
  Alert
} from '@mui/material';
import { createBook } from '../api';

function BookForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    price: ''
  });
  const [error, setError] = useState('');

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
      
      await createBook(bookData);
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred while creating the book');
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Add New Book
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
        <Box sx={{ mt: 2 }}>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            fullWidth
          >
            Add Book
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default BookForm;
