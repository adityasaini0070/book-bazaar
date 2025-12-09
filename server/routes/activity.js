const express = require('express');
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get activity feed for current user (following + own)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT af.*, u.username, u.full_name, p.avatar_url
             FROM activity_feed af
             JOIN users u ON af.user_id = u.id
             LEFT JOIN user_profiles p ON u.id = p.user_id
             WHERE af.is_public = TRUE 
               AND (af.user_id = $1 
                    OR af.user_id IN (SELECT following_id FROM user_follows WHERE follower_id = $1))
             ORDER BY af.created_at DESC
             LIMIT 50`,
            [req.user.id]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching activity feed:', error);
        res.status(500).json({ error: 'Server error fetching activity feed' });
    }
});

// Get activity for a specific user
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await pool.query(
            `SELECT af.*, u.username, u.full_name, p.avatar_url
             FROM activity_feed af
             JOIN users u ON af.user_id = u.id
             LEFT JOIN user_profiles p ON u.id = p.user_id
             WHERE af.user_id = $1 AND af.is_public = TRUE
             ORDER BY af.created_at DESC
             LIMIT 30`,
            [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching user activity:', error);
        res.status(500).json({ error: 'Server error fetching user activity' });
    }
});

// Create custom activity
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { activity_type, activity_data, is_public } = req.body;

        if (!activity_type) {
            return res.status(400).json({ error: 'Activity type is required' });
        }

        const result = await pool.query(
            `INSERT INTO activity_feed (user_id, activity_type, activity_data, is_public)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [req.user.id, activity_type, JSON.stringify(activity_data), is_public !== false]
        );

        res.status(201).json({
            message: 'Activity created successfully',
            activity: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating activity:', error);
        res.status(500).json({ error: 'Server error creating activity' });
    }
});

module.exports = router;
