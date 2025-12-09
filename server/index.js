const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const { pool, createBooksTable } = require('./db');
const authRoutes = require('./routes/auth');
const marketplaceRoutes = require('./routes/marketplace');
const profileRoutes = require('./routes/profiles');
const messageRoutes = require('./routes/messages');
const negotiationRoutes = require('./routes/negotiations');
const bookClubRoutes = require('./routes/bookClubs');
const forumRoutes = require('./routes/forums');
const activityRoutes = require('./routes/activity');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Create books table on server start
createBooksTable();

// Register all routes
app.use('/api/auth', authRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/negotiations', negotiationRoutes);
app.use('/api/book-clubs', bookClubRoutes);
app.use('/api/forums', forumRoutes);
app.use('/api/activity', activityRoutes);

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
        const { title, author, price, isbn, genre, publicationYear, publisher, pages, description } = req.body;
        
        // Convert price to number
        const numPrice = parseFloat(price);
        
        if (!title || !author || !price || isNaN(numPrice) || numPrice <= 0) {
            return res.status(400).json({ error: "Title, author, and valid price are required" });
        }

        // Extract user_id from JWT token if present
        let userId = null;
        const authHeader = req.headers['authorization'];
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            try {
                const jwt = require('jsonwebtoken');
                const { JWT_SECRET } = require('./middleware/auth');
                const decoded = jwt.verify(token, JWT_SECRET);
                userId = decoded.id;
            } catch (err) {
                // Token invalid or expired, continue without user_id
            }
        }

        const result = await pool.query(
            `INSERT INTO books (title, author, price, isbn, genre, publication_year, publisher, pages, description, user_id) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [title, author, numPrice, isbn || null, genre || null, publicationYear || null, 
             publisher || null, pages || null, description || null, userId]
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
        const { title, author, price, isbn, genre, publicationYear, publisher, pages, description } = req.body;
        
        // Convert price to number
        const numPrice = parseFloat(price);
        
        if (!title || !author || !price || isNaN(numPrice) || numPrice <= 0) {
            return res.status(400).json({ error: "Title, author, and valid price are required" });
        }

        const result = await pool.query(
            `UPDATE books SET title = $1, author = $2, price = $3, isbn = $4, genre = $5, 
             publication_year = $6, publisher = $7, pages = $8, description = $9 
             WHERE id = $10 RETURNING *`,
            [title, author, numPrice, isbn || null, genre || null, publicationYear || null, 
             publisher || null, pages || null, description || null, id]
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
