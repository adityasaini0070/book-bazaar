import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Chip,
  Stack,
  Divider,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  AutoStories as SummaryIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';

function BookSummary({ book, open, onClose }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateSummary = () => {
    setLoading(true);
    
    // Simulate AI summary generation
    setTimeout(() => {
      const summaries = {
        default: {
          overview: `This ${book.genre || 'book'} by ${book.author} explores fascinating themes and delivers a compelling narrative. Published in ${book.publication_year || 'recent years'}, it has captivated readers with its unique perspective and engaging storytelling.`,
          keyPoints: [
            'Engaging narrative style that keeps readers invested',
            'Well-developed characters with relatable motivations',
            'Thought-provoking themes that resonate with modern audiences',
            'Expertly crafted plot with satisfying progression'
          ],
          highlights: [
            '📚 Rich character development',
            '🎯 Clear thematic focus',
            '✨ Memorable storytelling',
            '💡 Insightful observations'
          ],
          audience: 'Perfect for readers who enjoy thoughtful narratives and compelling character studies.',
          readingTime: `Approximately ${Math.ceil((book.pages || 300) / 50)} hours`
        }
      };

      setSummary(summaries.default);
      setLoading(false);
    }, 2000);
  };

  const handleOpen = () => {
    if (!summary) {
      generateSummary();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionProps={{
        onEntered: handleOpen
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SummaryIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="bold">
            AI-Generated Summary
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Book Info Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            {book.title}
          </Typography>
          
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            {book.author && (
              <Chip
                icon={<PersonIcon />}
                label={book.author}
                size="small"
                variant="outlined"
              />
            )}
            {book.genre && (
              <Chip
                icon={<CategoryIcon />}
                label={book.genre}
                size="small"
                color="primary"
              />
            )}
            {book.publication_year && (
              <Chip
                icon={<CalendarIcon />}
                label={book.publication_year}
                size="small"
                variant="outlined"
              />
            )}
          </Stack>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Generating AI summary...
            </Typography>
          </Box>
        ) : summary ? (
          <Stack spacing={3}>
            {/* Overview */}
            <Box>
              <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                📖 Overview
              </Typography>
              <Typography variant="body1" paragraph>
                {summary.overview}
              </Typography>
            </Box>

            <Divider />

            {/* Key Points */}
            <Box>
              <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                🎯 Key Points
              </Typography>
              <Stack spacing={1}>
                {summary.keyPoints.map((point, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'start' }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>•</Typography>
                    <Typography variant="body2">{point}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Divider />

            {/* Highlights */}
            <Box>
              <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                ✨ Highlights
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {summary.highlights.map((highlight, index) => (
                  <Chip
                    key={index}
                    label={highlight}
                    size="small"
                    sx={{ bgcolor: 'action.hover' }}
                  />
                ))}
              </Box>
            </Box>

            <Divider />

            {/* Reading Info */}
            <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                👥 Who Should Read This?
              </Typography>
              <Typography variant="body2" paragraph>
                {summary.audience}
              </Typography>
              
              <Typography variant="subtitle2" fontWeight="bold">
                ⏱️ Estimated Reading Time
              </Typography>
              <Typography variant="body2">
                {summary.readingTime}
              </Typography>
            </Box>
          </Stack>
        ) : null}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BookSummary;
