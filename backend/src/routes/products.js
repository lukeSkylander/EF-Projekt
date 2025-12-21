import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Get all products with optional filtering
router.get('/', async (req, res) => {
  try {
    const { category, featured, search, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, c.name as category_name,
             pi.image_url, pi.alt_text
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      WHERE p.is_active = true
    `;

    const params = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND c.name ILIKE $${paramIndex}`;
      params.push(`%${category}%`);
      paramIndex++;
    }

    if (featured === 'true') {
      query += ` AND p.featured = true`;
    }

    if (search) {
      query += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const products = await db.any(query, params);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = true`;
    const countParams = [];
    let countParamIndex = 1;

    if (category) {
      countQuery += ` AND c.name ILIKE $${countParamIndex}`;
      countParams.push(`%${category}%`);
      countParamIndex++;
    }

    if (featured === 'true') {
      countQuery += ` AND p.featured = true`;
    }

    if (search) {
      countQuery += ` AND (p.name ILIKE $${countParamIndex} OR p.description ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
    }

    const totalCount = await db.one(countQuery, countParams);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(totalCount.count),
        pages: Math.ceil(totalCount.count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await db.oneOrNone(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1 AND p.is_active = true
    `, [id]);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get all images for this product
    const images = await db.any(`
      SELECT * FROM product_images
      WHERE product_id = $1
      ORDER BY position, id
    `, [id]);

    product.images = images;

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get featured products
router.get('/featured/list', async (req, res) => {
  try {
    const products = await db.any(`
      SELECT p.*, c.name as category_name,
             pi.image_url, pi.alt_text
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      WHERE p.is_active = true AND p.featured = true
      ORDER BY p.created_at DESC
      LIMIT 6
    `);

    res.json(products);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

