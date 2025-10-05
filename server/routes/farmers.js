const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorize } = require('../middleware/auth');
const router = express.Router();

// Get farmer profile (authenticated farmer only)
router.get('/profile', authenticateToken, authorize(['farmer']), async (req, res) => {
  try {
    const [farmers] = await pool.execute(`
      SELECT f.*, u.name, u.email, u.phone, u.status as user_status
      FROM farmers f
      JOIN users u ON f.user_id = u.id
      WHERE f.user_id = ?
    `, [req.user.id]);

    if (farmers.length === 0) {
      return res.status(404).json({ error: 'Farmer profile not found' });
    }

    const farmer = farmers[0];
    
    // Remove sensitive information
    delete farmer.password_hash;
    delete farmer.user_id;
    
    res.json(farmer);
  } catch (error) {
    console.error('Get farmer profile error:', error);
    res.status(500).json({ error: 'Failed to fetch farmer profile' });
  }
});

// Update farmer profile (authenticated farmer only)
router.patch('/profile', authenticateToken, authorize(['farmer']), async (req, res) => {
  try {
    const { 
      aadhaar_number, 
      pan_number, 
      gst_number, 
      bank_account_number, 
      bank_ifsc_code, 
      bank_name, 
      pickup_address, 
      photo_url,
      city, 
      state, 
      pincode 
    } = req.body;
    
    // Get farmer ID
    const [farmers] = await pool.execute(
      'SELECT id FROM farmers WHERE user_id = ?',
      [req.user.id]
    );

    if (farmers.length === 0) {
      return res.status(404).json({ error: 'Farmer profile not found' });
    }

    const farmerId = farmers[0].id;

    // Update farmer profile with all fields
    await pool.execute(`
      UPDATE farmers 
      SET 
        aadhaar_number = ?,
        pan_number = ?,
        gst_number = ?,
        bank_account_number = ?,
        bank_ifsc_code = ?,
        bank_name = ?,
        pickup_address = ?,
        photo_url = ?,
        city = ?,
        state = ?,
        pincode = ?
      WHERE id = ?
    `, [
      aadhaar_number || null,
      pan_number || null,
      gst_number || null,
      bank_account_number || null,
      bank_ifsc_code || null,
      bank_name || null,
      pickup_address || null,
      photo_url || null,
      city || null,
      state || null,
      pincode || null,
      farmerId
    ]);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update farmer profile error:', error);
    res.status(500).json({ error: 'Failed to update farmer profile' });
  }
});

module.exports = router;
