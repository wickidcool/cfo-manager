/**
 * QuickBooks Types
 *
 * Types for Intuit QuickBooks Online API integration
 */

/**
 * QuickBooks OAuth Token Response
 */
export interface QBTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  refreshTokenExpiresIn: number;
  realmId: string;
  createdAt: string;
}

/**
 * QuickBooks OAuth Connection Status
 */
export interface QBConnectionStatus {
  connected: boolean;
  realmId?: string;
  companyName?: string;
  expiresAt?: string;
  refreshTokenExpiresAt?: string;
}

/**
 * QuickBooks Environment
 */
export type QBEnvironment = 'sandbox' | 'production';

/**
 * QuickBooks Company Info
 */
export interface QBCompanyInfo {
  id: string;
  companyName: string;
  legalName?: string;
  companyAddress?: QBAddress;
  email?: string;
  phone?: string;
  webAddress?: string;
  fiscalYearStartMonth?: string;
  country?: string;
}

/**
 * QuickBooks Address
 */
export interface QBAddress {
  line1?: string;
  line2?: string;
  line3?: string;
  city?: string;
  countrySubDivisionCode?: string;
  postalCode?: string;
  country?: string;
}

/**
 * QuickBooks Customer
 */
export interface QBCustomer {
  id: string;
  displayName: string;
  companyName?: string;
  givenName?: string;
  familyName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  billingAddress?: QBAddress;
  shippingAddress?: QBAddress;
  balance: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * QuickBooks Vendor
 */
export interface QBVendor {
  id: string;
  displayName: string;
  companyName?: string;
  givenName?: string;
  familyName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  billingAddress?: QBAddress;
  balance: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * QuickBooks Account
 */
export interface QBAccount {
  id: string;
  name: string;
  accountType: string;
  accountSubType?: string;
  description?: string;
  currentBalance: number;
  active: boolean;
  classification?: 'Asset' | 'Equity' | 'Expense' | 'Liability' | 'Revenue';
}

/**
 * QuickBooks Invoice
 */
export interface QBInvoice {
  id: string;
  docNumber?: string;
  customerId: string;
  customerName: string;
  txnDate: string;
  dueDate?: string;
  totalAmount: number;
  balance: number;
  status: 'Draft' | 'Pending' | 'Paid' | 'Overdue';
  lineItems: QBLineItem[];
  createdAt: string;
  updatedAt: string;
}

/**
 * QuickBooks Bill
 */
export interface QBBill {
  id: string;
  docNumber?: string;
  vendorId: string;
  vendorName: string;
  txnDate: string;
  dueDate?: string;
  totalAmount: number;
  balance: number;
  lineItems: QBLineItem[];
  createdAt: string;
  updatedAt: string;
}

/**
 * QuickBooks Line Item
 */
export interface QBLineItem {
  id: string;
  description?: string;
  amount: number;
  quantity?: number;
  unitPrice?: number;
  accountId?: string;
  accountName?: string;
  itemId?: string;
  itemName?: string;
}

/**
 * QuickBooks Payment
 */
export interface QBPayment {
  id: string;
  txnDate: string;
  customerId: string;
  customerName: string;
  totalAmount: number;
  paymentMethod?: string;
  depositToAccountId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * QuickBooks Item (Product/Service)
 */
export interface QBItem {
  id: string;
  name: string;
  description?: string;
  type: 'Inventory' | 'NonInventory' | 'Service' | 'Category';
  unitPrice?: number;
  purchaseCost?: number;
  quantityOnHand?: number;
  incomeAccountId?: string;
  expenseAccountId?: string;
  active: boolean;
}

/**
 * QuickBooks Profit and Loss Report
 */
export interface QBProfitAndLoss {
  reportName: string;
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  grossProfit: number;
  incomeAccounts: QBReportRow[];
  expenseAccounts: QBReportRow[];
}

/**
 * QuickBooks Balance Sheet Report
 */
export interface QBBalanceSheet {
  reportName: string;
  asOfDate: string;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  assets: QBReportRow[];
  liabilities: QBReportRow[];
  equity: QBReportRow[];
}

/**
 * QuickBooks Report Row
 */
export interface QBReportRow {
  accountId?: string;
  accountName: string;
  amount: number;
  children?: QBReportRow[];
}

/**
 * QuickBooks Cash Flow Report
 */
export interface QBCashFlow {
  reportName: string;
  startDate: string;
  endDate: string;
  operatingActivities: number;
  investingActivities: number;
  financingActivities: number;
  netCashChange: number;
}

/**
 * QuickBooks Query Parameters
 */
export interface QBQueryParams {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

/**
 * QuickBooks Date Range Parameters
 */
export interface QBDateRange {
  startDate: string;
  endDate: string;
}

/**
 * QuickBooks API Error
 */
export interface QBApiError {
  code: string;
  message: string;
  detail?: string;
  intuitTid?: string;
}

/**
 * QuickBooks OAuth Request - Start Auth Flow
 */
export interface QBAuthStartRequest {
  userId: string;
  state?: string;
}

/**
 * QuickBooks OAuth Callback Request
 */
export interface QBAuthCallbackRequest {
  code: string;
  state: string;
  realmId: string;
}

/**
 * QuickBooks OAuth Start Response
 */
export interface QBAuthStartResponse {
  authorizationUrl: string;
  state: string;
}

/**
 * QuickBooks Disconnect Request
 */
export interface QBDisconnectRequest {
  userId: string;
}

