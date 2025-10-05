const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// For simplicity, authorize by role 'logistics' or admin on assigned orders
const ensureLogisticsOrAdmin = async (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'logistics') return next();
  return res.status(403).json({ error: 'Insufficient permissions' });
};

// List orders for logistics (could filter by status)
router.get('/orders', authenticateToken, ensureLogisticsOrAdmin, async (req, res) => {
  try {
    console.log('Logistics: Fetching orders for user:', req.user.id, 'Role:', req.user.role);
    
    const [rows] = await pool.execute(`
      SELECT o.*, 
             u.name as buyer_name, 
             fu.name as farmer_name,
             -- Pickup address (farmer's address)
             f.pickup_address,
             f.city as pickup_city,
             f.state as pickup_state,
             f.pincode as pickup_pincode,
             -- Delivery address (buyer's address)
             b.default_address as delivery_address,
             b.city as delivery_city,
             b.state as delivery_state,
             b.pincode as delivery_pincode
      FROM orders o
      JOIN buyers b ON o.buyer_id = b.id
      JOIN users u ON b.user_id = u.id
      JOIN farmers f ON o.farmer_id = f.id
      JOIN users fu ON f.user_id = fu.id
      WHERE o.status IN ('placed','accepted','shipped','delivered')
      ORDER BY o.created_at DESC
    `);
    
    console.log('Logistics: Found orders:', rows.length);
    res.json(rows);
  } catch (error) {
    console.error('Logistics list orders error:', error);
    console.error('Logistics list orders error stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
  }
});

// Update tracking status + POD
router.patch('/orders/:id/tracking', authenticateToken, ensureLogisticsOrAdmin, async (req, res) => {
  try {
    const { status, tracking_number, courier_name, pod_upload_url, estimated_delivery } = req.body;
    const { id } = req.params;

    console.log('Logistics: Updating tracking for order:', id, 'Status:', status);

    if (status && !['picked','in_transit','out_for_delivery','delivered','failed','returned'].includes(status)) {
      return res.status(400).json({ error: 'Invalid logistics status. Must be: picked, in_transit, out_for_delivery, delivered, failed, or returned' });
    }

    // Upsert logistics row
    const [existing] = await pool.execute('SELECT id FROM logistics WHERE order_id = ?', [id]);
    if (existing.length === 0) {
      await pool.execute(
        `INSERT INTO logistics (order_id, courier_name, tracking_number, estimated_delivery, status, pod_upload_url)
         VALUES (?,?,?,?,?,?)`,
        [id, courier_name || null, tracking_number || null, estimated_delivery || null, status || 'picked', pod_upload_url || null]
      );
      console.log('Logistics: Created new logistics record for order:', id);
    } else {
      await pool.execute(
        `UPDATE logistics SET courier_name = COALESCE(?, courier_name), tracking_number = COALESCE(?, tracking_number),
         estimated_delivery = COALESCE(?, estimated_delivery), status = COALESCE(?, status),
         pod_upload_url = COALESCE(?, pod_upload_url), updated_at = NOW() WHERE order_id = ?`,
        [courier_name || null, tracking_number || null, estimated_delivery || null, status || null, pod_upload_url || null, id]
      );
      console.log('Logistics: Updated logistics record for order:', id);
    }

    // If delivered, set order status to delivered
    if (status === 'delivered') {
      await pool.execute('UPDATE orders SET status = "delivered", updated_at = NOW() WHERE id = ?', [id]);
      console.log('Logistics: Updated order status to delivered for order:', id);
    }

    res.json({ message: 'Tracking updated successfully' });
  } catch (error) {
    console.error('Logistics update tracking error:', error);
    console.error('Logistics update tracking error stack:', error.stack);
    res.status(500).json({ error: 'Failed to update tracking', details: error.message });
  }
});

// Get logistics profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'logistics' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [logistics] = await pool.execute(`
      SELECT l.*, u.name, u.email, u.phone, u.status as user_status
      FROM logistics_profiles l
      JOIN users u ON l.user_id = u.id
      WHERE l.user_id = ?
    `, [req.user.id]);

    if (logistics.length === 0) {
      // Return basic user info if no logistics profile exists
      const [users] = await pool.execute(`
        SELECT id, name, email, phone, role, status
        FROM users 
        WHERE id = ?
      `, [req.user.id]);

      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({
        ...users[0],
        company_name: '',
        service_area: '',
        vehicle_type: '',
        contact_person: '',
        emergency_contact: ''
      });
    }

    const profile = logistics[0];
    
    // Remove sensitive information
    delete profile.password_hash;
    delete profile.user_id;
    
    res.json(profile);
  } catch (error) {
    console.error('Get logistics profile error:', error);
    res.status(500).json({ error: 'Failed to fetch logistics profile' });
  }
});

// Update logistics profile
router.patch('/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'logistics' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { company_name, service_area, vehicle_type, contact_person, emergency_contact } = req.body;
    
    // Check if logistics profile exists
    const [existing] = await pool.execute(
      'SELECT id FROM logistics_profiles WHERE user_id = ?',
      [req.user.id]
    );

    if (existing.length === 0) {
      // Create new logistics profile
      await pool.execute(`
        INSERT INTO logistics_profiles (user_id, company_name, service_area, vehicle_type, contact_person, emergency_contact)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [req.user.id, company_name, service_area, vehicle_type, contact_person, emergency_contact]);
    } else {
      // Update existing logistics profile
      await pool.execute(`
        UPDATE logistics_profiles 
        SET company_name = ?, service_area = ?, vehicle_type = ?, contact_person = ?, emergency_contact = ?
        WHERE user_id = ?
      `, [company_name, service_area, vehicle_type, contact_person, emergency_contact, req.user.id]);
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update logistics profile error:', error);
    res.status(500).json({ error: 'Failed to update logistics profile' });
  }
});

module.exports = router;


