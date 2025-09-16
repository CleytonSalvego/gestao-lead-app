export type ERPType = 'SAP' | 'ORACLE' | 'TOTVS' | 'PROTHEUS' | 'CUSTOM';

export interface ERPIntegration {
  id: string;
  name: string;
  type: ERPType;
  status: 'active' | 'inactive' | 'error';
  config: ERPConfig;
  lastSync: Date;
  createdAt: Date;
}

export interface ERPConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  apiKey?: string;
  timeout: number;
  retryAttempts: number;
  enableSSL: boolean;
  endpoint?: string;
  companyCode?: string;
  settings?: Record<string, any>;
}

export interface ERPSyncResult {
  success: boolean;
  processedRecords: number;
  errors: ERPError[];
  timestamp: Date;
}

export interface ERPError {
  code: string;
  message: string;
  record?: any;
  severity: 'warning' | 'error' | 'critical';
}

// Financial Interfaces
export interface Invoice {
  id: string;
  number: string;
  policyId?: string;
  leadId?: string;
  clientName: string;
  clientDocument: string;
  items: InvoiceItem[];
  totalAmount: number;
  taxes: Tax[];
  status: 'draft' | 'issued' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: Date;
  dueDate: Date;
  paymentDate?: Date;
  erpReference?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productCode?: string;
  taxes: Tax[];
}

export interface Tax {
  type: 'ICMS' | 'IPI' | 'PIS' | 'COFINS' | 'ISS' | 'IOF';
  rate: number;
  amount: number;
  base: number;
}

export interface Commission {
  id: string;
  consultantId: string;
  policyId: string;
  invoiceId?: string;
  type: 'sale' | 'renewal' | 'upsell' | 'cross_sell';
  baseAmount: number;
  rate: number;
  amount: number;
  status: 'pending' | 'calculated' | 'paid' | 'cancelled';
  period: string; // YYYY-MM
  calculatedAt: Date;
  paidAt?: Date;
  erpReference?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  method: 'boleto' | 'pix' | 'credit_card' | 'debit_card' | 'bank_transfer';
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  transactionId?: string;
  paidAt?: Date;
  fees: number;
  netAmount: number;
}

export interface BoletoData {
  barCode: string;
  digitableLine: string;
  dueDate: Date;
  amount: number;
  payerName: string;
  payerDocument: string;
  beneficiaryBank: string;
  instructions: string[];
}