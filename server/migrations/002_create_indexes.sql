-- Migration: 002_create_indexes
-- Description: Create database indexes for better performance
-- Created: 2024-01-01

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_product_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- JSONB indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_products_images_gin ON products USING GIN(images);
CREATE INDEX IF NOT EXISTS idx_products_sizes_gin ON products USING GIN(sizes);
CREATE INDEX IF NOT EXISTS idx_products_footwear_attrs_gin ON products USING GIN(footwear_attributes);
CREATE INDEX IF NOT EXISTS idx_products_clothing_attrs_gin ON products USING GIN(clothing_attributes);
CREATE INDEX IF NOT EXISTS idx_products_toys_attrs_gin ON products USING GIN(toys_attributes);
CREATE INDEX IF NOT EXISTS idx_products_accessories_attrs_gin ON products USING GIN(accessories_attributes);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING GIN(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_description_trgm ON products USING GIN(description gin_trgm_ops);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_product_type ON categories(product_type);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_name ON orders(customer_name);
CREATE INDEX IF NOT EXISTS idx_orders_items_gin ON orders USING GIN(items);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

-- Cart items indexes
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_product ON cart_items(product_id);

-- Special orders indexes  
CREATE INDEX IF NOT EXISTS idx_special_orders_status ON special_orders(status);
CREATE INDEX IF NOT EXISTS idx_special_orders_urgency ON special_orders(urgency);
CREATE INDEX IF NOT EXISTS idx_special_orders_created ON special_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_special_orders_name ON special_orders(name);
CREATE INDEX IF NOT EXISTS idx_special_orders_phone ON special_orders(phone);
CREATE INDEX IF NOT EXISTS idx_special_orders_brand ON special_orders(brand);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
