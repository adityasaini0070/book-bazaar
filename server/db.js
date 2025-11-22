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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Books table created successfully');
    } catch (err) {
        console.error('Error creating books table:', err);
        // Log more detailed error information
        if (err.code === '3D000') {
            console.error('Database does not exist. Please create the database first.');
        }
    }
};

module.exports = { pool, createBooksTable };
