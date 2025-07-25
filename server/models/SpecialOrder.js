const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class SpecialOrder {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.phone = data.phone;
    this.brand = data.brand;
    this.model = data.model;
    this.size = data.size;
    this.color = data.color;
    this.budget = data.budget;
    this.urgency = data.urgency;
    this.description = data.description;
    this.images = typeof data.images === 'string' ? JSON.parse(data.images || '[]') : (data.images || []);
    this.status = data.status || 'new';
    this.admin_notes = data.admin_notes;
    this.estimated_price = data.estimated_price;
    this.estimated_delivery = data.estimated_delivery;
    this.found_product_url = data.found_product_url;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Get all special orders with optional filters
  static async findAll(filters = {}) {
    let sql = `
      SELECT *
      FROM special_orders
      WHERE 1=1
    `;
    const params = [];

    // Status filter
    if (filters.status) {
      sql += ` AND status = ?`;
      params.push(filters.status);
    }

    // Urgency filter
    if (filters.urgency) {
      sql += ` AND urgency = ?`;
      params.push(filters.urgency);
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
      sql += ` AND (name LIKE ? OR brand LIKE ? OR model LIKE ?)`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Sorting
    if (filters.sort_by) {
      const sortOrder = filters.sort_order === 'desc' ? 'DESC' : 'ASC';
      switch (filters.sort_by) {
        case 'created_at':
          sql += ` ORDER BY created_at ${sortOrder}`;
          break;
        case 'urgency':
          sql += ` ORDER BY
            CASE urgency
              WHEN 'emergency' THEN 1
              WHEN 'urgent' THEN 2
              WHEN 'normal' THEN 3
            END ${sortOrder}`;
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
    return result.rows.map(row => new SpecialOrder(row));
  }

  // Get special order by ID
  static async findById(id) {
    const sql = `SELECT * FROM special_orders WHERE id = ?`;
    const row = await db.get(sql, [id]);
    return row ? new SpecialOrder(row) : null;
  }

  // Create new special order
  static async create(orderData) {
    const id = uuidv4();
    const sql = `
      INSERT INTO special_orders (
        id, name, phone, brand, model, size, color, budget,
        urgency, description, images, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      id,
      orderData.name,
      orderData.phone,
      orderData.brand,
      orderData.model,
      orderData.size || '',
      orderData.color || '',
      orderData.budget || '',
      orderData.urgency || 'normal',
      orderData.description || '',
      JSON.stringify(orderData.images || []),
      'new'
    ];

    await db.query(sql, params);
    return SpecialOrder.findById(id);
  }

  // Update special order
  async update(updateData) {
    const fields = [];
    const params = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'id') {
        if (key === 'images') {
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
      UPDATE special_orders
      SET ${fields.join(', ')}
      WHERE id = ?
    `;

    await db.query(sql, params);
    return SpecialOrder.findById(this.id);
  }

  // Delete special order
  async delete() {
    const sql = 'DELETE FROM special_orders WHERE id = ?';
    const result = await db.query(sql, [this.id]);
    return result.changes > 0;
  }

  // Get statistics
  static async getStatistics() {
    const stats = {};

    // Total orders
    const totalResult = await db.get('SELECT COUNT(*) as total FROM special_orders');
    stats.total = totalResult.total;

    // Orders by status
    const statusResult = await db.query(`
      SELECT status, COUNT(*) as count
      FROM special_orders
      GROUP BY status
    `);
    stats.by_status = statusResult.rows.reduce((acc, row) => {
      acc[row.status] = row.count;
      return acc;
    }, {});

    // Orders by urgency
    const urgencyResult = await db.query(`
      SELECT urgency, COUNT(*) as count
      FROM special_orders
      GROUP BY urgency
    `);
    stats.by_urgency = urgencyResult.rows.reduce((acc, row) => {
      acc[row.urgency] = row.count;
      return acc;
    }, {});

    // Monthly statistics for the last 6 months
    const monthlyResult = await db.query(`
      SELECT
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as count
      FROM special_orders
      WHERE created_at >= date('now', '-6 months')
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month DESC
    `);
    stats.monthly = monthlyResult.rows;

    // Average processing time (for completed orders)
    const avgTimeResult = await db.get(`
      SELECT AVG(julianday(updated_at) - julianday(created_at)) as avg_days
      FROM special_orders
      WHERE status IN ('completed', 'delivered')
    `);
    stats.average_processing_days = avgTimeResult.avg_days ? Math.round(avgTimeResult.avg_days) : 0;

    return stats;
  }

  // Update status
  async updateStatus(newStatus, adminNotes = '') {
    const sql = `
      UPDATE special_orders
      SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await db.query(sql, [newStatus, adminNotes, this.id]);
    return SpecialOrder.findById(this.id);
  }

  // Set price and delivery estimate
  async setEstimate(price, deliveryDate, notes = '') {
    const sql = `
      UPDATE special_orders
      SET estimated_price = ?, estimated_delivery = ?, admin_notes = ?, status = 'quoted', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await db.query(sql, [price, deliveryDate, notes, this.id]);
    return SpecialOrder.findById(this.id);
  }

  // Mark as found with product URL
  async markAsFound(productUrl, finalPrice, notes = '') {
    const sql = `
      UPDATE special_orders
      SET found_product_url = ?, estimated_price = ?, admin_notes = ?, status = 'found', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await db.query(sql, [productUrl, finalPrice, notes, this.id]);
    return SpecialOrder.findById(this.id);
  }



  // Get urgent orders (emergency and urgent)
  static async getUrgentOrders() {
    const sql = `
      SELECT * FROM special_orders
      WHERE urgency IN ('emergency', 'urgent') AND status NOT IN ('completed', 'cancelled', 'delivered')
      ORDER BY
        CASE urgency
          WHEN 'emergency' THEN 1
          WHEN 'urgent' THEN 2
        END,
        created_at ASC
    `;
    const result = await db.query(sql);
    return result.rows.map(row => new SpecialOrder(row));
  }

  // Format for API response
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      phone: this.phone,
      brand: this.brand,
      model: this.model,
      size: this.size,
      color: this.color,
      budget: this.budget,
      urgency: this.urgency,
      description: this.description,
      images: this.images,
      status: this.status,
      admin_notes: this.admin_notes,
      estimated_price: this.estimated_price ? parseFloat(this.estimated_price) : null,
      estimated_delivery: this.estimated_delivery,
      found_product_url: this.found_product_url,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = SpecialOrder;
