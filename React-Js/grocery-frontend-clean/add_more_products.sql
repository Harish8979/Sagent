-- Add more products to grocery_app database
-- Run this with: mysql -u root -p grocery_app < ~/grocery-frontend/add_more_products.sql

-- Insert more products across different categories
INSERT INTO product (name, description, price, status, category_id) VALUES
-- Grains & Cereals (category 1)
('Wheat Flour', 'Premium Whole Wheat Flour 5kg', 250, 'AVAILABLE', 1),
('Oats', 'Rolled Oats 1kg', 150, 'AVAILABLE', 1),
('Quinoa', 'Organic Quinoa 500g', 280, 'AVAILABLE', 1),
('Pasta', 'Italian Penne Pasta 500g', 95, 'AVAILABLE', 1),

-- Dairy Products (category 2)
('Yogurt', 'Fresh Curd 500ml', 40, 'AVAILABLE', 2),
('Butter', 'Salted Butter 200g', 110, 'AVAILABLE', 2),
('Cheese', 'Cheddar Cheese 200g', 180, 'AVAILABLE', 2),
('Paneer', 'Fresh Paneer 250g', 90, 'AVAILABLE', 2),

-- Cooking Oils (category 3)
('Olive Oil', 'Extra Virgin Olive Oil 500ml', 450, 'AVAILABLE', 3),
('Coconut Oil', 'Pure Coconut Oil 500ml', 220, 'AVAILABLE', 3),
('Mustard Oil', 'Kachi Ghani Mustard Oil 1L', 200, 'AVAILABLE', 3),

-- Vegetables & Fruits (assuming category 4)
('Tomatoes', 'Fresh Red Tomatoes 1kg', 40, 'AVAILABLE', 4),
('Onions', 'Fresh Onions 1kg', 35, 'AVAILABLE', 4),
('Potatoes', 'Fresh Potatoes 1kg', 30, 'AVAILABLE', 4),
('Apples', 'Fresh Red Apples 1kg', 150, 'AVAILABLE', 4),
('Bananas', 'Fresh Bananas 1 dozen', 60, 'AVAILABLE', 4),
('Carrots', 'Fresh Carrots 500g', 25, 'AVAILABLE', 4),

-- Pulses & Lentils (assuming category 5)
('Toor Dal', 'Arhar Dal 1kg', 140, 'AVAILABLE', 5),
('Moong Dal', 'Green Moong Dal 1kg', 130, 'AVAILABLE', 5),
('Chana Dal', 'Bengal Gram Dal 1kg', 120, 'AVAILABLE', 5),
('Rajma', 'Red Kidney Beans 500g', 110, 'AVAILABLE', 5),

-- Spices & Condiments (assuming category 6)
('Turmeric Powder', 'Pure Turmeric Powder 100g', 45, 'AVAILABLE', 6),
('Red Chili Powder', 'Red Chili Powder 100g', 50, 'AVAILABLE', 6),
('Cumin Seeds', 'Jeera 100g', 60, 'AVAILABLE', 6),
('Salt', 'Iodized Salt 1kg', 20, 'AVAILABLE', 6),
('Sugar', 'White Sugar 1kg', 45, 'AVAILABLE', 6),

-- Beverages (assuming category 7)
('Tea', 'Premium Tea Leaves 250g', 180, 'AVAILABLE', 7),
('Coffee', 'Instant Coffee 50g', 220, 'AVAILABLE', 7),
('Juice', 'Mixed Fruit Juice 1L', 120, 'AVAILABLE', 7),

-- Snacks (assuming category 8)
('Biscuits', 'Cream Biscuits 200g', 40, 'AVAILABLE', 8),
('Chips', 'Potato Chips 100g', 30, 'AVAILABLE', 8),
('Namkeen', 'Mixture Namkeen 200g', 50, 'AVAILABLE', 8);

-- Create categories if they don't exist
INSERT IGNORE INTO category (category_id, name, description) VALUES
(1, 'Grains & Cereals', 'Rice, wheat, oats, and other grains'),
(2, 'Dairy Products', 'Milk, yogurt, cheese, and dairy items'),
(3, 'Cooking Oils', 'Various cooking oils and ghee'),
(4, 'Vegetables & Fruits', 'Fresh vegetables and fruits'),
(5, 'Pulses & Lentils', 'Dal and lentils'),
(6, 'Spices & Condiments', 'Spices, salt, sugar'),
(7, 'Beverages', 'Tea, coffee, juices'),
(8, 'Snacks', 'Biscuits, chips, namkeen');
