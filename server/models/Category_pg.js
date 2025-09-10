const db = require("../config/database");

class Category {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description;
    this.image = data.image;
    this.product_type = data.product_type || "footwear";
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.product_count = data.product_count || 0;
  }

  // Get all categories
  static async findAll() {
    const sql = `
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id, c.product_type
      ORDER BY c.name
    `;
    const result = await db.query(sql);
    return result.rows.map((row) => new Category(row));
  }

  // Get category by ID
  static async findById(id) {
    const sql = `
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      WHERE c.id = $1
      GROUP BY c.id
    `;
    const row = await db.get(sql, [id]);
    return row ? new Category(row) : null;
  }

  // Get category by slug
  static async findBySlug(slug) {
    const sql = `
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      WHERE c.slug = $1
      GROUP BY c.id
    `;
    const row = await db.get(sql, [slug]);
    return row ? new Category(row) : null;
  }

  // Create new category
  static async create(categoryData) {
    const sql = `
      INSERT INTO categories (name, slug, description, image, product_type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;

    const params = [
      categoryData.name,
      categoryData.slug,
      categoryData.description || null,
      categoryData.image || null,
      categoryData.productType || categoryData.product_type || "footwear",
    ];

    const result = await db.query(sql, params);
    return Category.findById(result.rows[0].id);
  }

  // Update category
  async update(updateData) {
    const fields = [];
    const params = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined && key !== "id") {
        if (key === "productType") {
          fields.push(`product_type = $${paramIndex++}`);
          params.push(updateData[key]);
        } else {
          fields.push(`${key} = $${paramIndex++}`);
          params.push(updateData[key]);
        }
      }
    });

    if (fields.length === 0) {
      throw new Error("No fields to update");
    }

    // Add updated_at
    fields.push("updated_at = CURRENT_TIMESTAMP");
    params.push(this.id);

    const sql = `
      UPDATE categories
      SET ${fields.join(", ")}
      WHERE id = $${paramIndex}
    `;

    await db.query(sql, params);
    return Category.findById(this.id);
  }

  // Delete category
  async delete() {
    // Check if category has products
    const productCount = await this.getProductCount();
    if (productCount > 0) {
      throw new Error("Cannot delete category with existing products");
    }

    const sql = "DELETE FROM categories WHERE id = $1";
    const result = await db.query(sql, [this.id]);
    return result.rowCount > 0;
  }

  // Get product count for this category
  async getProductCount() {
    const sql = "SELECT COUNT(*) as count FROM products WHERE category_id = $1";
    const result = await db.query(sql, [this.id]);
    return parseInt(result.rows[0].count);
  }

  // Get categories by product type
  static async findByProductType(productType) {
    const sql = `
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      WHERE c.product_type = $1
      GROUP BY c.id
      ORDER BY c.name
    `;
    const result = await db.query(sql, [productType]);
    return result.rows.map((row) => new Category(row));
  }

  // Get all product types
  static async getProductTypes() {
    const sql = "SELECT DISTINCT product_type FROM categories ORDER BY product_type";
    const result = await db.query(sql);
    return result.rows.map((row) => row.product_type);
  }

  // Search categories
  static async search(searchTerm) {
    const sql = `
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      WHERE c.name ILIKE $1 OR c.description ILIKE $2
      GROUP BY c.id
      ORDER BY c.name
    `;
    const searchPattern = `%${searchTerm}%`;
    const result = await db.query(sql, [searchPattern, searchPattern]);
    return result.rows.map((row) => new Category(row));
  }

  // Format for API response
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      image: this.image,
      productType: this.product_type,
      productCount: this.product_count,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

module.exports = Category;
