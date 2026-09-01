-- ====================================================================================
-- SkeuoVault Inventory Management System - Supabase PostgreSQL Schema & Seed Migration
-- ====================================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'STAFF')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    icon_name TEXT DEFAULT 'Package',
    color_tag TEXT DEFAULT '#3b82f6',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
    sku TEXT UNIQUE NOT NULL,
    barcode TEXT,
    name TEXT NOT NULL,
    description TEXT,
    unit TEXT NOT NULL DEFAULT 'PCS',
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    stock_available INTEGER NOT NULL DEFAULT 0,
    stock_reserved INTEGER NOT NULL DEFAULT 0,
    critical_level INTEGER NOT NULL DEFAULT 5,
    reorder_quantity INTEGER NOT NULL DEFAULT 10,
    storage_rack_id TEXT NOT NULL DEFAULT 'A-01',
    expiry_date DATE,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. STOCK MOVEMENTS TABLE
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT', 'RETURN', 'DAMAGED', 'EXPIRED_DISPOSAL')),
    quantity INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reference_number TEXT NOT NULL,
    notes TEXT,
    user_id UUID,
    user_name TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 6. DELIVERIES TABLE
CREATE TABLE IF NOT EXISTS deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_number TEXT UNIQUE NOT NULL,
    user_id UUID,
    dispatcher_name TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    recipient_address TEXT,
    contact_number TEXT,
    total_quantity INTEGER NOT NULL DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'DISPATCHED', 'DELIVERED', 'CANCELLED', 'RETURNED')),
    scheduled_date DATE,
    dispatched_date TIMESTAMPTZ,
    delivered_date TIMESTAMPTZ,
    tracking_code TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. DELIVERY ITEMS TABLE
CREATE TABLE IF NOT EXISTS delivery_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_id UUID REFERENCES deliveries(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
    product_name TEXT NOT NULL,
    sku TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL
);

-- 8. INVOICES TABLE
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL,
    delivery_id UUID REFERENCES deliveries(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_address TEXT,
    customer_phone TEXT,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 12.00,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_status TEXT NOT NULL DEFAULT 'UNPAID' CHECK (payment_status IN ('PAID', 'PARTIAL', 'UNPAID', 'OVERDUE')),
    payment_method TEXT DEFAULT 'BANK_TRANSFER',
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    paid_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. INVOICE ITEMS TABLE
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    sku TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL
);

-- 10. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL CHECK (category IN ('UTILITIES', 'LOGISTICS', 'SALARIES', 'EQUIPMENT_MAINTENANCE', 'WAREHOUSE_SUPPLIES', 'MARKETING', 'MISCELLANEOUS')),
    title TEXT NOT NULL,
    description TEXT,
    amount NUMERIC(12, 2) NOT NULL,
    expense_date DATE DEFAULT CURRENT_DATE,
    authorized_by_user_id UUID,
    authorizer_name TEXT,
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. RECEIVABLES & PAYABLES (LEDGER) TABLE
CREATE TABLE IF NOT EXISTS receivables_payables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('RECEIVABLE', 'PAYABLE')),
    party_name TEXT NOT NULL,
    party_type TEXT NOT NULL DEFAULT 'CUSTOMER' CHECK (party_type IN ('CUSTOMER', 'SUPPLIER')),
    invoice_or_po_ref TEXT NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    remaining_balance NUMERIC(12, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'PARTIALLY_SETTLED', 'SETTLED', 'OVERDUE')),
    due_date DATE,
    settled_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. ACTIVITY LOGS (AUDIT TRAIL) TABLE
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE receivables_payables ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous/authenticated client operations (can be tuned per user authentication state)
CREATE POLICY "Allow public read users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public write users" ON users FOR ALL USING (true);

CREATE POLICY "Allow public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public write categories" ON categories FOR ALL USING (true);

CREATE POLICY "Allow public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public write products" ON products FOR ALL USING (true);

CREATE POLICY "Allow public read stock_movements" ON stock_movements FOR SELECT USING (true);
CREATE POLICY "Allow public write stock_movements" ON stock_movements FOR ALL USING (true);

CREATE POLICY "Allow public read deliveries" ON deliveries FOR SELECT USING (true);
CREATE POLICY "Allow public write deliveries" ON deliveries FOR ALL USING (true);

CREATE POLICY "Allow public read delivery_items" ON delivery_items FOR SELECT USING (true);
CREATE POLICY "Allow public write delivery_items" ON delivery_items FOR ALL USING (true);

CREATE POLICY "Allow public read invoices" ON invoices FOR SELECT USING (true);
CREATE POLICY "Allow public write invoices" ON invoices FOR ALL USING (true);

