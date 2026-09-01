import { v4 as uuidv4 } from 'uuid';
import type {
  User, Category, Product, StockMovement, Delivery, Invoice,
  Expense, ReceivablesPayablesEntry, ActivityLog, MonthlyProfitReport
} from '../types';

// ── Users ──
export const mockUsers: User[] = [
  {
    id: 'usr-admin-001',
    username: 'admin',
    fullName: 'Ricardo Santos',
    email: 'admin@skeuo.vault',
    role: 'ADMIN',
    isActive: true,
    lastLogin: '2026-09-01T08:30:00Z',
    createdAt: '2025-01-15T00:00:00Z',
  },
  {
    id: 'usr-admin-002',
    username: 'superadmin',
    fullName: 'Elena Reyes',
    email: 'elena@skeuo.vault',
    role: 'ADMIN',
    isActive: true,
    lastLogin: '2026-08-30T14:00:00Z',
    createdAt: '2025-01-15T00:00:00Z',
  },
  {
    id: 'usr-staff-001',
    username: 'staff01',
    fullName: 'Marco dela Cruz',
    email: 'marco@skeuo.vault',
    role: 'STAFF',
    isActive: true,
    lastLogin: '2026-09-01T07:00:00Z',
    createdAt: '2025-03-10T00:00:00Z',
  },
  {
    id: 'usr-staff-002',
    username: 'staff02',
    fullName: 'Anika Patel',
    email: 'anika@skeuo.vault',
    role: 'STAFF',
    isActive: true,
    lastLogin: '2026-08-31T16:45:00Z',
    createdAt: '2025-04-01T00:00:00Z',
  },
  {
    id: 'usr-staff-003',
    username: 'staff03',
    fullName: 'James Ortega',
    email: 'james@skeuo.vault',
    role: 'STAFF',
    isActive: false,
    createdAt: '2025-05-20T00:00:00Z',
  },
];

// ── Categories ──
export const mockCategories: Category[] = [
  { id: 'cat-001', name: 'Electronics', code: 'ELEC', description: 'Electronic devices and components', iconName: 'Cpu', colorTag: '#3b82f6', createdAt: '2025-01-20T00:00:00Z' },
  { id: 'cat-002', name: 'Office Supplies', code: 'OFFC', description: 'Stationery and office materials', iconName: 'Briefcase', colorTag: '#8b5cf6', createdAt: '2025-01-20T00:00:00Z' },
  { id: 'cat-003', name: 'Food & Beverages', code: 'FOOD', description: 'Perishable food items and drinks', iconName: 'Package', colorTag: '#10b981', createdAt: '2025-01-20T00:00:00Z' },
  { id: 'cat-004', name: 'Industrial Tools', code: 'TOOL', description: 'Machinery, tools and equipment', iconName: 'Wrench', colorTag: '#f59e0b', createdAt: '2025-01-20T00:00:00Z' },
  { id: 'cat-005', name: 'Packaging Materials', code: 'PACK', description: 'Boxes, tape, bubble wrap, etc.', iconName: 'Box', colorTag: '#ec4899', createdAt: '2025-01-20T00:00:00Z' },
];

