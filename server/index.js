const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const { pool, createBooksTable } = require('./db');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Create books table on server start
createBooksTable();

// Get all books
app.get('/api/books', async (req, res) => {
    try {
        console.log('Fetching all books...');
        const result = await pool.query('SELECT * FROM books ORDER BY created_at DESC');
        // Format the price as a number before sending
        const formattedBooks = result.rows.map(book => ({
            ...book,
            price: parseFloat(book.price)
        }));
        console.log('Books fetched:', formattedBooks);
        res.json(formattedBooks);
    } catch (err) {
        console.error('Error fetching books:', {
            message: err.message,
            stack: err.stack,
            code: err.code
        });
        res.status(500).json({ 
            error: err.message,
            code: err.code,
            detail: err.detail
        });
    }
});

// Get a specific book
app.get('/api/books/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM books WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Book not found" });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new book
app.post('/api/books', async (req, res) => {
    try {
        const { title, author, price } = req.body;
        
        if (!title || !author || typeof price !== 'number' || price <= 0) {
            return res.status(400).json({ error: "All fields are required and price must be a positive number" });
        }

        const result = await pool.query(
            'INSERT INTO books (title, author, price) VALUES ($1, $2, $3) RETURNING *',
            [title, author, price]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a book
app.put('/api/books/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, price } = req.body;
        
        if (!title || !author || typeof price !== 'number' || price <= 0) {
            return res.status(400).json({ error: "All fields are required and price must be a positive number" });
        }

        const result = await pool.query(
            'UPDATE books SET title = $1, author = $2, price = $3 WHERE id = $4 RETURNING *',
            [title, author, price, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Book not found" });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a book
app.delete('/api/books/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM books WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Book not found" });
        }
        
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
