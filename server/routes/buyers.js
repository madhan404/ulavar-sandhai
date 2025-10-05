const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorize } = require('../middleware/auth');
const router = express.Router();

// Get buyer profile (authenticated buyer only)
router.get('/profile', authenticateToken, authorize(['buyer']), async (req, res) => {
  try {
    const [buyers] = await pool.execute(`
      SELECT b.*, u.name, u.email, u.phone, u.status as user_status
      FROM buyers b
      JOIN users u ON b.user_id = u.id
      WHERE b.user_id = ?
    `, [req.user.id]);

    if (buyers.length === 0) {
      return res.status(404).json({ error: 'Buyer profile not found' });
    }

    const buyer = buyers[0];
    
    // Remove sensitive information
    delete buyer.password_hash;
    delete buyer.user_id;
    
    res.json(buyer);
  } catch (error) {
    console.error('Get buyer profile error:', error);
    res.status(500).json({ error: 'Failed to fetch buyer profile' });
  }
});

// Update buyer profile (authenticated buyer only)
router.patch('/profile', authenticateToken, authorize(['buyer']), async (req, res) => {
  try {
    const { default_address, city, state, pincode } = req.body;
    
    // Get buyer ID
    const [buyers] = await pool.execute(
      'SELECT id FROM buyers WHERE user_id = ?',
      [req.user.id]
    );

    if (buyers.length === 0) {
      return res.status(404).json({ error: 'Buyer profile not found' });
    }

    const buyerId = buyers[0].id;

    // Update buyer profile
    await pool.execute(`
      UPDATE buyers 
      SET default_address = ?, city = ?, state = ?, pincode = ?
      WHERE id = ?
    `, [default_address, city, state, pincode, buyerId]);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update buyer profile error:', error);
    res.status(500).json({ error: 'Failed to update buyer profile' });
  }
});

// Get buyer's order history with detailed information
router.get('/orders', authenticateToken, authorize(['buyer']), async (req, res) => {
  try {
    const [buyers] = await pool.execute(
      'SELECT id FROM buyers WHERE user_id = ?',
      [req.user.id]
    );

    if (buyers.length === 0) {
      return res.status(404).json({ error: 'Buyer profile not found' });
    }

    const buyerId = buyers[0].id;

    const [orders] = await pool.execute(`
      SELECT o.*, 
             p.name as product_name, 
             p.description as product_description,
             p.unit,
             p.images,
             f.pickup_address,
             f.city as farmer_city,
             f.state as farmer_state,
             fu.name as farmer_name,
             fu.phone as farmer_phone,
             l.courier_name,
             l.tracking_number,
             l.status as logistics_status,
             l.estimated_delivery,
             l.actual_delivery
      FROM orders o
      JOIN products p ON o.product_id = p.id
      JOIN farmers f ON o.farmer_id = f.id
      JOIN users fu ON f.user_id = fu.id
      LEFT JOIN logistics l ON o.id = l.order_id
      WHERE o.buyer_id = ?
      ORDER BY o.created_at DESC
    `, [buyerId]);

    // Process images for each order
    const processedOrders = orders.map(order => {
      try {
        let parsedImages = [];
        if (order.images && order.images !== null && order.images !== '') {
          if (Array.isArray(order.images)) {
            parsedImages = order.images;
          } else {
            parsedImages = JSON.parse(order.images);
          }
        }
        
        return {
          ...order,
          images: parsedImages
        };
      } catch (parseError) {
        return {
          ...order,
          images: []
        };
      }
    });

    res.json(processedOrders);
  } catch (error) {
    console.error('Get buyer orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get buyer's wishlist (if implemented)
router.get('/wishlist', authenticateToken, authorize(['buyer']), async (req, res) => {
  try {
    // For now, return empty array - can be implemented later
    res.json([]);
  } catch (error) {
    console.error('Get buyer wishlist error:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// Get buyer's saved addresses
router.get('/addresses', authenticateToken, authorize(['buyer']), async (req, res) => {
  try {
    const [buyers] = await pool.execute(
      'SELECT default_address, city, state, pincode FROM buyers WHERE user_id = ?',
      [req.user.id]
    );

    if (buyers.length === 0) {
      return res.status(404).json({ error: 'Buyer profile not found' });
    }

    const buyer = buyers[0];
    
    // Return as an array of addresses (for future expansion)
    const addresses = [];
    if (buyer.default_address) {
      addresses.push({
        id: 1,
        type: 'Home',
        address: buyer.default_address,
        city: buyer.city,
        state: buyer.state,
        pincode: buyer.pincode,
        is_default: true
      });
    }

    res.json(addresses);
  } catch (error) {
    console.error('Get buyer addresses error:', error);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

// Add new address
router.post('/addresses', authenticateToken, authorize(['buyer']), async (req, res) => {
  try {
    const { address, city, state, pincode, type = 'Other' } = req.body;
    
    // For now, just update the default address
    // In a real implementation, you'd have a separate addresses table
    await pool.execute(`
      UPDATE buyers 
      SET default_address = ?, city = ?, state = ?, pincode = ?
      WHERE user_id = ?
    `, [address, city, state, pincode, req.user.id]);

    res.json({ message: 'Address added successfully' });
  } catch (error) {
    console.error('Add buyer address error:', error);
    res.status(500).json({ error: 'Failed to add address' });
  }
});

module.exports = router;
