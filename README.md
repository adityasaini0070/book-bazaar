# Book Bazaar 📚

A comprehensive full-stack social book marketplace and collection management platform. Built with React, Node.js, Express, and PostgreSQL.

## ✨ Features

### Book Collection Management
- 📖 View and manage your complete book collection
- ➕ Add new books with comprehensive details (9 fields including genre, publisher, pages, description)
- ✏️ Edit existing book information
- 🗑️ Remove books from your collection
- 🔍 Advanced search and filter by title, author, or genre
- 📊 Real-time collection statistics dashboard
- 🌓 Dark/Light theme toggle

### Marketplace & Trading
- 🛒 **Book Marketplace** - Buy, sell, or exchange books with other users
- 💰 **Listing Management** - Create listings for selling or exchanging books
- 🔄 **Exchange System** - Request book exchanges with other collectors
- 💬 **Price Negotiation** - Make offers and counter-offers on listed books
- 📋 **My Listings** - Manage all your active marketplace listings

### Social Features
- 👤 **User Profiles** - Customizable profiles with bio, location, favorite genres, and reading goals
- 👥 **Follow System** - Follow users and see their activity
- 💌 **Messaging** - Send and receive messages with other users
- 📢 **Activity Feed** - Stay updated with activities from users you follow
- ⭐ **User Stats** - View follower counts, book counts, and listing counts

### Community Features
- 📚 **Book Clubs** - Create and join reading groups with current book tracking
- 💬 **Discussion Forums** - Create forum threads, reply to discussions, and like posts
- 🎯 **Club Management** - Admin and moderator roles for book clubs
- 🔍 **Forum Discovery** - Browse forums by book or club

### Authentication & Security
- 🔐 **User Authentication** - Secure JWT-based authentication
- 🔑 **Password Reset** - Email-based password recovery with crypto tokens
- 🛡️ **Protected Routes** - Secure access to authenticated features
- 👤 **User Sessions** - Persistent login sessions

### AI-Powered Features
- 🤖 **AI Book Recommendations** - Get personalized book suggestions based on your collection using Google Books API
- 🎯 **Smart Book Search** - Quick book lookup by title or author with auto-fill from Google Books database

### Enhanced User Experience
- 📱 Fully responsive design for all devices
- 🎨 Beautiful Material-UI components with custom styling
- ⚡ Fast and intuitive interface
- 💾 Persistent data storage with PostgreSQL
- 🔄 Real-time updates and synchronization
- 🔔 Unread message notifications

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

### Books & Collection
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/books` | Retrieve all books |
| GET | `/api/books/:id` | Get a specific book by ID |
| POST | `/api/books` | Add a new book to collection |
| PUT | `/api/books/:id` | Update book details |
| DELETE | `/api/books/:id` | Remove a book from collection |

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |

### Marketplace
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/marketplace` | Get all marketplace listings |
| POST | `/api/marketplace` | Create new listing |
| PUT | `/api/marketplace/:id` | Update listing |
| DELETE | `/api/marketplace/:id` | Delete listing |
| GET | `/api/marketplace/my-listings` | Get user's listings |
| POST | `/api/marketplace/:id/exchange` | Request book exchange |

### User Profiles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profiles/:username` | Get user profile |
| PUT | `/api/profiles/me` | Update own profile |
| POST | `/api/profiles/follow/:userId` | Follow user |
| DELETE | `/api/profiles/follow/:userId` | Unfollow user |
| GET | `/api/profiles/:userId/followers` | Get user's followers |
| GET | `/api/profiles/:userId/following` | Get users being followed |

### Messaging
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/conversations` | Get all conversations |
| GET | `/api/messages/conversation/:userId` | Get conversation with user |
| POST | `/api/messages/send` | Send message |
| GET | `/api/messages/unread-count` | Get unread message count |
| PUT | `/api/messages/:messageId/read` | Mark message as read |

### Negotiations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/negotiations` | Create price offer |
| GET | `/api/negotiations/my-offers` | Get buyer's offers |
| GET | `/api/negotiations/received` | Get seller's received offers |
| PUT | `/api/negotiations/:id/counter` | Counter-offer |
| PUT | `/api/negotiations/:id/accept` | Accept offer |
| PUT | `/api/negotiations/:id/reject` | Reject offer |

### Book Clubs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/book-clubs` | Get all public clubs |
| GET | `/api/book-clubs/:id` | Get club details |
| POST | `/api/book-clubs` | Create new club |
| POST | `/api/book-clubs/:id/join` | Join club |
| DELETE | `/api/book-clubs/:id/leave` | Leave club |
| POST | `/api/book-clubs/:id/current-book` | Set current reading book |
| GET | `/api/book-clubs/my/clubs` | Get user's clubs |

### Forums
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/forums` | Get all forums |
| GET | `/api/forums/:id` | Get forum with replies |
| POST | `/api/forums` | Create forum discussion |
| POST | `/api/forums/:id/reply` | Reply to forum |
| POST | `/api/forums/reply/:replyId/like` | Like a reply |
| DELETE | `/api/forums/:id` | Delete forum |

### Activity Feed
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/activity` | Get activity feed from followed users |
| GET | `/api/activity/user/:userId` | Get specific user's activity |
| POST | `/api/activity` | Create activity entry |

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
- **Modern UI/UX** with smooth animations and transitions
- **Theme customization** with dark/light mode support
- **Complete marketplace system** for buying, selling, and exchanging books
- **Social networking features** with profiles, following, and activity feeds
- **Community building** through book clubs and discussion forums
- **Real-time messaging** with unread notifications
- **Price negotiation system** for marketplace transactions
- **Secure authentication** with JWT and password reset functionality

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:

- **users** - User accounts and authentication
- **books** - Book collection entries
- **user_profiles** - Extended user information (bio, location, genres, reading goals)
- **marketplace_listings** - Buy/sell/exchange listings
- **exchange_requests** - Book exchange requests
- **messages** - User messaging system
- **conversations** - Message threads
- **negotiations** - Price negotiation offers
- **book_clubs** - Reading group information
- **book_club_members** - Club membership with roles
- **forums** - Discussion threads
- **forum_replies** - Forum responses with likes
- **user_follows** - Follow relationships
- **activity_feed** - Social activity tracking
- **password_reset_tokens** - Secure password reset

## 🚀 Future Enhancements

- [ ] Reading progress tracker
- [ ] Book reviews and ratings system
- [ ] Export collection to CSV/PDF
- [ ] Email notifications for messages and activities
- [ ] Book recommendations based on club discussions
- [ ] Advanced search filters (price range, condition, location)
- [ ] Mobile app version (React Native)
- [ ] Book condition ratings
- [ ] Wishlist feature
- [ ] Reading challenges and badges
- [ ] Integration with more book APIs (OpenLibrary, Goodreads)

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
