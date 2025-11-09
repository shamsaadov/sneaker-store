-- Migration: 004_add_category_hierarchy
-- Description: Add hierarchical structure to categories (Root Category -> Category -> Subcategory)
-- Created: 2024-11-09

-- Add parent_id and level to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 0 CHECK (level >= 0 AND level <= 2);

-- Create index for faster hierarchical queries
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_level ON categories(level);

-- Add comments for clarity
COMMENT ON COLUMN categories.parent_id IS 'Reference to parent category (NULL for root categories)';
COMMENT ON COLUMN categories.level IS 'Hierarchy level: 0 = Root Category, 1 = Category, 2 = Subcategory';

-- Update trigger to maintain updated_at
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_categories_timestamp ON categories;
CREATE TRIGGER update_categories_timestamp
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_categories_updated_at();

