const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Validate environment variables
if (!process.env.DB_PASSWORD) {
    console.error('Error: DB_PASSWORD is not set in .env file');
    process.exit(1);
}

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: String(process.env.DB_PASSWORD), // Ensure it's a string
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'book_bazaar',
});

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
        return;
    }
    console.log('Successfully connected to PostgreSQL database');
    release();
});

const createBooksTable = async () => {
    try {
        // Create users table first
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(255),
                phone VARCHAR(20),
                address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Users table created successfully');

        // Create books table with user_id
        await pool.query(`
            CREATE TABLE IF NOT EXISTS books (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                author VARCHAR(255) NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                isbn VARCHAR(20),
                genre VARCHAR(100),
                publication_year INTEGER,
                publisher VARCHAR(255),
                pages INTEGER,
                description TEXT,
                cover_url TEXT,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Books table created successfully');

        // Create marketplace listings table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS marketplace_listings (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
                listing_type VARCHAR(20) NOT NULL CHECK (listing_type IN ('sell', 'exchange')),
                price DECIMAL(10,2),
                condition VARCHAR(50) NOT NULL CHECK (condition IN ('new', 'like-new', 'good', 'fair', 'poor')),
                description TEXT,
                status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'exchanged', 'cancelled')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Marketplace listings table created successfully');

        // Create exchange requests table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS exchange_requests (
                id SERIAL PRIMARY KEY,
                listing_id INTEGER REFERENCES marketplace_listings(id) ON DELETE CASCADE,
                requester_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                offered_book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
                message TEXT,
                status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Exchange requests table created successfully');

        // Create transactions table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS transactions (
                id SERIAL PRIMARY KEY,
                listing_id INTEGER REFERENCES marketplace_listings(id) ON DELETE CASCADE,
                buyer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                amount DECIMAL(10,2) NOT NULL,
                status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP
            );
        `);
        console.log('Transactions table created successfully');
        
        // Insert sample books if table is empty
        const result = await pool.query('SELECT COUNT(*) FROM books');
        if (parseInt(result.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO books (title, author, price, isbn, genre, publication_year, publisher, pages, description)
                VALUES 
                ('The Great Gatsby', 'F. Scott Fitzgerald', 12.99, '978-0743273565', 'Classic Fiction', 1925, 'Scribner', 180, 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan, of lavish parties on Long Island.'),
                ('To Kill a Mockingbird', 'Harper Lee', 14.99, '978-0061120084', 'Classic Fiction', 1960, 'Harper Perennial', 324, 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.'),
                ('1984', 'George Orwell', 13.99, '978-0451524935', 'Science Fiction', 1949, 'Signet Classic', 328, 'A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism.');
            `);
            console.log('Sample books inserted successfully');
        }
    } catch (err) {
        console.error('Error creating books table:', err);
        // Log more detailed error information
        if (err.code === '3D000') {
            console.error('Database does not exist. Please create the database first.');
        }
    }
};

module.exports = { pool, createBooksTable };
