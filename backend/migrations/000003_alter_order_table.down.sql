-- Alter invoices table
ALTER TABLE orders 
RENAME COLUMN cf_link_id TO cf_order_id;

ALTER TABLE orders 
DROP COLUMN currency;