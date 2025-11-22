const { pool } = require('./db');

const addNewColumns = async () => {
    try {
        // Add new columns if they don't exist
        await pool.query(`
            ALTER TABLE books 
            ADD COLUMN IF NOT EXISTS isbn VARCHAR(20),
            ADD COLUMN IF NOT EXISTS genre VARCHAR(100),
            ADD COLUMN IF NOT EXISTS publication_year INTEGER,
            ADD COLUMN IF NOT EXISTS publisher VARCHAR(255),
            ADD COLUMN IF NOT EXISTS pages INTEGER,
            ADD COLUMN IF NOT EXISTS description TEXT;
        `);
        console.log('✅ Database migration completed successfully!');
        console.log('Added columns: isbn, genre, publication_year, publisher, pages, description');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error migrating database:', err.message);
        process.exit(1);
    }
};

addNewColumns();
