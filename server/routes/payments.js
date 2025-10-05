const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, authorize } = require('../middleware/auth');
const router = express.Router();

// Stub Razorpay order creation (replace with real SDK integration)
router.post('/create-order', authenticateToken, authorize(['buyer']), async (req, res) => {
  try {
    const { order_id } = req.body; // our internal order ID
    const [rows] = await pool.execute('SELECT total_amount FROM orders WHERE id = ?', [order_id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    const amount = Math.round(parseFloat(rows[0].total_amount) * 100); // paise

    // TODO: Use Razorpay SDK to create order; returning stub for development
    const razorpayOrder = {
      id: 'razor_order_stub_' + order_id,
      amount,
      currency: 'INR',
    };
    res.json({ order: razorpayOrder });
  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// Webhook stub for payment success
router.post('/webhook', async (req, res) => {
  try {
    // TODO: verify signature from Razorpay
    const { razorpay_payment_id, razorpay_order_id, status, order_id, user_id, amount } = req.body;
    await pool.execute(
      `INSERT INTO payments (order_id, user_id, amount, payment_method, transaction_id, razorpay_payment_id, razorpay_order_id, status)
       VALUES (?,?,?,?,?,?,?,?)`,
      [order_id, user_id, amount / 100, 'online', razorpay_payment_id, razorpay_payment_id, razorpay_order_id, status || 'success']
    );
    if (status === 'success') {
      await pool.execute('UPDATE orders SET payment_status = "paid" WHERE id = ?', [order_id]);
    }
    res.json({ received: true });
  } catch (error) {
    console.error('Payments webhook error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

module.exports = router;


