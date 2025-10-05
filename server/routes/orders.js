const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorize } = require('../middleware/auth');
const router = express.Router();

// Generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD${timestamp}${random}`;
};

// Create single product order (buyers only)
router.post('/single', authenticateToken, authorize(['buyer']), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      product_id,
      quantity,
      delivery_address,
      delivery_city,
      delivery_state,
      delivery_pincode
    } = req.body;

    // Get buyer ID
    const [buyers] = await connection.execute(
      'SELECT id FROM buyers WHERE user_id = ?',
      [req.user.id]
    );

    if (buyers.length === 0) {
      throw new Error('Buyer profile not found');
    }

    const buyerId = buyers[0].id;

    // Get product details
    const [products] = await connection.execute(
      'SELECT p.*, f.id as farmer_id FROM products p JOIN farmers f ON p.farmer_id = f.id WHERE p.id = ?',
      [product_id]
    );

    if (products.length === 0) {
      throw new Error('Product not found');
    }

    const product = products[0];

    // Check stock
    if (product.stock_quantity < quantity) {
      throw new Error('Insufficient stock');
    }

    // Calculate amounts
    const unitPrice = parseFloat(product.price);
    const totalAmount = unitPrice * quantity;
    const commissionRate = 5.00; // 5% commission
    const commissionAmount = totalAmount * (commissionRate / 100);

    const orderNumber = generateOrderNumber();

    // Create order
    const [orderResult] = await connection.execute(`
      INSERT INTO orders (order_number, buyer_id, farmer_id, product_id, quantity, unit_price, 
                         total_amount, commission_rate, commission_amount, delivery_address, 
                         delivery_city, delivery_state, delivery_pincode, payment_method, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderNumber,
      buyerId,
      product.farmer_id,
      product_id,
      quantity,
      unitPrice,
      totalAmount,
      commissionRate,
      commissionAmount,
      delivery_address,
      delivery_city,
      delivery_state,
      delivery_pincode,
      'cod', // Default to Cash on Delivery
      'placed' // Initial status
    ]);

    // Update product stock
    await connection.execute(
      'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
      [quantity, product_id]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Order placed successfully',
      orderId: orderResult.insertId,
      orderNumber,
      totalAmount
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create order error:', error);
    res.status(400).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// Create cart-based order (buyers only)
router.post('/', authenticateToken, authorize(['buyer']), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      items,
      delivery_address,
      delivery_city,
      delivery_state,
      delivery_pincode,
      total_amount
    } = req.body;

    // Get buyer ID
    const [buyers] = await connection.execute(
      'SELECT id FROM buyers WHERE user_id = ?',
      [req.user.id]
    );

    if (buyers.length === 0) {
      throw new Error('Buyer profile not found');
    }

    const buyerId = buyers[0].id;

    const orderIds = [];
    const orderNumbers = [];

    // Process each item in the cart
    for (const item of items) {
      // Get product details
      const [products] = await connection.execute(
        'SELECT p.*, f.id as farmer_id FROM products p JOIN farmers f ON p.farmer_id = f.id WHERE p.id = ?',
        [item.product_id]
      );

      if (products.length === 0) {
        throw new Error(`Product with ID ${item.product_id} not found`);
      }

      const product = products[0];

      // Check stock
      if (product.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      // Calculate amounts
      const unitPrice = parseFloat(product.price);
      const totalAmount = unitPrice * item.quantity;
      const commissionRate = 5.00; // 5% commission
      const commissionAmount = totalAmount * (commissionRate / 100);

      const orderNumber = generateOrderNumber();

      // Create order
      const [orderResult] = await connection.execute(`
        INSERT INTO orders (order_number, buyer_id, farmer_id, product_id, quantity, unit_price, 
                           total_amount, commission_rate, commission_amount, delivery_address, 
                           delivery_city, delivery_state, delivery_pincode, payment_method, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        orderNumber,
        buyerId,
        product.farmer_id,
        item.product_id,
        item.quantity,
        unitPrice,
        totalAmount,
        commissionRate,
        commissionAmount,
        delivery_address,
        delivery_city,
        delivery_state,
        delivery_pincode,
        'cod', // Default to Cash on Delivery
        'placed' // Initial status
      ]);

      // Update product stock
      await connection.execute(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );

      orderIds.push(orderResult.insertId);
      orderNumbers.push(orderNumber);
    }

    await connection.commit();

    res.status(201).json({
      message: 'Orders placed successfully',
      orderIds,
      orderNumbers,
      totalAmount: total_amount
    });

  } catch (error) {
    await connection.rollback();
    console.error('Create order error:', error);
    res.status(500).json({ error: error.message || 'Failed to create order' });
  } finally {
    connection.release();
  }
});

