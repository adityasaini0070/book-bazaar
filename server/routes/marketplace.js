const express = require('express');
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all active marketplace listings
router.get('/listings', async (req, res) => {
    try {
        const { type, condition, max_price, genre } = req.query;
        
        let query = `
            SELECT ml.*, b.title, b.author, b.genre, b.pages, b.isbn,
                   u.username as seller_name, u.email as seller_email
            FROM marketplace_listings ml
            JOIN books b ON ml.book_id = b.id
            JOIN users u ON ml.user_id = u.id
            WHERE ml.status = 'active'
        `;
        const params = [];
        let paramIndex = 1;

        if (type) {
            query += ` AND ml.listing_type = $${paramIndex}`;
            params.push(type);
            paramIndex++;
        }

        if (condition) {
            query += ` AND ml.condition = $${paramIndex}`;
            params.push(condition);
            paramIndex++;
        }

        if (max_price) {
            query += ` AND ml.price <= $${paramIndex}`;
            params.push(max_price);
            paramIndex++;
        }

        if (genre) {
            query += ` AND b.genre ILIKE $${paramIndex}`;
            params.push(`%${genre}%`);
            paramIndex++;
        }

        query += ' ORDER BY ml.created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ error: 'Server error fetching listings' });
    }
});

// Get user's own listings
router.get('/my-listings', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT ml.*, b.title, b.author, b.genre, b.pages
             FROM marketplace_listings ml
             JOIN books b ON ml.book_id = b.id
             WHERE ml.user_id = $1
             ORDER BY ml.created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching user listings:', error);
        res.status(500).json({ error: 'Server error fetching your listings' });
    }
});

// Create a new listing
router.post('/listings', authenticateToken, async (req, res) => {
    const { book_id, listing_type, price, condition, description } = req.body;

    try {
        // Validate input
        if (!book_id || !listing_type || !condition) {
            return res.status(400).json({ error: 'Book ID, listing type, and condition are required' });
        }

        if (listing_type === 'sell' && !price) {
            return res.status(400).json({ error: 'Price is required for sell listings' });
        }

        // Verify book exists and belongs to user
        const bookCheck = await pool.query(
            'SELECT * FROM books WHERE id = $1 AND user_id = $2',
            [book_id, req.user.id]
        );

        if (bookCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Book not found or does not belong to you' });
        }

        // Create listing
        const result = await pool.query(
            `INSERT INTO marketplace_listings (user_id, book_id, listing_type, price, condition, description)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [req.user.id, book_id, listing_type, price, condition, description]
        );

        res.status(201).json({
            message: 'Listing created successfully',
            listing: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating listing:', error);
        res.status(500).json({ error: 'Server error creating listing' });
    }
});

// Update listing
router.put('/listings/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { price, condition, description, status } = req.body;

    try {
        // Verify listing belongs to user
        const listingCheck = await pool.query(
            'SELECT * FROM marketplace_listings WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );

        if (listingCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Listing not found or does not belong to you' });
        }

        const result = await pool.query(
            `UPDATE marketplace_listings
             SET price = COALESCE($1, price),
                 condition = COALESCE($2, condition),
                 description = COALESCE($3, description),
                 status = COALESCE($4, status),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $5
             RETURNING *`,
            [price, condition, description, status, id]
        );

        res.json({
            message: 'Listing updated successfully',
            listing: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating listing:', error);
        res.status(500).json({ error: 'Server error updating listing' });
    }
});

// Delete listing
router.delete('/listings/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM marketplace_listings WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Listing not found or does not belong to you' });
        }

        res.json({ message: 'Listing deleted successfully' });
    } catch (error) {
        console.error('Error deleting listing:', error);
        res.status(500).json({ error: 'Server error deleting listing' });
    }
});

// Create exchange request
router.post('/exchange-requests', authenticateToken, async (req, res) => {
    const { listing_id, offered_book_id, message } = req.body;

    try {
        // Verify listing exists and is for exchange
        const listingCheck = await pool.query(
            'SELECT * FROM marketplace_listings WHERE id = $1 AND listing_type = $2 AND status = $3',
            [listing_id, 'exchange', 'active']
        );

        if (listingCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Exchange listing not found or not available' });
        }

        // Verify offered book belongs to requester
        const bookCheck = await pool.query(
            'SELECT * FROM books WHERE id = $1 AND user_id = $2',
            [offered_book_id, req.user.id]
        );

        if (bookCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Offered book not found or does not belong to you' });
        }

        // Create exchange request
        const result = await pool.query(
            `INSERT INTO exchange_requests (listing_id, requester_id, offered_book_id, message)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [listing_id, req.user.id, offered_book_id, message]
        );

        res.status(201).json({
            message: 'Exchange request created successfully',
            request: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating exchange request:', error);
        res.status(500).json({ error: 'Server error creating exchange request' });
    }
});

// Get exchange requests for user's listings
router.get('/exchange-requests/received', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT er.*, 
                    ml.book_id as listing_book_id,
                    b1.title as listing_book_title,
                    b2.title as offered_book_title,
                    b2.author as offered_book_author,
                    u.username as requester_name
             FROM exchange_requests er
             JOIN marketplace_listings ml ON er.listing_id = ml.id
             JOIN books b1 ON ml.book_id = b1.id
             JOIN books b2 ON er.offered_book_id = b2.id
             JOIN users u ON er.requester_id = u.id
             WHERE ml.user_id = $1
             ORDER BY er.created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching exchange requests:', error);
        res.status(500).json({ error: 'Server error fetching exchange requests' });
    }
});