CREATE POLICY "Allow public read invoice_items" ON invoice_items FOR SELECT USING (true);
CREATE POLICY "Allow public write invoice_items" ON invoice_items FOR ALL USING (true);

CREATE POLICY "Allow public read expenses" ON expenses FOR SELECT USING (true);
CREATE POLICY "Allow public write expenses" ON expenses FOR ALL USING (true);

CREATE POLICY "Allow public read receivables_payables" ON receivables_payables FOR SELECT USING (true);
CREATE POLICY "Allow public write receivables_payables" ON receivables_payables FOR ALL USING (true);

CREATE POLICY "Allow public read activity_logs" ON activity_logs FOR SELECT USING (true);
CREATE POLICY "Allow public write activity_logs" ON activity_logs FOR ALL USING (true);

-- ====================================================================================
-- SEED INITIAL DATA
-- ====================================================================================

-- 1. Initial Categories
INSERT INTO categories (id, name, code, description, icon_name, color_tag) VALUES
('c1000000-0000-0000-0000-000000000001', 'Electronics & Sensors', 'ELEC', 'Microcontrollers, sensors, industrial electronics', 'Cpu', '#3b82f6'),
('c1000000-0000-0000-0000-000000000002', 'Hardware & Fasteners', 'HDW', 'Bolts, nuts, structural metal fasteners', 'Wrench', '#8b5cf6'),
('c1000000-0000-0000-0000-000000000003', 'Raw Materials', 'RAW', 'Sheet metal, timber bars, polymer sheets', 'Layers', '#10b981'),
('c1000000-0000-0000-0000-000000000004', 'Safety & PPE', 'PPE', 'Helmets, safety goggles, thermal gloves', 'Shield', '#f59e0b'),
('c1000000-0000-0000-0000-000000000005', 'Chemicals & Lubricants', 'CHEM', 'Industrial grease, motor oil, degreasers', 'FlaskConical', '#ec4899')
ON CONFLICT (code) DO NOTHING;

-- 2. Initial Products
INSERT INTO products (id, category_id, sku, barcode, name, description, unit, cost_price, selling_price, stock_available, stock_reserved, critical_level, reorder_quantity, storage_rack_id, expiry_date) VALUES
('a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'ELEC-MCU-001', '4801234567890', 'STM32 Microcontroller Core Board', 'High-performance 32-bit ARM Cortex-M4 development module', 'PCS', 450.00, 750.00, 85, 5, 15, 50, 'A-01-1', NULL),
('a1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'ELEC-SNS-002', '4801234567891', 'Digital Ultrasonic Sensor Module', 'Precision distance measurement transducer', 'PCS', 180.00, 320.00, 6, 0, 10, 30, 'A-01-2', NULL),
('a1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 'ELEC-PWR-003', '4801234567892', '24V 10A Industrial Power Supply', 'DIN-rail mount enclosed switching unit', 'PCS', 1200.00, 1850.00, 0, 0, 5, 15, 'A-02-1', NULL),
('a1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002', 'HDW-BLT-001', '4801234567893', 'M8x40mm Hex Stainless Steel Bolt', 'Grade 316 corrosion-resistant machine fastener', 'BOX', 350.00, 580.00, 120, 10, 20, 50, 'B-01-1', NULL),
('a1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000002', 'HDW-NUT-002', '4801234567894', 'M8 Nylon Lock Nut (Pack of 100)', 'Vibration-resistant self-locking nylon insert', 'PACK', 220.00, 380.00, 4, 0, 8, 25, 'B-01-2', NULL),
('a1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000003', 'RAW-ALU-001', '4801234567895', '6061-T6 Aluminum Plate 10mm', 'Aerospace grade alloy plate 500x500mm', 'PCS', 2800.00, 4200.00, 14, 2, 5, 10, 'C-01-1', NULL),
('a1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000004', 'PPE-HLM-001', '4801234567896', 'High-Impact Industrial Hard Hat', 'ANSI certified ratchet suspension helmet', 'PCS', 480.00, 790.00, 45, 0, 10, 20, 'D-01-1', NULL),
('a1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000005', 'CHEM-LUB-001', '4801234567897', 'Synthetic Bearing Grease EP2', 'Lithium complex heavy duty lubricant 1kg', 'PCS', 650.00, 1100.00, 30, 0, 8, 20, 'E-01-1', '2026-01-15'),
('a1000000-0000-0000-0000-000000000009', 'c1000000-0000-0000-0000-000000000005', 'CHEM-DEG-002', '4801234567898', 'Industrial Fast-Dry Degreaser 5L', 'Citrus-based heavy residue cleaner', 'LTR', 890.00, 1450.00, 8, 0, 10, 15, 'E-01-2', '2026-09-15')
ON CONFLICT (sku) DO NOTHING;
