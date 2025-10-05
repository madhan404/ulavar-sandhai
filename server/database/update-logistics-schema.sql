-- Update logistics table to include all status values
ALTER TABLE logistics 
MODIFY COLUMN status ENUM('picked','in_transit','out_for_delivery','delivered','failed','returned') DEFAULT 'picked';

-- Add missing columns (MySQL doesn't support IF NOT EXISTS for ADD COLUMN)
-- These columns should already exist based on the current schema
-- ALTER TABLE logistics ADD COLUMN courier_name VARCHAR(255) AFTER order_id;
-- ALTER TABLE logistics ADD COLUMN tracking_number VARCHAR(255) AFTER courier_name;
-- ALTER TABLE logistics ADD COLUMN estimated_delivery DATE AFTER status;
-- ALTER TABLE logistics ADD COLUMN actual_delivery DATE AFTER estimated_delivery;
-- ALTER TABLE logistics ADD COLUMN pod_upload_url VARCHAR(500) AFTER actual_delivery;

-- Update existing records to have valid status
UPDATE logistics SET status = 'picked' WHERE status NOT IN ('picked','in_transit','out_for_delivery','delivered','failed','returned');