// ── Products ──
export const mockProducts: Product[] = [
  // Electronics
  { id: 'prd-001', categoryId: 'cat-001', categoryName: 'Electronics', sku: 'ELEC-001', barcode: '8901234567890', name: 'Wireless Keyboard Pro', description: 'Mechanical wireless keyboard with RGB backlight', unit: 'PCS', costPrice: 850, sellingPrice: 1299, stockAvailable: 42, stockReserved: 5, criticalLevel: 10, reorderQuantity: 25, storageRackId: 'A-01', status: 'IN_STOCK', createdAt: '2025-02-01T00:00:00Z', updatedAt: '2026-08-28T00:00:00Z' },
  { id: 'prd-002', categoryId: 'cat-001', categoryName: 'Electronics', sku: 'ELEC-002', barcode: '8901234567891', name: 'USB-C Hub 7-in-1', description: 'Multi-port USB-C hub with HDMI and ethernet', unit: 'PCS', costPrice: 650, sellingPrice: 995, stockAvailable: 8, stockReserved: 2, criticalLevel: 10, reorderQuantity: 20, storageRackId: 'A-02', status: 'CRITICAL', createdAt: '2025-02-01T00:00:00Z', updatedAt: '2026-08-29T00:00:00Z' },
  { id: 'prd-003', categoryId: 'cat-001', categoryName: 'Electronics', sku: 'ELEC-003', barcode: '8901234567892', name: 'Laptop Stand Aluminum', description: 'Adjustable ergonomic laptop riser', unit: 'PCS', costPrice: 420, sellingPrice: 699, stockAvailable: 0, stockReserved: 0, criticalLevel: 5, reorderQuantity: 15, storageRackId: 'A-03', status: 'OUT_OF_STOCK', createdAt: '2025-02-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z' },
  { id: 'prd-004', categoryId: 'cat-001', categoryName: 'Electronics', sku: 'ELEC-004', barcode: '8901234567893', name: 'Noise-Cancelling Headset', description: 'Over-ear ANC headset with mic', unit: 'PCS', costPrice: 1800, sellingPrice: 2799, stockAvailable: 19, stockReserved: 3, criticalLevel: 8, reorderQuantity: 12, storageRackId: 'A-04', status: 'IN_STOCK', createdAt: '2025-03-01T00:00:00Z', updatedAt: '2026-08-15T00:00:00Z' },
  // Office Supplies
  { id: 'prd-005', categoryId: 'cat-002', categoryName: 'Office Supplies', sku: 'OFFC-001', barcode: '8901234568000', name: 'Premium Bond Paper A4 (500s)', description: 'High-quality 80gsm bond paper ream', unit: 'PACK', costPrice: 180, sellingPrice: 295, stockAvailable: 126, stockReserved: 10, criticalLevel: 20, reorderQuantity: 50, storageRackId: 'B-01', status: 'IN_STOCK', createdAt: '2025-02-15T00:00:00Z', updatedAt: '2026-08-20T00:00:00Z' },
  { id: 'prd-006', categoryId: 'cat-002', categoryName: 'Office Supplies', sku: 'OFFC-002', barcode: '8901234568001', name: 'Ballpen Blue Box (12s)', description: 'Smooth-writing blue ballpoint pens', unit: 'BOX', costPrice: 35, sellingPrice: 65, stockAvailable: 4, stockReserved: 0, criticalLevel: 10, reorderQuantity: 30, storageRackId: 'B-02', status: 'CRITICAL', createdAt: '2025-02-15T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z' },
  { id: 'prd-007', categoryId: 'cat-002', categoryName: 'Office Supplies', sku: 'OFFC-003', barcode: '8901234568002', name: 'Stapler Heavy Duty', description: '100-sheet capacity stapler', unit: 'PCS', costPrice: 280, sellingPrice: 450, stockAvailable: 31, stockReserved: 0, criticalLevel: 5, reorderQuantity: 10, storageRackId: 'B-03', status: 'IN_STOCK', createdAt: '2025-02-15T00:00:00Z', updatedAt: '2026-07-10T00:00:00Z' },
  // Food & Beverages
  { id: 'prd-008', categoryId: 'cat-003', categoryName: 'Food & Beverages', sku: 'FOOD-001', barcode: '8901234569000', name: 'Mineral Water 500ml (24s)', description: '24-pack mineral water bottles', unit: 'PACK', costPrice: 140, sellingPrice: 220, stockAvailable: 85, stockReserved: 12, criticalLevel: 15, reorderQuantity: 40, storageRackId: 'C-01', expiryDate: '2027-03-15', status: 'IN_STOCK', createdAt: '2025-04-01T00:00:00Z', updatedAt: '2026-08-25T00:00:00Z' },
  { id: 'prd-009', categoryId: 'cat-003', categoryName: 'Food & Beverages', sku: 'FOOD-002', barcode: '8901234569001', name: 'Instant Coffee 3-in-1 (50s)', description: 'Box of 50 sachets, classic blend', unit: 'BOX', costPrice: 175, sellingPrice: 299, stockAvailable: 0, stockReserved: 0, criticalLevel: 8, reorderQuantity: 20, storageRackId: 'C-02', expiryDate: '2026-07-01', status: 'EXPIRED', createdAt: '2025-04-01T00:00:00Z', updatedAt: '2026-07-02T00:00:00Z' },
  { id: 'prd-010', categoryId: 'cat-003', categoryName: 'Food & Beverages', sku: 'FOOD-003', barcode: '8901234569002', name: 'Energy Bar Variety (12s)', description: 'Assorted protein energy bars', unit: 'PACK', costPrice: 380, sellingPrice: 599, stockAvailable: 3, stockReserved: 0, criticalLevel: 5, reorderQuantity: 15, storageRackId: 'C-03', expiryDate: '2026-10-15', status: 'CRITICAL', createdAt: '2025-05-01T00:00:00Z', updatedAt: '2026-08-30T00:00:00Z' },
  // Industrial Tools
  { id: 'prd-011', categoryId: 'cat-004', categoryName: 'Industrial Tools', sku: 'TOOL-001', barcode: '8901234570000', name: 'Digital Torque Wrench', description: 'Calibrated 20-200Nm digital torque', unit: 'PCS', costPrice: 3200, sellingPrice: 4999, stockAvailable: 7, stockReserved: 1, criticalLevel: 3, reorderQuantity: 5, storageRackId: 'D-01', status: 'IN_STOCK', createdAt: '2025-06-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' },
  { id: 'prd-012', categoryId: 'cat-004', categoryName: 'Industrial Tools', sku: 'TOOL-002', barcode: '8901234570001', name: 'Safety Gloves (Pair)', description: 'Cut-resistant level 5 nitrile gloves', unit: 'PCS', costPrice: 185, sellingPrice: 320, stockAvailable: 56, stockReserved: 4, criticalLevel: 10, reorderQuantity: 20, storageRackId: 'D-02', status: 'IN_STOCK', createdAt: '2025-06-01T00:00:00Z', updatedAt: '2026-08-20T00:00:00Z' },
  // Packaging
  { id: 'prd-013', categoryId: 'cat-005', categoryName: 'Packaging Materials', sku: 'PACK-001', barcode: '8901234571000', name: 'Cardboard Box 12x12x12"', description: 'Double-walled shipping carton', unit: 'PCS', costPrice: 28, sellingPrice: 55, stockAvailable: 210, stockReserved: 20, criticalLevel: 30, reorderQuantity: 80, storageRackId: 'E-01', status: 'IN_STOCK', createdAt: '2025-07-01T00:00:00Z', updatedAt: '2026-08-28T00:00:00Z' },
  { id: 'prd-014', categoryId: 'cat-005', categoryName: 'Packaging Materials', sku: 'PACK-002', barcode: '8901234571001', name: 'Bubble Wrap Roll 50m', description: 'Large bubble wrap 50m x 60cm roll', unit: 'PCS', costPrice: 220, sellingPrice: 380, stockAvailable: 0, stockReserved: 0, criticalLevel: 5, reorderQuantity: 10, storageRackId: 'E-02', status: 'OUT_OF_STOCK', createdAt: '2025-07-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z' },
  { id: 'prd-015', categoryId: 'cat-005', categoryName: 'Packaging Materials', sku: 'PACK-003', barcode: '8901234571002', name: 'Packing Tape 48mm (6 rolls)', description: 'Heavy-duty transparent packing tape set', unit: 'SET', costPrice: 95, sellingPrice: 175, stockAvailable: 38, stockReserved: 5, criticalLevel: 8, reorderQuantity: 20, storageRackId: 'E-03', status: 'IN_STOCK', createdAt: '2025-07-01T00:00:00Z', updatedAt: '2026-08-22T00:00:00Z' },
];

