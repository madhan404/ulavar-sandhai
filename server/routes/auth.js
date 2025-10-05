const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const router = express.Router();

// Utility function to ensure buyer accounts are active
const ensureBuyerActive = async (userId) => {
  try {
    const [result] = await pool.execute(
      'UPDATE users SET status = ? WHERE id = ? AND role = ? AND status != ?',
      ['active', userId, 'buyer', 'active']
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error ensuring buyer active:', error);
    return false;
  }
};

// Debug endpoint to check user status
router.get('/debug/user/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    const [users] = await pool.execute(
      'SELECT id, name, email, phone, role, status, created_at FROM users WHERE phone = ? OR email = ?',
      [identifier, identifier]
    );

    if (users.length === 0) {
      return res.json({ found: false, message: 'User not found' });
    }

    const user = users[0];
    
    // Get role-specific info
    let profileInfo = {};
    if (user.role === 'farmer') {
      const [farmers] = await pool.execute('SELECT kyc_status, rejection_reason FROM farmers WHERE user_id = ?', [user.id]);
      profileInfo = farmers[0] || {};
    } else if (user.role === 'buyer') {
      const [buyers] = await pool.execute('SELECT id FROM buyers WHERE user_id = ?', [user.id]);
      profileInfo = buyers[0] || {};
    }

    res.json({
      found: true,
      user: {
        ...user,
        profile: profileInfo
      }
    });

  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    console.log('Registration request:', { name, email, phone, role }); // Debug log

    if (!name || !phone || !password || !role) {
      return res.status(400).json({ error: 'Name, phone, password, and role are required' });
    }

    if (!['buyer', 'farmer'].includes(role)) {
      return res.status(400).json({ error: 'Role must be buyer or farmer' });
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE phone = ? OR (email IS NOT NULL AND email = ?)',
      [phone, email || '']
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists with this phone or email' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Set status based on role - buyers are active immediately, farmers need approval
    const userStatus = role === 'buyer' ? 'active' : 'pending';

    // Create user
    const [userResult] = await pool.execute(
      'INSERT INTO users (name, email, phone, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email || null, phone, passwordHash, role, userStatus]
    );

    const userId = userResult.insertId;

    // Create role-specific profile
    if (role === 'farmer') {
      await pool.execute(
        'INSERT INTO farmers (user_id) VALUES (?)',
        [userId]
      );
    } else if (role === 'buyer') {
      await pool.execute(
        'INSERT INTO buyers (user_id) VALUES (?)',
        [userId]
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId, role, name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('User registered successfully:', { userId, role, name, status: userStatus }); // Debug log

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: { id: userId, name, email, phone, role, status: userStatus },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    console.log('Login request:', { identifier }); // Debug log

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Identifier and password are required' });
    }

    // Find user by email or phone
    const [users] = await pool.execute(
      'SELECT id, name, email, phone, password_hash, role, status FROM users WHERE phone = ? OR email = ?',
      [identifier, identifier]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    console.log('User found:', { id: user.id, role: user.role, status: user.status }); // Debug log

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check status based on role
    if (user.role === 'farmer') {
      // Check if farmer is rejected
      if (user.status === 'rejected') {
        // Get rejection reason
        const [farmers] = await pool.execute(
          'SELECT rejection_reason FROM farmers WHERE user_id = ?',
          [user.id]
        );
        
        const rejectionReason = farmers[0]?.rejection_reason || 'No reason provided';
        
        return res.status(401).json({ 
          error: 'Your farmer account has been rejected.',
          rejectionReason,
          farmerId: user.id,
          canReRegister: true
        });
      }
      
      // Farmers need to be approved to login
      if (user.status !== 'active') {
        return res.status(401).json({ error: 'Your farmer account is pending approval. Please wait for admin approval.' });
      }
      
      // Check KYC status
      const [farmers] = await pool.execute(
        'SELECT kyc_status FROM farmers WHERE user_id = ?',
        [user.id]
      );
      
      if (farmers.length > 0) {
        const farmer = farmers[0];
        if (farmer.kyc_status === 'rejected') {
          return res.status(401).json({ error: 'Your farmer account has been rejected.' });
        }
      }
    } else if (user.role === 'buyer') {
      // Buyers can login immediately after registration
      if (user.status !== 'active') {
        // Auto-activate buyer if somehow not active
        await ensureBuyerActive(user.id);
        user.status = 'active';
        console.log('Buyer account auto-activated:', user.id);
      }
    } else if (user.role === 'admin' || user.role === 'logistics') {
      // Admin and logistics users can always login
      if (user.status !== 'active') {
        return res.status(401).json({ error: 'Your account is not active. Please contact administrator.' });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful:', { userId: user.id, role: user.role, status: user.status }); // Debug log

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Request OTP
router.post('/request-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    // Store OTP in database
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await pool.execute(
      'INSERT INTO otps (phone, otp_hash, expires_at) VALUES (?, ?, ?)',
      [phone, otpHash, expiresAt]
    );

    // In development, log OTP to console
    console.log(`OTP for ${phone}: ${otp}`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      // In production, remove this line
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });

  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required' });
    }

    // Find valid OTP
    const [otps] = await pool.execute(
      'SELECT otp_hash, expires_at FROM otps WHERE phone = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [phone]
    );

    if (otps.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const otpRecord = otps[0];

    // Verify OTP
    const isValidOtp = await bcrypt.compare(otp, otpRecord.otp_hash);
    if (!isValidOtp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Find or create user
    let [users] = await pool.execute(
      'SELECT id, name, email, phone, role, status FROM users WHERE phone = ?',
      [phone]
    );

    let user;
    if (users.length === 0) {
      // Create new user with OTP
      const [userResult] = await pool.execute(
        'INSERT INTO users (name, phone, role, status) VALUES (?, ?, ?, ?)',
        [`User_${phone.slice(-4)}`, phone, 'buyer', 'active']
      );

      const userId = userResult.insertId;
      
      // Create buyer profile
      await pool.execute(
        'INSERT INTO buyers (user_id) VALUES (?)',
        [userId]
      );

      user = {
        id: userId,
        name: `User_${phone.slice(-4)}`,
        phone,
        role: 'buyer',
        status: 'active'
      };
    } else {
      user = users[0];
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Delete used OTP
    await pool.execute('DELETE FROM otps WHERE phone = ?', [phone]);

    res.json({
      success: true,
      message: 'OTP verified successfully',
      user,
      token
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

module.exports = router;
