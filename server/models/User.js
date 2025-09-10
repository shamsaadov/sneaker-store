const db = require("../config/database");
const bcrypt = require("bcryptjs");

class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    this.role = data.role || "user";
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    // Don't expose password in constructor
  }

  // Get user by email
  static async findByEmail(email) {
    const sql = "SELECT * FROM users WHERE email = $1";
    const row = await db.get(sql, [email.toLowerCase()]);
    return row ? new User(row) : null;
  }

  // Get user by ID
  static async findById(id) {
    const sql = "SELECT * FROM users WHERE id = $1";
    const row = await db.get(sql, [id]);
    return row ? new User(row) : null;
  }

  // Create new user
  static async create(userData) {
    const { email, password, name, role = "user" } = userData;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const sql = `
      INSERT INTO users (email, password, name, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;

    const result = await db.query(sql, [
      email.toLowerCase(),
      hashedPassword,
      name,
      role
    ]);

    return User.findById(result.rows[0].id);
  }

  // Verify password
  static async verifyPassword(email, password) {
    const sql = "SELECT * FROM users WHERE email = $1";
    const row = await db.get(sql, [email.toLowerCase()]);

    if (!row) {
      return null;
    }

    const isValid = await bcrypt.compare(password, row.password);
    return isValid ? new User(row) : null;
  }

  // Update user
  async update(updateData) {
    const allowedFields = ["name", "email", "role"];
    const updateFields = [];
    const values = [];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        values.push(
          field === "email"
            ? updateData[field].toLowerCase()
            : updateData[field]
        );
      }
    }

    if (updateFields.length === 0) {
      return this;
    }

    updateFields.push("updated_at = CURRENT_TIMESTAMP");
    values.push(this.id);

    const sql = `UPDATE users SET ${updateFields.join(", ")} WHERE id = $${values.length}`;
    await db.query(sql, values);

    return User.findById(this.id);
  }

  // Update password
  async updatePassword(newPassword) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const sql = "UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2";
    await db.query(sql, [hashedPassword, this.id]);
  }

  // Delete user
  async delete() {
    const sql = "DELETE FROM users WHERE id = $1";
    await db.query(sql, [this.id]);
  }

  // Get all users (admin only)
  static async findAll(filters = {}) {
    let sql = "SELECT id, email, name, role, created_at, updated_at FROM users";
    const conditions = [];
    const values = [];

    let paramIndex = 1;
    
    if (filters.role) {
      conditions.push(`role = $${paramIndex++}`);
      values.push(filters.role);
    }

    if (filters.search) {
      conditions.push(`(name ILIKE $${paramIndex++} OR email ILIKE $${paramIndex++})`);
      values.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " ORDER BY created_at DESC";

    if (filters.limit) {
      sql += ` LIMIT $${values.length + 1}`;
      values.push(filters.limit);
    }

    const result = await db.query(sql, values);
    return result.rows.map((row) => new User(row));
  }

  // Convert to JSON (without password)
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      role: this.role,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

module.exports = User;