// ── Stock Movements ──
export const mockStockMovements: StockMovement[] = [
  { id: uuidv4(), productId: 'prd-001', productName: 'Wireless Keyboard Pro', sku: 'ELEC-001', userId: 'usr-staff-001', userName: 'Marco dela Cruz', type: 'STOCK_IN', quantity: 25, previousStock: 17, currentStock: 42, referenceNumber: 'PO-2026-0892', notes: 'Regular stock replenishment', timestamp: '2026-08-28T09:15:00Z' },
  { id: uuidv4(), productId: 'prd-003', productName: 'Laptop Stand Aluminum', sku: 'ELEC-003', userId: 'usr-staff-002', userName: 'Anika Patel', type: 'STOCK_OUT', quantity: 12, previousStock: 12, currentStock: 0, referenceNumber: 'SO-2026-1104', notes: 'Bulk order fulfillment', timestamp: '2026-09-01T07:30:00Z' },
  { id: uuidv4(), productId: 'prd-009', productName: 'Instant Coffee 3-in-1', sku: 'FOOD-002', userId: 'usr-admin-001', userName: 'Ricardo Santos', type: 'EXPIRED_DISPOSAL', quantity: 15, previousStock: 15, currentStock: 0, referenceNumber: 'DISP-2026-0045', notes: 'Expired — past shelf life 2026-07-01', timestamp: '2026-07-02T11:00:00Z' },
  { id: uuidv4(), productId: 'prd-002', productName: 'USB-C Hub 7-in-1', sku: 'ELEC-002', userId: 'usr-staff-001', userName: 'Marco dela Cruz', type: 'STOCK_OUT', quantity: 5, previousStock: 13, currentStock: 8, referenceNumber: 'SO-2026-1098', timestamp: '2026-08-30T14:20:00Z' },
  { id: uuidv4(), productId: 'prd-005', productName: 'Premium Bond Paper A4', sku: 'OFFC-001', userId: 'usr-staff-002', userName: 'Anika Patel', type: 'STOCK_IN', quantity: 50, previousStock: 76, currentStock: 126, referenceNumber: 'PO-2026-0901', timestamp: '2026-08-20T10:00:00Z' },
];

