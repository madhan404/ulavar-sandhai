-- Add missing tables for settings functionality

-- Admins table (if it doesn't exist)
  CREATE TABLE IF NOT EXISTS admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    department VARCHAR(100),
    designation VARCHAR(100),
    permissions TEXT,
    office_location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

-- Logistics profiles table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS logistics_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  company_name VARCHAR(255),
  service_area TEXT,
  vehicle_type VARCHAR(100),
  contact_person VARCHAR(255),
  emergency_contact VARCHAR(15),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default admin profile for existing admin users
INSERT IGNORE INTO admins (user_id, department, designation, office_location)
SELECT id, 'Administration', 'System Administrator', 'Main Office'
FROM users 
WHERE role = 'admin' 
AND id NOT IN (SELECT user_id FROM admins);

-- Insert default logistics profile for existing logistics users
INSERT IGNORE INTO logistics_profiles (user_id, company_name, service_area, vehicle_type, contact_person)
SELECT id, 'Logistics Company', 'All Areas', 'Truck', 'Primary Contact'
FROM users 
WHERE role = 'logistics' 
AND id NOT IN (SELECT user_id FROM logistics_profiles);

