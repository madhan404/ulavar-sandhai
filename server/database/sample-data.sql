-- Sample Data for Agricultural Marketplace
-- Admin and Farmer accounts with Indian formats

-- Clear existing sample data (optional)
DELETE FROM farmers WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%sample%');
DELETE FROM users WHERE email LIKE '%sample%';

-- Sample Admin Users
INSERT INTO users (name, email, phone, password_hash, role, status) VALUES
('Rajesh Kumar Sharma', 'admin.rajesh@agrimarket.in', '+91-98765-43210', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'active'),
('Priya Patel', 'admin.priya@agrimarket.in', '+91-87654-32109', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'active'),
('Amit Singh', 'admin.amit@agrimarket.in', '+91-76543-21098', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'active');

-- Sample Farmer Users
INSERT INTO users (name, email, phone, password_hash, role, status) VALUES
('Lakshmi Devi', 'farmer.lakshmi@email.com', '+91-98765-12345', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'farmer', 'active'),
('Ramesh Chandra', 'farmer.ramesh@email.com', '+91-87654-23456', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'farmer', 'active'),
('Sunita Kumari', 'farmer.sunita@email.com', '+91-76543-34567', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'farmer', 'active'),
('Harish Patel', 'farmer.harish@email.com', '+91-65432-45678', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'farmer', 'active'),
('Meera Bai', 'farmer.meera@email.com', '+91-54321-56789', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'farmer', 'active'),
('Ganesh Iyer', 'farmer.ganesh@email.com', '+91-43210-67890', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'farmer', 'active'),
('Kavita Reddy', 'farmer.kavita@email.com', '+91-32109-78901', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'farmer', 'active'),
('Suresh Kumar', 'farmer.suresh@email.com', '+91-21098-89012', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'farmer', 'active');

-- Sample Farmer Details
INSERT INTO farmers (user_id, aadhaar_number, pan_number, gst_number, bank_account_number, bank_ifsc_code, bank_name, pickup_address, city, state, pincode, kyc_status) VALUES
((SELECT id FROM users WHERE email = 'farmer.lakshmi@email.com'), '123456789012', 'ABCDE1234F', '22AAAAA0000A1Z5', '1234567890123456', 'SBIN0001234', 'State Bank of India', 'Village: Ramgarh, Post: Ramgarh, Tehsil: Sikar', 'Sikar', 'Rajasthan', '332001', 'approved'),
((SELECT id FROM users WHERE email = 'farmer.ramesh@email.com'), '234567890123', 'BCDEF2345G', '33BBBBB0000B2Z6', '2345678901234567', 'HDFC0001234', 'HDFC Bank', 'House No: 45, Street: Gandhi Marg, Colony: New Colony', 'Jaipur', 'Rajasthan', '302001', 'approved'),
((SELECT id FROM users WHERE email = 'farmer.sunita@email.com'), '345678901234', 'CDEFG3456H', '44CCCCC0000C3Z7', '3456789012345678', 'ICICI0001234', 'ICICI Bank', 'Farm: Green Valley, Village: Devpura, Post: Devpura', 'Udaipur', 'Rajasthan', '313001', 'approved'),
((SELECT id FROM users WHERE email = 'farmer.harish@email.com'), '456789012345', 'DEFGH4567I', '55DDDDD0000D4Z8', '4567890123456789', 'PNB0001234', 'Punjab National Bank', 'Plot No: 78, Sector: 15, Colony: Industrial Area', 'Jodhpur', 'Rajasthan', '342001', 'approved'),
((SELECT id FROM users WHERE email = 'farmer.meera@email.com'), '567890123456', 'EFGHI5678J', '66EEEEE0000E5Z9', '5678901234567890', 'BOB0001234', 'Bank of Baroda', 'Village: Meera Nagar, Post: Meera Nagar, Tehsil: Alwar', 'Alwar', 'Rajasthan', '301001', 'approved'),
((SELECT id FROM users WHERE email = 'farmer.ganesh@email.com'), '678901234567', 'FGHIJ6789K', '77FFFFF0000F6Z0', '6789012345678901', 'SBI0001234', 'State Bank of India', 'House No: 123, Street: Temple Road, Colony: Old City', 'Ajmer', 'Rajasthan', '305001', 'approved'),
((SELECT id FROM users WHERE email = 'farmer.kavita@email.com'), '789012345678', 'GHIJK7890L', '88GGGGG0000G7Z1', '7890123456789012', 'HDFC0001234', 'HDFC Bank', 'Farm: Sunshine Fields, Village: Kavita Nagar, Post: Kavita Nagar', 'Bikaner', 'Rajasthan', '334001', 'approved'),
((SELECT id FROM users WHERE email = 'farmer.suresh@email.com'), '890123456789', 'HIJKL8901M', '99HHHHH0000H8Z2', '8901234567890123', 'ICICI0001234', 'ICICI Bank', 'Plot No: 456, Sector: 22, Colony: Green Valley', 'Kota', 'Rajasthan', '324001', 'approved');

-- Display the created sample data
SELECT 'Admin Users:' as user_type, name, email, phone, role, status FROM users WHERE role = 'admin';
SELECT 'Farmer Users:' as user_type, name, email, phone, role, status FROM users WHERE role = 'farmer';
SELECT 'Farmer Details:' as info, f.user_id, u.name, f.city, f.state, f.kyc_status FROM farmers f JOIN users u ON f.user_id = u.id;
