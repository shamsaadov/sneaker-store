const db = require('../config/database');

class Product {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.brand = data.brand;
    this.price = data.price;
    this.original_price = data.original_price;
    this.description = data.description;
    
    // PostgreSQL JSONB fields are automatically parsed
    this.images = Array.isArray(data.images) ? data.images : (data.images || []);
    this.sizes = Array.isArray(data.sizes) ? data.sizes : (data.sizes || []);
    
    this.category_id = data.category_id;
    this.stock = data.stock;
    this.featured = Boolean(data.featured);

    // Новые поля для универсальной модели
    this.product_type = data.product_type || 'footwear';
    this.gender = data.gender || 'unisex';
    this.color = data.color;

    // Специфические атрибуты для каждого типа товара (PostgreSQL JSONB)
    this.footwear_attributes = data.footwear_attributes || null;
    this.clothing_attributes = data.clothing_attributes || null;
    this.toys_attributes = data.toys_attributes || null;
    this.accessories_attributes = data.accessories_attributes || null;

    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.category_name = data.category_name;
    this.category_slug = data.category_slug;
    this.category_product_type = data.category_product_type;
  }

  // Helper function to build PostgreSQL parameterized queries
  static buildPlaceholders(startIndex, count) {
    return Array.from({ length: count }, (_, i) => `$${startIndex + i}`).join(',');
  }

  // Get all products with optional filters
  static async findAll(filters = {}) {
    let sql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug, c.product_type as category_product_type
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    // Search filter
    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      sql += ` AND (p.name ILIKE $${params.length + 1} OR p.brand ILIKE $${params.length + 2} OR p.description ILIKE $${params.length + 3})`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Brand filter
    if (filters.brands && filters.brands.length > 0) {
      const placeholders = this.buildPlaceholders(params.length + 1, filters.brands.length);
      sql += ` AND p.brand IN (${placeholders})`;
      params.push(...filters.brands);
    }

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      const placeholders = this.buildPlaceholders(params.length + 1, filters.categories.length);
      sql += ` AND p.category_id IN (${placeholders})`;
      params.push(...filters.categories);
    }

    // Product type filter
    if (filters.product_types && filters.product_types.length > 0) {
      const placeholders = this.buildPlaceholders(params.length + 1, filters.product_types.length);
      sql += ` AND p.product_type IN (${placeholders})`;
      params.push(...filters.product_types);
    }

    // Gender filter
    if (filters.gender && filters.gender.length > 0) {
      const placeholders = this.buildPlaceholders(params.length + 1, filters.gender.length);
      sql += ` AND p.gender IN (${placeholders})`;
      params.push(...filters.gender);
    }

    // Color filter
    if (filters.colors && filters.colors.length > 0) {
      const colorConditions = filters.colors.map(() => `p.color ILIKE $${params.length + 1}`);
      sql += ` AND (${colorConditions.join(' OR ')})`;
      filters.colors.forEach(color => {
        params.push(`%${color}%`);
      });
    }

    // Size filter (using JSONB operators for PostgreSQL)
    if (filters.sizes && filters.sizes.length > 0) {
      const sizeConditions = filters.sizes.map(() => `p.sizes ? $${params.length + 1}`);
      sql += ` AND (${sizeConditions.join(' OR ')})`;
      filters.sizes.forEach(size => {
        params.push(String(size));
      });
    }

    // Price range filter
    if (filters.min_price) {
      sql += ` AND p.price >= $${params.length + 1}`;
      params.push(filters.min_price);
    }
    if (filters.max_price) {
      sql += ` AND p.price <= $${params.length + 1}`;
      params.push(filters.max_price);
    }

    // Featured filter
    if (filters.featured) {
      sql += ` AND p.featured = true`;
    }

    // In stock filter
    if (filters.in_stock) {
      sql += ` AND p.stock > 0`;
    }

    // Sorting
    if (filters.sort_by) {
      const sortOrder = filters.sort_order === 'desc' ? 'DESC' : 'ASC';
      switch (filters.sort_by) {
        case 'price':
          sql += ` ORDER BY p.price ${sortOrder}`;
          break;
        case 'newest':
          sql += ` ORDER BY p.created_at ${sortOrder}`;
          break;
        case 'popularity':
          sql += ` ORDER BY p.featured DESC, p.created_at ${sortOrder}`;
          break;
        case 'name':
        default:
          sql += ` ORDER BY p.name ${sortOrder}`;
          break;
      }
    } else {
      sql += ` ORDER BY p.created_at DESC`;
    }

    // Pagination
    if (filters.limit) {
      sql += ` LIMIT $${params.length + 1}`;
      params.push(filters.limit);

      if (filters.offset) {
        sql += ` OFFSET $${params.length + 1}`;
        params.push(filters.offset);
      }
    }

    const result = await db.query(sql, params);
    return result.rows.map(row => new Product(row));
  }

  // Get product by ID
  static async findById(id) {
    const sql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug, c.product_type as category_product_type
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `;
    const row = await db.get(sql, [id]);
    return row ? new Product(row) : null;
  }

  // Create new product
  static async create(productData) {
    const sql = `
      INSERT INTO products (
        name, brand, price, original_price, description, images, sizes,
        category_id, stock, featured, product_type, gender, color,
        footwear_attributes, clothing_attributes, toys_attributes, accessories_attributes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING id
    `;
    
    const params = [
      productData.name,
      productData.brand,
      productData.price,
      productData.originalPrice || productData.original_price || null,
      productData.description || '',
      JSON.stringify(productData.images || []),
      JSON.stringify(productData.sizes || []),
      productData.category_id,
      productData.stock || 0,
      productData.featured || false,
      productData.productType || productData.product_type || 'footwear',
      productData.gender || 'unisex',
      productData.color || null,
      productData.footwearAttributes ? JSON.stringify(productData.footwearAttributes) : null,
      productData.clothingAttributes ? JSON.stringify(productData.clothingAttributes) : null,
      productData.toysAttributes ? JSON.stringify(productData.toysAttributes) : null,
      productData.accessoriesAttributes ? JSON.stringify(productData.accessoriesAttributes) : null
    ];

    const result = await db.query(sql, params);
    return Product.findById(result.rows[0].id);
  }

  // Update product
  async update(updateData) {
    const fields = [];
    const params = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'id') {
        // Handle JSON fields
        if (key === 'images' || key === 'sizes') {
          fields.push(`${key} = $${paramIndex++}`);
          params.push(JSON.stringify(updateData[key]));
        } else if (key.includes('Attributes') || key.includes('_attributes')) {
          // Handle specific attributes
          const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          fields.push(`${dbKey} = $${paramIndex++}`);
          params.push(updateData[key] ? JSON.stringify(updateData[key]) : null);
        } else if (key === 'featured') {
          fields.push(`${key} = $${paramIndex++}`);
          params.push(updateData[key] || false);
        } else if (key === 'originalPrice') {
          fields.push(`original_price = $${paramIndex++}`);
          params.push(updateData[key]);
        } else if (key === 'productType') {
          fields.push(`product_type = $${paramIndex++}`);
          params.push(updateData[key]);
        } else {
          // Convert camelCase to snake_case for database
          const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          fields.push(`${dbKey} = $${paramIndex++}`);
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
      UPDATE products
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
    `;

    await db.query(sql, params);
    return Product.findById(this.id);
  }

  // Delete product
  async delete() {
    const sql = 'DELETE FROM products WHERE id = $1';
    const result = await db.query(sql, [this.id]);
    return result.rowCount > 0;
  }

  // Get available brands
  static async getBrands() {
    const sql = 'SELECT DISTINCT brand FROM products ORDER BY brand';
    const result = await db.query(sql);
    return result.rows.map(row => row.brand);
  }

  // Get available sizes (supports both string and number)
  static async getSizes() {
    const sql = 'SELECT DISTINCT sizes FROM products WHERE sizes IS NOT NULL AND jsonb_array_length(sizes) > 0';
    const result = await db.query(sql);
    const allSizes = new Set();

    result.rows.forEach(row => {
      if (row.sizes && Array.isArray(row.sizes)) {
        row.sizes.forEach(size => allSizes.add(size));
      }
    });

    // Sort: numbers first, then strings
    return Array.from(allSizes).sort((a, b) => {
      if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
      }
      if (typeof a === 'string' && typeof b === 'string') {
        const sizeOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'One Size'];
        const aIndex = sizeOrder.indexOf(a);
        const bIndex = sizeOrder.indexOf(b);
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }
        return a.localeCompare(b);
      }
      // Numbers before strings
      return typeof a === 'number' ? -1 : 1;
    });
  }

  // Get available colors
  static async getColors() {
    const sql = 'SELECT DISTINCT color FROM products WHERE color IS NOT NULL AND color != \'\' ORDER BY color';
    const result = await db.query(sql);
    return result.rows.map(row => row.color);
  }

  // Get available product types
  static async getProductTypes() {
    const sql = 'SELECT DISTINCT product_type FROM products ORDER BY product_type';
    const result = await db.query(sql);
    return result.rows.map(row => row.product_type);
  }

  // Get available genders
  static async getGenders() {
    const sql = 'SELECT DISTINCT gender FROM products ORDER BY gender';
    const result = await db.query(sql);
    return result.rows.map(row => row.gender);
  }

  // Get price range
  static async getPriceRange() {
    const sql = 'SELECT MIN(price) as min_price, MAX(price) as max_price FROM products';
    const result = await db.query(sql);
    return result.rows[0] || { min_price: 0, max_price: 100000 };
  }

  // Get featured products
  static async getFeatured(limit = 8) {
    const sql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug, c.product_type as category_product_type
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.featured = true AND p.stock > 0
      ORDER BY p.created_at DESC
      LIMIT $1
    `;
    const result = await db.query(sql, [limit]);
    return result.rows.map(row => new Product(row));
  }

  // Search products
  static async search(searchTerm, limit = 20) {
    const sql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug, c.product_type as category_product_type
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE (p.name ILIKE $1 OR p.brand ILIKE $2 OR p.description ILIKE $3)
      AND p.stock > 0
      ORDER BY
        CASE
          WHEN p.name ILIKE $4 THEN 1
          WHEN p.brand ILIKE $5 THEN 2
          ELSE 3
        END,
        p.featured DESC,
        p.created_at DESC
      LIMIT $6
    `;
    const searchPattern = `%${searchTerm}%`;
    const result = await db.query(sql, [
      searchPattern, searchPattern, searchPattern,
      searchPattern, searchPattern,
      limit
    ]);
    return result.rows.map(row => new Product(row));
  }

  // Check if product is in stock for specific size
  isInStockForSize(size, quantity = 1) {
    return this.sizes.includes(size) && this.stock >= quantity;
  }

  // Format for API response
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      brand: this.brand,
      price: parseFloat(this.price),
      originalPrice: this.original_price ? parseFloat(this.original_price) : null,
      description: this.description,
      images: this.images,
      sizes: this.sizes,
      category_id: this.category_id,
      category: this.category_name ? {
        name: this.category_name,
        slug: this.category_slug,
        productType: this.category_product_type
      } : null,
      stock: this.stock,
      featured: this.featured,

      // Новые поля универсальной модели
      productType: this.product_type,
      gender: this.gender,
      color: this.color,

      // Специфические атрибуты
      footwearAttributes: this.footwear_attributes,
      clothingAttributes: this.clothing_attributes,
      toysAttributes: this.toys_attributes,
      accessoriesAttributes: this.accessories_attributes,

      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Product;
