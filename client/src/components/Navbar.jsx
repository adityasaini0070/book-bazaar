import { AppBar, Toolbar, Typography, Button, Box, IconButton, Tooltip, Menu, MenuItem, Badge } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  LibraryBooks as LibraryBooksIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Store as StoreIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Inventory as InventoryIcon,
  Message as MessageIcon,
  Groups as GroupsIcon,
  Forum as ForumIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getUnreadCount } from '../api';

function Navbar({ mode, onToggleTheme }) {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchUnreadCount = async () => {
        try {
          const response = await getUnreadCount();
          setUnreadCount(response.data.count);
        } catch (error) {
          console.error('Failed to fetch unread count:', error);
        }
      };
      fetchUnreadCount();
      // Refresh every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

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

          {/* Navigation Buttons */}
          <Button 
            startIcon={<StoreIcon />}
            component={Link} 
            to="/marketplace"
            sx={{ mr: 1 }}
          >
            Marketplace
          </Button>

          {isAuthenticated && (
            <>
              <Button 
                startIcon={<InventoryIcon />}
                component={Link} 
                to="/my-listings"
                sx={{ mr: 1 }}
              >
                My Listings
              </Button>

              <IconButton 
                component={Link} 
                to="/messages"
                color="primary"
                sx={{ mr: 1 }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <MessageIcon />
                </Badge>
              </IconButton>

              <Button 
                startIcon={<GroupsIcon />}
                component={Link} 
                to="/book-clubs"
                sx={{ mr: 1 }}
              >
                Clubs
              </Button>

              <Button 
                startIcon={<ForumIcon />}
                component={Link} 
                to="/forums"
                sx={{ mr: 1 }}
              >
                Forums
              </Button>

              <IconButton 
                component={Link} 
                to="/activity"
                color="primary"
                sx={{ mr: 1 }}
              >
                <NotificationsIcon />
              </IconButton>
            </>
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
                <MenuItem 
                  component={Link} 
                  to={`/profile/${user?.username}`}
                  onClick={handleMenuClose}
                >
                  <PersonIcon sx={{ mr: 1 }} fontSize="small" />
                  My Profile
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
