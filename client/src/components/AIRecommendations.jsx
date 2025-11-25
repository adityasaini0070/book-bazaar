import { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Card,
  CardContent,
  Divider,
  Snackbar
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  Refresh as RefreshIcon,
  MenuBook as BookIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { createBook } from '../api';

function AIRecommendations({ books, onBookAdded }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addingBook, setAddingBook] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const generateRecommendations = async () => {
    if (!books || books.length === 0) {
      setError('Add some books to get personalized recommendations!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Analyze user's collection
      const genres = books.map(b => b.genre).filter(Boolean);
      const authors = books.map(b => b.author).filter(Boolean);
      const titles = books.map(b => b.title).filter(Boolean);
      
      // Build search query based on user's collection
      const genreCount = {};
      genres.forEach(g => {
        genreCount[g] = (genreCount[g] || 0) + 1;
      });

      const favoriteGenre = genres.length > 0 
        ? Object.keys(genreCount).reduce((a, b) => genreCount[a] > genreCount[b] ? a : b)
        : 'bestseller';

      // Fetch recommendations from Google Books API
      const searchQuery = encodeURIComponent(`subject:${favoriteGenre}`);
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&orderBy=relevance&maxResults=10`);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const recommendations = data.items
          .filter(item => {
            const bookTitle = item.volumeInfo.title?.toLowerCase();
            // Filter out books already in collection
            return !titles.some(t => t.toLowerCase() === bookTitle);
          })
          .slice(0, 3)
          .map(item => ({
            title: item.volumeInfo.title || 'Unknown Title',
            author: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Unknown Author',
            genre: item.volumeInfo.categories ? item.volumeInfo.categories[0] : favoriteGenre,
            reason: item.volumeInfo.description 
              ? item.volumeInfo.description.substring(0, 150) + '...'
              : `A ${favoriteGenre} book that matches your reading preferences.`,
            rating: item.volumeInfo.averageRating || 4.0
          }));

        setRecommendations(recommendations);
      } else {
        setError('No recommendations found. Try adding more books to your collection.');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to generate recommendations. Please try again.');
      setLoading(false);
    }
  };

  const handleAddBook = async (rec) => {
    setAddingBook(rec.title);
    
    try {
      const bookData = {
        title: rec.title,
        author: rec.author,
        price: 15.99, // Default price for recommended books
        genre: rec.genre,
        publicationYear: '',
        publisher: '',
        pages: '',
        description: rec.reason
      };

      await createBook(bookData);
      setSnackbar({ open: true, message: `"${rec.title}" added to your collection!` });
      
      // Remove the added book from recommendations
      setRecommendations(prev => prev.filter(r => r.title !== rec.title));
      
      // Notify parent to refresh book list
      if (onBookAdded) {
        onBookAdded();
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to add book. Please try again.' });
    } finally {
      setAddingBook(null);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 2,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <AIIcon sx={{ fontSize: 32, mr: 1 }} />
        <Typography variant="h5" fontWeight="bold">
          AI Book Recommendations
        </Typography>
      </Box>

      <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
        Get personalized book suggestions based on your collection
      </Typography>

      <Button
        variant="contained"
        onClick={generateRecommendations}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.2)',
          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' },
          mb: 3
        }}
      >
        {loading ? 'Analyzing Collection...' : 'Get Recommendations'}
      </Button>

      {error && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {recommendations.length > 0 && (
        <Stack spacing={2.5}>
          {recommendations.map((rec, index) => (
            <Card
              key={index}
              sx={{
                bgcolor: '#ffffff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                border: '1px solid rgba(0,0,0,0.1)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <BookIcon sx={{ mr: 2, color: '#667eea', fontSize: 28, mt: 0.5, flexShrink: 0 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography 
                      variant="h6" 
                      fontWeight="bold" 
                      sx={{ 
                        color: '#1a1a1a',
                        mb: 0.5,
                        fontSize: '1.1rem'
                      }}
                    >
                      {rec.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#666666',
                        fontStyle: 'italic'
                      }}
                    >
                      by {rec.author}
                    </Typography>
                  </Box>
                  <Chip
                    label={`⭐ ${rec.rating}`}
                    size="small"
                    sx={{ 
                      bgcolor: '#667eea',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.875rem',
                      ml: 2,
                      flexShrink: 0
                    }}
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={rec.genre}
                    size="small"
                    sx={{ 
                      bgcolor: '#f0f0f0',
                      color: '#333333',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  />
                </Box>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#333333',
                    lineHeight: 1.7,
                    fontSize: '0.9rem',
                    mb: 2
                  }}
                >
                  {rec.reason}
                </Typography>

                <Button
                  variant="contained"
                  size="small"
                  startIcon={addingBook === rec.title ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
                  onClick={() => handleAddBook(rec)}
                  disabled={addingBook === rec.title}
                  sx={{
                    bgcolor: '#667eea',
                    '&:hover': { bgcolor: '#5568d3' },
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  {addingBook === rec.title ? 'Adding...' : 'Add to Collection'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Paper>
  );
}

export default AIRecommendations;
