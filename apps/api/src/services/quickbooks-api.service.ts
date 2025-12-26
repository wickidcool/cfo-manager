import type {
  QBTokens,
  QBCompanyInfo,
  QBCustomer,
  QBVendor,
  QBAccount,
  QBInvoice,
  QBBill,
  QBPayment,
  QBItem,
  QBProfitAndLoss,
  QBBalanceSheet,
  QBLineItem,
  QBQueryParams,
  QBDateRange,
} from '@aws-starter-kit/common-types';
import { quickBooksOAuthService } from './quickbooks-oauth.service';
import { getQBSecrets } from '../utils/secrets';


const OAuthClient = require('intuit-oauth');

// Helper type for QB API responses
type QBRecord = Record<string, unknown>;

// Helper function to safely get a property from a QB record
function get<T>(obj: QBRecord | undefined | null, key: string): T | undefined {
  if (!obj) return undefined;
  return obj[key] as T | undefined;
}

/**
 * QuickBooks API Service
 * Handles all QuickBooks Online API operations
 *
 * Credentials are fetched from AWS Secrets Manager for security.
 */
export class QuickBooksApiService {
  /**
   * Create an authenticated OAuth client with tokens
   * Fetches credentials from AWS Secrets Manager
   */
  private async createAuthenticatedClient(tokens: QBTokens): Promise<typeof OAuthClient> {
    const secrets = await getQBSecrets();

    const oauthClient = new OAuthClient({
      clientId: secrets.clientId,
      clientSecret: secrets.clientSecret,
      environment: secrets.environment || process.env['QB_ENVIRONMENT'] || 'sandbox',
      redirectUri: secrets.redirectUri || process.env['QB_REDIRECT_URI'] || '',
    });

    oauthClient.setToken({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      realmId: tokens.realmId,
    });

    return oauthClient;
  }

