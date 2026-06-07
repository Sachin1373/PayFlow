-- Alter invoices table
ALTER TABLE invoices 
RENAME COLUMN notes TO description;

ALTER TABLE invoices 
ADD COLUMN tax_rate NUMERIC(5,2) DEFAULT 0.00 NOT NULL,
ADD COLUMN tax_type VARCHAR(20) DEFAULT 'IGST' CHECK (tax_type IN ('IGST', 'CGST+SGST', 'UGST'));