import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { 
  Invoice, 
  InvoiceItem, 
  Tax, 
  Payment, 
  BoletoData,
  Commission 
} from '../../interfaces/erp.interface';

@Injectable({
  providedIn: 'root'
})
export class FinancialService {
  private apiUrl = '/api/financial';
  private invoicesSubject = new BehaviorSubject<Invoice[]>([]);
  public invoices$ = this.invoicesSubject.asObservable();

  private commissionsSubject = new BehaviorSubject<Commission[]>([]);
  public commissions$ = this.commissionsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadInvoices();
    this.loadCommissions();
  }

  // Invoice Management
  getInvoices(filters?: any): Observable<Invoice[]> {
    const params = filters ? { params: filters } : {};
    return this.http.get<Invoice[]>(`${this.apiUrl}/invoices`, params)
      .pipe(
        catchError(this.handleError)
      );
  }

  getInvoiceById(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/invoices/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  createInvoice(invoiceData: Partial<Invoice>): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.apiUrl}/invoices`, invoiceData)
      .pipe(
        map(invoice => {
          this.refreshInvoices();
          return invoice;
        }),
        catchError(this.handleError)
      );
  }

  updateInvoice(id: string, updates: Partial<Invoice>): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.apiUrl}/invoices/${id}`, updates)
      .pipe(
        map(invoice => {
          this.refreshInvoices();
          return invoice;
        }),
        catchError(this.handleError)
      );
  }

  deleteInvoice(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/invoices/${id}`)
      .pipe(
        map(result => {
          this.refreshInvoices();
          return result;
        }),
        catchError(this.handleError)
      );
  }

  // Invoice Generation
  generateInvoiceFromPolicy(policyId: string): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.apiUrl}/invoices/generate-from-policy`, {
      policyId
    }).pipe(
      map(invoice => {
        this.refreshInvoices();
        return invoice;
      }),
      catchError(this.handleError)
    );
  }

  generateInvoiceFromLead(leadId: string, items: InvoiceItem[]): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.apiUrl}/invoices/generate-from-lead`, {
      leadId,
      items
    }).pipe(
      map(invoice => {
        this.refreshInvoices();
        return invoice;
      }),
      catchError(this.handleError)
    );
  }

  // Tax Calculation
  calculateTaxes(items: InvoiceItem[], clientLocation: string): Observable<Tax[]> {
    return this.http.post<Tax[]>(`${this.apiUrl}/calculate-taxes`, {
      items,
      clientLocation
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Invoice Actions
  sendInvoice(invoiceId: string, method: 'email' | 'whatsapp' | 'postal'): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/invoices/${invoiceId}/send`, {
      method
    }).pipe(
      catchError(this.handleError)
    );
  }

  cancelInvoice(invoiceId: string, reason: string): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.apiUrl}/invoices/${invoiceId}/cancel`, {
      reason
    }).pipe(
      map(invoice => {
        this.refreshInvoices();
        return invoice;
      }),
      catchError(this.handleError)
    );
  }

  // Payment Management
  getPayments(invoiceId?: string): Observable<Payment[]> {
    const url = invoiceId 
      ? `${this.apiUrl}/payments?invoiceId=${invoiceId}`
      : `${this.apiUrl}/payments`;
    
    return this.http.get<Payment[]>(url)
      .pipe(
        catchError(this.handleError)
      );
  }

  processPayment(paymentData: Partial<Payment>): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/payments`, paymentData)
      .pipe(
        catchError(this.handleError)
      );
  }

  getPaymentStatus(paymentId: string): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/payments/${paymentId}/status`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Boleto Management
  generateBoleto(invoiceId: string): Observable<BoletoData> {
    return this.http.post<BoletoData>(`${this.apiUrl}/boleto/generate`, {
      invoiceId
    }).pipe(
      catchError(this.handleError)
    );
  }

  getBoletoStatus(invoiceId: string): Observable<{ paid: boolean; paidAt?: Date }> {
    return this.http.get<{ paid: boolean; paidAt?: Date }>(`${this.apiUrl}/boleto/${invoiceId}/status`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // PIX Management
  generatePIX(invoiceId: string): Observable<{ qrCode: string; pixKey: string; amount: number }> {
    return this.http.post<{ qrCode: string; pixKey: string; amount: number }>(`${this.apiUrl}/pix/generate`, {
      invoiceId
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Commission Management
  getCommissions(filters?: any): Observable<Commission[]> {
    const params = filters ? { params: filters } : {};
    return this.http.get<Commission[]>(`${this.apiUrl}/commissions`, params)
      .pipe(
        catchError(this.handleError)
      );
  }

  calculateCommission(saleData: {
    policyId: string;
    consultantId: string;
    saleAmount: number;
    productType: string;
  }): Observable<Commission> {
    return this.http.post<Commission>(`${this.apiUrl}/commissions/calculate`, saleData)
      .pipe(
        catchError(this.handleError)
      );
  }

  approveCommission(commissionId: string): Observable<Commission> {
    return this.http.post<Commission>(`${this.apiUrl}/commissions/${commissionId}/approve`, {})
      .pipe(
        map(commission => {
          this.refreshCommissions();
          return commission;
        }),
        catchError(this.handleError)
      );
  }

  payCommission(commissionId: string, paymentDetails: any): Observable<Commission> {
    return this.http.post<Commission>(`${this.apiUrl}/commissions/${commissionId}/pay`, paymentDetails)
      .pipe(
        map(commission => {
          this.refreshCommissions();
          return commission;
        }),
        catchError(this.handleError)
      );
  }

  getCommissionsByConsultant(consultantId: string, period?: string): Observable<Commission[]> {
    const params = period ? { consultantId, period } : { consultantId };
    return this.http.get<Commission[]>(`${this.apiUrl}/commissions/by-consultant`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Financial Reports
  getFinancialSummary(period: { start: Date; end: Date }): Observable<{
    totalRevenue: number;
    totalCommissions: number;
    pendingInvoices: number;
    overdueBoletos: number;
    avgTicket: number;
    paymentMethods: Record<string, number>;
  }> {
    return this.http.post<any>(`${this.apiUrl}/reports/summary`, period)
      .pipe(
        catchError(this.handleError)
      );
  }

  getRevenueByProduct(period: { start: Date; end: Date }): Observable<{
    product: string;
    revenue: number;
    percentage: number;
  }[]> {
    return this.http.post<any[]>(`${this.apiUrl}/reports/revenue-by-product`, period)
      .pipe(
        catchError(this.handleError)
      );
  }

  getCommissionReport(period: { start: Date; end: Date }): Observable<{
    consultant: string;
    totalCommission: number;
    salesCount: number;
    avgTicket: number;
  }[]> {
    return this.http.post<any[]>(`${this.apiUrl}/reports/commission-report`, period)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Integration with ERP
  syncWithERP(entityType: 'invoice' | 'payment' | 'commission', entityId: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/sync-erp`, {
      entityType,
      entityId
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Utility Methods
  private loadInvoices(): void {
    this.getInvoices().subscribe(
      invoices => this.invoicesSubject.next(invoices),
      error => console.error('Error loading invoices:', error)
    );
  }

  private loadCommissions(): void {
    this.getCommissions().subscribe(
      commissions => this.commissionsSubject.next(commissions),
      error => console.error('Error loading commissions:', error)
    );
  }

  private refreshInvoices(): void {
    this.loadInvoices();
  }

  private refreshCommissions(): void {
    this.loadCommissions();
  }

  private handleError(error: any): Observable<never> {
    console.error('Financial Service Error:', error);
    
    let errorMessage = 'Erro no serviço financeiro';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = 'Erro de conexão. Verifique sua internet.';
    } else if (error.status === 422) {
      errorMessage = 'Dados inválidos para operação financeira.';
    } else if (error.status >= 500) {
      errorMessage = 'Erro interno do servidor financeiro.';
    }

    return throwError({
      message: errorMessage,
      originalError: error
    });
  }

  // Mock Data for Development
  getMockInvoices(): Invoice[] {
    return [
      {
        id: 'INV-001',
        number: '2025-001',
        policyId: 'POL-001',
        leadId: 'L-1001',
        clientName: 'João Silva',
        clientDocument: '123.456.789-00',
        items: [
          {
            id: 'ITEM-001',
            description: 'Seguro Auto Completo',
            quantity: 1,
            unitPrice: 1200.00,
            totalPrice: 1200.00,
            productCode: 'AUTO-COMP',
            taxes: [
              {
                type: 'IOF',
                rate: 7.38,
                amount: 88.56,
                base: 1200.00
              }
            ]
          }
        ],
        totalAmount: 1288.56,
        taxes: [
          {
            type: 'IOF',
            rate: 7.38,
            amount: 88.56,
            base: 1200.00
          }
        ],
        status: 'issued',
        issueDate: new Date('2025-09-01'),
        dueDate: new Date('2025-09-15'),
        erpReference: 'ERP-INV-001'
      }
    ];
  }
}