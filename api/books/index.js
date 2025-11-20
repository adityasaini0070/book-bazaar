// Shared in-memory storage (Note: Will reset on cold starts in serverless)
let books = [];
let nextId = 1;

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { method, query, body } = req;
    const { id } = query;

    try {
        // GET /api/books - Get all books
        if (method === 'GET' && !id) {
            return res.status(200).json(books);
        }

        // GET /api/books/[id] - Get single book
        if (method === 'GET' && id) {
            const bookId = parseInt(id);
            const book = books.find(b => b.id === bookId);
            if (!book) {
                return res.status(404).json({ error: "Book not found" });
            }
            return res.status(200).json(book);
        }

        // POST /api/books - Create book
        if (method === 'POST' && !id) {
            const { title, author, price } = body;
            const numPrice = parseFloat(price);
            
            if (!title || !author || isNaN(numPrice) || numPrice <= 0) {
                return res.status(400).json({ error: "All fields are required and price must be a positive number" });
            }
            
            const newBook = { id: nextId++, title, author, price: numPrice };
            books.push(newBook);
            return res.status(201).json(newBook);
        }

        // PUT /api/books/[id] - Update book
        if (method === 'PUT' && id) {
            const bookId = parseInt(id);
            const book = books.find(b => b.id === bookId);
            if (!book) {
                return res.status(404).json({ error: "Book not found" });
            }
            
            const { title, author, price } = body;
            const numPrice = parseFloat(price);
            
            if (!title || !author || isNaN(numPrice) || numPrice <= 0) {
                return res.status(400).json({ error: "All fields are required and price must be a positive number" });
            }
            
            book.title = title;
            book.author = author;
            book.price = numPrice;
            return res.status(200).json(book);
        }

        // DELETE /api/books/[id] - Delete book
        if (method === 'DELETE' && id) {
            const bookId = parseInt(id);
            const index = books.findIndex(b => b.id === bookId);
            if (index === -1) {
                return res.status(404).json({ error: "Book not found" });
            }
            books.splice(index, 1);
            return res.status(204).end();
        }

        // Method not allowed
        return res.status(405).json({ error: "Method not allowed" });
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: "Internal server error", message: error.message });
    }
};
