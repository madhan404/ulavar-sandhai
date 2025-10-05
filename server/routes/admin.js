const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorize } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Admin-specific rate limiting - more permissive
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // 2000 requests per 15 minutes for admin routes
  message: 'Admin rate limit exceeded, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    return req.user ? req.user.id : req.ip;
  }
});

// Apply admin rate limiting to all admin routes
router.use(adminLimiter);

// Test endpoint to check if admin routes are working
router.get('/test', authenticateToken, authorize(['admin']), (req, res) => {
  res.json({ message: 'Admin routes are working!', user: req.user });
});

// Get all users by role
router.get('/users/:role', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { role } = req.params;
    console.log(`Admin route: Fetching ${role} users...`);
    
    if (!['farmer', 'buyer', 'logistics'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    // Test database connection first
    try {
      const [testResult] = await pool.execute('SELECT 1 as test');
      console.log('Database connection test:', testResult);
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return res.status(500).json({ 
        error: 'Database connection failed',
        details: dbError.message 
      });
    }

    let query = '';
    let params = [];

    if (role === 'farmer') {
      console.log('Building farmer query...');
      // Use a simple query that works with existing columns
      query = `
        SELECT 
          u.id as user_id,
          u.name,
          u.email,
          u.phone,
          u.status,
          u.created_at,
          f.city,
          f.state,
          f.kyc_status
        FROM users u
        JOIN farmers f ON u.id = f.user_id
        WHERE u.role = ?
        ORDER BY u.created_at DESC
      `;
    } else if (role === 'buyer') {
      console.log('Building buyer query...');
      query = `
        SELECT 
          u.id as user_id,
          u.name,
          u.email,
          u.phone,
          u.status,
          u.created_at,
          COALESCE(b.city, '') as city,
          COALESCE(b.state, '') as state,
          COALESCE(b.pincode, '') as pincode,
          COALESCE(b.default_address, '') as default_address
        FROM users u
        JOIN buyers b ON u.id = b.user_id
        WHERE u.role = ?
        ORDER BY u.created_at DESC
      `;
    } else if (role === 'logistics') {
      console.log('Building logistics query...');
      query = `
        SELECT 
          u.id as user_id,
          u.name,
          u.email,
          u.phone,
          u.status,
          u.created_at
        FROM users u
        WHERE u.role = ?
        ORDER BY u.created_at DESC
      `;
    }

    console.log('Executing query:', query);
    console.log('Query parameters:', [role]);

    const [users] = await pool.execute(query, [role]);
    console.log(`Found ${users.length} ${role} users:`, users);

    res.json(users);
  } catch (error) {
    console.error(`Error fetching ${req.params.role} users:`, error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message,
      stack: error.stack
    });
  }
});

