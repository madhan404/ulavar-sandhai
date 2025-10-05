const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorize } = require('../middleware/auth');
const router = express.Router();

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const { category, search, limit = 20, offset = 0 } = req.query;
    
    console.log('Products route: Starting query with params:', { category, search, limit, offset });
    
    let query = `
      SELECT p.*, c.name as category_name, c.name_hindi as category_name_hindi,
             u.name as farmer_name, u.phone as farmer_phone, u.email as farmer_email,
             f.city as farmer_city, f.state as farmer_state, f.pickup_address
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN farmers f ON p.farmer_id = f.id
      JOIN users u ON f.user_id = u.id
      WHERE p.status = 'active' AND u.status = 'active'
    `;
    
    const params = [];
    
    if (category) {
      query += ' AND c.id = ?';
      params.push(category);
    }
    
    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    const limitNum = parseInt(limit) || 20;
    const offsetNum = parseInt(offset) || 0;
    
    // Use a different approach to avoid MySQL2 parameter binding issues
    const finalQuery = query.replace('LIMIT ? OFFSET ?', `LIMIT ${limitNum} OFFSET ${offsetNum}`);
    
    console.log('Products route: Executing query:', finalQuery);
    console.log('Products route: With params:', params);
    console.log('Products route: Limit type:', typeof limitNum, 'Offset type:', typeof offsetNum);

    const [products] = await pool.execute(finalQuery, params);

    console.log('Products route: Query result count:', products.length);

    // Parse JSON fields
    const processedProducts = products.map(product => {
      try {
        console.log('Products route: Processing product:', product.id, 'Raw images:', product.images, 'Type:', typeof product.images);
        
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
        
        console.log('Products route: Parsed images for product:', product.id, parsedImages);
        
        return {
          ...product,
          images: parsedImages
        };
      } catch (parseError) {
        console.error('Products route: JSON parse error for product:', product.id, parseError);
        return {
          ...product,
          images: []
        };
      }
    });

    console.log('Products route: Sending response with', processedProducts.length, 'products');
    res.json(processedProducts);
  } catch (error) {
    console.error('Get products error:', error);
    console.error('Get products error stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch products', details: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const [products] = await pool.execute(`
      SELECT p.*, c.name as category_name, c.name_hindi as category_name_hindi,
             u.name as farmer_name, u.phone as farmer_phone, u.email as farmer_email,
             f.city as farmer_city, f.state as farmer_state, f.pickup_address
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN farmers f ON p.farmer_id = f.id
      JOIN users u ON f.user_id = u.id
      WHERE p.id = ? AND p.status = 'active'
    `, [req.params.id]);

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = products[0];
    
    // Safe JSON parsing for images
    try {
      let parsedImages = [];
      if (product.images && product.images !== null && product.images !== '') {
        if (Array.isArray(product.images)) {
          parsedImages = product.images;
        } else {
          parsedImages = JSON.parse(product.images);
        }
      }
      product.images = parsedImages;
    } catch (parseError) {
      console.error('Single product: JSON parse error for images:', parseError);
      product.images = [];
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product (farmers only)
router.post('/', authenticateToken, authorize(['farmer']), async (req, res) => {
  try {
    const {
      category_id,
      name,
      name_hindi,
      description,
      price,
      unit,
      stock_quantity,
      min_order_quantity,
      harvest_date,
      expiry_date,
      images
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

    const [result] = await pool.execute(`
      INSERT INTO products (farmer_id, category_id, name, name_hindi, description, price, unit, 
                           stock_quantity, min_order_quantity, harvest_date, expiry_date, images)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      farmerId,
      category_id,
      name,
      name_hindi || null,
      description,
      price,
      unit,
      stock_quantity,
      min_order_quantity || 1,
      harvest_date || null,
      expiry_date || null,
      images ? JSON.stringify(images) : null
    ]);

    res.status(201).json({
      message: 'Product created successfully',
      productId: result.insertId
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Get farmer's products
router.get('/farmer/my-products', authenticateToken, authorize(['farmer']), async (req, res) => {
  try {
    console.log('Farmer products: User ID:', req.user.id, 'Role:', req.user.role);
    
    const [farmers] = await pool.execute(
      'SELECT id FROM farmers WHERE user_id = ?',
      [req.user.id]
    );

    console.log('Farmer products: Found farmers:', farmers.length);

    if (farmers.length === 0) {
      return res.status(404).json({ error: 'Farmer profile not found' });
    }

    const farmerId = farmers[0].id;
    console.log('Farmer products: Using farmer ID:', farmerId);

    const [products] = await pool.execute(`
      SELECT p.*, c.name as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.farmer_id = ?
      ORDER BY p.created_at DESC
    `, [farmerId]);

    console.log('Farmer products: Raw products count:', products.length);

    const processedProducts = products.map(product => {
      try {
        return {
          ...product,
          images: product.images ? JSON.parse(product.images) : []
        };
      } catch (parseError) {
        console.error('Farmer products: JSON parse error for product:', product.id, parseError);
        return {
          ...product,
          images: []
        };
      }
    });

    console.log('Farmer products: Processed products count:', processedProducts.length);
    res.json(processedProducts);
  } catch (error) {
    console.error('Get farmer products error:', error);
    console.error('Get farmer products error stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch products', details: error.message });
  }
});

module.exports = router;