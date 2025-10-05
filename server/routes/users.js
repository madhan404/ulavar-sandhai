const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get user profile by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Users can only access their own profile
    if (req.user.id != userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [users] = await pool.execute(`
      SELECT id, name, email, phone, role, status, created_at
      FROM users 
      WHERE id = ?
    `, [userId]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, phone } = req.body;
    
    // Users can only update their own profile
    if (req.user.id != userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Name, email, and phone are required' });
    }

    // Check if email is already taken by another user
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, userId]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email is already taken' });
    }

    // Update user profile
    await pool.execute(`
      UPDATE users 
      SET name = ?, email = ?, phone = ?, updated_at = NOW()
      WHERE id = ?
    `, [name, email, phone, userId]);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

module.exports = router;
