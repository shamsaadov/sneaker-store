const db = require('../config/database');

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
    this.urgency = data.urgency || 'normal';
    this.description = data.description;
    // PostgreSQL JSONB fields are automatically parsed
    this.images = Array.isArray(data.images) ? data.images : (data.images || []);
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
    let paramIndex = 1;

    // Status filter
    if (filters.status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(filters.status);
    }

    // Urgency filter
    if (filters.urgency) {
      sql += ` AND urgency = $${paramIndex++}`;
      params.push(filters.urgency);
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
      sql += ` AND (name ILIKE $${paramIndex++} OR phone ILIKE $${paramIndex++} OR brand ILIKE $${paramIndex++} OR model ILIKE $${paramIndex++})`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
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
        case 'name':
        default:
          sql += ` ORDER BY name ${sortOrder}`;
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
    return result.rows.map(row => new SpecialOrder(row));
  }

  // Get special order by ID
  static async findById(id) {
    const sql = `SELECT * FROM special_orders WHERE id = $1`;
    const row = await db.get(sql, [id]);
    return row ? new SpecialOrder(row) : null;
  }

  // Create new special order
  static async create(orderData) {
    const sql = `
      INSERT INTO special_orders (
        name, phone, brand, model, size, color, budget, urgency,
        description, images, status, admin_notes, estimated_price, estimated_delivery, found_product_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id
    `;

    const params = [
      orderData.name,
      orderData.phone,
      orderData.brand,
      orderData.model,
      orderData.size || null,
      orderData.color || null,
      orderData.budget || null,
      orderData.urgency || 'normal',
      orderData.description || null,
      JSON.stringify(orderData.images || []),
      orderData.status || 'new',
      orderData.admin_notes || null,
      orderData.estimated_price || null,
      orderData.estimated_delivery || null,
      orderData.found_product_url || null
    ];

    const result = await db.query(sql, params);
    return SpecialOrder.findById(result.rows[0].id);
  }

  // Update special order
  async update(updateData) {
    const fields = [];
    const params = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'id') {
        if (key === 'images') {
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
      UPDATE special_orders
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
    `;

    await db.query(sql, params);
    return SpecialOrder.findById(this.id);
  }

  // Update status
  async updateStatus(status, adminNotes = null) {
    const sql = `
      UPDATE special_orders
      SET status = $1, admin_notes = COALESCE($2, admin_notes), updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `;
    await db.query(sql, [status, adminNotes, this.id]);
    return SpecialOrder.findById(this.id);
  }

  // Delete special order
  async delete() {
    const sql = 'DELETE FROM special_orders WHERE id = $1';
    const result = await db.query(sql, [this.id]);
    return result.rowCount > 0;
  }

  // Get orders by status
  static async findByStatus(status) {
    const sql = `
      SELECT * FROM special_orders
      WHERE status = $1
      ORDER BY created_at DESC
    `;
    const result = await db.query(sql, [status]);
    return result.rows.map(row => new SpecialOrder(row));
  }

  // Get orders by urgency
  static async findByUrgency(urgency) {
    const sql = `
      SELECT * FROM special_orders
      WHERE urgency = $1
      ORDER BY created_at DESC
    `;
    const result = await db.query(sql, [urgency]);
    return result.rows.map(row => new SpecialOrder(row));
  }

  // Get orders by customer
  static async findByCustomer(name, phone = null) {
    let sql = `
      SELECT * FROM special_orders
      WHERE name ILIKE $1
    `;
    const params = [`%${name}%`];

    if (phone) {
      sql += ` OR phone = $2`;
      params.push(phone);
    }

    sql += ` ORDER BY created_at DESC`;

    const result = await db.query(sql, params);
    return result.rows.map(row => new SpecialOrder(row));
  }

  // Get statistics
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
        COUNT(CASE WHEN status = 'new' THEN 1 END) as new_orders,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_orders,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
        COUNT(CASE WHEN urgency = 'emergency' THEN 1 END) as emergency_orders,
        COUNT(CASE WHEN urgency = 'urgent' THEN 1 END) as urgent_orders,
        COUNT(CASE WHEN urgency = 'normal' THEN 1 END) as normal_orders,
        COALESCE(AVG(estimated_price), 0) as average_estimated_price
      FROM special_orders
      ${whereClause}
    `;

    const result = await db.query(sql, params);
    return result.rows[0];
  }

  // Search by brand and model
  static async searchByProduct(brand, model = null) {
    let sql = `
      SELECT * FROM special_orders
      WHERE brand ILIKE $1
    `;
    const params = [`%${brand}%`];

    if (model) {
      sql += ` AND model ILIKE $2`;
      params.push(`%${model}%`);
    }

    sql += ` ORDER BY created_at DESC`;

    const result = await db.query(sql, params);
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
      adminNotes: this.admin_notes,
      estimatedPrice: this.estimated_price ? parseFloat(this.estimated_price) : null,
      estimatedDelivery: this.estimated_delivery,
      foundProductUrl: this.found_product_url,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = SpecialOrder;
