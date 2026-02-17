-- Grocery App Database Updates
-- Run this file with: mysql -u root -p grocery_app < add_database_columns.sql

USE grocery_app;

-- Add address column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS address VARCHAR(500);

-- Add delivery_address column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address VARCHAR(500);

-- Show the updated table structures
SELECT 'Users table updated:' AS Status;
DESCRIBE users;

SELECT 'Orders table updated:' AS Status;
DESCRIBE orders;
