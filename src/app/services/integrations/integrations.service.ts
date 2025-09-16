import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError, delay, switchMap } from 'rxjs/operators';
import {
  IntegrationProvider,
  IntegrationConfiguration,
  IntegrationTestResult,
  WebhookConfiguration,
  IntegrationStats,
  APICall,
  WebhookLog,
  FacebookIntegrationConfig,
  GoogleAdsIntegrationConfig
} from '../../interfaces/integration.interface';
import { DatabaseService } from '../database/database.service';
import { DatabaseIntegration } from '../../interfaces/database.interface';

@Injectable({
  providedIn: 'root'
})
export class IntegrationsService {
  private providers$ = new BehaviorSubject<IntegrationProvider[]>([]);
  private configurations$ = new BehaviorSubject<IntegrationConfiguration[]>([]);
  private webhooks$ = new BehaviorSubject<WebhookConfiguration[]>([]);
  private apiCalls$ = new BehaviorSubject<APICall[]>([]);
  private webhookLogs$ = new BehaviorSubject<WebhookLog[]>([]);

  constructor(
    private http: HttpClient,
    private databaseService: DatabaseService
  ) {
    this.initializeProviders();
    this.loadRealData();
  }

  // Providers Management
  getProviders(): Observable<IntegrationProvider[]> {
    return this.providers$.asObservable();
  }

  getProvider(id: string): Observable<IntegrationProvider | undefined> {
    return this.providers$.pipe(
      map(providers => providers.find(p => p.id === id))
    );
  }

  // Configurations Management
  getConfigurations(): Observable<IntegrationConfiguration[]> {
    return this.databaseService.isInitialized$.pipe(
      switchMap(initialized => {
        if (!initialized) {
          return of([]);
        }
        return this.loadConfigurationsFromDatabase();
      })
    );
  }

  getConfiguration(id: string): Observable<IntegrationConfiguration | undefined> {
    return this.configurations$.pipe(
      map(configs => configs.find(c => c.id === id))
    );
  }

  saveConfiguration(config: Partial<IntegrationConfiguration>): Observable<IntegrationConfiguration> {
    return this.databaseService.isInitialized$.pipe(
      switchMap(initialized => {
        if (!initialized) {
          return throwError(() => new Error('Database not initialized'));
        }

        if (config.id) {
          // Update existing
          return this.updateConfigurationInDatabase(config.id, config);
        } else {
          // Create new
          return this.createConfigurationInDatabase(config);
        }
      })
    );
  }

  deleteConfiguration(id: string): Observable<boolean> {
    return this.databaseService.isInitialized$.pipe(
      switchMap(async (initialized) => {
        if (!initialized) {
          throw new Error('Database not initialized');
        }

        try {
          await this.databaseService.deleteIntegration(id);
          this.loadRealData(); // Refresh data
          return true;
        } catch (error) {
          console.error('Error deleting configuration:', error);
          return false;
        }
      })
    );
  }

  // Testing
  testConfiguration(id: string): Observable<IntegrationTestResult> {
    const config = this.configurations$.value.find(c => c.id === id);
    if (!config) {
      return throwError(() => new Error('Configuration not found'));
    }

    const provider = this.providers$.value.find(p => p.id === config.providerId);
    if (!provider) {
      return throwError(() => new Error('Provider not found'));
    }

    // Simulate test based on provider
    return this.performProviderTest(provider, config).pipe(
      map(result => {
        // Update configuration with test results
        const configurations = this.configurations$.value;
        const configIndex = configurations.findIndex(c => c.id === id);
        if (configIndex !== -1) {
          configurations[configIndex].lastTested = new Date();
          configurations[configIndex].testResults = result;
          configurations[configIndex].status = result.success ? 'active' : 'error';
          this.configurations$.next([...configurations]);
        }
        return result;
      })
    );
  }

