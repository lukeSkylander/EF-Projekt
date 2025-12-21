import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Generate unique order number
function generateOrderNumber() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp.slice(-6)}${random}`;
}

// CREATE ORDER
router.post('/create', async (req, res) => {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const {
      userId,
      sessionId,
      email,
      phone,
      shippingAddress,
      billingAddress,
      items
    } = req.body;

    if (!email || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let subtotal = 0;
    const orderItems = [];

    // Validate items and calculate totals
    for (const item of items) {
      const product = await client.oneOrNone(
        'SELECT * FROM products WHERE id = $1 AND is_active = true',
        [item.productId]
      );

      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (product.track_inventory && product.inventory_quantity < item.quantity) {
        throw new Error(`Not enough stock for ${product.name}`);
      }

      const itemTotal = parseFloat(product.price) * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal
      });
    }

    const taxAmount = subtotal * 0.08; // 8% tax
    const shippingAmount = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
    const totalAmount = subtotal + taxAmount + shippingAmount;

    // Create order
    const orderNumber = generateOrderNumber();
    const order = await client.one(`
      INSERT INTO orders (
        user_id, order_number, email, phone, status, financial_status,
        fulfillment_status, subtotal, tax_amount, shipping_amount,
        total_amount, shipping_address, billing_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      userId || null,
      orderNumber,
      email,
      phone || null,
      'confirmed',
      'pending',
      'unfulfilled',
      subtotal.toFixed(2),
      taxAmount.toFixed(2),
      shippingAmount.toFixed(2),
      totalAmount.toFixed(2),
      JSON.stringify(shippingAddress),
      JSON.stringify(billingAddress)
    ]);

    // Create order items and update inventory
    for (const item of orderItems) {
      await client.none(`
        INSERT INTO order_items (
          order_id, product_id, product_name, product_sku,
          quantity, price, total
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        order.id,
        item.productId,
        item.productName,
        item.productSku,
        item.quantity,
        item.price,
        item.total.toFixed(2)
      ]);

      // Update inventory if tracking is enabled
      await client.none(`
        UPDATE products
        SET inventory_quantity = inventory_quantity - $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND track_inventory = true
      `, [item.quantity, item.productId]);
    }

    // Clear cart if user/session provided
    if (userId) {
      await client.none(`
        DELETE FROM cart_items
        WHERE cart_id = (SELECT id FROM carts WHERE user_id = $1)
      `, [userId]);
    } else if (sessionId) {
      await client.none(`
        DELETE FROM cart_items
        WHERE cart_id = (SELECT id FROM carts WHERE session_id = $1)
      `, [sessionId]);
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order.id,
        orderNumber: order.order_number,
        total: order.total_amount,
        status: order.status
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  } finally {
    client.release();
  }
});

// GET orders (with optional user filtering)
router.get('/', async (req, res) => {
  try {
    const { userId, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM orders';
    const params = [];

    if (userId) {
      query += ' WHERE user_id = $1';
      params.push(userId);
      query += ' ORDER BY created_at DESC LIMIT $2 OFFSET $3';
      params.push(limit, offset);
    } else {
      query += ' ORDER BY created_at DESC LIMIT $1 OFFSET $2';
      params.push(limit, offset);
    }

    const orders = await db.any(query, params);

    res.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single order by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const order = await db.oneOrNone('SELECT * FROM orders WHERE id = $1', [id]);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const orderItems = await db.any(`
      SELECT * FROM order_items WHERE order_id = $1 ORDER BY id
    `, [id]);

    res.json({
      ...order,
      items: orderItems
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE order status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, financialStatus, fulfillmentStatus } = req.body;

    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (status) {
      updates.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (financialStatus) {
      updates.push(`financial_status = $${paramIndex}`);
      params.push(financialStatus);
      paramIndex++;
    }

    if (fulfillmentStatus) {
      updates.push(`fulfillment_status = $${paramIndex}`);
      params.push(fulfillmentStatus);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No status updates provided' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const result = await db.result(`
      UPDATE orders SET ${updates.join(', ')} WHERE id = $${paramIndex}
    `, params);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

