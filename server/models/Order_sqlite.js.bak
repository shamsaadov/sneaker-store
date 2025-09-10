const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Order {
  constructor(data) {
    this.id = data.id;
    this.order_number = data.order_number;
    this.customer_name = data.customer_name;
    this.customer_phone = data.customer_phone;
    this.shipping_address = data.shipping_address;
    this.payment_method = data.payment_method;
    this.items = typeof data.items === 'string' ? JSON.parse(data.items || '[]') : (data.items || []);
    this.subtotal = data.subtotal;
    this.shipping_cost = data.shipping_cost || 0;
    this.tax = data.tax || 0;
    this.total = data.total;
    this.status = data.status || 'pending';
    this.notes = data.notes;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Get all orders with optional filters
  static async findAll(filters = {}) {
    let sql = `
      SELECT *
      FROM orders
      WHERE 1=1
    `;
    const params = [];

    // Status filter
    if (filters.status) {
      sql += ` AND status = ?`;
      params.push(filters.status);
    }

    // Date range filter
    if (filters.start_date) {
      sql += ` AND created_at >= ?`;
      params.push(filters.start_date);
    }
    if (filters.end_date) {
      sql += ` AND created_at <= ?`;
      params.push(filters.end_date);
    }

    // Search filter
    if (filters.search) {
      sql += ` AND (customer_name LIKE ? OR order_number LIKE ?)`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Sorting
    if (filters.sort_by) {
      const sortOrder = filters.sort_order === 'desc' ? 'DESC' : 'ASC';
      switch (filters.sort_by) {
        case 'created_at':
          sql += ` ORDER BY created_at ${sortOrder}`;
          break;
        case 'total':
          sql += ` ORDER BY total ${sortOrder}`;
          break;
        case 'status':
          sql += ` ORDER BY status ${sortOrder}`;
          break;
        default:
          sql += ` ORDER BY created_at DESC`;
          break;
      }
    } else {
      sql += ` ORDER BY created_at DESC`;
    }

    // Pagination
    if (filters.limit) {
      sql += ` LIMIT ?`;
      params.push(filters.limit);

      if (filters.offset) {
        sql += ` OFFSET ?`;
        params.push(filters.offset);
      }
    }

    const result = await db.query(sql, params);
    return result.rows.map(row => new Order(row));
  }

  // Get order by ID
  static async findById(id) {
    const sql = `SELECT * FROM orders WHERE id = ?`;
    const row = await db.get(sql, [id]);
    return row ? new Order(row) : null;
  }

  // Get order by order number
  static async findByOrderNumber(orderNumber) {
    const sql = `SELECT * FROM orders WHERE order_number = ?`;
    const row = await db.get(sql, [orderNumber]);
    return row ? new Order(row) : null;
  }

  // Create new order
  static async create(orderData) {
    const id = uuidv4();

    // Generate order number
    const orderNumber = await Order.generateOrderNumber();

    const sql = `
      INSERT INTO orders (
        id, order_number, customer_name, customer_phone,
        shipping_address, payment_method, items, subtotal, shipping_cost,
        tax, total, status, notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      id,
      orderNumber,
      orderData.customer_name,
      orderData.customer_phone || '',
      orderData.shipping_address || '',
      orderData.payment_method || 'cash',
      JSON.stringify(orderData.items || []),
      orderData.subtotal || 0,
      orderData.shipping_cost || 0,
      orderData.tax || 0,
      orderData.total || 0,
      'pending',
      orderData.notes || ''
    ];

    await db.query(sql, params);
    return Order.findById(id);
  }

  // Generate unique order number
  static async generateOrderNumber() {
    const prefix = 'ORD';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

  // Update order
  async update(updateData) {
    const fields = [];
    const params = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'id') {
        if (key === 'items') {
          fields.push(`${key} = ?`);
          params.push(JSON.stringify(updateData[key]));
        } else {
          fields.push(`${key} = ?`);
          params.push(updateData[key]);
        }
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    // Add updated_at
    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(this.id);

    const sql = `
      UPDATE orders
      SET ${fields.join(', ')}
      WHERE id = ?
    `;

    await db.query(sql, params);
    return Order.findById(this.id);
  }

  // Update order status
  async updateStatus(newStatus, notes = '') {
    const sql = `
      UPDATE orders
      SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await db.query(sql, [newStatus, notes, this.id]);
    return Order.findById(this.id);
  }

  // Delete order
  async delete() {
    const sql = 'DELETE FROM orders WHERE id = ?';
    const result = await db.query(sql, [this.id]);
    return result.changes > 0;
  }



  // Get order statistics
  static async getStatistics() {
    const stats = {};

    // Total orders
    const totalResult = await db.get('SELECT COUNT(*) as total FROM orders');
    stats.total = totalResult.total;

    // Orders by status
    const statusResult = await db.query(`
      SELECT status, COUNT(*) as count
      FROM orders
      GROUP BY status
    `);
    stats.by_status = statusResult.rows.reduce((acc, row) => {
      acc[row.status] = row.count;
      return acc;
    }, {});

    // Total revenue
    const revenueResult = await db.get(`
      SELECT SUM(total) as total_revenue
      FROM orders
      WHERE status NOT IN ('cancelled', 'refunded')
    `);
    stats.total_revenue = revenueResult.total_revenue || 0;

    // Monthly statistics for the last 6 months
    const monthlyResult = await db.query(`
      SELECT
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as order_count,
        SUM(total) as revenue
      FROM orders
      WHERE created_at >= date('now', '-6 months')
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month DESC
    `);
    stats.monthly = monthlyResult.rows;

    // Average order value
    const avgResult = await db.get(`
      SELECT AVG(total) as avg_order_value
      FROM orders
      WHERE status NOT IN ('cancelled', 'refunded')
    `);
    stats.average_order_value = avgResult.avg_order_value || 0;

    // Today's orders
    const todayResult = await db.get(`
      SELECT COUNT(*) as today_orders, COALESCE(SUM(total), 0) as today_revenue
      FROM orders
      WHERE date(created_at) = date('now')
    `);
    stats.today = {
      orders: todayResult.today_orders || 0,
      revenue: todayResult.today_revenue || 0
    };

    return stats;
  }

  // Get recent orders
  static async getRecent(limit = 10) {
    const sql = `
      SELECT * FROM orders
      ORDER BY created_at DESC
      LIMIT ?
    `;
    const result = await db.query(sql, [limit]);
    return result.rows.map(row => new Order(row));
  }

  // Get pending orders
  static async getPending() {
    const sql = `
      SELECT * FROM orders
      WHERE status = 'pending'
      ORDER BY created_at ASC
    `;
    const result = await db.query(sql);
    return result.rows.map(row => new Order(row));
  }

  // Calculate totals for an order
  static calculateTotals(items, shippingCost = 0, taxRate = 0) {
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    const shipping = shippingCost;
    const tax = subtotal * taxRate;
    const total = subtotal + shipping + tax;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      shipping_cost: parseFloat(shipping.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    };
  }

  // Format for API response
  toJSON() {
    return {
      id: this.id,
      order_number: this.order_number,
      customer_name: this.customer_name,
      customer_phone: this.customer_phone,
      shipping_address: this.shipping_address,
      payment_method: this.payment_method,
      items: this.items,
      subtotal: parseFloat(this.subtotal) || 0,
      shipping_cost: parseFloat(this.shipping_cost) || 0,
      tax: parseFloat(this.tax) || 0,
      total: parseFloat(this.total) || 0,
      status: this.status,
      notes: this.notes,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Order;