  private performProviderTest(provider: IntegrationProvider, config: IntegrationConfiguration): Observable<IntegrationTestResult> {
    const startTime = Date.now();
    
    // Simulate API call based on provider
    switch (provider.id) {
      case 'facebook':
        return this.testFacebookIntegration(config);
      case 'google-ads':
        return this.testGoogleAdsIntegration(config);
      default:
        return this.testGenericIntegration(provider, config);
    }
  }

  private testFacebookIntegration(config: IntegrationConfiguration): Observable<IntegrationTestResult> {
    const fbConfig = config.config as FacebookIntegrationConfig;
    
    if (!fbConfig.appId || !fbConfig.accessToken) {
      return of({
        success: false,
        timestamp: new Date(),
        responseTime: 0,
        error: 'App ID e Access Token são obrigatórios'
      });
    }

    // Simulate Facebook Graph API call
    return of({
      success: true,
      timestamp: new Date(),
      responseTime: Math.random() * 1000 + 200,
      statusCode: 200,
      details: {
        tokenValid: true,
        permissions: fbConfig.permissions,
        pageConnected: !!fbConfig.pageId,
        adAccountConnected: !!fbConfig.adAccountId
      }
    }).pipe(delay(1000));
  }

  private testGoogleAdsIntegration(config: IntegrationConfiguration): Observable<IntegrationTestResult> {
    const gadsConfig = config.config as GoogleAdsIntegrationConfig;
    
    if (!gadsConfig.clientId || !gadsConfig.customerId) {
      return of({
        success: false,
        timestamp: new Date(),
        responseTime: 0,
        error: 'Client ID e Customer ID são obrigatórios'
      });
    }

    // Simulate Google Ads API call
    return of({
      success: true,
      timestamp: new Date(),
      responseTime: Math.random() * 800 + 300,
      statusCode: 200,
      details: {
        customerAccessible: true,
        hasActiveCampaigns: true
      }
    }).pipe(delay(800));
  }

  private testGenericIntegration(provider: IntegrationProvider, config: IntegrationConfiguration): Observable<IntegrationTestResult> {
    return of({
      success: Math.random() > 0.2, // 80% success rate
      timestamp: new Date(),
      responseTime: Math.random() * 1500 + 200,
      statusCode: Math.random() > 0.2 ? 200 : 500,
      error: Math.random() > 0.2 ? undefined : 'Connection timeout'
    }).pipe(delay(500));
  }

  // Webhooks Management
  getWebhooks(): Observable<WebhookConfiguration[]> {
    return this.webhooks$.asObservable();
  }

  saveWebhook(webhook: Partial<WebhookConfiguration>): Observable<WebhookConfiguration> {
    const webhooks = this.webhooks$.value;
    
    if (webhook.id) {
      const index = webhooks.findIndex(w => w.id === webhook.id);
      if (index !== -1) {
        webhooks[index] = { ...webhooks[index], ...webhook };
        this.webhooks$.next([...webhooks]);
        return of(webhooks[index]);
      }
    }
    
    const newWebhook: WebhookConfiguration = {
      id: this.generateId(),
      integrationId: webhook.integrationId!,
      name: webhook.name!,
      endpoint: webhook.endpoint!,
      events: webhook.events || [],
      active: webhook.active || true,
      status: webhook.active !== false ? 'active' : 'inactive',
      totalTriggers: 0,
      successRate: 100,
      ...webhook
    };
    
    webhooks.push(newWebhook);
    this.webhooks$.next([...webhooks]);
    return of(newWebhook);
  }

