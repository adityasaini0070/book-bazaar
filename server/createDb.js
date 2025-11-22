const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const createDatabase = async () => {
    // Connect to postgres database (default) to create our database
    const client = new Client({
        user: process.env.DB_USER || 'postgres',
        password: String(process.env.DB_PASSWORD),
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        database: 'postgres', // Connect to default postgres database
    });

    try {
        await client.connect();
        console.log('Connected to PostgreSQL server');

        // Check if database exists
        const result = await client.query(
            "SELECT 1 FROM pg_database WHERE datname = $1",
            [process.env.DB_NAME || 'book_bazaar']
        );

        if (result.rows.length === 0) {
            // Database doesn't exist, create it
            await client.query(`CREATE DATABASE ${process.env.DB_NAME || 'book_bazaar'}`);
            console.log(`Database '${process.env.DB_NAME || 'book_bazaar'}' created successfully!`);
        } else {
            console.log(`Database '${process.env.DB_NAME || 'book_bazaar'}' already exists`);
        }
    } catch (err) {
        console.error('Error creating database:', err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
};

createDatabase();
