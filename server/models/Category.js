const db = require("../config/database");
const { v4: uuidv4 } = require("uuid");

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
      WHERE c.id = ?
      GROUP BY c.id, c.product_type
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
      WHERE c.slug = ?
      GROUP BY c.id, c.product_type
    `;
    const row = await db.get(sql, [slug]);
    return row ? new Category(row) : null;
  }

  // Create new category
  static async create(categoryData) {
    const id = uuidv4();
    const sql = `
      INSERT INTO categories (id, name, slug, description, image, product_type)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
      id,
      categoryData.name,
      categoryData.slug,
      categoryData.description || "",
      categoryData.image || "",
      categoryData.product_type || categoryData.productType || "footwear",
    ];

    await db.query(sql, params);
    return Category.findById(id);
  }

  // Update category
  async update(updateData) {
    const fields = [];
    const params = [];

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined && key !== "id") {
        fields.push(`${key} = ?`);
        params.push(updateData[key]);
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
      WHERE id = ?
    `;

    await db.query(sql, params);
    return Category.findById(this.id);
  }

  // Delete category
  async delete() {
    // Check if category has products
    const productCheck = await db.get(
      "SELECT COUNT(*) as count FROM products WHERE category_id = ?",
      [this.id]
    );
    if (productCheck && productCheck.count > 0) {
      throw new Error("Cannot delete category with existing products");
    }

    const sql = "DELETE FROM categories WHERE id = ?";
    const result = await db.query(sql, [this.id]);
    return result.changes > 0;
  }

  // Get products in this category
  async getProducts(filters = {}) {
    const Product = require("./Product");
    return Product.findAll({ ...filters, categories: [this.id] });
  }

  // Generate slug from name
  static generateSlug(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  // Check if slug is unique
  static async isSlugUnique(slug, excludeId = null) {
    let sql = "SELECT id FROM categories WHERE slug = ?";
    const params = [slug];

    if (excludeId) {
      sql += " AND id != ?";
      params.push(excludeId);
    }

    const row = await db.get(sql, params);
    return !row;
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
      product_count: this.product_count,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

module.exports = Category;
