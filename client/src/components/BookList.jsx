import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  CardActions, 
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { getAllBooks, deleteBook } from '../api';

function BookList() {
  const [books, setBooks] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);

  const fetchBooks = async () => {
    try {
      const response = await getAllBooks();
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDeleteClick = (book) => {
    setBookToDelete(book);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteBook(bookToDelete.id);
      await fetchBooks();
      setDeleteDialogOpen(false);
      setBookToDelete(null);
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  return (
    <>
      <Grid container spacing={3}>
        {books.map((book) => (
          <Grid item xs={12} sm={6} md={4} key={book.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div">
                  {book.title}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  by {book.author}
                </Typography>
                <Typography variant="h6" color="primary">
                  ${book.price}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton 
                  component={Link} 
                  to={`/edit/${book.id}`}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  color="error"
                  onClick={() => handleDeleteClick(book)}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "{bookToDelete?.title}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default BookList;
