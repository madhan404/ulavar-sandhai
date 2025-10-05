-- Initialize database
SOURCE schema.sql;

-- Create default admin user (password: 123)
INSERT INTO users (name, email, phone, password_hash, role, status) VALUES 
('Admin User', 'admin@kisan.local', '9999999999', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'active')
ON DUPLICATE KEY UPDATE name=name;

-- Create default logistics user (password: 123)
INSERT INTO users (name, email, phone, password_hash, role, status) VALUES 
('Logistics User', 'logistics@kisan.local', '8888888888', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'logistics', 'active')
ON DUPLICATE KEY UPDATE name=name;

-- Create default buyer user (password: 123) - BUYERS ARE ALWAYS ACTIVE
INSERT INTO users (name, email, phone, password_hash, role, status) VALUES 
('Test Buyer', 'buyer@test.local', '7777777777', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'buyer', 'active')
ON DUPLICATE KEY UPDATE name=name;

-- Create default farmer user (password: 123) - FARMERS START AS PENDING
INSERT INTO users (name, email, phone, password_hash, role, status) VALUES 
('Test Farmer', 'farmer@test.local', '6666666666', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'farmer', 'pending')
ON DUPLICATE KEY UPDATE name=name;

-- Create additional sample users for better admin dashboard
-- Sample Farmers (some pending, some active)
INSERT INTO users (name, email, phone, password_hash, role, status) VALUES 
('Rajesh Kumar', 'rajesh@farmer.local', '9876543210', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'farmer', 'pending'),
('Priya Singh', 'priya@farmer.local', '9876543211', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'farmer', 'pending'),
('Amit Patel', 'amit@farmer.local', '9876543212', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'farmer', 'active'),
('Sunita Devi', 'sunita@farmer.local', '9876543213', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'farmer', 'active')
ON DUPLICATE KEY UPDATE name=name;

-- Sample Buyers
INSERT INTO users (name, email, phone, password_hash, role, status) VALUES 
('Rahul Sharma', 'rahul@buyer.local', '8765432109', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'buyer', 'active'),
('Neha Gupta', 'neha@buyer.local', '8765432108', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'buyer', 'active'),
('Vikram Singh', 'vikram@buyer.local', '8765432107', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'buyer', 'active')
ON DUPLICATE KEY UPDATE name=name;

-- Sample Logistics Partners
INSERT INTO users (name, email, phone, password_hash, role, status) VALUES 
('FastTrack Logistics', 'fasttrack@logistics.local', '7654321098', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'logistics', 'active'),
('QuickShip Express', 'quickship@logistics.local', '7654321097', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'logistics', 'active')
ON DUPLICATE KEY UPDATE name=name;

-- Create corresponding profiles
INSERT INTO buyers (user_id, city, state, pincode, default_address) 
SELECT id, 'Mumbai', 'Maharashtra', '400001', '123 Main Street, Andheri West' FROM users WHERE role = 'buyer' AND email = 'buyer@test.local'
ON DUPLICATE KEY UPDATE user_id=user_id;

INSERT INTO buyers (user_id, city, state, pincode, default_address) 
SELECT id, 'Mumbai', 'Maharashtra', '400002', '456 Park Avenue, Bandra East' FROM users WHERE role = 'buyer' AND email = 'rahul@buyer.local'
ON DUPLICATE KEY UPDATE user_id=user_id;

INSERT INTO buyers (user_id, city, state, pincode, default_address) 
SELECT id, 'Delhi', 'Delhi', '110001', '789 Connaught Place, New Delhi' FROM users WHERE role = 'buyer' AND email = 'neha@buyer.local'
ON DUPLICATE KEY UPDATE user_id=user_id;

INSERT INTO buyers (user_id, city, state, pincode, default_address) 
SELECT id, 'Bangalore', 'Karnataka', '560001', '321 MG Road, Bangalore' FROM users WHERE role = 'buyer' AND email = 'vikram@buyer.local'
ON DUPLICATE KEY UPDATE user_id=user_id;

