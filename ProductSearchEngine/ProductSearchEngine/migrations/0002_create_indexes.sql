-- Create performance indexes for filtering and searching
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(average_rating);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Create composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_products_active_category ON products(is_active, category);
CREATE INDEX IF NOT EXISTS idx_products_active_price ON products(is_active, price);
CREATE INDEX IF NOT EXISTS idx_products_category_price ON products(category, price);

-- Create text search indexes
CREATE INDEX IF NOT EXISTS idx_products_name_gin ON products USING gin(to_tsvector('turkish', name));
CREATE INDEX IF NOT EXISTS idx_products_description_gin ON products USING gin(to_tsvector('turkish', description));

-- Enable trigram extension for fuzzy text search (if available)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_description_trgm ON products USING gin(description gin_trgm_ops);
