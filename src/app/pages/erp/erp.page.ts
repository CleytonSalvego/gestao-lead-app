import { Component, OnInit } from '@angular/core';
import { ERPIntegration, ERPSyncResult, Invoice, Commission } from '../../interfaces/erp.interface';

@Component({
  selector: 'app-erp',
  templateUrl: './erp.page.html',
  styleUrls: ['./erp.page.scss'],
})
export class ErpPage implements OnInit {
  integrations: ERPIntegration[] = [];
  recentSync: ERPSyncResult[] = [];
  pendingInvoices: Invoice[] = [];
  monthlyCommissions: Commission[] = [];
  
  stats = {
    totalIntegrations: 0,
    activeIntegrations: 0,
    todaySync: 0,
    pendingInvoices: 0,
    monthlyRevenue: 0
  };

  selectedSegment = 'overview';

  constructor() { }

  ngOnInit() {
    this.loadMockData();
  }

  private loadMockData() {
    this.integrations = [
      {
        id: '1',
        name: 'SAP Production',
        type: 'SAP',
        status: 'active',
        config: {
          host: 'sap.portoseguro.com.br',
          port: 443,
          database: 'PROD',
          username: 'integration_user',
          password: '******',
          timeout: 30000,
          retryAttempts: 3,
          enableSSL: true,
          endpoint: 'https://sap.portoseguro.com.br/api',
          companyCode: '1000'
        },
        lastSync: new Date('2025-09-11T08:30:00'),
        createdAt: new Date('2025-01-01T00:00:00')
      },
      {
        id: '2',
        name: 'TOTVS Protheus',
        type: 'PROTHEUS',
        status: 'active',
        config: {
          host: 'totvs.portoseguro.com.br',
          port: 443,
          database: 'DADOSADV',
          username: 'protheus_user',
          password: '******',
          timeout: 30000,
          retryAttempts: 3,
          enableSSL: true,
          endpoint: 'https://totvs.portoseguro.com.br/rest',
          companyCode: '01'
        },
        lastSync: new Date('2025-09-11T09:00:00'),
        createdAt: new Date('2025-02-01T00:00:00')
      }
    ];

    this.recentSync = [
      {
        success: true,
        processedRecords: 45,
        errors: [],
        timestamp: new Date('2025-09-11T09:00:00')
      },
      {
        success: true,
        processedRecords: 32,
        errors: [],
        timestamp: new Date('2025-09-11T08:30:00')
      },
      {
        success: false,
        processedRecords: 12,
        errors: [
          {
            code: 'CONN_ERROR',
            message: 'Falha na conexão com SAP',
            severity: 'error'
          }
        ],
        timestamp: new Date('2025-09-11T07:45:00')
      }
    ];

    this.pendingInvoices = [
      {
        id: 'INV-001',
        number: 'NF-2025-001',
        clientName: 'Maria Silva Santos',
        clientDocument: '123.456.789-10',
        items: [],
        totalAmount: 1250.50,
        taxes: [],
        status: 'draft',
        issueDate: new Date('2025-09-11'),
        dueDate: new Date('2025-10-11'),
        erpReference: 'SAP-REF-001'
      },
      {
        id: 'INV-002',
        number: 'NF-2025-002',
        clientName: 'João Carlos Oliveira',
        clientDocument: '987.654.321-00',
        items: [],
        totalAmount: 850.00,
        taxes: [],
        status: 'issued',
        issueDate: new Date('2025-09-10'),
        dueDate: new Date('2025-10-10'),
        erpReference: 'SAP-REF-002'
      }
    ];

    this.monthlyCommissions = [
      {
        id: 'COM-001',
        consultantId: 'CONS-001',
        policyId: 'POL-001',
        type: 'sale',
        baseAmount: 5000.00,
        rate: 0.05,
        amount: 250.00,
        status: 'calculated',
        period: '2025-09',
        calculatedAt: new Date('2025-09-01'),
        erpReference: 'SAP-COM-001'
      },
      {
        id: 'COM-002',
        consultantId: 'CONS-002',
        policyId: 'POL-002',
        type: 'renewal',
        baseAmount: 3200.00,
        rate: 0.03,
        amount: 96.00,
        status: 'paid',
        period: '2025-09',
        calculatedAt: new Date('2025-09-01'),
        paidAt: new Date('2025-09-05'),
        erpReference: 'SAP-COM-002'
      }
    ];

    this.updateStats();
  }

  private updateStats() {
    this.stats = {
      totalIntegrations: this.integrations.length,
      activeIntegrations: this.integrations.filter(i => i.status === 'active').length,
      todaySync: this.recentSync.filter(s => s.timestamp.toDateString() === new Date().toDateString()).length,
      pendingInvoices: this.pendingInvoices.filter(i => i.status === 'draft' || i.status === 'issued').length,
      monthlyRevenue: this.monthlyCommissions.reduce((sum, c) => sum + c.amount, 0)
    };
  }

  syncIntegration(integration: ERPIntegration) {
    console.log('Syncing integration:', integration.name);
  }

  testConnection(integration: ERPIntegration) {
    console.log('Testing connection:', integration.name);
  }

  generateInvoice() {
    console.log('Generating new invoice');
  }

  exportData() {
    console.log('Exporting ERP data');
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'error': return 'danger';
      default: return 'medium';
    }
  }

  getInvoiceStatusColor(status: string): string {
    switch (status) {
      case 'paid': return 'success';
      case 'issued': return 'primary';
      case 'draft': return 'warning';
      case 'overdue': return 'danger';
      default: return 'medium';
    }
  }

  getCommissionStatusColor(status: string): string {
    switch (status) {
      case 'paid': return 'success';
      case 'calculated': return 'primary';
      case 'pending': return 'warning';
      default: return 'medium';
    }
  }
}
