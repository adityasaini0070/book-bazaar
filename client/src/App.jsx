import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, CssBaseline, ThemeProvider, createTheme, Box } from '@mui/material';
import { useState, useMemo, useEffect } from 'react';
import BookList from './components/BookList';
import BookForm from './components/BookForm';
import EditBook from './components/EditBook';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';

// Theme configuration function
const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1e40af',
    },
    secondary: {
      main: '#db2777',
      light: '#f472b6',
      dark: '#be185d',
    },
    background: {
      default: mode === 'light' ? '#f8fafc' : '#0f172a',
      paper: mode === 'light' ? '#ffffff' : '#1e293b',
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
  // Get theme preference from localStorage or default to light
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'light';
  });

  // Create theme based on current mode
  const theme = useMemo(() => getTheme(mode), [mode]);

  // Save theme preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  // Toggle theme function
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <ErrorBoundary>
          <Navbar mode={mode} onToggleTheme={toggleTheme} />
          <Box 
            sx={{ 
              minHeight: 'calc(100vh - 64px)', // Full height minus navbar
              width: '100%',
              backgroundColor: 'background.default'
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
          </Box>
        </ErrorBoundary>
      </Router>
    </ThemeProvider>
  );
}

export default App;
