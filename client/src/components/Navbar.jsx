import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
          Book Bazaar
        </Typography>
        <Button color="inherit" component={Link} to="/add">
          Add Book
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
