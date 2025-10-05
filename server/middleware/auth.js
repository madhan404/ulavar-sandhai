const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Auth middleware - Headers:', req.headers);
  console.log('Auth middleware - Token:', token ? 'Present' : 'Missing');

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware - Decoded token:', decoded);
    
    // Get user details from database
    const [users] = await pool.execute(
      'SELECT id, name, email, phone, role, status FROM users WHERE id = ?',
      [decoded.userId]
    );

    console.log('Auth middleware - Users found:', users);

    if (users.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (users[0].status !== 'active') {
      return res.status(401).json({ error: 'Account not active' });
    }

    req.user = users[0];
    console.log('Auth middleware - User set:', req.user);
    next();
  } catch (error) {
    console.error('Auth middleware - Error:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

const authorize = (roles) => {
  return (req, res, next) => {
    console.log('Authorize middleware - Required roles:', roles);
    console.log('Authorize middleware - User role:', req.user?.role);
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

module.exports = { authenticateToken, authorize };