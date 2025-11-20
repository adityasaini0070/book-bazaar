const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
const books = [];
let nextId = 1;

// API routes
app.post('/api/books', (req, res) => {
    const { title, author, price } = req.body;
    if (!title || !author || typeof price !== 'number' || price <= 0) {
        return res.status(400).json({ error: "All fields are required and price must be a positive number" });
    }
    const newBook = { id: nextId++, title, author, price };
    books.push(newBook);
    res.status(201).json(newBook);
});

app.get('/api/books', (req, res) => {
    res.status(200).json(books);
});

app.get('/api/books/:id', (req, res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    if (!book) {
        return res.status(404).json({ error: "Book not found" });
    }
    res.status(200).json(book);
});

app.put('/api/books/:id', (req, res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    if (!book) {
        return res.status(404).json({ error: "Book not found" });
    }
    const { title, author, price } = req.body;
    if (!title || !author || typeof price !== 'number' || price <= 0) {
        return res.status(400).json({ error: "All fields are required and price must be a positive number" });
    }
    book.title = title;
    book.author = author;
    book.price = price;
    res.status(200).json(book);
});

app.delete('/api/books/:id', (req, res) => {
    const index = books.findIndex(b => b.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).json({ error: "Book not found" });
    }
    books.splice(index, 1);
    res.status(204).send();
});

module.exports = app;
