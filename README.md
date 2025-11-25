# Book Bazaar 📚

A modern full-stack web application for managing your personal book collection with AI-powered features. Built with React, Node.js, Express, and PostgreSQL.

## ✨ Features

### Core Functionality
- 📖 View and manage your complete book collection
- ➕ Add new books with comprehensive details (9 fields including genre, publisher, pages, description)
- ✏️ Edit existing book information
- 🗑️ Remove books from your collection
- 🔍 Advanced search and filter by title, author, or genre
- 📊 Real-time collection statistics dashboard
- 🌓 Dark/Light theme toggle

### AI-Powered Features
- 🤖 **AI Book Recommendations** - Get personalized book suggestions based on your collection using Google Books API
- 📄 **AI Summary Generator** - Generate comprehensive summaries for any book with key points, highlights, and reading insights
- 🎯 **Smart Book Search** - Quick book lookup by title or author with auto-fill from Google Books database

### Enhanced User Experience
- 📱 Fully responsive design for all devices
- 🎨 Beautiful Material-UI components with custom styling
- ⚡ Fast and intuitive interface
- 💾 Persistent data storage with PostgreSQL
- 🔄 Real-time updates and synchronization

## 🛠️ Tech Stack

### Frontend
- **React 19.1.0** - Modern UI library
- **Material-UI 7.2.0** - Comprehensive component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Vite 7.0.4** - Lightning-fast build tool

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **PostgreSQL** - Robust relational database
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### External APIs
- **Google Books API** - Book metadata and recommendations

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
```bash
# Create PostgreSQL database
createdb book_bazaar

# Or using psql
psql -U postgres
CREATE DATABASE book_bazaar;
```

4. Configure environment variables:
```bash
# Create .env file in server directory
cd server
echo "DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=book_bazaar
PORT=3001" > .env
```

5. Start the application:

```bash
# Start backend (from server directory)
npm run dev

# Start frontend (from client directory)
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/books` | Retrieve all books |
| GET | `/api/books/:id` | Get a specific book by ID |
| POST | `/api/books` | Add a new book to collection |
| PUT | `/api/books/:id` | Update book details |
| DELETE | `/api/books/:id` | Remove a book from collection |

### Book Schema
```javascript
{
  id: INTEGER,
  title: STRING (required),
  author: STRING (required),
  price: DECIMAL (required),
  isbn: STRING,
  genre: STRING,
  publication_year: STRING,
  publisher: STRING,
  pages: INTEGER,
  description: TEXT,
  created_at: TIMESTAMP
}
```

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

## 🎯 Key Highlights

- **Full-width responsive layout** optimized for all screen sizes
- **Smart search integration** with Google Books API for easy book entry
- **Real-time statistics** showing collection value, total pages, genre distribution
- **AI-powered recommendations** personalized to your reading preferences
- **Book summary generator** with AI-generated insights
- **Modern UI/UX** with smooth animations and transitions
- **Theme customization** with dark/light mode support

## 🚀 Future Enhancements

- [ ] User authentication and authorization
- [ ] Multiple user collections
- [ ] Book lending/borrowing tracking
- [ ] Reading progress tracker
- [ ] Book reviews and ratings
- [ ] Export collection to CSV/PDF
- [ ] Social features (share books, recommendations)
- [ ] Mobile app version

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

ISC

## 👨‍💻 Author

**Aditya Saini**
- GitHub: [@adityasaini0070](https://github.com/adityasaini0070)

---

⭐ Star this repo if you find it helpful!
