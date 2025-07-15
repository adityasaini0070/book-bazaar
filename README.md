# Book Bazaar

A full-stack web application for managing a book inventory system. Built with React, Node.js, Express, and PostgreSQL.

## Features

- View all books in the inventory
- Add new books with title, author, and price
- Edit existing book details
- Delete books
- Responsive UI with Material-UI
- PostgreSQL database for persistent storage

## Tech Stack

- **Frontend:**
  - React
  - Material-UI
  - React Router
  - Axios
  - Vite

- **Backend:**
  - Node.js
  - Express
  - PostgreSQL
  - CORS
  - dotenv

## Setup

### Prerequisites

- Node.js
- PostgreSQL
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/adityasaini0070/book-bazaar.git
cd book-bazaar
```

2. Install dependencies:
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

3. Set up the database:
- Create a PostgreSQL database named 'book_bazaar'
- Copy `.env.example` to `.env` in the server directory and update with your database credentials

4. Start the application:

```bash
# Start backend (from server directory)
npm run dev

# Start frontend (from client directory)
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## API Endpoints

- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get a specific book
- `POST /api/books` - Create a new book
- `PUT /api/books/:id` - Update a book
- `DELETE /api/books/:id` - Delete a book

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=book_bazaar
PORT=3001
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

## License

ISC