// Get exchange requests sent by user
router.get('/exchange-requests/sent', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT er.*, 
                    b1.title as listing_book_title,
                    b2.title as offered_book_title,
                    u.username as seller_name
             FROM exchange_requests er
             JOIN marketplace_listings ml ON er.listing_id = ml.id
             JOIN books b1 ON ml.book_id = b1.id
             JOIN books b2 ON er.offered_book_id = b2.id
             JOIN users u ON ml.user_id = u.id
             WHERE er.requester_id = $1
             ORDER BY er.created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching sent exchange requests:', error);
        res.status(500).json({ error: 'Server error fetching sent exchange requests' });
    }
});

// Update exchange request status (accept/reject)
router.put('/exchange-requests/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        if (!['accepted', 'rejected', 'completed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        // Verify request belongs to user's listing
        const requestCheck = await pool.query(
            `SELECT er.*, ml.user_id 
             FROM exchange_requests er
             JOIN marketplace_listings ml ON er.listing_id = ml.id
             WHERE er.id = $1`,
            [id]
        );

        if (requestCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Exchange request not found' });
        }

        if (requestCheck.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to update this request' });
        }

        const result = await pool.query(
            `UPDATE exchange_requests
             SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING *`,
            [status, id]
        );

        // If accepted, update listing status
        if (status === 'accepted') {
            await pool.query(
                `UPDATE marketplace_listings
                 SET status = 'exchanged', updated_at = CURRENT_TIMESTAMP
                 WHERE id = $1`,
                [requestCheck.rows[0].listing_id]
            );
        }

        res.json({
            message: 'Exchange request updated successfully',
            request: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating exchange request:', error);
        res.status(500).json({ error: 'Server error updating exchange request' });
    }
});

// Create purchase transaction
router.post('/transactions', authenticateToken, async (req, res) => {
    const { listing_id } = req.body;

    try {
        // Verify listing exists and is for sale
        const listingCheck = await pool.query(
            'SELECT * FROM marketplace_listings WHERE id = $1 AND listing_type = $2 AND status = $3',
            [listing_id, 'sell', 'active']
        );

        if (listingCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Listing not found or not available for purchase' });
        }

        const listing = listingCheck.rows[0];

        if (listing.user_id === req.user.id) {
            return res.status(400).json({ error: 'Cannot purchase your own listing' });
        }

        // Create transaction
        const result = await pool.query(
            `INSERT INTO transactions (listing_id, buyer_id, seller_id, amount)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [listing_id, req.user.id, listing.user_id, listing.price]
        );

        // Update listing status
        await pool.query(
            `UPDATE marketplace_listings
             SET status = 'sold', updated_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [listing_id]
        );

        res.status(201).json({
            message: 'Transaction created successfully',
            transaction: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ error: 'Server error creating transaction' });
    }
});

// Get user's purchase history
router.get('/transactions/purchases', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT t.*, 
                    b.title, b.author, b.genre,
                    u.username as seller_name
             FROM transactions t
             JOIN marketplace_listings ml ON t.listing_id = ml.id
             JOIN books b ON ml.book_id = b.id
             JOIN users u ON t.seller_id = u.id
             WHERE t.buyer_id = $1
             ORDER BY t.created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching purchases:', error);
        res.status(500).json({ error: 'Server error fetching purchases' });
    }
});

// Get user's sales history
router.get('/transactions/sales', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT t.*, 
                    b.title, b.author, b.genre,
                    u.username as buyer_name
             FROM transactions t
             JOIN marketplace_listings ml ON t.listing_id = ml.id
             JOIN books b ON ml.book_id = b.id
             JOIN users u ON t.buyer_id = u.id
             WHERE t.seller_id = $1
             ORDER BY t.created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching sales:', error);
        res.status(500).json({ error: 'Server error fetching sales' });
    }
});

module.exports = router;
