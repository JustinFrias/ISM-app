// =============================================
// AUTH DOMAIN
// =============================================
export type UserRole = 'ADMIN' | 'STAFF';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  invitationStatus?: 'PENDING' | 'ACCEPTED';
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

// =============================================
// INVENTORY & CATEGORY DOMAIN
// =============================================
export type StockStatus = 'IN_STOCK' | 'CRITICAL' | 'OUT_OF_STOCK' | 'EXPIRED';
export type UnitOfMeasure = 'PCS' | 'BOX' | 'PACK' | 'KG' | 'LTR' | 'MTR' | 'SET' | 'BAG';

export interface Category {
  id: string;
  name: string;
  code: string;
  description?: string;
  iconName: string;
  colorTag: string;
  productCount?: number;
  createdAt: string;
}

export interface Product {
  id: string;
  categoryId: string;
  categoryName?: string;
  sku: string;
  barcode: string;
  name: string;
  description?: string;
  unit: UnitOfMeasure;
  costPrice: number;
  sellingPrice: number;
  stockAvailable: number;
  stockReserved: number;
  criticalLevel: number;
  reorderQuantity: number;
  storageRackId: string;
  expiryDate?: string;
  status: StockStatus;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type MovementType =
  | 'STOCK_IN'
  | 'STOCK_OUT'
  | 'ADJUSTMENT'
  | 'DAMAGED'
  | 'RETURN'
  | 'EXPIRED_DISPOSAL';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  userId: string;
  userName: string;
  type: MovementType;
  quantity: number;
  previousStock: number;
  currentStock: number;
  referenceNumber: string;
  notes?: string;
  timestamp: string;
}

// =============================================
// DELIVERY & INVOICE DOMAIN
// =============================================
export type DeliveryStatus = 'PENDING' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';

export interface DeliveryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Delivery {
  id: string;
  deliveryNumber: string;
  userId: string;
  dispatcherName: string;
  recipientName: string;
  recipientAddress: string;
  contactNumber: string;
  items: DeliveryItem[];
  totalQuantity: number;
  totalAmount: number;
  status: DeliveryStatus;
  scheduledDate: string;
  deliveredDate?: string;
  trackingCode: string;
  notes?: string;
  createdAt: string;
}

export type PaymentStatus = 'PAID' | 'UNPAID' | 'PARTIAL' | 'OVERDUE';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CHECK' | 'CARD';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  deliveryId?: string;
  customerName: string;
  customerAddress: string;
  customerPhone?: string;
  items: DeliveryItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  issueDate: string;
  dueDate: string;
  notes?: string;
}

// =============================================
// FINANCIAL & EXPENSE DOMAIN
// =============================================
export type LedgerPartyType = 'CUSTOMER' | 'SUPPLIER';
export type LedgerEntryType = 'RECEIVABLE' | 'PAYABLE';
export type LedgerStatus = 'OPEN' | 'PARTIALLY_SETTLED' | 'SETTLED' | 'OVERDUE';

export interface ReceivablesPayablesEntry {
  id: string;
  partyName: string;
  partyType: LedgerPartyType;
  type: LedgerEntryType;
  invoiceOrPoRef: string;
  totalAmount: number;
  paidAmount: number;
  remainingBalance: number;
  status: LedgerStatus;
  dueDate: string;
  createdAt: string;
}

export type ExpenseCategory =
  | 'UTILITIES'
  | 'LOGISTICS'
  | 'SALARIES'
  | 'EQUIPMENT_MAINTENANCE'
  | 'WAREHOUSE_SUPPLIES'
  | 'MARKETING'
  | 'MISCELLANEOUS';

export interface Expense {
  id: string;
  authorizedByUserId: string;
  authorizerName: string;
  category: ExpenseCategory;
  title: string;
  description?: string;
  amount: number;
  receiptImageUrl?: string;
  expenseDate: string;
  createdAt: string;
}

export interface MonthlyProfitReport {
  month: string;
  grossRevenue: number;
  cogs: number;
  grossProfit: number;
  totalExpenses: number;
  netProfit: number;
  profitMarginPercent: number;
  totalDeliveriesCompleted: number;
  totalStockValue: number;
}

// =============================================
// AUDIT & ACTIVITY LOG DOMAIN
// =============================================
export type ActivityActionType =
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'PRODUCT_CREATE'
  | 'PRODUCT_UPDATE'
  | 'PRODUCT_DELETE'
  | 'CATEGORY_CREATE'
  | 'CATEGORY_UPDATE'
  | 'CATEGORY_DELETE'
  | 'STOCK_IN'
  | 'STOCK_OUT'
  | 'STOCK_ADJUST'
  | 'DELIVERY_CREATE'
  | 'DELIVERY_DISPATCH'
  | 'DELIVERY_RECEIVE'
  | 'INVOICE_GENERATED'
  | 'INVOICE_PRINTED'
  | 'EXPENSE_RECORDED'
  | 'REPORT_PRINTED'
  | 'ACCOUNT_CREATE'
  | 'ACCOUNT_UPDATE'
  | 'ACCOUNT_DELETE';

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: ActivityActionType;
  entityName: string;
  entityId: string;
  description: string;
  payload?: Record<string, unknown>;
  ipAddress?: string;
  timestamp: string;
}

// =============================================
// UTILITY TYPES
// =============================================
export interface AlertSummary {
  outOfStockCount: number;
  criticalStockCount: number;
  expiredCount: number;
  expiringCount: number;
}

export interface DashboardKPI {
  totalProducts: number;
  totalStockValue: number;
  monthlyRevenue: number;
  monthlyProfit: number;
  pendingDeliveries: number;
  activeAlerts: number;
}
