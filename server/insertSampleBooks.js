const { pool } = require('./db');

async function insertSampleBooks() {
    try {
        // Insert sample books
        await pool.query(`
            INSERT INTO books (title, author, price, isbn, genre, publication_year, publisher, pages, description)
            VALUES 
            ('The Great Gatsby', 'F. Scott Fitzgerald', 12.99, '978-0743273565', 'Classic Fiction', 1925, 'Scribner', 180, 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan, of lavish parties on Long Island.'),
            ('To Kill a Mockingbird', 'Harper Lee', 14.99, '978-0061120084', 'Classic Fiction', 1960, 'Harper Perennial', 324, 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.'),
            ('1984', 'George Orwell', 13.99, '978-0451524935', 'Science Fiction', 1949, 'Signet Classic', 328, 'A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism.');
        `);
        console.log('✅ Sample books inserted successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error inserting sample books:', error);
        process.exit(1);
    }
}

insertSampleBooks();
