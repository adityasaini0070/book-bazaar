import { AppBar, Toolbar, Typography, Button, Box, IconButton, Tooltip, Menu, MenuItem } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  LibraryBooks as LibraryBooksIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Store as StoreIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

function Navbar({ mode, onToggleTheme }) {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  return (
    <AppBar position="static" elevation={0} sx={{ 
      backgroundColor: 'background.paper', 
      borderBottom: '1px solid',
      borderColor: 'divider',
    }}>
      <Box sx={{ px: 3 }}>
        <Toolbar sx={{ py: 1 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            textDecoration: 'none', 
            color: 'primary.main' 
          }} 
          component={Link} 
          to="/"
          >
            <LibraryBooksIcon sx={{ mr: 1, fontSize: 32 }} />
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(45deg, #2563eb 30%, #60a5fa 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Book Bazaar
            </Typography>
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />

          {/* Marketplace Button */}
          <Button 
            startIcon={<StoreIcon />}
            component={Link} 
            to="/marketplace"
            sx={{ mr: 2 }}
          >
            Marketplace
          </Button>

          {isAuthenticated && (
            <Button 
              startIcon={<InventoryIcon />}
              component={Link} 
              to="/my-listings"
              sx={{ mr: 2 }}
            >
              My Listings
            </Button>
          )}
          
          {/* Theme Toggle Button */}
          <Tooltip title={mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
            <IconButton 
              onClick={onToggleTheme} 
              color="primary"
              sx={{ mr: 2 }}
            >
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>

          {isAuthenticated ? (
            <>
              <Button 
                variant="contained" 
                component={Link} 
                to="/add"
                sx={{ mr: 2 }}
              >
                Add Book
              </Button>
              
              <IconButton onClick={handleMenuOpen} color="primary">
                <PersonIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem disabled>
                  <Typography variant="body2" color="text.secondary">
                    {user?.username || user?.email}
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button 
                component={Link} 
                to="/login"
                sx={{ mr: 1 }}
              >
                Sign In
              </Button>
              <Button 
                variant="contained" 
                component={Link} 
                to="/register"
              >
                Sign Up
              </Button>
            </>
          )}
        </Toolbar>
      </Box>
    </AppBar>
  );
}

export default Navbar;
