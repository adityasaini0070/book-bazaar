import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, CssBaseline, ThemeProvider, createTheme, Box } from '@mui/material';
import { useState, useMemo, useEffect } from 'react';
import BookList from './components/BookList';
import BookForm from './components/BookForm';
import EditBook from './components/EditBook';
import Login from './components/Login';
import Register from './components/Register';
import Marketplace from './components/Marketplace';
import MyListings from './components/MyListings';
import UserProfile from './components/UserProfile';
import Messages from './components/Messages';
import BookClubs from './components/BookClubs';
import Forums from './components/Forums';
import ActivityFeed from './components/ActivityFeed';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return null; // Or a loading spinner
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}

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
        <AuthProvider>
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
                    <ProtectedRoute>
                      <BookList />
                    </ProtectedRoute>
                  </ErrorBoundary>
                } />
                <Route path="/login" element={
                  <ErrorBoundary>
                    <Login />
                  </ErrorBoundary>
                } />
                <Route path="/register" element={
                  <ErrorBoundary>
                    <Register />
                  </ErrorBoundary>
                } />
                <Route path="/forgot-password" element={
                  <ErrorBoundary>
                    <ForgotPassword />
                  </ErrorBoundary>
                } />
                <Route path="/reset-password/:token" element={
                  <ErrorBoundary>
                    <ResetPassword />
                  </ErrorBoundary>
                } />
                <Route path="/marketplace" element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <Marketplace />
                    </ProtectedRoute>
                  </ErrorBoundary>
                } />
                <Route path="/my-listings" element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <MyListings />
                    </ProtectedRoute>
                  </ErrorBoundary>
                } />
                <Route path="/profile/:username" element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
                  </ErrorBoundary>
                } />
                <Route path="/messages" element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  </ErrorBoundary>
                } />
                <Route path="/messages/:userId" element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  </ErrorBoundary>
                } />
                <Route path="/book-clubs" element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <BookClubs />
                    </ProtectedRoute>
                  </ErrorBoundary>
                } />
                <Route path="/book-clubs/:clubId" element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <BookClubs />
                    </ProtectedRoute>
                  </ErrorBoundary>
                } />
                <Route path="/forums" element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <Forums />
                    </ProtectedRoute>
                  </ErrorBoundary>
                } />
                <Route path="/forums/:forumId" element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <Forums />
                    </ProtectedRoute>
                  </ErrorBoundary>
                } />
                <Route path="/activity" element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <ActivityFeed />
                    </ProtectedRoute>
                  </ErrorBoundary>
                } />
                <Route path="/add" element={
                  <ErrorBoundary>
                    <ProtectedRoute>
                      <BookForm />
                    </ProtectedRoute>
                  </ErrorBoundary>
              } />
              <Route path="/edit/:id" element={
                <ErrorBoundary>
                  <ProtectedRoute>
                    <EditBook />
                  </ProtectedRoute>
                </ErrorBoundary>
              } />
            </Routes>
          </Box>
        </ErrorBoundary>
      </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