// ── Deliveries ──
export const mockDeliveries: Delivery[] = [
  {
    id: 'del-001', deliveryNumber: 'DLV-2026-0901', userId: 'usr-staff-001', dispatcherName: 'Marco dela Cruz',
    recipientName: 'TechWorld Corp', recipientAddress: '123 Makati Ave, Makati City', contactNumber: '+63-917-555-0101',
    items: [
      { id: uuidv4(), productId: 'prd-001', productName: 'Wireless Keyboard Pro', sku: 'ELEC-001', quantity: 10, unitPrice: 1299, totalPrice: 12990 },
      { id: uuidv4(), productId: 'prd-004', productName: 'Noise-Cancelling Headset', sku: 'ELEC-004', quantity: 5, unitPrice: 2799, totalPrice: 13995 },
    ],
    totalQuantity: 15, totalAmount: 26985, status: 'DELIVERED', scheduledDate: '2026-08-28', deliveredDate: '2026-08-29',
    trackingCode: 'TRK-2026-0901', createdAt: '2026-08-27T08:00:00Z',
  },
  {
    id: 'del-002', deliveryNumber: 'DLV-2026-0902', userId: 'usr-admin-001', dispatcherName: 'Ricardo Santos',
    recipientName: 'Office Solutions PH', recipientAddress: '45 Ortigas Center, Pasig City', contactNumber: '+63-920-555-0202',
    items: [
      { id: uuidv4(), productId: 'prd-005', productName: 'Premium Bond Paper A4', sku: 'OFFC-001', quantity: 20, unitPrice: 295, totalPrice: 5900 },
      { id: uuidv4(), productId: 'prd-013', productName: 'Cardboard Box 12x12x12"', sku: 'PACK-001', quantity: 50, unitPrice: 55, totalPrice: 2750 },
    ],
    totalQuantity: 70, totalAmount: 8650, status: 'DISPATCHED', scheduledDate: '2026-09-02',
    trackingCode: 'TRK-2026-0902', createdAt: '2026-09-01T09:00:00Z',
  },
  {
    id: 'del-003', deliveryNumber: 'DLV-2026-0903', userId: 'usr-staff-002', dispatcherName: 'Anika Patel',
    recipientName: 'BuildRight Construction', recipientAddress: '7 Industrial Rd, Cavite', contactNumber: '+63-915-555-0303',
    items: [
      { id: uuidv4(), productId: 'prd-011', productName: 'Digital Torque Wrench', sku: 'TOOL-001', quantity: 3, unitPrice: 4999, totalPrice: 14997 },
      { id: uuidv4(), productId: 'prd-012', productName: 'Safety Gloves (Pair)', sku: 'TOOL-002', quantity: 20, unitPrice: 320, totalPrice: 6400 },
    ],
    totalQuantity: 23, totalAmount: 21397, status: 'PENDING', scheduledDate: '2026-09-03',
    trackingCode: 'TRK-2026-0903', createdAt: '2026-09-01T10:30:00Z',
  },
];

