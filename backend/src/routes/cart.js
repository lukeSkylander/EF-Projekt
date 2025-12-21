import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Get or create cart for user/session
async function getOrCreateCart(userId, sessionId) {
  try {
    let cart;
    if (userId) {
      cart = await db.oneOrNone('SELECT * FROM carts WHERE user_id = $1', [userId]);
      if (!cart) {
        cart = await db.one(
          'INSERT INTO carts (user_id) VALUES ($1) RETURNING *',
          [userId]
        );
      }
    } else {
      cart = await db.oneOrNone('SELECT * FROM carts WHERE session_id = $1', [sessionId]);
      if (!cart) {
        cart = await db.one(
          'INSERT INTO carts (session_id) VALUES ($1) RETURNING *',
          [sessionId]
        );
      }
    }
    return cart;
  } catch (error) {
    throw error;
  }
}

// GET cart items
router.get('/', async (req, res) => {
  try {
    const { userId, sessionId } = req.query;

    if (!userId && !sessionId) {
      return res.status(400).json({ error: 'User ID or session ID required' });
    }

    const cart = await getOrCreateCart(userId, sessionId);

    const items = await db.any(`
      SELECT ci.*, p.name, p.price, p.inventory_quantity as stock,
             pi.image_url, pi.alt_text
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      WHERE ci.cart_id = $1
      ORDER BY ci.created_at DESC
    `, [cart.id]);

    const total = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

    res.json({
      cart: { ...cart, items, total: total.toFixed(2) }
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ADD item to cart
router.post('/add', async (req, res) => {
  try {
    const { userId, sessionId, productId, quantity = 1 } = req.body;

    if (!userId && !sessionId) {
      return res.status(400).json({ error: 'User ID or session ID required' });
    }

    if (!productId) {
      return res.status(400).json({ error: 'Product ID required' });
    }

    // Check if product exists and has enough stock
    const product = await db.oneOrNone(
      'SELECT * FROM products WHERE id = $1 AND is_active = true',
      [productId]
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.track_inventory && product.inventory_quantity < quantity) {
      return res.status(400).json({ error: 'Not enough stock available' });
    }

    const cart = await getOrCreateCart(userId, sessionId);

    // Check if item already exists in cart
    const existingItem = await db.oneOrNone(
      'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cart.id, productId]
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (product.track_inventory && product.inventory_quantity < newQuantity) {
        return res.status(400).json({ error: 'Not enough stock available' });
      }

      await db.none(
        'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newQuantity, existingItem.id]
      );
    } else {
      await db.none(
        'INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [cart.id, productId, quantity, product.price]
      );
    }

    res.json({ message: 'Item added to cart successfully' });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE cart item quantity
router.put('/update/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    // Get cart item with product info
    const cartItem = await db.oneOrNone(`
      SELECT ci.*, p.inventory_quantity, p.track_inventory
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.id = $1
    `, [itemId]);

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (cartItem.track_inventory && cartItem.inventory_quantity < quantity) {
      return res.status(400).json({ error: 'Not enough stock available' });
    }

    await db.none(
      'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [quantity, itemId]
    );

    res.json({ message: 'Cart item updated successfully' });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// REMOVE item from cart
router.delete('/remove/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;

    const result = await db.result('DELETE FROM cart_items WHERE id = $1', [itemId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CLEAR entire cart
router.delete('/clear', async (req, res) => {
  try {
    const { userId, sessionId } = req.query;

    if (!userId && !sessionId) {
      return res.status(400).json({ error: 'User ID or session ID required' });
    }

    const cart = await getOrCreateCart(userId, sessionId);
    await db.none('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