// Get buyer's orders
router.get('/buyer/my-orders', authenticateToken, authorize(['buyer']), async (req, res) => {
  try {
    const [buyers] = await pool.execute(
      'SELECT id FROM buyers WHERE user_id = ?',
      [req.user.id]
    );

    if (buyers.length === 0) {
      return res.status(404).json({ error: 'Buyer profile not found' });
    }

    const [orders] = await pool.execute(`
      SELECT o.*, p.name as product_name, p.unit, u.name as farmer_name
      FROM orders o
      JOIN products p ON o.product_id = p.id
      JOIN farmers f ON o.farmer_id = f.id
      JOIN users u ON f.user_id = u.id
      WHERE o.buyer_id = ?
      ORDER BY o.created_at DESC
    `, [buyers[0].id]);

    res.json(orders);
  } catch (error) {
    console.error('Get buyer orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get farmer's orders
router.get('/farmer/my-orders', authenticateToken, authorize(['farmer']), async (req, res) => {
  try {
    const [farmers] = await pool.execute(
      'SELECT id FROM farmers WHERE user_id = ?',
      [req.user.id]
    );

    if (farmers.length === 0) {
      return res.status(404).json({ error: 'Farmer profile not found' });
    }

    const [orders] = await pool.execute(`
      SELECT o.*, p.name as product_name, p.unit, u.name as buyer_name
      FROM orders o
      JOIN products p ON o.product_id = p.id
      JOIN buyers b ON o.buyer_id = b.id
      JOIN users u ON b.user_id = u.id
      WHERE o.farmer_id = ?
      ORDER BY o.created_at DESC
    `, [farmers[0].id]);

    res.json(orders);
  } catch (error) {
    console.error('Get farmer orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order status updates (for real-time tracking)
router.get('/:orderId/status', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const [orders] = await pool.execute(`
      SELECT o.*, p.name as product_name, f.pickup_address, f.city as farmer_city, f.state as farmer_state,
             l.status as logistics_status, l.tracking_number, l.courier_name, l.estimated_delivery
      FROM orders o 
      JOIN products p ON o.product_id = p.id 
      JOIN farmers f ON o.farmer_id = f.id 
      LEFT JOIN logistics l ON o.id = l.order_id 
      WHERE o.id = ?
    `, [orderId]);

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[0];
    
    // Get order timeline
    const timeline = [];
    
    // Order placed
    timeline.push({
      status: 'placed',
      title: 'Order Placed',
      description: 'Your order has been placed successfully',
      timestamp: order.created_at,
      icon: '📋'
    });

    // If farmer has accepted
    if (order.status === 'accepted' || order.status === 'shipped' || order.status === 'delivered') {
      timeline.push({
        status: 'accepted',
        title: 'Order Accepted',
        description: 'Farmer has confirmed your order',
        timestamp: order.updated_at,
        icon: '✅'
      });
    }

    // If logistics is involved
    if (order.logistics_status) {
      if (order.logistics_status === 'picked') {
        timeline.push({
          status: 'logistics',
          title: 'Order Picked Up',
          description: `Order picked up by ${order.courier_name || 'logistics team'}`,
          timestamp: order.updated_at,
          icon: '📦'
        });
      } else if (order.logistics_status === 'in_transit') {
        timeline.push({
          status: 'logistics',
          title: 'In Transit',
          description: `Order is on the way to you via ${order.courier_name || 'logistics team'}`,
          timestamp: order.updated_at,
          icon: '🚚'
        });
      } else if (order.logistics_status === 'out_for_delivery') {
        timeline.push({
          status: 'logistics',
          title: 'Out for Delivery',
          description: `Order is out for delivery via ${order.courier_name || 'logistics team'}`,
          timestamp: order.updated_at,
          icon: '🚛'
        });
      } else if (order.logistics_status === 'delivered') {
        timeline.push({
          status: 'delivered',
          title: 'Delivered',
          description: `Order delivered successfully via ${order.courier_name || 'logistics team'}`,
          timestamp: order.updated_at,
          icon: '🎉'
        });
      } else if (order.logistics_status === 'failed') {
        timeline.push({
          status: 'failed',
          title: 'Delivery Failed',
          description: `Delivery attempt failed. Please contact logistics team.`,
          timestamp: order.updated_at,
          icon: '❌'
        });
      } else if (order.logistics_status === 'returned') {
        timeline.push({
          status: 'returned',
          title: 'Order Returned',
          description: `Order was returned. Please contact logistics team.`,
          timestamp: order.updated_at,
          icon: '↩️'
        });
      }
    }

    // If delivered (fallback for orders without logistics)
    if (order.status === 'delivered' && !order.logistics_status) {
      timeline.push({
        status: 'delivered',
        title: 'Delivered',
        description: 'Your order has been delivered successfully',
        timestamp: order.updated_at,
        icon: '🎉'
      });
    }

    res.json({
      order,
      timeline,
      currentStatus: order.status,
      logisticsStatus: order.logistics_status
    });

  } catch (error) {
    console.error('Get order status error:', error);
    res.status(500).json({ error: 'Failed to get order status' });
  }
});

// Update order status (for farmers and logistics)
router.patch('/:orderId/status', authenticateToken, authorize(['farmer', 'logistics', 'admin']), async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, notes } = req.body;
    
    // Validate status
    const validStatuses = ['placed', 'accepted', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Update order status
    await pool.execute(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, orderId]
    );

    // If logistics status is being updated
    if (req.user.role === 'logistics' && ['shipped', 'delivered'].includes(status)) {
      await pool.execute(
        'UPDATE logistics SET status = ?, updated_at = NOW() WHERE order_id = ?',
        [status, orderId]
      );
    }

    res.json({ 
      message: 'Order status updated successfully',
      status,
      orderId
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Update order status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    // Check if user has permission to update this order
    const [orders] = await pool.execute(`
      SELECT o.*, p.farmer_id, b.user_id as buyer_user_id
      FROM orders o
      JOIN products p ON o.product_id = p.id
      JOIN buyers b ON o.buyer_id = b.id
      WHERE o.id = ?
    `, [orderId]);

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[0];
    const canUpdate = 
      (req.user.role === 'farmer' && order.farmer_id === req.user.id) ||
      (req.user.role === 'buyer' && order.buyer_user_id === req.user.id) ||
      req.user.role === 'admin';

    if (!canUpdate) {
      return res.status(403).json({ error: 'Not authorized to update this order' });
    }

    await pool.execute(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, orderId]
    );

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;