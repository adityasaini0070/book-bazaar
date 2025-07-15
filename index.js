const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`, 'https://book-bazaar-69chusp8h-adityasaini0070s-projects.vercel.app'] : 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(express.json());

// API routes
const books = [];
let nextId = 1; // Counter for generating unique book IDs
app.post('/books', (req, res) => {
    const { title, author, price } = req.body;
    if (!title || !author || typeof price !== 'number' || price <= 0) {
        return res.status(400).json({ error: "All fields are required and price must be a positive number" });
    }
    const newBook = { id: nextId++, title, author, price };
    books.push(newBook);
    res.status(201).json(newBook);
});
app.get('/books', (req, res) => {
    res.status(200).json(books);
});
app.get('/books/:id', (req, res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    if (!book) {
        return res.status(404).json({ error: "Book not found" });
    }
    res.status(200).json(book);
});
app.put('/books/:id', (req, res) => {
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
app.delete('/books/:id', (req, res) => {
    const index = books.findIndex(b => b.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).json({ error: "Book not found" });
    }
    books.splice(index, 1);
    res.status(204).send(); // No content response
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});