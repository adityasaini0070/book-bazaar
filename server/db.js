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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Books table created successfully');
        
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
