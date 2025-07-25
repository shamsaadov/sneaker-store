const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Database file path
const dbPath = path.join(__dirname, "..", "database.sqlite");

// Database connection
let db = null;

// Initialize database
const init = async () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("Error opening database:", err);
        reject(err);
      } else {
        console.log("Connected to SQLite database");
        // Enable foreign keys
        db.run("PRAGMA foreign_keys = ON");
        createTables()
          .then(() => resolve())
          .catch(reject);
      }
    });
  });
};

// Create database tables
const createTables = async () => {
  return new Promise((resolve, reject) => {
    const tables = [
      // Categories table
      `CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Products table
      `CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        brand TEXT NOT NULL,
        price REAL NOT NULL,
        original_price REAL,
        description TEXT,
        images TEXT,
        sizes TEXT,
        category_id TEXT,
        stock INTEGER DEFAULT 0,
        rating REAL DEFAULT 0,
        reviews_count INTEGER DEFAULT 0,
        featured INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id)
      )`,

      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Orders table
      `CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        order_number TEXT UNIQUE NOT NULL,
        customer_name TEXT NOT NULL,
        customer_phone TEXT,
        shipping_address TEXT,
        payment_method TEXT DEFAULT 'cash',
        items TEXT NOT NULL,
        subtotal REAL DEFAULT 0,
        shipping_cost REAL DEFAULT 0,
        tax REAL DEFAULT 0,
        total REAL NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Order items table
      `CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT,
        product_id TEXT,
        quantity INTEGER NOT NULL,
        size INTEGER NOT NULL,
        price REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products (id)
      )`,

      // Reviews table
      `CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        product_id TEXT,
        user_id TEXT,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // Cart table
      `CREATE TABLE IF NOT EXISTS cart_items (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        product_id TEXT,
        quantity INTEGER NOT NULL,
        size INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
        UNIQUE(user_id, product_id, size)
      )`,

      // Special orders table
      `CREATE TABLE IF NOT EXISTS special_orders (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        brand TEXT NOT NULL,
        model TEXT NOT NULL,
        size TEXT,
        color TEXT,
        budget TEXT,
        urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('normal', 'urgent', 'emergency')),
        description TEXT,
        images TEXT,
        status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'quoted', 'confirmed', 'found', 'ordered', 'delivered', 'completed', 'cancelled')),
        admin_notes TEXT,
        estimated_price REAL,
        estimated_delivery DATE,
        found_product_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
    ];

    let completed = 0;
    const total = tables.length;

    tables.forEach((table, index) => {
      db.run(table, (err) => {
        if (err) {
          console.error(`Error creating table ${index + 1}:`, err);
          reject(err);
        } else {
          completed++;
          if (completed === total) {
            console.log("All tables created successfully");
            createIndexes()
              .then(() => resolve())
              .catch(reject);
          }
        }
      });
    });
  });
};

// Create indexes
const createIndexes = async () => {
  return new Promise((resolve, reject) => {
    const indexes = [
      "CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)",
      "CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand)",
      "CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured)",

      "CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)",
      "CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number)",
      "CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)",
      "CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id)",
      "CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id)",
      "CREATE INDEX IF NOT EXISTS idx_special_orders_status ON special_orders(status)",
      "CREATE INDEX IF NOT EXISTS idx_special_orders_urgency ON special_orders(urgency)",

      "CREATE INDEX IF NOT EXISTS idx_special_orders_created ON special_orders(created_at)",
    ];

    let completed = 0;
    const total = indexes.length;

    indexes.forEach((index, i) => {
      db.run(index, (err) => {
        if (err) {
          console.error(`Error creating index ${i + 1}:`, err);
          reject(err);
        } else {
          completed++;
          if (completed === total) {
            console.log("All indexes created successfully");
            resolve();
          }
        }
      });
    });
  });
};

// Query helper function with promise support
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    if (sql.trim().toUpperCase().startsWith("SELECT")) {
      db.all(sql, params, (err, rows) => {
        const duration = Date.now() - start;
        if (err) {
          console.error("Database query error:", err);
          reject(err);
        } else {
          console.log("Executed query", {
            sql: sql.substring(0, 100) + "...",
            duration,
            rows: rows.length,
          });
          resolve({ rows });
        }
      });
    } else {
      db.run(sql, params, function (err) {
        const duration = Date.now() - start;
        if (err) {
          console.error("Database query error:", err);
          reject(err);
        } else {
          console.log("Executed query", {
            sql: sql.substring(0, 100) + "...",
            duration,
            changes: this.changes,
          });
          resolve({
            changes: this.changes,
            lastID: this.lastID,
            rows: this.changes > 0 ? [{ id: this.lastID }] : [],
          });
        }
      });
    }
  });
};

// Get single row
const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        console.error("Database get error:", err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// Close database connection
const close = async () => {
  if (db) {
    return new Promise((resolve) => {
      db.close((err) => {
        if (err) {
          console.error("Error closing database:", err);
        } else {
          console.log("Database connection closed");
        }
        resolve();
      });
    });
  }
};

module.exports = {
  init,
  query,
  get,
  close,
  db: () => db,
};
