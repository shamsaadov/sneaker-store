-- Create default admin user (password: admin123)
-- Use pgcrypto to hash password with bcrypt

-- Ensure pgcrypto is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO users (email, password, name, role)
SELECT 'admin@sneakerstore.com', crypt('admin123', gen_salt('bf', 10)), 'Администратор', 'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'admin@sneakerstore.com'
);