INSERT INTO farmers (user_id, city, state, pincode, pickup_address, pan_number, gst_number, aadhaar_number, bank_name, bank_account_number, bank_ifsc_code) 
SELECT id, 'Mumbai', 'Maharashtra', '400003', 'Farm House 1, Village Road, Thane', 'ABCDE1234F', '27ABCDE1234F1Z5', '123456789012', 'State Bank of India', '12345678901', 'SBIN0001234' FROM users WHERE role = 'farmer' AND email = 'farmer@test.local'
ON DUPLICATE KEY UPDATE user_id=user_id;

INSERT INTO farmers (user_id, city, state, pincode, pickup_address, pan_number, gst_number, aadhaar_number, bank_name, bank_account_number, bank_ifsc_code) 
SELECT id, 'Delhi', 'Delhi', '110002', 'Organic Farm, Outer Ring Road, Delhi', 'FGHIJ5678K', '07FGHIJ5678K1Z5', '234567890123', 'HDFC Bank', '23456789012', 'HDFC0001234' FROM users WHERE role = 'farmer' AND email = 'rajesh@farmer.local'
ON DUPLICATE KEY UPDATE user_id=user_id;

INSERT INTO farmers (user_id, city, state, pincode, pickup_address, pan_number, gst_number, aadhaar_number, bank_name, bank_account_number, bank_ifsc_code) 
SELECT id, 'Pune', 'Maharashtra', '411001', 'Green Valley Farm, Pune-Mumbai Highway', 'KLMNO9012P', '27KLMNO9012P1Z5', '345678901234', 'ICICI Bank', '34567890123', 'ICIC0001234' FROM users WHERE role = 'farmer' AND email = 'priya@farmer.local'
ON DUPLICATE KEY UPDATE user_id=user_id;

INSERT INTO farmers (user_id, city, state, pincode, pickup_address, pan_number, gst_number, aadhaar_number, bank_name, bank_account_number, bank_ifsc_code) 
SELECT id, 'Ahmedabad', 'Gujarat', '380001', 'Fresh Harvest Farm, Ahmedabad', 'PQRST3456U', '24PQRST3456U1Z5', '456789012345', 'Axis Bank', '45678901234', 'UTIB0001234' FROM users WHERE role = 'farmer' AND email = 'amit@farmer.local'
ON DUPLICATE KEY UPDATE user_id=user_id;

INSERT INTO farmers (user_id, city, state, pincode, pickup_address, pan_number, gst_number, aadhaar_number, bank_name, bank_account_number, bank_ifsc_code) 
SELECT id, 'Chennai', 'Tamil Nadu', '600001', 'Southern Farm, Chennai', 'UVWXY6789Z', '33UVWXY6789Z1Z5', '567890123456', 'Canara Bank', '56789012345', 'CNRB0001234' FROM users WHERE role = 'farmer' AND email = 'sunita@farmer.local'
ON DUPLICATE KEY UPDATE user_id=user_id;

-- Add sample categories
INSERT INTO categories (name, name_hindi, description) VALUES 
('Vegetables', 'सब्जियां', 'Fresh vegetables from local farms'),
('Fruits', 'फल', 'Seasonal and exotic fruits'),
('Grains', 'अनाज', 'Rice, wheat, pulses and other grains'),
('Dairy', 'दूध', 'Milk, curd, butter and dairy products'),
('Spices', 'मसाले', 'Fresh and dried spices'),
('Herbs', 'जड़ी बूटी', 'Medicinal and culinary herbs')
ON DUPLICATE KEY UPDATE name=name;

-- Add sample products
INSERT INTO products (farmer_id, category_id, name, description, price, unit, stock_quantity, status) VALUES 
(1, 1, 'Fresh Tomatoes', 'Organic red tomatoes from our farm', 40.00, 'kg', 100, 'active'),
(1, 1, 'Onions', 'Fresh white onions', 25.00, 'kg', 150, 'active'),
(2, 2, 'Mangoes', 'Sweet Alphonso mangoes', 120.00, 'kg', 50, 'active'),
(2, 3, 'Basmati Rice', 'Premium quality basmati rice', 80.00, 'kg', 200, 'active'),
(3, 4, 'Fresh Milk', 'Pure cow milk', 60.00, 'liter', 100, 'active'),
(3, 5, 'Black Pepper', 'Freshly ground black pepper', 200.00, 'kg', 25, 'active')
ON DUPLICATE KEY UPDATE name=name;


