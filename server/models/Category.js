const db = require("../config/database");
const Product = require("./Product");

class Category {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description;
    this.image = data.image;
    this.product_type = data.product_type || "footwear";
    this.parent_id = data.parent_id || null;
    this.level = data.level || 0;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.product_count = data.product_count || 0;

    // Additional fields for hierarchical display
    this.children = data.children || [];
    this.parent_name = data.parent_name || null;
  }

  // Get all categories with hierarchy
  static async findAll() {
    const sql = `
      SELECT c.*, 
             COUNT(DISTINCT p.id) as product_count,
             parent.name as parent_name
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      LEFT JOIN categories parent ON c.parent_id = parent.id
      GROUP BY c.id, c.product_type, parent.name
      ORDER BY c.level, c.name
    `;
    const result = await db.query(sql);
    return result.rows.map((row) => new Category(row));
  }

  // Get all categories as a hierarchical tree
  static async findAllTree() {
    const allCategories = await this.findAll();

    // Build tree structure
    const categoryMap = new Map();
    const rootCategories = [];

    // First pass: create map of all categories
    allCategories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Second pass: build tree
    allCategories.forEach((cat) => {
      if (cat.parent_id) {
        const parent = categoryMap.get(cat.parent_id);
        if (parent) {
          parent.children.push(categoryMap.get(cat.id));
        }
      } else {
        rootCategories.push(categoryMap.get(cat.id));
      }
    });

    return rootCategories;
  }

  // Get categories by level (0 = root, 1 = category, 2 = subcategory)
  static async findByLevel(level) {
    const sql = `
      SELECT c.*, 
             COUNT(DISTINCT p.id) as product_count,
             parent.name as parent_name
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      LEFT JOIN categories parent ON c.parent_id = parent.id
      WHERE c.level = $1
      GROUP BY c.id, c.product_type, parent.name
      ORDER BY c.name
    `;
    const result = await db.query(sql, [level]);
    return result.rows.map((row) => new Category(row));
  }

  // Get root categories (level 0)
  static async findRootCategories() {
    return this.findByLevel(0);
  }

  // Get child categories of a parent
  static async findByParent(parentId) {
    const sql = `
      SELECT c.*, 
             COUNT(DISTINCT p.id) as product_count,
             parent.name as parent_name
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      LEFT JOIN categories parent ON c.parent_id = parent.id
      WHERE c.parent_id = $1
      GROUP BY c.id, c.product_type, parent.name
      ORDER BY c.name
    `;
    const result = await db.query(sql, [parentId]);
    return result.rows.map((row) => new Category(row));
  }

  // Get category by ID
  static async findById(id) {
    const sql = `
      SELECT c.*, 
             COUNT(DISTINCT p.id) as product_count,
             parent.name as parent_name
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      LEFT JOIN categories parent ON c.parent_id = parent.id
      WHERE c.id = $1
      GROUP BY c.id, parent.name
    `;
    const row = await db.get(sql, [id]);
    return row ? new Category(row) : null;
  }

  // Get category by slug
  static async findBySlug(slug) {
    const sql = `
      SELECT c.*, 
             COUNT(DISTINCT p.id) as product_count,
             parent.name as parent_name
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      LEFT JOIN categories parent ON c.parent_id = parent.id
      WHERE c.slug = $1
      GROUP BY c.id, parent.name
    `;
    const row = await db.get(sql, [slug]);
    return row ? new Category(row) : null;
  }

  // Get full path of category (e.g., "Мужское > Обувь > Jordan")
  async getFullPath() {
    const path = [this.name];
    let currentCategory = this;

    while (currentCategory.parent_id) {
      const parent = await Category.findById(currentCategory.parent_id);
      if (!parent) break;
      path.unshift(parent.name);
      currentCategory = parent;
    }

    return path.join(" > ");
  }

  // Get all children (direct children only)
  async getChildren() {
    return Category.findByParent(this.id);
  }

  // Get all descendants recursively
  async getAllDescendants() {
    const descendants = [];
    const children = await this.getChildren();

    for (const child of children) {
      descendants.push(child);
      const childDescendants = await child.getAllDescendants();
      descendants.push(...childDescendants);
    }

    return descendants;
  }

  // Get all product IDs in this category and all subcategories
  async getAllProductIds() {
    const descendants = await this.getAllDescendants();
    const categoryIds = [this.id, ...descendants.map((d) => d.id)];

    const placeholders = categoryIds.map((_, i) => `$${i + 1}`).join(",");
    const sql = `SELECT DISTINCT id FROM products WHERE category_id IN (${placeholders})`;
    const result = await db.query(sql, categoryIds);

    return result.rows.map((row) => row.id);
  }

  // Create new category
  static async create(categoryData) {
    // Determine level based on parent
    let level = 0;
    if (categoryData.parent_id) {
      const parent = await Category.findById(categoryData.parent_id);
      if (!parent) {
        throw new Error("Parent category not found");
      }
      level = parent.level + 1;

      // Validate max level (0 = root, 1 = category, 2 = subcategory)
      if (level > 2) {
        throw new Error("Maximum category depth (3 levels) exceeded");
      }
    }

    const sql = `
      INSERT INTO categories (name, slug, description, image, product_type, parent_id, level)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;

    const params = [
      categoryData.name,
      categoryData.slug,
      categoryData.description || null,
      categoryData.image || null,
      categoryData.productType || categoryData.product_type || "footwear",
      categoryData.parent_id || null,
      level,
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

    // Check if category has children
    const children = await this.getChildren();
    if (children.length > 0) {
      throw new Error(
        "Cannot delete category with subcategories. Delete subcategories first."
      );
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

  async getProducts(filters = {}) {
    return Product.findAll({ ...filters, categories: [this.id] });
  }

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
    let sql = "SELECT id FROM categories WHERE slug = $1";
    const params = [slug];

    if (excludeId) {
      sql += " AND id != $2";
      params.push(excludeId);
    }

    const result = await db.query(sql, params);
    return result.rowCount === 0;
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
      parentId: this.parent_id,
      parentName: this.parent_name,
      level: this.level,
      productCount: this.product_count,
      children: this.children,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

module.exports = Category;
