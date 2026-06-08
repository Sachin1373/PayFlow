-- Alter orders table
ALTER TABLE orders 
RENAME COLUMN cf_order_id TO cf_link_id;

ALTER TABLE orders 
ADD COLUMN currency TEXT DEFAULT 'INR' NOT NULL;