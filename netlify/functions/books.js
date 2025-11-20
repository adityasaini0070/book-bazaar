// Shared storage (will reset on cold starts)
let books = [
  { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", price: 12.99 },
  { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", price: 14.99 }
];
let nextId = 3;

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const path = event.path.replace('/.netlify/functions/books', '');
  const method = event.httpMethod;

  try {
    // GET /books - Get all books
    if (method === 'GET' && !path) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(books)
      };
    }

    // POST /books - Create book
    if (method === 'POST' && !path) {
      const { title, author, price } = JSON.parse(event.body);
      const numPrice = parseFloat(price);
      
      if (!title || !author || isNaN(numPrice) || numPrice <= 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "All fields are required and price must be a positive number" })
        };
      }
      
      const newBook = { id: nextId++, title, author, price: numPrice };
      books.push(newBook);
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(newBook)
      };
    }

    // GET /books/:id - Get single book
    if (method === 'GET' && path) {
      const bookId = parseInt(path.substring(1));
      const book = books.find(b => b.id === bookId);
      
      if (!book) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: "Book not found" })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(book)
      };
    }

    // PUT /books/:id - Update book
    if (method === 'PUT' && path) {
      const bookId = parseInt(path.substring(1));
      const book = books.find(b => b.id === bookId);
      
      if (!book) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: "Book not found" })
        };
      }
      
      const { title, author, price } = JSON.parse(event.body);
      const numPrice = parseFloat(price);
      
      if (!title || !author || isNaN(numPrice) || numPrice <= 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "All fields are required and price must be a positive number" })
        };
      }
      
      book.title = title;
      book.author = author;
      book.price = numPrice;
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(book)
      };
    }

    // DELETE /books/:id - Delete book
    if (method === 'DELETE' && path) {
      const bookId = parseInt(path.substring(1));
      const index = books.findIndex(b => b.id === bookId);
      
      if (index === -1) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: "Book not found" })
        };
      }
      
      books.splice(index, 1);
      
      return {
        statusCode: 204,
        headers,
        body: ''
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: "Not found" })
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal server error", message: error.message })
    };
  }
};
