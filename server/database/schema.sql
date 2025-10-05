-- Schema extracted from supabase/migrations with adjustments
CREATE DATABASE IF NOT EXISTS agricultural_marketplace;
USE agricultural_marketplace;

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(15) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  role ENUM('farmer','buyer','admin','logistics') NOT NULL,
  status ENUM('pending','active','suspended','rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS farmers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  aadhaar_number VARCHAR(12),
  pan_number VARCHAR(10),
  gst_number VARCHAR(15),
  bank_account_number VARCHAR(20),
  bank_ifsc_code VARCHAR(11),
  bank_name VARCHAR(255),
  photo_url VARCHAR(500),
  pickup_address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  kyc_status ENUM('pending','approved','rejected') DEFAULT 'pending',
  rejection_reason TEXT,
  kyc_documents JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS buyers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  default_address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  name_hindi VARCHAR(100),
  description TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  farmer_id INT NOT NULL,
  category_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  name_hindi VARCHAR(255),
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  min_order_quantity INT DEFAULT 1,
  images JSON,
  status ENUM('active','inactive','out_of_stock') DEFAULT 'active',
  harvest_date DATE,
  expiry_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  buyer_id INT NOT NULL,
  farmer_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 5.00,
  commission_amount DECIMAL(10,2) NOT NULL,
  delivery_address TEXT NOT NULL,
  status ENUM('placed','accepted','rejected','shipped','delivered','cancelled') DEFAULT 'placed',
  payment_status ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES buyers(id),
  FOREIGN KEY (farmer_id) REFERENCES farmers(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('razorpay','upi','cod') NOT NULL,
  transaction_id VARCHAR(255),
  status ENUM('pending','completed','failed','refunded') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS logistics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  courier_name VARCHAR(255),
  tracking_number VARCHAR(255),
  status ENUM('picked','in_transit','delivered') DEFAULT 'picked',
  estimated_delivery DATE,
  actual_delivery DATE,
  pod_upload_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info','success','warning','error') DEFAULT 'info',
  read_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS otps (
  id INT PRIMARY KEY AUTO_INCREMENT,
  phone VARCHAR(15) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_farmers_user_id ON farmers(user_id);
CREATE INDEX idx_buyers_user_id ON buyers(user_id);
CREATE INDEX idx_products_farmer_id ON products(farmer_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_farmer_id ON orders(farmer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);


