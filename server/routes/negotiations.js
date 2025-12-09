const express = require('express');
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create a price negotiation offer
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { listing_id, offered_price, message } = req.body;

        if (!listing_id || !offered_price) {
            return res.status(400).json({ error: 'Listing ID and offered price are required' });
        }

        // Get listing details
        const listingResult = await pool.query(
            'SELECT * FROM marketplace_listings WHERE id = $1 AND status = $2 AND listing_type = $3',
            [listing_id, 'active', 'sell']
        );

        if (listingResult.rows.length === 0) {
            return res.status(404).json({ error: 'Listing not found or not available for negotiation' });
        }

        const listing = listingResult.rows[0];

        if (listing.user_id === req.user.id) {
            return res.status(400).json({ error: 'Cannot negotiate on your own listing' });
        }

        // Create negotiation
        const result = await pool.query(
            `INSERT INTO negotiations (listing_id, buyer_id, seller_id, original_price, offered_price, message)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [listing_id, req.user.id, listing.user_id, listing.price, offered_price, message]
        );

        res.status(201).json({
            message: 'Negotiation offer sent successfully',
            negotiation: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating negotiation:', error);
        res.status(500).json({ error: 'Server error creating negotiation' });
    }
});

// Get negotiations for a listing (seller view)
router.get('/listing/:listingId', authenticateToken, async (req, res) => {
    try {
        const { listingId } = req.params;

        const result = await pool.query(
            `SELECT n.*, u.username as buyer_username, u.full_name as buyer_name,
                    l.title as book_title
             FROM negotiations n
             JOIN users u ON n.buyer_id = u.id
             JOIN marketplace_listings ml ON n.listing_id = ml.id
             JOIN books l ON ml.book_id = l.id
             WHERE n.listing_id = $1 AND n.seller_id = $2
             ORDER BY n.created_at DESC`,
            [listingId, req.user.id]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching negotiations:', error);
        res.status(500).json({ error: 'Server error fetching negotiations' });
    }
});

// Get user's sent negotiations (buyer view)
router.get('/my-offers', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT n.*, u.username as seller_username, u.full_name as seller_name,
                    b.title as book_title, b.author as book_author
             FROM negotiations n
             JOIN users u ON n.seller_id = u.id
             JOIN marketplace_listings ml ON n.listing_id = ml.id
             JOIN books b ON ml.book_id = b.id
             WHERE n.buyer_id = $1
             ORDER BY n.created_at DESC`,
            [req.user.id]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching sent negotiations:', error);
        res.status(500).json({ error: 'Server error fetching sent negotiations' });
    }
});

// Get received negotiations (seller view)
router.get('/received', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT n.*, u.username as buyer_username, u.full_name as buyer_name,
                    b.title as book_title, b.author as book_author, ml.id as listing_id
             FROM negotiations n
             JOIN users u ON n.buyer_id = u.id
             JOIN marketplace_listings ml ON n.listing_id = ml.id
             JOIN books b ON ml.book_id = b.id
             WHERE n.seller_id = $1
             ORDER BY n.created_at DESC`,
            [req.user.id]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching received negotiations:', error);
        res.status(500).json({ error: 'Server error fetching received negotiations' });
    }
});

// Counter offer (seller)
router.put('/:id/counter', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { counter_price, message } = req.body;

        if (!counter_price) {
            return res.status(400).json({ error: 'Counter price is required' });
        }

        const result = await pool.query(
            `UPDATE negotiations 
             SET counter_price = $1, status = $2, message = $3, updated_at = CURRENT_TIMESTAMP
             WHERE id = $4 AND seller_id = $5
             RETURNING *`,
            [counter_price, 'countered', message, id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Negotiation not found' });
        }

        res.json({
            message: 'Counter offer sent successfully',
            negotiation: result.rows[0]
        });
    } catch (error) {
        console.error('Error sending counter offer:', error);
        res.status(500).json({ error: 'Server error sending counter offer' });
    }
});

// Accept negotiation (seller)
router.put('/:id/accept', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `UPDATE negotiations 
             SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2 AND seller_id = $3
             RETURNING *`,
            ['accepted', id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Negotiation not found' });
        }

        // Update listing price
        await pool.query(
            'UPDATE marketplace_listings SET price = $1 WHERE id = $2',
            [result.rows[0].offered_price, result.rows[0].listing_id]
        );

        res.json({
            message: 'Negotiation accepted successfully',
            negotiation: result.rows[0]
        });
    } catch (error) {
        console.error('Error accepting negotiation:', error);
        res.status(500).json({ error: 'Server error accepting negotiation' });
    }
});

// Reject negotiation (seller)
router.put('/:id/reject', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `UPDATE negotiations 
             SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2 AND seller_id = $3
             RETURNING *`,
            ['rejected', id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Negotiation not found' });
        }

        res.json({
            message: 'Negotiation rejected',
            negotiation: result.rows[0]
        });
    } catch (error) {
        console.error('Error rejecting negotiation:', error);
        res.status(500).json({ error: 'Server error rejecting negotiation' });
    }
});

module.exports = router;
