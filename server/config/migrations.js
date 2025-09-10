const fs = require('fs');
const path = require('path');

class MigrationManager {
  constructor(db) {
    this.db = db;
    this.migrationsDir = path.join(__dirname, '..', 'migrations');
  }

  // Initialize migrations table
  async initMigrationsTable() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    try {
      await this.db.query(createTableSQL);
      console.log('Migrations table initialized');
    } catch (error) {
      console.error('Error initializing migrations table:', error);
      throw error;
    }
  }

  // Get list of executed migrations
  async getExecutedMigrations() {
    try {
      const result = await this.db.query(
        'SELECT filename FROM migrations ORDER BY id ASC'
      );
      return result.rows.map(row => row.filename);
    } catch (error) {
      console.error('Error getting executed migrations:', error);
      return [];
    }
  }

  // Get list of available migration files (.sql and .js)
  getAvailableMigrations() {
    try {
      if (!fs.existsSync(this.migrationsDir)) {
        console.log('Migrations directory does not exist:', this.migrationsDir);
        return [];
      }

      return fs.readdirSync(this.migrationsDir)
        .filter(file => file.endsWith('.sql') || file.endsWith('.js'))
        .sort();
    } catch (error) {
      console.error('Error reading migrations directory:', error);
      return [];
    }
  }

  // Execute a single migration (supports .sql and .js)
  async executeMigration(filename) {
    const filePath = path.join(this.migrationsDir, filename);

    try {
      console.log(`Executing migration: ${filename}`);

      const isSql = filename.endsWith('.sql');
      const isJs = filename.endsWith('.js');

      // Execute migration in a transaction
      await this.db.query('BEGIN');
      try {
        if (isSql) {
          const sql = fs.readFileSync(filePath, 'utf8');
          await this.db.query(sql);
        } else if (isJs) {
          const migrationModule = require(filePath);
          const runner = migrationModule.up || migrationModule.run;
          if (typeof runner !== 'function') {
            throw new Error(`JS migration ${filename} must export function up(db) or run(db)`);
          }
          await runner(this.db);
        } else {
          throw new Error(`Unsupported migration file type: ${filename}`);
        }

        // Record the migration as executed
        await this.db.query('INSERT INTO migrations (filename) VALUES ($1)', [filename]);
        await this.db.query('COMMIT');
        console.log(`✅ Migration ${filename} executed successfully`);
      } catch (error) {
        await this.db.query('ROLLBACK');
        throw error;
      }

    } catch (error) {
      console.error(`❌ Error executing migration ${filename}:`, error);
      throw error;
    }
  }

  // Run all pending migrations
  async runPendingMigrations() {
    try {
      await this.initMigrationsTable();

      const executedMigrations = await this.getExecutedMigrations();
      const availableMigrations = this.getAvailableMigrations();

      const pendingMigrations = availableMigrations.filter(
        migration => !executedMigrations.includes(migration)
      );

      if (pendingMigrations.length === 0) {
        console.log('✅ All migrations are up to date');
        return;
      }

      console.log(`📋 Found ${pendingMigrations.length} pending migrations:`);
      pendingMigrations.forEach(migration => {
        console.log(`   - ${migration}`);
      });

      for (const migration of pendingMigrations) {
        await this.executeMigration(migration);
      }

      console.log(`🎉 Successfully executed ${pendingMigrations.length} migrations`);

    } catch (error) {
      console.error('❌ Error running migrations:', error);
      throw error;
    }
  }
}

module.exports = MigrationManager;
