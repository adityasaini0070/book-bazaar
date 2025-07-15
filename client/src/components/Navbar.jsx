import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import { LibraryBooks as LibraryBooksIcon } from '@mui/icons-material';

function Navbar() {
  return (
    <AppBar position="static" elevation={0} sx={{ 
      backgroundColor: 'background.paper', 
      borderBottom: '1px solid',
      borderColor: 'divider',
    }}>
      <Container maxWidth="lg">
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
          <Button 
            variant="contained" 
            component={Link} 
            to="/add"
            sx={{ 
              px: 3,
              py: 1,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
              }
            }}
          >
            Add Book
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
