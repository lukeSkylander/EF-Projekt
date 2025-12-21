import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// GET all categories
router.get('/', async (req, res) => {
  try {
    const categories = await db.any(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
      WHERE c.is_active = true
      GROUP BY c.id
      ORDER BY c.name
    `);

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single category with products
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    const category = await db.oneOrNone(
      'SELECT * FROM categories WHERE id = $1 AND is_active = true',
      [id]
    );

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const products = await db.any(`
      SELECT p.*, pi.image_url, pi.alt_text
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      WHERE p.category_id = $1 AND p.is_active = true
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `, [id, limit, offset]);

    const totalCount = await db.one(
      'SELECT COUNT(*) FROM products WHERE category_id = $1 AND is_active = true',
      [id]
    );

    res.json({
      category,
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(totalCount.count),
        pages: Math.ceil(totalCount.count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
