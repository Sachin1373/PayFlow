CREATE EXTENSION IF NOT EXISTS pgcrypto;


CREATE TABLE business (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,

    mobile_no VARCHAR(20) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE business_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    business_id UUID NOT NULL UNIQUE
        REFERENCES business(uuid)
        ON DELETE CASCADE,

    business_name VARCHAR(255) NOT NULL,

    business_email VARCHAR(255),

    business_phone VARCHAR(20),

    gst_number VARCHAR(50),

    logo_url TEXT,

    cashfree_app_id TEXT,

    cashfree_secret_key TEXT,

    cashfree_webhook_secret TEXT,

    cashfree_environment VARCHAR(20)
        DEFAULT 'SANDBOX'
        CHECK (
            cashfree_environment IN (
                'SANDBOX',
                'PRODUCTION'
            )
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    business_id UUID NOT NULL UNIQUE
        REFERENCES business(uuid)
        ON DELETE CASCADE,

    email_payment_received BOOLEAN DEFAULT TRUE,
    email_payment_failed BOOLEAN DEFAULT TRUE,
    email_invoice_overdue BOOLEAN DEFAULT TRUE,

    whatsapp_payment_received BOOLEAN DEFAULT FALSE,
    whatsapp_payment_failed BOOLEAN DEFAULT FALSE,
    whatsapp_invoice_overdue BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    business_id UUID NOT NULL
        REFERENCES business(uuid)
        ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,

    email VARCHAR(255),

    mobile_no VARCHAR(20),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    business_id UUID NOT NULL
        REFERENCES business(uuid)
        ON DELETE CASCADE,

    customer_id UUID NOT NULL
        REFERENCES customers(id)
        ON DELETE CASCADE,

    invoice_no VARCHAR(100) NOT NULL UNIQUE,

    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',

    subtotal NUMERIC(12,2) NOT NULL,

    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,

    total_amount NUMERIC(12,2) NOT NULL,

    due_date DATE,

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    invoice_id UUID NOT NULL
        REFERENCES invoices(id)
        ON DELETE CASCADE,

    description TEXT NOT NULL,

    quantity INTEGER NOT NULL,

    unit_price NUMERIC(12,2) NOT NULL,

    amount NUMERIC(12,2) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    business_id UUID NOT NULL
        REFERENCES business(uuid)
        ON DELETE CASCADE,

    invoice_id UUID NOT NULL
        REFERENCES invoices(id)
        ON DELETE CASCADE,

    cf_order_id TEXT UNIQUE NOT NULL,

    payment_link TEXT NOT NULL,

    amount NUMERIC(12,2) NOT NULL,

    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',

    expires_at TIMESTAMPTZ,

    paid_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL
        REFERENCES orders(id)
        ON DELETE CASCADE,

    cf_payment_id TEXT,

    event_type VARCHAR(100) NOT NULL,

    payload JSONB NOT NULL,

    processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- CREATE INDEX idx_customers_business_id
-- ON customers(business_id);

-- CREATE INDEX idx_invoices_business_id
-- ON invoices(business_id);

-- CREATE INDEX idx_invoices_customer_id
-- ON invoices(customer_id);

-- CREATE INDEX idx_invoice_items_invoice_id
-- ON invoice_items(invoice_id);

-- CREATE INDEX idx_orders_invoice_id
-- ON orders(invoice_id);

-- CREATE INDEX idx_orders_business_id
-- ON orders(business_id);

-- CREATE INDEX idx_payment_events_order_id
-- ON payment_events(order_id);