// Get dashboard statistics
router.get('/stats', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    // Get counts for each role
    const [farmerCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE role = ?',
      ['farmer']
    );
    
    const [buyerCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE role = ?',
      ['buyer']
    );
    
    const [logisticsCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE role = ?',
      ['logistics']
    );
    
    const [pendingFarmerCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE role = ? AND status = ?',
      ['farmer', 'pending']
    );
    
    const [activeOrderCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM orders WHERE status IN (?, ?, ?)',
      ['placed', 'accepted', 'shipped']
    );
    
    const [totalRevenue] = await pool.execute(
      'SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status = ?',
      ['delivered']
    );

    // Get monthly growth data for the last 6 months
    const [monthlyStats] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as order_count,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
    `);

    res.json({
      farmers: farmerCount[0].count,
      buyers: buyerCount[0].count,
      logistics: logisticsCount[0].count,
      pendingFarmers: pendingFarmerCount[0].count,
      activeOrders: activeOrderCount[0].count,
      totalRevenue: totalRevenue[0].total,
      monthlyGrowth: monthlyStats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all products with farmer details
router.get('/products', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const [products] = await pool.execute(`
      SELECT 
        p.id,
        p.farmer_id,
        p.category_id,
        p.name,
        p.name_hindi,
        p.description,
        p.price,
        p.unit,
        p.stock_quantity,
        p.min_order_quantity,
        p.images,
        p.status,
        p.harvest_date,
        p.expiry_date,
        p.created_at,
        p.updated_at,
        c.name as category_name,
        u.name as farmer_name,
        u.phone as farmer_phone,
        f.city as farmer_city,
        f.state as farmer_state
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN farmers f ON p.farmer_id = f.id
      JOIN users u ON f.user_id = u.id
      ORDER BY p.created_at DESC
    `);

    // Add active orders count separately to avoid JOIN issues
    const productsWithOrderCounts = await Promise.all(products.map(async (product) => {
      try {
        const [orderCount] = await pool.execute(
          'SELECT COUNT(*) as count FROM orders WHERE product_id = ? AND status IN (?, ?, ?)',
          [product.id, 'placed', 'accepted', 'shipped']
        );
        return {
          ...product,
          active_orders_count: orderCount[0].count
        };
      } catch (error) {
        console.error(`Error getting order count for product ${product.id}:`, error);
        return {
          ...product,
          active_orders_count: 0
        };
      }
    }));

    // Parse JSON fields safely
    const processedProducts = productsWithOrderCounts.map(product => {
      try {
        let parsedImages = [];
        if (product.images && product.images !== null && product.images !== '') {
          // If images is already an array, use it directly
          if (Array.isArray(product.images)) {
            parsedImages = product.images;
          } else {
            // Otherwise, try to parse it as JSON
            parsedImages = JSON.parse(product.images);
          }
        }
        
        return {
          ...product,
          images: parsedImages
        };
      } catch (parseError) {
        console.error('Error parsing images for product:', product.id, parseError);
        return {
          ...product,
          images: []
        };
      }
    });

    res.json(processedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update product images
router.patch('/products/:id/images', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { images } = req.body;

    if (!Array.isArray(images)) {
      return res.status(400).json({ error: 'Images must be an array' });
    }

    // Update product images
    await pool.execute(
      'UPDATE products SET images = ? WHERE id = ?',
      [JSON.stringify(images), id]
    );

    res.json({ 
      success: true, 
      message: 'Product images updated successfully',
      images: images
    });
  } catch (error) {
    console.error('Error updating product images:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete product
router.delete('/products/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if product exists
    const [existingProduct] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
    if (existingProduct.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if product has active orders
    const [activeOrders] = await pool.execute(
      'SELECT COUNT(*) as count FROM orders WHERE product_id = ? AND status IN (?, ?, ?)',
      [id, 'placed', 'accepted', 'shipped']
    );
    
    if (activeOrders[0].count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete product. It has active orders.' 
      });
    }

    // Delete the product
    await pool.execute('DELETE FROM products WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update farmer details
router.patch('/farmers/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      city,
      state,
      pincode,
      pickup_address,
      pan_number,
      gst_number,
      aadhaar_number,
      bank_name,
      bank_account_number,
      bank_ifsc_code
    } = req.body;

    // Update user details
    await pool.execute(
      'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?',
      [name, email, phone, id]
    );

    // Update farmer details
    await pool.execute(`
      UPDATE farmers SET 
        city = ?, state = ?, pincode = ?, pickup_address = ?,
        pan_number = ?, gst_number = ?, aadhaar_number = ?,
        bank_name = ?, bank_account_number = ?, bank_ifsc_code = ?
      WHERE user_id = ?
    `, [city, state, pincode, pickup_address, pan_number, gst_number, 
         aadhaar_number, bank_name, bank_account_number, bank_ifsc_code, id]);

    res.json({ success: true, message: 'Farmer details updated successfully' });
  } catch (error) {
    console.error('Error updating farmer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update logistics user details
router.patch('/logistics/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    await pool.execute(
      'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?',
      [name, email, phone, id]
    );

    res.json({ success: true, message: 'Logistics user updated successfully' });
  } catch (error) {
    console.error('Error updating logistics user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pending farmers for review
router.get('/farmers/pending', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    console.log('Admin route: Fetching pending farmers...');
    
    // First, let's check if we can connect to the database
    const [testResult] = await pool.execute('SELECT 1 as test');
    console.log('Database connection test:', testResult);
    
    // Check what users exist
    const [allUsers] = await pool.execute(`
      SELECT id, name, email, phone, role, status, created_at
      FROM users 
      WHERE role = 'farmer'
      ORDER BY created_at DESC
    `);
    console.log('All farmer users:', allUsers);
    
    // Now get pending farmers
    const [farmers] = await pool.execute(`
      SELECT 
        u.id as user_id,
        u.name,
        u.email,
        u.phone,
        u.created_at,
        f.city,
        f.state,
        f.kyc_status
      FROM users u
      JOIN farmers f ON u.id = f.user_id
      WHERE u.role = 'farmer' AND u.status = 'pending'
      ORDER BY u.created_at DESC
    `);
    
    console.log('Pending farmers found:', farmers);
    res.json(farmers);
  } catch (error) {
    console.error('Error fetching pending farmers:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message,
      stack: error.stack
    });
  }
});

// Approve farmer
router.patch('/farmers/:id/approve', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Update user status to active
    await pool.execute(
      'UPDATE users SET status = ? WHERE id = ? AND role = ?',
      ['active', id, 'farmer']
    );

    // Update farmer KYC status to approved
    await pool.execute(
      'UPDATE farmers SET kyc_status = ? WHERE user_id = ?',
      ['approved', id]
    );

    console.log(`Farmer ${id} approved successfully`);

    res.json({ 
      success: true, 
      message: 'Farmer approved successfully' 
    });
  } catch (error) {
    console.error('Error approving farmer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject farmer with reason
router.patch('/farmers/:id/reject', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    // Update user status to rejected
    await pool.execute(
      'UPDATE users SET status = ? WHERE id = ? AND role = ?',
      ['rejected', id, 'farmer']
    );

    // Update farmer KYC status to rejected with reason
    await pool.execute(
      'UPDATE farmers SET kyc_status = ?, rejection_reason = ? WHERE user_id = ?',
      ['rejected', reason.trim(), id]
    );

    console.log(`Farmer ${id} rejected with reason: ${reason}`);

    res.json({ 
      success: true, 
      message: 'Farmer rejected successfully',
      reason: reason.trim()
    });
  } catch (error) {
    console.error('Error rejecting farmer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete rejected farmer (for re-registration)
router.delete('/farmers/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if farmer is rejected
    const [users] = await pool.execute(
      'SELECT status FROM users WHERE id = ? AND role = ?',
      [id, 'farmer']
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    if (users[0].status !== 'rejected') {
      return res.status(400).json({ error: 'Only rejected farmers can be deleted' });
    }

    // Delete farmer profile first (due to foreign key constraint)
    await pool.execute('DELETE FROM farmers WHERE user_id = ?', [id]);
    
    // Delete user
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);

    console.log(`Rejected farmer ${id} deleted successfully`);

    res.json({ 
      success: true, 
      message: 'Farmer deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting farmer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all farmers with their status
router.get('/farmers', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const [farmers] = await pool.execute(`
      SELECT 
        u.id as user_id,
        u.name,
        u.email,
        u.phone,
        u.status,
        u.created_at,
        f.city,
        f.state,
        COALESCE(f.pincode, '') as pincode,
        f.kyc_status,
        COALESCE(f.rejection_reason, '') as rejection_reason,
        COALESCE(f.photo_url, '') as photo_url,
        COALESCE(f.pan_number, '') as pan_number,
        COALESCE(f.gst_number, '') as gst_number,
        COALESCE(f.aadhaar_number, '') as aadhaar_number,
        COALESCE(f.pickup_address, '') as pickup_address,
        COALESCE(f.bank_name, '') as bank_name,
        COALESCE(f.bank_account_number, '') as bank_account_number
      FROM users u
      JOIN farmers f ON u.id = f.user_id
      WHERE u.role = 'farmer'
      ORDER BY u.created_at DESC
    `);

    res.json(farmers);
  } catch (error) {
    console.error('Error fetching farmers:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Get categories
router.get('/categories', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const [categories] = await pool.execute('SELECT * FROM categories ORDER BY name');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new category
router.post('/categories', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { name, name_hindi, description } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO categories (name, name_hindi, description) VALUES (?, ?, ?)',
      [name.trim(), name_hindi || null, description || null]
    );

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category: { id: result.insertId, name: name.trim(), name_hindi, description }
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete category
router.delete('/categories/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category exists
    const [existingCategory] = await pool.execute('SELECT * FROM categories WHERE id = ?', [id]);
    if (existingCategory.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if category is being used by any products
    const [productsUsingCategory] = await pool.execute('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [id]);
    if (productsUsingCategory[0].count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category. It is being used by existing products.' 
      });
    }

    // Delete the category
    await pool.execute('DELETE FROM categories WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get admin profile
router.get('/profile', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const [admins] = await pool.execute(`
      SELECT a.*, u.name, u.email, u.phone, u.status as user_status
      FROM admins a
      JOIN users u ON a.user_id = u.id
      WHERE a.user_id = ?
    `, [req.user.id]);

    if (admins.length === 0) {
      return res.status(404).json({ error: 'Admin profile not found' });
    }

    const admin = admins[0];
    
    // Remove sensitive information
    delete admin.password_hash;
    delete admin.user_id;
    
    res.json(admin);
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ error: 'Failed to fetch admin profile' });
  }
});

// Update admin profile
router.patch('/profile', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { department, designation, permissions, office_location } = req.body;
    
    // Get admin ID
    const [admins] = await pool.execute(
      'SELECT id FROM admins WHERE user_id = ?',
      [req.user.id]
    );

    if (admins.length === 0) {
      return res.status(404).json({ error: 'Admin profile not found' });
    }

    const adminId = admins[0].id;

    // Update admin profile
    await pool.execute(`
      UPDATE admins 
      SET department = ?, designation = ?, permissions = ?, office_location = ?
      WHERE id = ?
    `, [department, designation, permissions, office_location, adminId]);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({ error: 'Failed to update admin profile' });
  }
});

// Update farmer KYC status
router.patch('/farmers/:userId/kyc', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, reason } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid KYC status' });
    }
    
    if (status === 'rejected' && !reason) {
      return res.status(400).json({ error: 'Rejection reason is required when rejecting KYC' });
    }

    // Update farmer KYC status
    await pool.execute(`
      UPDATE farmers 
      SET kyc_status = ?, rejection_reason = ?
      WHERE user_id = ?
    `, [status, reason || null, userId]);

    res.json({ message: 'KYC status updated successfully' });
  } catch (error) {
    console.error('Error updating KYC status:', error);
    res.status(500).json({ error: 'Failed to update KYC status' });
  }
});

// Update farmer profile (admin)
router.patch('/farmers/:userId/profile', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, city, state, pincode } = req.body;
    
    // Update user status
    if (status) {
      await pool.execute(`
        UPDATE users 
        SET status = ?
        WHERE id = ?
      `, [status, userId]);
    }
    
    // Update farmer location details
    if (city || state || pincode) {
      await pool.execute(`
        UPDATE farmers 
        SET city = ?, state = ?, pincode = ?
        WHERE user_id = ?
      `, [city || null, state || null, pincode || null, userId]);
    }

    res.json({ message: 'Farmer profile updated successfully' });
  } catch (error) {
    console.error('Error updating farmer profile:', error);
    res.status(500).json({ error: 'Failed to update farmer profile' });
  }
});

// Update logistics profile (admin)
router.patch('/logistics/:userId/profile', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    
    // Update user status
    if (status) {
      await pool.execute(`
        UPDATE users 
        SET status = ?
        WHERE id = ?
      `, [status, userId]);
    }

    res.json({ message: 'Logistics profile updated successfully' });
  } catch (error) {
    console.error('Error updating logistics profile:', error);
    res.status(500).json({ error: 'Failed to update logistics profile' });
  }
});

// Update product (admin)
router.patch('/products/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, description, price, stock_quantity, unit, status, category_id, images 
    } = req.body;
    
    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    
    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (price !== undefined) {
      updateFields.push('price = ?');
      updateValues.push(price);
    }
    if (stock_quantity !== undefined) {
      updateFields.push('stock_quantity = ?');
      updateValues.push(stock_quantity);
    }
    if (unit !== undefined) {
      updateFields.push('unit = ?');
      updateValues.push(unit);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }
    if (category_id !== undefined) {
      updateFields.push('category_id = ?');
      updateValues.push(category_id);
    }
    if (images !== undefined) {
      updateFields.push('images = ?');
      updateValues.push(JSON.stringify(images));
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    // Add product ID to update values
    updateValues.push(id);
    
    // Execute update query
    const updateQuery = `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`;
    await pool.execute(updateQuery, updateValues);
    
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

module.exports = router;