// ── Invoices ──
export const mockInvoices: Invoice[] = [
  {
    id: 'inv-001', invoiceNumber: 'INV-2026-0901', deliveryId: 'del-001',
    customerName: 'TechWorld Corp', customerAddress: '123 Makati Ave, Makati City', customerPhone: '+63-917-555-0101',
    items: mockDeliveries[0].items,
    subtotal: 26985, taxRate: 12, taxAmount: 3238.20, discountAmount: 0, grandTotal: 30223.20,
    paymentStatus: 'PAID', paymentMethod: 'BANK_TRANSFER', issueDate: '2026-08-29', dueDate: '2026-09-28',
  },
  {
    id: 'inv-002', invoiceNumber: 'INV-2026-0902', deliveryId: 'del-002',
    customerName: 'Office Solutions PH', customerAddress: '45 Ortigas Center, Pasig City', customerPhone: '+63-920-555-0202',
    items: mockDeliveries[1].items,
    subtotal: 8650, taxRate: 12, taxAmount: 1038, discountAmount: 200, grandTotal: 9488,
    paymentStatus: 'UNPAID', paymentMethod: 'CASH', issueDate: '2026-09-01', dueDate: '2026-09-30',
  },
];

// ── Expenses ──
export const mockExpenses: Expense[] = [
  { id: uuidv4(), authorizedByUserId: 'usr-admin-001', authorizerName: 'Ricardo Santos', category: 'UTILITIES', title: 'Electricity Bill — August 2026', amount: 18500, expenseDate: '2026-08-31', createdAt: '2026-08-31T12:00:00Z' },
  { id: uuidv4(), authorizedByUserId: 'usr-admin-001', authorizerName: 'Ricardo Santos', category: 'LOGISTICS', title: 'Courier Partner Fee Q3', amount: 8200, expenseDate: '2026-09-01', createdAt: '2026-09-01T09:00:00Z' },
  { id: uuidv4(), authorizedByUserId: 'usr-admin-002', authorizerName: 'Elena Reyes', category: 'SALARIES', title: 'Staff Payroll — August 2026', amount: 65000, expenseDate: '2026-08-30', createdAt: '2026-08-30T15:00:00Z' },
  { id: uuidv4(), authorizedByUserId: 'usr-admin-002', authorizerName: 'Elena Reyes', category: 'WAREHOUSE_SUPPLIES', title: 'Racking Unit Repair', amount: 3800, expenseDate: '2026-08-25', createdAt: '2026-08-25T11:00:00Z' },
  { id: uuidv4(), authorizedByUserId: 'usr-admin-001', authorizerName: 'Ricardo Santos', category: 'EQUIPMENT_MAINTENANCE', title: 'Forklift Servicing', amount: 5500, expenseDate: '2026-08-20', createdAt: '2026-08-20T10:00:00Z' },
];

// ── Receivables & Payables ──
export const mockLedger: ReceivablesPayablesEntry[] = [
  { id: uuidv4(), partyName: 'TechWorld Corp', partyType: 'CUSTOMER', type: 'RECEIVABLE', invoiceOrPoRef: 'INV-2026-0901', totalAmount: 30223.20, paidAmount: 30223.20, remainingBalance: 0, status: 'SETTLED', dueDate: '2026-09-28', createdAt: '2026-08-29T00:00:00Z' },
  { id: uuidv4(), partyName: 'Office Solutions PH', partyType: 'CUSTOMER', type: 'RECEIVABLE', invoiceOrPoRef: 'INV-2026-0902', totalAmount: 9488, paidAmount: 0, remainingBalance: 9488, status: 'OPEN', dueDate: '2026-09-30', createdAt: '2026-09-01T00:00:00Z' },
  { id: uuidv4(), partyName: 'GlobalTech Distributors', partyType: 'SUPPLIER', type: 'PAYABLE', invoiceOrPoRef: 'PO-2026-0892', totalAmount: 21250, paidAmount: 10625, remainingBalance: 10625, status: 'PARTIALLY_SETTLED', dueDate: '2026-09-15', createdAt: '2026-08-28T00:00:00Z' },
  { id: uuidv4(), partyName: 'PaperPro Supply Co', partyType: 'SUPPLIER', type: 'PAYABLE', invoiceOrPoRef: 'PO-2026-0901', totalAmount: 9000, paidAmount: 9000, remainingBalance: 0, status: 'SETTLED', dueDate: '2026-09-05', createdAt: '2026-08-20T00:00:00Z' },
];

