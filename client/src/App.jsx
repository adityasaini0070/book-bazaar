import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, CssBaseline, ThemeProvider, createTheme, Box } from '@mui/material';
import BookList from './components/BookList';
import BookForm from './components/BookForm';
import EditBook from './components/EditBook';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb', // Modern blue
      light: '#60a5fa',
      dark: '#1e40af',
    },
    secondary: {
      main: '#db2777', // Modern pink
      light: '#f472b6',
      dark: '#be185d',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    error: {
      main: '#ef4444',
    },
    success: {
      main: '#22c55e',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '8px 16px',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <ErrorBoundary>
          <Navbar />
          <Box 
            sx={{ 
              minHeight: 'calc(100vh - 64px)', // Full height minus navbar
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pt: 4,
              pb: 4,
              px: 2,
              backgroundColor: 'background.default'
            }}
          >
            <Container 
              maxWidth="lg" 
              sx={{ 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%'
              }}
            >
              <Routes>
                <Route path="/" element={
                  <ErrorBoundary>
                    <BookList />
                  </ErrorBoundary>
                } />
                <Route path="/add" element={
                  <ErrorBoundary>
                    <BookForm />
                  </ErrorBoundary>
                } />
                <Route path="/edit/:id" element={
                  <ErrorBoundary>
                    <EditBook />
                  </ErrorBoundary>
                } />
              </Routes>
            </Container>
          </Box>
        </ErrorBoundary>
      </Router>
    </ThemeProvider>
  );
}

export default App;
