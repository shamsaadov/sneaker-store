const db = require('../config/database');

class Order {
  constructor(data) {
    this.id = data.id;
    this.order_number = data.order_number;
    this.customer_name = data.customer_name;
    this.customer_phone = data.customer_phone;
    this.shipping_address = data.shipping_address;
    this.payment_method = data.payment_method;
    // PostgreSQL JSONB fields are automatically parsed
    this.items = Array.isArray(data.items) ? data.items : (data.items || []);
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
    let paramIndex = 1;

    // Status filter
    if (filters.status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(filters.status);
    }

    // Date range filter
    if (filters.start_date) {
      sql += ` AND created_at >= $${paramIndex++}`;
      params.push(filters.start_date);
    }
    if (filters.end_date) {
      sql += ` AND created_at <= $${paramIndex++}`;
      params.push(filters.end_date);
    }

    // Search filter
    if (filters.search) {
      sql += ` AND (customer_name ILIKE $${paramIndex++} OR order_number ILIKE $${paramIndex++})`;
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
        case 'customer_name':
        default:
          sql += ` ORDER BY customer_name ${sortOrder}`;
          break;
      }
    } else {
      sql += ` ORDER BY created_at DESC`;
    }

    // Pagination
    if (filters.limit) {
      sql += ` LIMIT $${paramIndex++}`;
      params.push(filters.limit);

      if (filters.offset) {
        sql += ` OFFSET $${paramIndex++}`;
        params.push(filters.offset);
      }
    }

    const result = await db.query(sql, params);
    return result.rows.map(row => new Order(row));
  }

  // Get order by ID
  static async findById(id) {
    const sql = `SELECT * FROM orders WHERE id = $1`;
    const row = await db.get(sql, [id]);
    return row ? new Order(row) : null;
  }

  // Get order by order number
  static async findByOrderNumber(orderNumber) {
    const sql = `SELECT * FROM orders WHERE order_number = $1`;
    const row = await db.get(sql, [orderNumber]);
    return row ? new Order(row) : null;
  }

  // Create new order
  static async create(orderData) {
    // Generate order number if not provided
    const orderNumber = orderData.order_number || await Order.generateOrderNumber();

    const sql = `
      INSERT INTO orders (
        order_number, customer_name, customer_phone, shipping_address, payment_method,
        items, subtotal, shipping_cost, tax, total, status, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id
    `;

    const params = [
      orderNumber,
      orderData.customer_name,
      orderData.customer_phone || null,
      orderData.shipping_address || null,
      orderData.payment_method || 'cash',
      JSON.stringify(orderData.items || []),
      orderData.subtotal || 0,
      orderData.shipping_cost || 0,
      orderData.tax || 0,
      orderData.total,
      orderData.status || 'pending',
      orderData.notes || null
    ];

    const result = await db.query(sql, params);
    return Order.findById(result.rows[0].id);
  }

  // Update order
  async update(updateData) {
    const fields = [];
    const params = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'id') {
        if (key === 'items') {
          fields.push(`${key} = $${paramIndex++}`);
          params.push(JSON.stringify(updateData[key]));
        } else {
          fields.push(`${key} = $${paramIndex++}`);
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
      WHERE id = $${paramIndex}
    `;

    await db.query(sql, params);
    return Order.findById(this.id);
  }

  // Update order status
  async updateStatus(status, notes = null) {
    const sql = `
      UPDATE orders
      SET status = $1, notes = COALESCE($2, notes), updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `;
    await db.query(sql, [status, notes, this.id]);
    return Order.findById(this.id);
  }

  // Delete order
  async delete() {
    const sql = 'DELETE FROM orders WHERE id = $1';
    const result = await db.query(sql, [this.id]);
    return result.rowCount > 0;
  }

  // Generate unique order number
  static async generateOrderNumber() {
    const prefix = 'ORD';
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    let orderNumber = `${prefix}${timestamp}${random}`;

    // Check if order number already exists
    let attempts = 0;
    while (attempts < 10) {
      const existing = await Order.findByOrderNumber(orderNumber);
      if (!existing) {
        return orderNumber;
      }

      // Generate new random part
      const newRandom = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      orderNumber = `${prefix}${timestamp}${newRandom}`;
      attempts++;
    }

    throw new Error('Unable to generate unique order number');
  }

  // Get orders by status
  static async findByStatus(status) {
    const sql = `
      SELECT * FROM orders
      WHERE status = $1
      ORDER BY created_at DESC
    `;
    const result = await db.query(sql, [status]);
    return result.rows.map(row => new Order(row));
  }

  // Get orders by customer
  static async findByCustomer(customerName, customerPhone = null) {
    let sql = `
      SELECT * FROM orders
      WHERE customer_name ILIKE $1
    `;
    const params = [`%${customerName}%`];

    if (customerPhone) {
      sql += ` OR customer_phone = $2`;
      params.push(customerPhone);
    }

    sql += ` ORDER BY created_at DESC`;

    const result = await db.query(sql, params);
    return result.rows.map(row => new Order(row));
  }

  // Get order statistics
  static async getStatistics(filters = {}) {
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (filters.start_date) {
      whereClause += ` AND created_at >= $${paramIndex++}`;
      params.push(filters.start_date);
    }
    if (filters.end_date) {
      whereClause += ` AND created_at <= $${paramIndex++}`;
      params.push(filters.end_date);
    }

    const sql = `
      SELECT
        COUNT(*) as total_orders,
        COALESCE(SUM(total), 0) as total_revenue,
        COALESCE(AVG(total), 0) as average_order_value,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
      FROM orders
      ${whereClause}
    `;

    const result = await db.query(sql, params);
    return result.rows[0];
  }

  static async getRecent(limit = 10) {
    const sql = `
      SELECT * FROM orders
      ORDER BY created_at DESC
      LIMIT $1
    `;
    const result = await db.query(sql, [limit]);
    return result.rows.map(row => new Order(row));
  }

  static async getPending() {
    const sql = `
      SELECT *
      FROM orders
      WHERE status = 'pending'
      ORDER BY created_at
    `;
    const result = await db.query(sql);
    return result.rows.map(row => new Order(row));
  }

  // Calculate totals
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
      order_umber: this.order_number,
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
