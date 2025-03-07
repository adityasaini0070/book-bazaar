const express = require('express');
const app = express();
const port = 3001;
app.use(express.json()); // Middleware to parse JSON request bodies
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
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