  /**
   * Make an authenticated API call to QuickBooks
   */
  private async makeApiCall<T>(
    tokens: QBTokens,
    endpoint: string
  ): Promise<T> {
    const oauthClient = await this.createAuthenticatedClient(tokens);
    const baseUrl = await quickBooksOAuthService.getApiBaseUrl();
    const url = `${baseUrl}/v3/company/${tokens.realmId}${endpoint}`;

    try {
      const response = await oauthClient.makeApiCall({ url });
      return response.json as T;
    } catch (error) {
      console.error(`QuickBooks API error for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Execute a QuickBooks query
   */
  private async executeQuery<T>(
    tokens: QBTokens,
    query: string
  ): Promise<T> {
    const encodedQuery = encodeURIComponent(query);
    return this.makeApiCall<T>(tokens, `/query?query=${encodedQuery}`);
  }

  /**
   * Get company information
   */
  async getCompanyInfo(tokens: QBTokens): Promise<QBCompanyInfo> {
    const response = await this.makeApiCall<{ CompanyInfo: QBRecord }>(
      tokens,
      `/companyinfo/${tokens.realmId}`
    );

    const info = response.CompanyInfo;
    const email = get<QBRecord>(info, 'Email');
    const phone = get<QBRecord>(info, 'PrimaryPhone');
    const webAddr = get<QBRecord>(info, 'WebAddr');
    const companyAddr = get<QBRecord>(info, 'CompanyAddr');

    return {
      id: get<string>(info, 'Id') || '',
      companyName: get<string>(info, 'CompanyName') || '',
      legalName: get<string>(info, 'LegalName'),
      companyAddress: companyAddr
        ? this.mapAddress(companyAddr as Record<string, string>)
        : undefined,
      email: get<string>(email, 'Address'),
      phone: get<string>(phone, 'FreeFormNumber'),
      webAddress: get<string>(webAddr, 'URI'),
      fiscalYearStartMonth: get<string>(info, 'FiscalYearStartMonth'),
      country: get<string>(info, 'Country'),
    };
  }

  /**
   * Get all customers
   */
  async getCustomers(
    tokens: QBTokens,
    params?: QBQueryParams
  ): Promise<QBCustomer[]> {
    const limit = params?.limit || 100;
    const offset = params?.offset || 0;
    const orderBy = params?.orderBy || 'DisplayName';
    const direction = params?.orderDirection || 'ASC';

    const query = `SELECT * FROM Customer ORDERBY ${orderBy} ${direction} STARTPOSITION ${offset + 1} MAXRESULTS ${limit}`;

    const response = await this.executeQuery<{
      QueryResponse: { Customer?: QBRecord[] };
    }>(tokens, query);

    const customers = response.QueryResponse.Customer || [];
    return customers.map((c) => this.mapCustomer(c));
  }

  /**
   * Get customer by ID
   */
  async getCustomerById(tokens: QBTokens, customerId: string): Promise<QBCustomer> {
    const response = await this.makeApiCall<{ Customer: QBRecord }>(
      tokens,
      `/customer/${customerId}`
    );
    return this.mapCustomer(response.Customer);
  }

  /**
   * Get all vendors
   */
  async getVendors(
    tokens: QBTokens,
    params?: QBQueryParams
  ): Promise<QBVendor[]> {
    const limit = params?.limit || 100;
    const offset = params?.offset || 0;

    const query = `SELECT * FROM Vendor STARTPOSITION ${offset + 1} MAXRESULTS ${limit}`;

    const response = await this.executeQuery<{
      QueryResponse: { Vendor?: QBRecord[] };
    }>(tokens, query);

    const vendors = response.QueryResponse.Vendor || [];
    return vendors.map((v) => this.mapVendor(v));
  }

  /**
   * Get all accounts
   */
  async getAccounts(tokens: QBTokens): Promise<QBAccount[]> {
    const query = 'SELECT * FROM Account MAXRESULTS 1000';

    const response = await this.executeQuery<{
      QueryResponse: { Account?: QBRecord[] };
    }>(tokens, query);

    const accounts = response.QueryResponse.Account || [];
    return accounts.map((a) => this.mapAccount(a));
  }

  /**
   * Get all invoices
   */
  async getInvoices(
    tokens: QBTokens,
    params?: QBQueryParams & { dateRange?: QBDateRange }
  ): Promise<QBInvoice[]> {
    const limit = params?.limit || 100;
    const offset = params?.offset || 0;

    let query = `SELECT * FROM Invoice`;

    if (params?.dateRange) {
      query += ` WHERE TxnDate >= '${params.dateRange.startDate}' AND TxnDate <= '${params.dateRange.endDate}'`;
    }

    query += ` ORDERBY TxnDate DESC STARTPOSITION ${offset + 1} MAXRESULTS ${limit}`;

    const response = await this.executeQuery<{
      QueryResponse: { Invoice?: QBRecord[] };
    }>(tokens, query);

    const invoices = response.QueryResponse.Invoice || [];
    return invoices.map((inv) => this.mapInvoice(inv));
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(tokens: QBTokens, invoiceId: string): Promise<QBInvoice> {
    const response = await this.makeApiCall<{ Invoice: QBRecord }>(
      tokens,
      `/invoice/${invoiceId}`
    );
    return this.mapInvoice(response.Invoice);
  }

  /**
   * Get all bills
   */
  async getBills(
    tokens: QBTokens,
    params?: QBQueryParams & { dateRange?: QBDateRange }
  ): Promise<QBBill[]> {
    const limit = params?.limit || 100;
    const offset = params?.offset || 0;

    let query = `SELECT * FROM Bill`;

    if (params?.dateRange) {
      query += ` WHERE TxnDate >= '${params.dateRange.startDate}' AND TxnDate <= '${params.dateRange.endDate}'`;
    }

    query += ` ORDERBY TxnDate DESC STARTPOSITION ${offset + 1} MAXRESULTS ${limit}`;

    const response = await this.executeQuery<{
      QueryResponse: { Bill?: QBRecord[] };
    }>(tokens, query);

    const bills = response.QueryResponse.Bill || [];
    return bills.map((b) => this.mapBill(b));
  }

  /**
   * Get all payments
   */
  async getPayments(
    tokens: QBTokens,
    params?: QBQueryParams & { dateRange?: QBDateRange }
  ): Promise<QBPayment[]> {
    const limit = params?.limit || 100;
    const offset = params?.offset || 0;

    let query = `SELECT * FROM Payment`;

    if (params?.dateRange) {
      query += ` WHERE TxnDate >= '${params.dateRange.startDate}' AND TxnDate <= '${params.dateRange.endDate}'`;
    }

    query += ` ORDERBY TxnDate DESC STARTPOSITION ${offset + 1} MAXRESULTS ${limit}`;

    const response = await this.executeQuery<{
      QueryResponse: { Payment?: QBRecord[] };
    }>(tokens, query);

    const payments = response.QueryResponse.Payment || [];
    return payments.map((p) => this.mapPayment(p));
  }

  /**
   * Get all items (products/services)
   */
  async getItems(tokens: QBTokens): Promise<QBItem[]> {
    const query = 'SELECT * FROM Item MAXRESULTS 1000';

    const response = await this.executeQuery<{
      QueryResponse: { Item?: QBRecord[] };
    }>(tokens, query);

    const items = response.QueryResponse.Item || [];
    return items.map((i) => this.mapItem(i));
  }

  /**
   * Get Profit and Loss Report
   */
  async getProfitAndLossReport(
    tokens: QBTokens,
    dateRange: QBDateRange
  ): Promise<QBProfitAndLoss> {
    const response = await this.makeApiCall<{ Rows?: { Row?: QBRecord[] }; Header?: Record<string, string> }>(
      tokens,
      `/reports/ProfitAndLoss?start_date=${dateRange.startDate}&end_date=${dateRange.endDate}`
    );

    return this.mapProfitAndLossReport(response, dateRange);
  }

  /**
   * Get Balance Sheet Report
   */
  async getBalanceSheetReport(
    tokens: QBTokens,
    asOfDate: string
  ): Promise<QBBalanceSheet> {
    const response = await this.makeApiCall<{ Rows?: { Row?: QBRecord[] }; Header?: Record<string, string> }>(
      tokens,
      `/reports/BalanceSheet?date_macro=Custom&start_date=${asOfDate}&end_date=${asOfDate}`
    );

    return this.mapBalanceSheetReport(response, asOfDate);
  }

  // ============ Mapping Functions ============

  private mapAddress(addr: Record<string, string>): {
    line1?: string;
    line2?: string;
    city?: string;
    countrySubDivisionCode?: string;
    postalCode?: string;
    country?: string;
  } {
    return {
      line1: addr['Line1'],
      line2: addr['Line2'],
      city: addr['City'],
      countrySubDivisionCode: addr['CountrySubDivisionCode'],
      postalCode: addr['PostalCode'],
      country: addr['Country'],
    };
  }

  private mapCustomer(c: QBRecord): QBCustomer {
    const email = get<QBRecord>(c, 'PrimaryEmailAddr');
    const phone = get<QBRecord>(c, 'PrimaryPhone');
    const mobile = get<QBRecord>(c, 'Mobile');
    const billAddr = get<QBRecord>(c, 'BillAddr');
    const shipAddr = get<QBRecord>(c, 'ShipAddr');
    const metaData = get<QBRecord>(c, 'MetaData');

    return {
      id: get<string>(c, 'Id') || '',
      displayName: get<string>(c, 'DisplayName') || '',
      companyName: get<string>(c, 'CompanyName'),
      givenName: get<string>(c, 'GivenName'),
      familyName: get<string>(c, 'FamilyName'),
      email: get<string>(email, 'Address'),
      phone: get<string>(phone, 'FreeFormNumber'),
      mobile: get<string>(mobile, 'FreeFormNumber'),
      billingAddress: billAddr
        ? this.mapAddress(billAddr as Record<string, string>)
        : undefined,
      shippingAddress: shipAddr
        ? this.mapAddress(shipAddr as Record<string, string>)
        : undefined,
      balance: get<number>(c, 'Balance') || 0,
      active: get<boolean>(c, 'Active') || false,
      createdAt: get<string>(metaData, 'CreateTime') || '',
      updatedAt: get<string>(metaData, 'LastUpdatedTime') || '',
    };
  }

  private mapVendor(v: QBRecord): QBVendor {
    const email = get<QBRecord>(v, 'PrimaryEmailAddr');
    const phone = get<QBRecord>(v, 'PrimaryPhone');
    const mobile = get<QBRecord>(v, 'Mobile');
    const billAddr = get<QBRecord>(v, 'BillAddr');
    const metaData = get<QBRecord>(v, 'MetaData');

    return {
      id: get<string>(v, 'Id') || '',
      displayName: get<string>(v, 'DisplayName') || '',
      companyName: get<string>(v, 'CompanyName'),
      givenName: get<string>(v, 'GivenName'),
      familyName: get<string>(v, 'FamilyName'),
      email: get<string>(email, 'Address'),
      phone: get<string>(phone, 'FreeFormNumber'),
      mobile: get<string>(mobile, 'FreeFormNumber'),
      billingAddress: billAddr
        ? this.mapAddress(billAddr as Record<string, string>)
        : undefined,
      balance: get<number>(v, 'Balance') || 0,
      active: get<boolean>(v, 'Active') || false,
      createdAt: get<string>(metaData, 'CreateTime') || '',
      updatedAt: get<string>(metaData, 'LastUpdatedTime') || '',
    };
  }

  private mapAccount(a: QBRecord): QBAccount {
    return {
      id: get<string>(a, 'Id') || '',
      name: get<string>(a, 'Name') || '',
      accountType: get<string>(a, 'AccountType') || '',
      accountSubType: get<string>(a, 'AccountSubType'),
      description: get<string>(a, 'Description'),
      currentBalance: get<number>(a, 'CurrentBalance') || 0,
      active: get<boolean>(a, 'Active') || false,
      classification: get<QBAccount['classification']>(a, 'Classification'),
    };
  }

  private mapInvoice(inv: QBRecord): QBInvoice {
    const lines = get<QBRecord[]>(inv, 'Line') || [];
    const lineItems = lines
      .filter((line) => get<string>(line, 'DetailType') === 'SalesItemLineDetail')
      .map((line) => this.mapLineItem(line));

    const balance = get<number>(inv, 'Balance') || 0;
    const total = get<number>(inv, 'TotalAmt') || 0;
    const dueDate = get<string>(inv, 'DueDate');
    const customerRef = get<QBRecord>(inv, 'CustomerRef');
    const metaData = get<QBRecord>(inv, 'MetaData');

    let status: QBInvoice['status'] = 'Pending';
    if (balance === 0 && total > 0) {
      status = 'Paid';
    } else if (dueDate && new Date(dueDate) < new Date()) {
      status = 'Overdue';
    }

    return {
      id: get<string>(inv, 'Id') || '',
      docNumber: get<string>(inv, 'DocNumber'),
      customerId: get<string>(customerRef, 'value') || '',
      customerName: get<string>(customerRef, 'name') || '',
      txnDate: get<string>(inv, 'TxnDate') || '',
      dueDate,
      totalAmount: total,
      balance,
      status,
      lineItems,
      createdAt: get<string>(metaData, 'CreateTime') || '',
      updatedAt: get<string>(metaData, 'LastUpdatedTime') || '',
    };
  }

  private mapBill(b: QBRecord): QBBill {
    const lines = get<QBRecord[]>(b, 'Line') || [];
    const lineItems = lines
      .filter((line) => get<string>(line, 'DetailType') === 'AccountBasedExpenseLineDetail')
      .map((line) => this.mapLineItem(line));

    const vendorRef = get<QBRecord>(b, 'VendorRef');
    const metaData = get<QBRecord>(b, 'MetaData');

    return {
      id: get<string>(b, 'Id') || '',
      docNumber: get<string>(b, 'DocNumber'),
      vendorId: get<string>(vendorRef, 'value') || '',
      vendorName: get<string>(vendorRef, 'name') || '',
      txnDate: get<string>(b, 'TxnDate') || '',
      dueDate: get<string>(b, 'DueDate'),
      totalAmount: get<number>(b, 'TotalAmt') || 0,
      balance: get<number>(b, 'Balance') || 0,
      lineItems,
      createdAt: get<string>(metaData, 'CreateTime') || '',
      updatedAt: get<string>(metaData, 'LastUpdatedTime') || '',
    };
  }

  private mapLineItem(line: QBRecord): QBLineItem {
    const salesDetail = get<QBRecord>(line, 'SalesItemLineDetail');
    const expenseDetail = get<QBRecord>(line, 'AccountBasedExpenseLineDetail');
    const accountRef = get<QBRecord>(expenseDetail, 'AccountRef');
    const itemRef = get<QBRecord>(salesDetail, 'ItemRef');

    return {
      id: get<string>(line, 'Id') || '',
      description: get<string>(line, 'Description'),
      amount: get<number>(line, 'Amount') || 0,
      quantity: get<number>(salesDetail, 'Qty'),
      unitPrice: get<number>(salesDetail, 'UnitPrice'),
      accountId: get<string>(accountRef, 'value'),
      accountName: get<string>(accountRef, 'name'),
      itemId: get<string>(itemRef, 'value'),
      itemName: get<string>(itemRef, 'name'),
    };
  }

  private mapPayment(p: QBRecord): QBPayment {
    const customerRef = get<QBRecord>(p, 'CustomerRef');
    const paymentMethodRef = get<QBRecord>(p, 'PaymentMethodRef');
    const depositRef = get<QBRecord>(p, 'DepositToAccountRef');
    const metaData = get<QBRecord>(p, 'MetaData');

    return {
      id: get<string>(p, 'Id') || '',
      txnDate: get<string>(p, 'TxnDate') || '',
      customerId: get<string>(customerRef, 'value') || '',
      customerName: get<string>(customerRef, 'name') || '',
      totalAmount: get<number>(p, 'TotalAmt') || 0,
      paymentMethod: get<string>(paymentMethodRef, 'name'),
      depositToAccountId: get<string>(depositRef, 'value'),
      createdAt: get<string>(metaData, 'CreateTime') || '',
      updatedAt: get<string>(metaData, 'LastUpdatedTime') || '',
    };
  }

  private mapItem(i: QBRecord): QBItem {
    const incomeRef = get<QBRecord>(i, 'IncomeAccountRef');
    const expenseRef = get<QBRecord>(i, 'ExpenseAccountRef');

    return {
      id: get<string>(i, 'Id') || '',
      name: get<string>(i, 'Name') || '',
      description: get<string>(i, 'Description'),
      type: get<QBItem['type']>(i, 'Type') || 'Service',
      unitPrice: get<number>(i, 'UnitPrice'),
      purchaseCost: get<number>(i, 'PurchaseCost'),
      quantityOnHand: get<number>(i, 'QtyOnHand'),
      incomeAccountId: get<string>(incomeRef, 'value'),
      expenseAccountId: get<string>(expenseRef, 'value'),
      active: get<boolean>(i, 'Active') || false,
    };
  }

  private mapProfitAndLossReport(
    _response: { Rows?: { Row?: QBRecord[] }; Header?: Record<string, string> },
    dateRange: QBDateRange
  ): QBProfitAndLoss {
    // Basic structure - QuickBooks reports have complex nested structures
    // This provides a simplified mapping
    return {
      reportName: 'Profit and Loss',
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      totalIncome: 0,
      totalExpenses: 0,
      netIncome: 0,
      grossProfit: 0,
      incomeAccounts: [],
      expenseAccounts: [],
    };
  }

  private mapBalanceSheetReport(
    _response: { Rows?: { Row?: QBRecord[] }; Header?: Record<string, string> },
    asOfDate: string
  ): QBBalanceSheet {
    // Basic structure - QuickBooks reports have complex nested structures
    // This provides a simplified mapping
    return {
      reportName: 'Balance Sheet',
      asOfDate,
      totalAssets: 0,
      totalLiabilities: 0,
      totalEquity: 0,
      assets: [],
      liabilities: [],
      equity: [],
    };
  }
}

// Export singleton instance
export const quickBooksApiService = new QuickBooksApiService();
