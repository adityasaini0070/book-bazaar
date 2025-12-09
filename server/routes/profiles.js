const express = require('express');
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user profile by username
router.get('/:username', async (req, res) => {
    try {
        const { username } = req.params;
        
        const userResult = await pool.query(
            `SELECT u.id, u.username, u.email, u.full_name, u.created_at,
                    p.bio, p.avatar_url, p.location, p.favorite_genres, p.reading_goal, p.books_read
             FROM users u
             LEFT JOIN user_profiles p ON u.id = p.user_id
             WHERE u.username = $1`,
            [username]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userResult.rows[0];

        // Get user's books
        const booksResult = await pool.query(
            'SELECT * FROM books WHERE user_id = $1 ORDER BY created_at DESC',
            [user.id]
        );

        // Get follower/following counts
        const followStatsResult = await pool.query(
            `SELECT 
                (SELECT COUNT(*) FROM user_follows WHERE following_id = $1) as followers,
                (SELECT COUNT(*) FROM user_follows WHERE follower_id = $1) as following`,
            [user.id]
        );

        // Get user's marketplace listings count
        const listingsResult = await pool.query(
            'SELECT COUNT(*) FROM marketplace_listings WHERE user_id = $1 AND status = $2',
            [user.id, 'active']
        );

        res.json({
            user,
            books: booksResult.rows,
            followers: parseInt(followStatsResult.rows[0].followers),
            following: parseInt(followStatsResult.rows[0].following),
            activeListings: parseInt(listingsResult.rows[0].count)
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Server error fetching profile' });
    }
});

// Update own profile
router.put('/me', authenticateToken, async (req, res) => {
    try {
        const { bio, location, favorite_genres, reading_goal } = req.body;

        // Upsert profile
        await pool.query(
            `INSERT INTO user_profiles (user_id, bio, location, favorite_genres, reading_goal)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (user_id) 
             DO UPDATE SET 
                bio = EXCLUDED.bio,
                location = EXCLUDED.location,
                favorite_genres = EXCLUDED.favorite_genres,
                reading_goal = EXCLUDED.reading_goal,
                updated_at = CURRENT_TIMESTAMP`,
            [req.user.id, bio, location, favorite_genres, reading_goal]
        );

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Server error updating profile' });
    }
});

// Follow a user
router.post('/follow/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;

        if (parseInt(userId) === req.user.id) {
            return res.status(400).json({ error: 'Cannot follow yourself' });
        }

        await pool.query(
            `INSERT INTO user_follows (follower_id, following_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [req.user.id, userId]
        );

        // Create activity
        await pool.query(
            `INSERT INTO activity_feed (user_id, activity_type, activity_data)
             VALUES ($1, $2, $3)`,
            [req.user.id, 'follow', JSON.stringify({ followed_user_id: userId })]
        );

        res.json({ message: 'User followed successfully' });
    } catch (error) {
        console.error('Error following user:', error);
        res.status(500).json({ error: 'Server error following user' });
    }
});

// Unfollow a user
router.delete('/follow/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;

        await pool.query(
            'DELETE FROM user_follows WHERE follower_id = $1 AND following_id = $2',
            [req.user.id, userId]
        );

        res.json({ message: 'User unfollowed successfully' });
    } catch (error) {
        console.error('Error unfollowing user:', error);
        res.status(500).json({ error: 'Server error unfollowing user' });
    }
});

// Check if following a user
router.get('/follow/check/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await pool.query(
            'SELECT EXISTS(SELECT 1 FROM user_follows WHERE follower_id = $1 AND following_id = $2)',
            [req.user.id, userId]
        );

        res.json({ isFollowing: result.rows[0].exists });
    } catch (error) {
        console.error('Error checking follow status:', error);
        res.status(500).json({ error: 'Server error checking follow status' });
    }
});

// Get user's followers
router.get('/:userId/followers', async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await pool.query(
            `SELECT u.id, u.username, u.full_name, p.avatar_url
             FROM user_follows uf
             JOIN users u ON uf.follower_id = u.id
             LEFT JOIN user_profiles p ON u.id = p.user_id
             WHERE uf.following_id = $1
             ORDER BY uf.created_at DESC`,
            [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching followers:', error);
        res.status(500).json({ error: 'Server error fetching followers' });
    }
});

// Get user's following
router.get('/:userId/following', async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await pool.query(
            `SELECT u.id, u.username, u.full_name, p.avatar_url
             FROM user_follows uf
             JOIN users u ON uf.following_id = u.id
             LEFT JOIN user_profiles p ON u.id = p.user_id
             WHERE uf.follower_id = $1
             ORDER BY uf.created_at DESC`,
            [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching following:', error);
        res.status(500).json({ error: 'Server error fetching following' });
    }
});

module.exports = router;
