
-- Revert changes
ALTER TABLE invoices 
DROP COLUMN tax_rate,
DROP COLUMN tax_type;

ALTER TABLE invoices 
RENAME COLUMN description TO notes;