const express = require('express');
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all book clubs
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT bc.*, u.username as creator_username,
                    (SELECT COUNT(*) FROM book_club_members WHERE club_id = bc.id) as member_count
             FROM book_clubs bc
             JOIN users u ON bc.creator_id = u.id
             WHERE bc.is_private = FALSE
             ORDER BY bc.created_at DESC`
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching book clubs:', error);
        res.status(500).json({ error: 'Server error fetching book clubs' });
    }
});

// Get single book club
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const clubResult = await pool.query(
            `SELECT bc.*, u.username as creator_username, u.full_name as creator_name
             FROM book_clubs bc
             JOIN users u ON bc.creator_id = u.id
             WHERE bc.id = $1`,
            [id]
        );

        if (clubResult.rows.length === 0) {
            return res.status(404).json({ error: 'Book club not found' });
        }

        // Get members
        const membersResult = await pool.query(
            `SELECT u.id, u.username, u.full_name, p.avatar_url, bcm.role, bcm.joined_at
             FROM book_club_members bcm
             JOIN users u ON bcm.user_id = u.id
             LEFT JOIN user_profiles p ON u.id = p.user_id
             WHERE bcm.club_id = $1
             ORDER BY bcm.joined_at ASC`,
            [id]
        );

        // Get current book
        const currentBookResult = await pool.query(
            `SELECT b.*, bcb.start_date, bcb.end_date
             FROM book_club_books bcb
             JOIN books b ON bcb.book_id = b.id
             WHERE bcb.club_id = $1 AND bcb.is_current = TRUE`,
            [id]
        );

        res.json({
            club: clubResult.rows[0],
            members: membersResult.rows,
            currentBook: currentBookResult.rows[0] || null
        });
    } catch (error) {
        console.error('Error fetching book club:', error);
        res.status(500).json({ error: 'Server error fetching book club' });
    }
});

// Create a book club
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name, description, is_private } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Book club name is required' });
        }

        // Create club
        const clubResult = await pool.query(
            `INSERT INTO book_clubs (name, description, creator_id, is_private)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [name, description, req.user.id, is_private || false]
        );

        const club = clubResult.rows[0];

        // Add creator as admin member
        await pool.query(
            `INSERT INTO book_club_members (club_id, user_id, role)
             VALUES ($1, $2, $3)`,
            [club.id, req.user.id, 'admin']
        );

        // Create activity
        await pool.query(
            `INSERT INTO activity_feed (user_id, activity_type, activity_data)
             VALUES ($1, $2, $3)`,
            [req.user.id, 'create_club', JSON.stringify({ club_id: club.id, club_name: name })]
        );

        res.status(201).json({
            message: 'Book club created successfully',
            club
        });
    } catch (error) {
        console.error('Error creating book club:', error);
        res.status(500).json({ error: 'Server error creating book club' });
    }
});

// Join a book club
router.post('/:id/join', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if club exists
        const clubResult = await pool.query('SELECT * FROM book_clubs WHERE id = $1', [id]);
        if (clubResult.rows.length === 0) {
            return res.status(404).json({ error: 'Book club not found' });
        }

        // Add member
        await pool.query(
            `INSERT INTO book_club_members (club_id, user_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [id, req.user.id]
        );

        // Update member count
        await pool.query(
            `UPDATE book_clubs SET member_count = (
                SELECT COUNT(*) FROM book_club_members WHERE club_id = $1
            ) WHERE id = $1`,
            [id]
        );

        // Create activity
        await pool.query(
            `INSERT INTO activity_feed (user_id, activity_type, activity_data)
             VALUES ($1, $2, $3)`,
            [req.user.id, 'join_club', JSON.stringify({ club_id: id, club_name: clubResult.rows[0].name })]
        );

        res.json({ message: 'Joined book club successfully' });
    } catch (error) {
        console.error('Error joining book club:', error);
        res.status(500).json({ error: 'Server error joining book club' });
    }
});

// Leave a book club
router.delete('/:id/leave', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(
            'DELETE FROM book_club_members WHERE club_id = $1 AND user_id = $2',
            [id, req.user.id]
        );

        // Update member count
        await pool.query(
            `UPDATE book_clubs SET member_count = (
                SELECT COUNT(*) FROM book_club_members WHERE club_id = $1
            ) WHERE id = $1`,
            [id]
        );

        res.json({ message: 'Left book club successfully' });
    } catch (error) {
        console.error('Error leaving book club:', error);
        res.status(500).json({ error: 'Server error leaving book club' });
    }
});

// Set current reading book for club (admin only)
router.post('/:id/current-book', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { book_id, start_date, end_date } = req.body;

        // Check if user is admin
        const memberCheck = await pool.query(
            'SELECT role FROM book_club_members WHERE club_id = $1 AND user_id = $2',
            [id, req.user.id]
        );

        if (memberCheck.rows.length === 0 || (memberCheck.rows[0].role !== 'admin' && memberCheck.rows[0].role !== 'moderator')) {
            return res.status(403).json({ error: 'Only admins and moderators can set current book' });
        }

        // Set all current books to false
        await pool.query(
            'UPDATE book_club_books SET is_current = FALSE WHERE club_id = $1',
            [id]
        );

        // Add new current book
        await pool.query(
            `INSERT INTO book_club_books (club_id, book_id, start_date, end_date, is_current)
             VALUES ($1, $2, $3, $4, TRUE)`,
            [id, book_id, start_date, end_date]
        );

        res.json({ message: 'Current book set successfully' });
    } catch (error) {
        console.error('Error setting current book:', error);
        res.status(500).json({ error: 'Server error setting current book' });
    }
});

// Get user's book clubs
router.get('/my/clubs', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT bc.*, bcm.role, bcm.joined_at
             FROM book_club_members bcm
             JOIN book_clubs bc ON bcm.club_id = bc.id
             WHERE bcm.user_id = $1
             ORDER BY bcm.joined_at DESC`,
            [req.user.id]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching user book clubs:', error);
        res.status(500).json({ error: 'Server error fetching user book clubs' });
    }
});

module.exports = router;
