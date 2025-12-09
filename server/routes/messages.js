const express = require('express');
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all conversations for current user
router.get('/conversations', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT DISTINCT ON (other_user_id) 
                m.id,
                m.subject,
                m.message,
                m.created_at,
                m.is_read,
                CASE 
                    WHEN m.sender_id = $1 THEN m.recipient_id
                    ELSE m.sender_id
                END as other_user_id,
                u.username as other_username,
                u.full_name as other_full_name,
                p.avatar_url as other_avatar
             FROM messages m
             JOIN users u ON u.id = CASE 
                WHEN m.sender_id = $1 THEN m.recipient_id
                ELSE m.sender_id
             END
             LEFT JOIN user_profiles p ON u.id = p.user_id
             WHERE m.sender_id = $1 OR m.recipient_id = $1
             ORDER BY other_user_id, m.created_at DESC`,
            [req.user.id]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Server error fetching conversations' });
    }
});

// Get messages with a specific user
router.get('/conversation/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await pool.query(
            `SELECT m.*, 
                    sender.username as sender_username,
                    recipient.username as recipient_username
             FROM messages m
             JOIN users sender ON m.sender_id = sender.id
             JOIN users recipient ON m.recipient_id = recipient.id
             WHERE (m.sender_id = $1 AND m.recipient_id = $2)
                OR (m.sender_id = $2 AND m.recipient_id = $1)
             ORDER BY m.created_at ASC`,
            [req.user.id, userId]
        );

        // Mark messages as read
        await pool.query(
            'UPDATE messages SET is_read = TRUE WHERE sender_id = $1 AND recipient_id = $2 AND is_read = FALSE',
            [userId, req.user.id]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({ error: 'Server error fetching conversation' });
    }
});

// Send a message
router.post('/send', authenticateToken, async (req, res) => {
    try {
        const { recipient_id, subject, message, listing_id } = req.body;

        if (!recipient_id || !message) {
            return res.status(400).json({ error: 'Recipient and message are required' });
        }

        const result = await pool.query(
            `INSERT INTO messages (sender_id, recipient_id, subject, message, listing_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [req.user.id, recipient_id, subject, message, listing_id || null]
        );

        res.status(201).json({
            message: 'Message sent successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Server error sending message' });
    }
});

// Get unread message count
router.get('/unread-count', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT COUNT(*) FROM messages WHERE recipient_id = $1 AND is_read = FALSE',
            [req.user.id]
        );

        res.json({ count: parseInt(result.rows[0].count) });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ error: 'Server error fetching unread count' });
    }
});

// Mark message as read
router.put('/:messageId/read', authenticateToken, async (req, res) => {
    try {
        const { messageId } = req.params;

        await pool.query(
            'UPDATE messages SET is_read = TRUE WHERE id = $1 AND recipient_id = $2',
            [messageId, req.user.id]
        );

        res.json({ message: 'Message marked as read' });
    } catch (error) {
        console.error('Error marking message as read:', error);
        res.status(500).json({ error: 'Server error marking message as read' });
    }
});

// Delete a message
router.delete('/:messageId', authenticateToken, async (req, res) => {
    try {
        const { messageId } = req.params;

        const result = await pool.query(
            'DELETE FROM messages WHERE id = $1 AND (sender_id = $2 OR recipient_id = $2) RETURNING *',
            [messageId, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }

        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: 'Server error deleting message' });
    }
});

module.exports = router;