// ── Activity Logs ──
export const mockActivityLogs: ActivityLog[] = [
  { id: uuidv4(), userId: 'usr-admin-001', userName: 'Ricardo Santos', userRole: 'ADMIN', action: 'USER_LOGIN', entityName: 'Auth', entityId: 'usr-admin-001', description: 'Admin logged in from Web', timestamp: '2026-09-01T08:30:00Z' },
  { id: uuidv4(), userId: 'usr-staff-001', userName: 'Marco dela Cruz', userRole: 'STAFF', action: 'STOCK_IN', entityName: 'Product', entityId: 'prd-001', description: 'Stock-In 25 units of Wireless Keyboard Pro (PO-2026-0892)', timestamp: '2026-08-28T09:15:00Z' },
  { id: uuidv4(), userId: 'usr-staff-002', userName: 'Anika Patel', userRole: 'STAFF', action: 'STOCK_OUT', entityName: 'Product', entityId: 'prd-003', description: 'Stock-Out 12 units of Laptop Stand Aluminum (SO-2026-1104)', timestamp: '2026-09-01T07:30:00Z' },
  { id: uuidv4(), userId: 'usr-admin-001', userName: 'Ricardo Santos', userRole: 'ADMIN', action: 'INVOICE_GENERATED', entityName: 'Invoice', entityId: 'inv-001', description: 'Generated Invoice INV-2026-0901 for TechWorld Corp — ₱30,223.20', timestamp: '2026-08-29T10:00:00Z' },
  { id: uuidv4(), userId: 'usr-admin-002', userName: 'Elena Reyes', userRole: 'ADMIN', action: 'EXPENSE_RECORDED', entityName: 'Expense', entityId: 'exp-003', description: 'Recorded expense: Staff Payroll August 2026 — ₱65,000', timestamp: '2026-08-30T15:00:00Z' },
  { id: uuidv4(), userId: 'usr-admin-001', userName: 'Ricardo Santos', userRole: 'ADMIN', action: 'DELIVERY_DISPATCH', entityName: 'Delivery', entityId: 'del-002', description: 'Dispatched DLV-2026-0902 to Office Solutions PH', timestamp: '2026-09-01T09:00:00Z' },
];

// ── Monthly Profit Reports ──
export const mockMonthlyReports: MonthlyProfitReport[] = [
  { month: '2026-04', grossRevenue: 185000, cogs: 112000, grossProfit: 73000, totalExpenses: 45000, netProfit: 28000, profitMarginPercent: 15.13, totalDeliveriesCompleted: 18, totalStockValue: 450000 },
  { month: '2026-05', grossRevenue: 210000, cogs: 128000, grossProfit: 82000, totalExpenses: 48000, netProfit: 34000, profitMarginPercent: 16.19, totalDeliveriesCompleted: 22, totalStockValue: 520000 },
  { month: '2026-06', grossRevenue: 198000, cogs: 121000, grossProfit: 77000, totalExpenses: 51000, netProfit: 26000, profitMarginPercent: 13.13, totalDeliveriesCompleted: 19, totalStockValue: 490000 },
  { month: '2026-07', grossRevenue: 245000, cogs: 148000, grossProfit: 97000, totalExpenses: 55000, netProfit: 42000, profitMarginPercent: 17.14, totalDeliveriesCompleted: 28, totalStockValue: 560000 },
  { month: '2026-08', grossRevenue: 268500, cogs: 162000, grossProfit: 106500, totalExpenses: 101000, netProfit: 5500, profitMarginPercent: 2.05, totalDeliveriesCompleted: 31, totalStockValue: 598000 },
  { month: '2026-09', grossRevenue: 39711.20, cogs: 25150, grossProfit: 14561.20, totalExpenses: 0, netProfit: 14561.20, profitMarginPercent: 36.67, totalDeliveriesCompleted: 1, totalStockValue: 598000 },
];
