import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { 
  ERPIntegration, 
  ERPConfig, 
  ERPSyncResult, 
  Invoice, 
  Commission,
  ERPError 
} from '../../interfaces/erp.interface';
import { Lead } from '../../interfaces/lead.interface';

@Injectable({
  providedIn: 'root'
})
export class ERPIntegrationService {
  private apiUrl = '/api/erp-integration';
  private integrationsSubject = new BehaviorSubject<ERPIntegration[]>([]);
  public integrations$ = this.integrationsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadIntegrations();
  }

  // Integration Management
  getIntegrations(): Observable<ERPIntegration[]> {
    return this.http.get<ERPIntegration[]>(`${this.apiUrl}/integrations`)
      .pipe(
        catchError(this.handleError)
      );
  }

  createIntegration(integration: Partial<ERPIntegration>): Observable<ERPIntegration> {
    return this.http.post<ERPIntegration>(`${this.apiUrl}/integrations`, integration)
      .pipe(
        map(result => {
          this.refreshIntegrations();
          return result;
        }),
        catchError(this.handleError)
      );
  }

  updateIntegration(id: string, integration: Partial<ERPIntegration>): Observable<ERPIntegration> {
    return this.http.put<ERPIntegration>(`${this.apiUrl}/integrations/${id}`, integration)
      .pipe(
        map(result => {
          this.refreshIntegrations();
          return result;
        }),
        catchError(this.handleError)
      );
  }

  deleteIntegration(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/integrations/${id}`)
      .pipe(
        map(result => {
          this.refreshIntegrations();
          return result;
        }),
        catchError(this.handleError)
      );
  }

  testConnection(integrationId: string): Observable<{success: boolean, error?: string}> {
    const integration = this.integrationsSubject.value.find(i => i.id === integrationId);
    if (!integration) {
      return throwError('Integration not found');
    }
    return this.http.post<{success: boolean, error?: string}>(`${this.apiUrl}/test-connection`, integration.config)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  // Data Synchronization
  syncToERP(data: any, integrationId: string): Observable<ERPSyncResult> {
    return this.http.post<ERPSyncResult>(`${this.apiUrl}/sync/${integrationId}`, data)
      .pipe(
        catchError(this.handleError)
      );
  }

  syncFromERP(integrationId: string, entityType: string): Observable<ERPSyncResult> {
    return this.http.get<ERPSyncResult>(`${this.apiUrl}/sync/${integrationId}/${entityType}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getLastSyncResults(integrationId: string): Observable<ERPSyncResult[]> {
    return this.http.get<ERPSyncResult[]>(`${this.apiUrl}/sync-history/${integrationId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Lead to ERP
  syncLeadToERP(lead: Lead, integrationId: string): Observable<ERPSyncResult> {
    const erpData = this.transformLeadToERP(lead);
    return this.syncToERP(erpData, integrationId);
  }

  // Policy to ERP
  syncPolicyToERP(policy: any, integrationId: string): Observable<ERPSyncResult> {
    const erpData = this.transformPolicyToERP(policy);
    return this.syncToERP(erpData, integrationId);
  }

  // Invoice Generation
  generateInvoice(policyId: string, integrationId: string): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.apiUrl}/generate-invoice`, {
      policyId,
      integrationId
    }).pipe(
      catchError(this.handleError)
    );
  }

  sendInvoiceToERP(invoice: Invoice, integrationId: string): Observable<ERPSyncResult> {
    return this.http.post<ERPSyncResult>(`${this.apiUrl}/send-invoice/${integrationId}`, invoice)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Commission Calculation
  calculateCommission(saleData: any): Observable<Commission> {
    return this.http.post<Commission>(`${this.apiUrl}/calculate-commission`, saleData)
      .pipe(
        catchError(this.handleError)
      );
  }

  syncCommissionsToERP(period: string, integrationId: string): Observable<ERPSyncResult> {
    return this.http.post<ERPSyncResult>(`${this.apiUrl}/sync-commissions/${integrationId}`, {
      period
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Automated Sync
  enableAutomaticSync(integrationId: string, entityTypes: string[]): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/auto-sync/${integrationId}`, {
      entityTypes,
      enabled: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  disableAutomaticSync(integrationId: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/auto-sync/${integrationId}`, {
      enabled: false
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Data Transformation Methods
  private transformLeadToERP(lead: Lead): any {
    return {
      clientCode: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      document: lead.cpf,
      product: lead.product,
      status: lead.status,
      createdAt: lead.createdAt,
      // Add more ERP-specific fields based on integration type
    };
  }

  private transformPolicyToERP(policy: any): any {
    return {
      policyNumber: policy.id,
      clientCode: policy.leadId,
      productType: policy.type,
      premium: policy.premium,
      startDate: policy.startDate,
      endDate: policy.endDate,
      status: policy.status,
      // Add more ERP-specific fields
    };
  }

  // Utility Methods
  private loadIntegrations(): void {
    this.getIntegrations().subscribe(
      integrations => this.integrationsSubject.next(integrations),
      error => console.error('Error loading integrations:', error)
    );
  }

  private refreshIntegrations(): void {
    this.loadIntegrations();
  }

  private handleError(error: any): Observable<never> {
    console.error('ERP Integration Error:', error);
    
    let errorMessage = 'Erro na integração com ERP';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = 'Erro de conexão. Verifique sua internet.';
    } else if (error.status === 401) {
      errorMessage = 'Credenciais de ERP inválidas.';
    } else if (error.status >= 500) {
      errorMessage = 'Erro interno do servidor ERP.';
    }

    return throwError({
      message: errorMessage,
      originalError: error
    });
  }

  // Mock Data for Development
  private getMockIntegrations(): ERPIntegration[] {
    return [
      {
        id: '1',
        name: 'SAP Production',
        type: 'SAP',
        status: 'active',
        config: {
          host: 'sap.empresa.com.br',
          port: 443,
          database: 'PROD',
          username: 'integration_user',
          password: '******',
          timeout: 30000,
          retryAttempts: 3,
          enableSSL: true,
          endpoint: 'https://sap.empresa.com.br/api',
          companyCode: '1000',
          settings: {
            syncInterval: 15,
            autoSync: true
          }
        },
        lastSync: new Date('2025-09-10T20:00:00'),
        createdAt: new Date('2025-01-01T00:00:00')
      },
      {
        id: '2',
        name: 'TOTVS Protheus',
        type: 'PROTHEUS',
        status: 'active',
        config: {
          host: 'totvs.empresa.com.br',
          port: 443,
          database: 'DADOSADV',
          username: 'protheus_user',
          password: '******',
          apiKey: 'api_key_here',
          timeout: 30000,
          retryAttempts: 3,
          enableSSL: true,
          endpoint: 'https://totvs.empresa.com.br/rest',
          companyCode: '01',
          settings: {
            syncInterval: 30,
            autoSync: false
          }
        },
        lastSync: new Date('2025-09-10T19:30:00'),
        createdAt: new Date('2025-02-01T00:00:00')
      }
    ];
  }
}