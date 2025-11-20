// In-memory storage (will reset on each cold start in serverless)
const books = [];
let nextId = 1;

module.exports = (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;
    const method = req.method;

    // Parse book ID from path if present
    const bookIdMatch = path.match(/\/api\/books\/(\d+)/);
    const bookId = bookIdMatch ? parseInt(bookIdMatch[1]) : null;

    // GET /api/books - Get all books
    if (method === 'GET' && path === '/api/books') {
        return res.status(200).json(books);
    }

    // GET /api/books/:id - Get single book
    if (method === 'GET' && bookId) {
        const book = books.find(b => b.id === bookId);
        if (!book) {
            return res.status(404).json({ error: "Book not found" });
        }
        return res.status(200).json(book);
    }

    // POST /api/books - Create book
    if (method === 'POST' && path === '/api/books') {
        const { title, author, price } = req.body;
        if (!title || !author || typeof price !== 'number' || price <= 0) {
            return res.status(400).json({ error: "All fields are required and price must be a positive number" });
        }
        const newBook = { id: nextId++, title, author, price };
        books.push(newBook);
        return res.status(201).json(newBook);
    }

    // PUT /api/books/:id - Update book
    if (method === 'PUT' && bookId) {
        const book = books.find(b => b.id === bookId);
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
        return res.status(200).json(book);
    }

    // DELETE /api/books/:id - Delete book
    if (method === 'DELETE' && bookId) {
        const index = books.findIndex(b => b.id === bookId);
        if (index === -1) {
            return res.status(404).json({ error: "Book not found" });
        }
        books.splice(index, 1);
        return res.status(204).end();
    }

    // Route not found
    return res.status(404).json({ error: "Not found" });
};
