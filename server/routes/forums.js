const express = require('express');
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all forums with filters
router.get('/', async (req, res) => {
    try {
        const { book_id, club_id } = req.query;
        
        let query = `
            SELECT f.*, u.username as creator_username, u.full_name as creator_name,
                   b.title as book_title, bc.name as club_name,
                   (SELECT COUNT(*) FROM forum_replies WHERE forum_id = f.id) as reply_count
            FROM forums f
            JOIN users u ON f.creator_id = u.id
            LEFT JOIN books b ON f.book_id = b.id
            LEFT JOIN book_clubs bc ON f.club_id = bc.id
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (book_id) {
            query += ` AND f.book_id = $${paramIndex}`;
            params.push(book_id);
            paramIndex++;
        }

        if (club_id) {
            query += ` AND f.club_id = $${paramIndex}`;
            params.push(club_id);
            paramIndex++;
        }

        query += ' ORDER BY f.is_pinned DESC, f.updated_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching forums:', error);
        res.status(500).json({ error: 'Server error fetching forums' });
    }
});

// Get single forum with replies
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Get forum
        const forumResult = await pool.query(
            `SELECT f.*, u.username as creator_username, u.full_name as creator_name,
                    b.title as book_title, bc.name as club_name
             FROM forums f
             JOIN users u ON f.creator_id = u.id
             LEFT JOIN books b ON f.book_id = b.id
             LEFT JOIN book_clubs bc ON f.club_id = bc.id
             WHERE f.id = $1`,
            [id]
        );

        if (forumResult.rows.length === 0) {
            return res.status(404).json({ error: 'Forum not found' });
        }

        // Get replies
        const repliesResult = await pool.query(
            `SELECT fr.*, u.username, u.full_name, p.avatar_url
             FROM forum_replies fr
             JOIN users u ON fr.user_id = u.id
             LEFT JOIN user_profiles p ON u.id = p.user_id
             WHERE fr.forum_id = $1
             ORDER BY fr.created_at ASC`,
            [id]
        );

        // Increment view count
        await pool.query(
            'UPDATE forums SET view_count = view_count + 1 WHERE id = $1',
            [id]
        );

        res.json({
            forum: forumResult.rows[0],
            replies: repliesResult.rows
        });
    } catch (error) {
        console.error('Error fetching forum:', error);
        res.status(500).json({ error: 'Server error fetching forum' });
    }
});

// Create a forum
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, description, book_id, club_id } = req.body;

        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }

        const result = await pool.query(
            `INSERT INTO forums (title, description, book_id, club_id, creator_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [title, description, book_id || null, club_id || null, req.user.id]
        );

        // Create activity
        await pool.query(
            `INSERT INTO activity_feed (user_id, activity_type, activity_data)
             VALUES ($1, $2, $3)`,
            [req.user.id, 'create_forum', JSON.stringify({ forum_id: result.rows[0].id, title })]
        );

        res.status(201).json({
            message: 'Forum created successfully',
            forum: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating forum:', error);
        res.status(500).json({ error: 'Server error creating forum' });
    }
});

// Reply to a forum
router.post('/:id/reply', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { content, parent_reply_id } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        const result = await pool.query(
            `INSERT INTO forum_replies (forum_id, user_id, parent_reply_id, content)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [id, req.user.id, parent_reply_id || null, content]
        );

        // Update forum reply count and updated_at
        await pool.query(
            'UPDATE forums SET reply_count = reply_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
            [id]
        );

        res.status(201).json({
            message: 'Reply posted successfully',
            reply: result.rows[0]
        });
    } catch (error) {
        console.error('Error posting reply:', error);
        res.status(500).json({ error: 'Server error posting reply' });
    }
});

// Like a reply
router.post('/reply/:replyId/like', authenticateToken, async (req, res) => {
    try {
        const { replyId } = req.params;

        await pool.query(
            'UPDATE forum_replies SET likes = likes + 1 WHERE id = $1',
            [replyId]
        );

        res.json({ message: 'Reply liked successfully' });
    } catch (error) {
        console.error('Error liking reply:', error);
        res.status(500).json({ error: 'Server error liking reply' });
    }
});

// Delete own forum
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM forums WHERE id = $1 AND creator_id = $2 RETURNING *',
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Forum not found or not authorized' });
        }

        res.json({ message: 'Forum deleted successfully' });
    } catch (error) {
        console.error('Error deleting forum:', error);
        res.status(500).json({ error: 'Server error deleting forum' });
    }
});

// Delete own reply
router.delete('/reply/:replyId', authenticateToken, async (req, res) => {
    try {
        const { replyId } = req.params;

        const result = await pool.query(
            'DELETE FROM forum_replies WHERE id = $1 AND user_id = $2 RETURNING forum_id',
            [replyId, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Reply not found or not authorized' });
        }

        // Update forum reply count
        await pool.query(
            'UPDATE forums SET reply_count = reply_count - 1 WHERE id = $1',
            [result.rows[0].forum_id]
        );

        res.json({ message: 'Reply deleted successfully' });
    } catch (error) {
        console.error('Error deleting reply:', error);
        res.status(500).json({ error: 'Server error deleting reply' });
    }
});

module.exports = router;
