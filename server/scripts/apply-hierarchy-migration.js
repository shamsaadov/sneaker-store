#!/usr/bin/env node

/**
 * Script to apply the category hierarchy migration
 * This will add parent_id and level columns to the categories table
 */

const fs = require('fs');
const path = require('path');
const db = require('../config/database');

async function applyMigration() {
  try {
    console.log('🚀 Starting category hierarchy migration...\n');

    // Read the migration file
    const migrationPath = path.join(__dirname, '../migrations/004_add_category_hierarchy.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        await db.query(statement);
      }
    }

    console.log('\n✅ Migration applied successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Existing categories are now at level 0 (root categories)');
    console.log('2. Create child categories with parent_id set');
    console.log('3. The hierarchy is: Root (0) → Category (1) → Subcategory (2)');
    console.log('4. Products should be assigned to subcategories (level 2)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error applying migration:', error);
    process.exit(1);
  }
}

// Run the migration
applyMigration();

