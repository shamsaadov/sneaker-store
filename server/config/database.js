const { Pool } = require('pg');
const MigrationManager = require('./migrations');

// Database connection pool
let pool = null;
let migrationManager = null;

// Get database configuration from environment
const getDatabaseConfig = () => {
  // Support both individual env vars and DATABASE_URL
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'sneaker_store',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 20, // maximum number of clients in the pool
    idleTimeoutMillis: 30000, // how long a client is allowed to remain idle
    connectionTimeoutMillis: 2000, // how long to wait when connecting a client
  };
};

// Initialize database connection and run migrations
const init = async () => {
  try {
    const config = getDatabaseConfig();
    pool = new Pool(config);
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
    client.release();
    
    // Initialize migration manager
    migrationManager = new MigrationManager({ query });
    
    // Run pending migrations
    await migrationManager.runPendingMigrations();
    
    console.log('✅ Database initialization completed');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Get migration manager instance
const getMigrationManager = () => {
  if (!migrationManager) {
    throw new Error('Migration manager not initialized. Call init() first.');
  }
  return migrationManager;
};

// Query helper function with promise support
const query = async (sql, params = []) => {
  if (!pool) {
    throw new Error('Database not initialized. Call init() first.');
  }

  const start = Date.now();
  let client;

  try {
    client = await pool.connect();
    const result = await client.query(sql, params);
    const duration = Date.now() - start;

    // Log query execution (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log("Executed query", {
        sql: sql.substring(0, 100) + "...",
        duration,
        rows: result.rows ? result.rows.length : 0,
      });
    }

    return {
      rows: result.rows || [],
      rowCount: result.rowCount || 0,
      command: result.command
    };

  } catch (error) {
    console.error("Database query error:", error);
    console.error("SQL:", sql);
    console.error("Params:", params);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Get single row
const get = async (sql, params = []) => {
  const result = await query(sql, params);
  return result.rows.length > 0 ? result.rows[0] : null;
};

// Close database connection
const close = async () => {
  if (pool) {
    try {
      await pool.end();
      console.log("Database connection pool closed");
    } catch (error) {
      console.error("Error closing database pool:", error);
    }
  }
};

module.exports = {
  init,
  query,
  get,
  close,
  getMigrationManager,
  getPool: () => pool,
};