  // Stats and Logs
  getStats(): Observable<IntegrationStats> {
    return this.databaseService.isInitialized$.pipe(
      switchMap(async (initialized) => {
        if (!initialized) {
          return {
            totalIntegrations: 0,
            activeIntegrations: 0,
            totalCalls: 0,
            todayCalls: 0,
            avgResponseTime: 0,
            errorRate: 0,
            successRate: 100,
            totalAPIs: 0,
            activeAPIs: 0,
            totalWebhooks: 0,
            activeWebhooks: 0
          };
        }

        const integrations = await this.databaseService.getIntegrations();
        const activeIntegrations = integrations.filter(i => i.status === 'active');

        return {
          totalIntegrations: integrations.length,
          activeIntegrations: activeIntegrations.length,
          totalCalls: 0, // Will be implemented when we add API call tracking
          todayCalls: 0,
          avgResponseTime: 0,
          errorRate: 0,
          successRate: 100,
          totalAPIs: integrations.length,
          activeAPIs: activeIntegrations.length,
          totalWebhooks: 0, // Will be implemented when we add webhook tracking
          activeWebhooks: 0
        };
      })
    );
  }

  getRecentAPICalls(limit: number = 10): Observable<APICall[]> {
    return this.apiCalls$.pipe(
      map(calls => [...calls].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit))
    );
  }

  getRecentWebhookLogs(limit: number = 10): Observable<WebhookLog[]> {
    return this.webhookLogs$.pipe(
      map(logs => [...logs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit))
    );
  }

  // Utility methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private initializeProviders(): void {
    const providers: IntegrationProvider[] = [
      {
        id: 'facebook',
        name: 'facebook',
        displayName: 'Facebook & Instagram',
        description: 'Integre com Facebook Ads e Instagram para capturar leads e analisar campanhas',
        icon: 'logo-facebook',
        color: 'primary',
        category: 'social-media',
        authType: 'oauth2',
        webhookSupport: true,
        testEndpoint: 'https://graph.facebook.com/me',
        capabilities: [
          {
            id: 'lead_retrieval',
            name: 'Captura de Leads',
            description: 'Recuperar leads de formulários do Facebook',
            enabled: true,
            permissions: ['leads_retrieval']
          },
          {
            id: 'campaign_insights',
            name: 'Insights de Campanhas',
            description: 'Obter métricas de campanhas publicitárias',
            enabled: true,
            permissions: ['ads_read']
          },
          {
            id: 'instagram_media',
            name: 'Mídia do Instagram',
            description: 'Acessar posts e stories do Instagram',
            enabled: true,
            permissions: ['instagram_basic', 'instagram_manage_insights']
          }
        ],
        fields: [
          {
            id: 'app_id',
            name: 'appId',
            label: 'App ID',
            type: 'text',
            required: true,
            placeholder: 'Seu Facebook App ID',
            description: 'ID da aplicação Facebook criada no Facebook Developers',
            group: 'authentication'
          },
          {
            id: 'app_secret',
            name: 'appSecret',
            label: 'App Secret',
            type: 'password',
            required: true,
            placeholder: 'Seu Facebook App Secret',
            description: 'Chave secreta da aplicação Facebook',
            group: 'authentication'
          },
          {
            id: 'access_token',
            name: 'accessToken',
            label: 'Access Token',
            type: 'textarea',
            required: true,
            placeholder: 'Seu Access Token de longa duração',
            description: 'Token de acesso obtido através do processo OAuth',
            group: 'authentication'
          },
          {
            id: 'business_manager_id',
            name: 'businessManagerId',
            label: 'Business Manager ID',
            type: 'text',
            required: false,
            placeholder: 'ID do Business Manager',
            description: 'ID do seu Business Manager (opcional)',
            group: 'business'
          },
          {
            id: 'ad_account_id',
            name: 'adAccountId',
            label: 'Ad Account ID',
            type: 'text',
            required: false,
            placeholder: 'act_123456789',
            description: 'ID da conta publicitária (para campanhas)',
            group: 'business'
          },
          {
            id: 'page_id',
            name: 'pageId',
            label: 'Page ID',
            type: 'text',
            required: false,
            placeholder: 'ID da sua página Facebook',
            description: 'ID da página do Facebook conectada',
            group: 'business'
          },
          {
            id: 'instagram_account_id',
            name: 'instagramAccountId',
            label: 'Instagram Account ID',
            type: 'text',
            required: false,
            placeholder: 'ID da conta Instagram',
            description: 'ID da conta Instagram Business conectada',
            group: 'business'
          },
          {
            id: 'environment',
            name: 'environment',
            label: 'Ambiente',
            type: 'select',
            required: true,
            options: [
              { value: 'sandbox', label: 'Sandbox (Teste)' },
              { value: 'production', label: 'Produção' }
            ],
            description: 'Ambiente para execução da integração',
            group: 'settings'
          }
        ]
      },
      {
        id: 'google-ads',
        name: 'google-ads',
        displayName: 'Google Ads',
        description: 'Integre com Google Ads para gerenciar campanhas e capturar conversões',
        icon: 'logo-google',
        color: 'warning',
        category: 'advertising',
        authType: 'oauth2',
        webhookSupport: false,
        testEndpoint: 'https://googleads.googleapis.com/v14/customers',
        capabilities: [
          {
            id: 'campaign_management',
            name: 'Gestão de Campanhas',
            description: 'Criar e gerenciar campanhas publicitárias',
            enabled: true
          },
          {
            id: 'conversion_tracking',
            name: 'Rastreamento de Conversões',
            description: 'Rastrear e importar dados de conversões',
            enabled: true
          },
          {
            id: 'keyword_research',
            name: 'Pesquisa de Palavras-chave',
            description: 'Ferramenta de planejamento de palavras-chave',
            enabled: true
          }
        ],
        fields: [
          {
            id: 'client_id',
            name: 'clientId',
            label: 'Client ID',
            type: 'text',
            required: true,
            placeholder: 'Seu Google OAuth Client ID',
            description: 'Client ID obtido no Google Cloud Console',
            group: 'authentication'
          },
          {
            id: 'client_secret',
            name: 'clientSecret',
            label: 'Client Secret',
            type: 'password',
            required: true,
            placeholder: 'Seu Google OAuth Client Secret',
            description: 'Client Secret obtido no Google Cloud Console',
            group: 'authentication'
          },
          {
            id: 'refresh_token',
            name: 'refreshToken',
            label: 'Refresh Token',
            type: 'textarea',
            required: true,
            placeholder: 'Seu Refresh Token',
            description: 'Token de atualização obtido no processo OAuth',
            group: 'authentication'
          },
          {
            id: 'customer_id',
            name: 'customerId',
            label: 'Customer ID',
            type: 'text',
            required: true,
            placeholder: '123-456-7890',
            description: 'ID do cliente Google Ads (sem hífens)',
            group: 'account'
          },
          {
            id: 'developer_token',
            name: 'developerToken',
            label: 'Developer Token',
            type: 'password',
            required: true,
            placeholder: 'Seu Developer Token',
            description: 'Token de desenvolvedor da API do Google Ads',
            group: 'account'
          },
          {
            id: 'login_customer_id',
            name: 'loginCustomerId',
            label: 'Login Customer ID',
            type: 'text',
            required: false,
            placeholder: '123-456-7890',
            description: 'ID do cliente de login (para contas MCC)',
            group: 'account'
          }
        ]
      }
    ];

    this.providers$.next(providers);
  }

  private loadRealData(): void {
    // Initialize with empty data - real data will be loaded from database
    this.configurations$.next([]);
    this.webhooks$.next([]);
    this.apiCalls$.next([]);
  }

  private async loadConfigurationsFromDatabase(): Promise<IntegrationConfiguration[]> {
    try {
      const dbIntegrations = await this.databaseService.getIntegrations();

      const configurations: IntegrationConfiguration[] = dbIntegrations.map(integration => ({
        id: integration.id,
        providerId: this.mapTypeToProviderId(integration.type),
        name: integration.name,
        status: integration.status as 'active' | 'inactive' | 'error' | 'testing',
        config: integration.configuration,
        capabilities: this.getCapabilitiesFromConfig(integration.configuration),
        createdAt: integration.createdAt,
        updatedAt: integration.updatedAt,
        lastTested: integration.lastSync,
        testResults: integration.metadata?.testResults
      }));

      this.configurations$.next(configurations);
      return configurations;
    } catch (error) {
      console.error('Error loading configurations from database:', error);
      return [];
    }
  }

  private async createConfigurationInDatabase(config: Partial<IntegrationConfiguration>): Promise<IntegrationConfiguration> {
    const dbIntegration: Omit<DatabaseIntegration, 'createdAt' | 'updatedAt'> = {
      id: this.generateId(),
      name: config.name!,
      type: this.mapProviderIdToType(config.providerId!) as 'facebook' | 'instagram' | 'google_ads' | 'meta_ads' | 'tiktok_ads' | 'linkedin_ads' | 'webhook' | 'api',
      status: (config.status || 'inactive') as 'active' | 'inactive' | 'error' | 'pending' | 'testing',
      configuration: {
        ...config.config,
        isActive: config.status === 'active',
        autoSync: false
      },
      metadata: {
        providerId: config.providerId,
        capabilities: config.capabilities
      }
    };

    const savedIntegration = await this.databaseService.createIntegration(dbIntegration);

    const newConfig: IntegrationConfiguration = {
      id: savedIntegration.id,
      providerId: config.providerId!,
      name: savedIntegration.name,
      status: savedIntegration.status as 'active' | 'inactive' | 'error' | 'pending',
      config: config.config || {},
      capabilities: config.capabilities || [],
      createdAt: savedIntegration.createdAt,
      updatedAt: savedIntegration.updatedAt
    };

    // Update local state
    const configurations = this.configurations$.value;
    configurations.push(newConfig);
    this.configurations$.next([...configurations]);

    return newConfig;
  }

  private async updateConfigurationInDatabase(id: string, updates: Partial<IntegrationConfiguration>): Promise<IntegrationConfiguration> {
    const updateData: Partial<DatabaseIntegration> = {
      updatedAt: new Date()
    };

    if (updates.name) updateData.name = updates.name;
    if (updates.status) updateData.status = updates.status as 'active' | 'inactive' | 'error' | 'pending' | 'testing';
    if (updates.config) {
      updateData.configuration = {
        ...updates.config,
        isActive: updates.status === 'active',
        autoSync: false
      };
    }

    await this.databaseService.updateIntegration(id, updateData);

    // Update local state
    const configurations = this.configurations$.value;
    const index = configurations.findIndex(c => c.id === id);
    if (index !== -1) {
      configurations[index] = { ...configurations[index], ...updates, updatedAt: new Date() };
      this.configurations$.next([...configurations]);
      return configurations[index];
    }

    throw new Error('Configuration not found');
  }

  private mapTypeToProviderId(type: string): string {
    const mapping: { [key: string]: string } = {
      'facebook': 'facebook',
      'instagram': 'facebook',
      'google_ads': 'google-ads',
      'meta_ads': 'facebook',
      'tiktok_ads': 'tiktok',
      'linkedin_ads': 'linkedin',
      'webhook': 'webhook',
      'api': 'api'
    };
    return mapping[type] || type;
  }

  private mapProviderIdToType(providerId: string): string {
    const mapping: { [key: string]: string } = {
      'facebook': 'facebook',
      'google-ads': 'google_ads',
      'tiktok': 'tiktok_ads',
      'linkedin': 'linkedin_ads',
      'webhook': 'webhook',
      'api': 'api'
    };
    return mapping[providerId] || providerId;
  }

  private getCapabilitiesFromConfig(config: any): string[] {
    // Extract capabilities based on the configuration
    const capabilities: string[] = [];

    if (config.pageId) capabilities.push('page_access');
    if (config.adAccountId) capabilities.push('ads_management');
    if (config.accessToken) capabilities.push('api_access');

    return capabilities;
  }
}