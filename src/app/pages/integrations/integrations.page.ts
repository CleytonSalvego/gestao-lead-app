import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController, AlertController, LoadingController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  IntegrationProvider,
  IntegrationConfiguration,
  IntegrationStats,
  APICall,
  WebhookLog,
  WebhookConfiguration
} from '../../interfaces/integration.interface';
import { IntegrationsService } from '../../services/integrations/integrations.service';
import { IntegrationConfigComponent } from '../../components/integration-config/integration-config.component';
import { AutoIntegrationService } from '../../services/auto-integration.service';
import { AuthService } from '../../services/mock/auth.service';
import { UserRole } from '../../interfaces/auth.interface';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-integrations',
  templateUrl: './integrations.page.html',
  styleUrls: ['./integrations.page.scss'],
})
export class IntegrationsPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  selectedSegment = 'overview';
  
  // Data
  providers: IntegrationProvider[] = [];
  configurations: IntegrationConfiguration[] = [];
  webhooks: WebhookConfiguration[] = [];
  recentCalls: APICall[] = [];
  recentWebhookLogs: WebhookLog[] = [];
  stats: IntegrationStats = {
    totalIntegrations: 0,
    activeIntegrations: 0,
    totalCalls: 0,
    todayCalls: 0,
    avgResponseTime: 0,
    errorRate: 0,
    successRate: 100,
    // Backward compatibility
    totalAPIs: 0,
    activeAPIs: 0,
    totalWebhooks: 0,
    activeWebhooks: 0
  };

  // UI State
  isAnalyst = false;
  isMetaAnalyst = false;
  isCreatingIntegration = false;

  constructor(
    private integrationsService: IntegrationsService,
    private modalController: ModalController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private autoIntegrationService: AutoIntegrationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadData();

    // Check if user is analyst to disable configuration buttons
    this.authService.currentUser$.subscribe(user => {
      this.isAnalyst = user?.role === UserRole.META_ANALYST;
      this.isMetaAnalyst = user?.email === 'analista-meta@teste.com';

      // If user is meta analyst, automatically set to configurations tab
      if (this.isMetaAnalyst) {
        this.selectedSegment = 'configurations';
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData() {
    // Load providers
    this.integrationsService.getProviders()
      .pipe(takeUntil(this.destroy$))
      .subscribe(providers => {
        this.providers = providers;
      });

    // Load configurations
    this.integrationsService.getConfigurations()
      .pipe(takeUntil(this.destroy$))
      .subscribe(configs => {
        // Remove duplicates based on ID
        const uniqueConfigs = configs.filter((config, index, self) =>
          index === self.findIndex((c) => c.id === config.id)
        );
        this.configurations = uniqueConfigs;
      });

    // Load webhooks
    this.integrationsService.getWebhooks()
      .pipe(takeUntil(this.destroy$))
      .subscribe(webhooks => {
        this.webhooks = webhooks;
      });

    // Load recent API calls
    this.integrationsService.getRecentAPICalls(10)
      .pipe(takeUntil(this.destroy$))
      .subscribe(calls => {
        this.recentCalls = calls;
      });

    // Load recent webhook logs
    this.integrationsService.getRecentWebhookLogs(10)
      .pipe(takeUntil(this.destroy$))
      .subscribe(logs => {
        this.recentWebhookLogs = logs;
      });

    // Load stats
    this.integrationsService.getStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => {
        this.stats = stats;
      });
  }

  // Provider methods
  async configureProvider(provider: IntegrationProvider) {
    const modal = await this.modalController.create({
      component: IntegrationConfigComponent,
      componentProps: {
        provider: provider
      },
      cssClass: 'integration-config-modal'
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        // Configuration was saved
        this.loadData(); // Refresh data
      }
    });

    return await modal.present();
  }

  async showProvidersModal() {
    // Pequeno delay para mostrar o loading
    await new Promise(resolve => setTimeout(resolve, 800));

    const alert = await this.alertController.create({
      header: 'Selecionar Provedor',
      message: 'Escolha o tipo de integração que deseja configurar:',
      inputs: this.providers.map(provider => ({
        name: 'provider',
        type: 'radio',
        label: provider.displayName,
        value: provider.id
      })),
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Configurar',
          handler: (selectedProviderId) => {
            if (selectedProviderId) {
              const provider = this.providers.find(p => p.id === selectedProviderId);
              if (provider) {
                this.configureProvider(provider);
              }
            }
          }
        }
      ]
    });

    await alert.present();
  }

  getProviderStatusIcon(providerId: string): string {
    const config = this.configurations.find(c => c.providerId === providerId);
    if (!config) return 'add-circle-outline';
    
    switch (config.status) {
      case 'active': return 'checkmark-circle';
      case 'error': return 'close-circle';
      case 'testing': return 'sync';
      default: return 'pause-circle';
    }
  }

  getProviderStatusColor(providerId: string): string {
    const config = this.configurations.find(c => c.providerId === providerId);
    if (!config) return 'medium';
    
    switch (config.status) {
      case 'active': return 'success';
      case 'error': return 'danger';
      case 'testing': return 'warning';
      default: return 'medium';
    }
  }

  getCategoryLabel(category: string): string {
    const categoryLabels: { [key: string]: string } = {
      'social-media': 'Redes Sociais',
      'advertising': 'Publicidade',
      'crm': 'CRM',
      'analytics': 'Analytics',
      'email': 'Email Marketing',
      'other': 'Outros'
    };
    return categoryLabels[category] || category;
  }

  // Configuration methods
  async editConfiguration(config: IntegrationConfiguration) {
    const provider = this.providers.find(p => p.id === config.providerId);
    if (!provider) return;

    // Criar uma cópia da configuração para mascaramento se necessário
    let configToEdit = { ...config };

    // Se o usuário for analista-meta@teste.com, mascarar dados sensíveis
    if (this.isMetaAnalyst && config.name === 'Redes Sociais Teste') {
      configToEdit = this.maskSensitiveData(config);
    }

    const modal = await this.modalController.create({
      component: IntegrationConfigComponent,
      componentProps: {
        provider: provider,
        configuration: configToEdit,
        isMasked: this.isMetaAnalyst && config.name === 'Redes Sociais Teste'
      },
      cssClass: 'integration-config-modal'
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.loadData(); // Refresh data
      }
    });

    return await modal.present();
  }

  /**
   * Mascara dados sensíveis para o usuário analista-meta@teste.com
   */
  private maskSensitiveData(config: IntegrationConfiguration): IntegrationConfiguration {
    const maskedConfig = { ...config };

    if (maskedConfig.config) {
      const conf = maskedConfig.config;

      // Mascarar IDs: mostrar apenas 2 primeiros e 2 últimos caracteres
      if (conf.pageId) {
        conf.pageId = this.maskId(conf.pageId);
      }
      if (conf.instagramAccountId) {
        conf.instagramAccountId = this.maskId(conf.instagramAccountId);
      }
      if (conf.appId) {
        conf.appId = this.maskId(conf.appId);
      }

      // Mascarar token completamente
      if (conf.accessToken) {
        conf.accessToken = '****************************';
      }
      if (conf.appSecret) {
        conf.appSecret = '****************************';
      }
    }

    return maskedConfig;
  }

  /**
   * Mascara um ID mostrando apenas os 2 primeiros e 2 últimos caracteres
   */
  private maskId(id: string): string {
    if (!id || id.length <= 4) {
      return '****';
    }

    const firstTwo = id.substring(0, 2);
    const lastTwo = id.substring(id.length - 2);
    const maskedMiddle = '****';

    return `${firstTwo}${maskedMiddle}${lastTwo}`;
  }

  async testIntegration(config: IntegrationConfiguration) {
    const loading = await this.loadingController.create({
      message: 'Testando integração...'
    });
    await loading.present();

    try {
      const result = await this.integrationsService.testConfiguration(config.id).toPromise();
      
      if (result?.success) {
        const alert = await this.alertController.create({
          header: 'Teste Bem-sucedido!',
          message: `A integração ${config.name} está funcionando corretamente.`,
          buttons: ['OK']
        });
        await alert.present();
      } else {
        const alert = await this.alertController.create({
          header: 'Teste Falhou',
          message: result?.error || 'Erro desconhecido na integração.',
          buttons: ['OK']
        });
        await alert.present();
      }
      
      this.loadData(); // Refresh to show updated test results
    } catch (error: any) {
      const alert = await this.alertController.create({
        header: 'Erro no Teste',
        message: error.message || 'Erro ao testar a integração.',
        buttons: ['OK']
      });
      await alert.present();
    } finally {
      await loading.dismiss();
    }
  }

  async deleteConfiguration(config: IntegrationConfiguration) {
    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir a integração "${config.name}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Removendo integração...'
            });
            await loading.present();

            try {
              const success = await this.integrationsService.deleteConfiguration(config.id).toPromise();
              if (success) {
                this.loadData(); // Refresh data
                const successAlert = await this.alertController.create({
                  header: 'Sucesso!',
                  message: 'Integração removida com sucesso.',
                  buttons: ['OK']
                });
                await successAlert.present();
              }
            } catch (error: any) {
              const errorAlert = await this.alertController.create({
                header: 'Erro',
                message: error.message || 'Erro ao remover a integração.',
                buttons: ['OK']
              });
              await errorAlert.present();
            } finally {
              await loading.dismiss();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  getProviderName(providerId: string): string {
    const provider = this.providers.find(p => p.id === providerId);
    return provider?.displayName || 'Desconhecido';
  }

  // Webhook methods
  async createWebhook() {
    if (this.configurations.length === 0) {
      const alert = await this.alertController.create({
        header: 'Nenhuma Integração',
        message: 'Configure pelo menos uma integração antes de criar webhooks.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // TODO: Implement webhook creation modal
  }

  async testWebhook(webhook: WebhookConfiguration) {
    // TODO: Implement webhook testing
  }

  // Utility methods
  exportLogs() {
    // TODO: Implement log export
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'error': return 'danger';
      case 'testing': return 'tertiary';
      default: return 'medium';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active': return 'Ativa';
      case 'inactive': return 'Inativa';
      case 'error': return 'Erro';
      case 'testing': return 'Testando';
      default: return 'Desconhecido';
    }
  }

  async forceCreateIntegration() {

    try {

      // Pular verificação e ir direto para criação

      // Criar configuração usando o DatabaseService diretamente
      const newIntegration = {
        id: `integration_${Date.now()}`,
        name: `Redes Sociais Teste`,
        type: 'facebook' as const,
        status: 'active' as const,
        configuration: {
          appId: environment.facebook.appId || '722085609076707',
          appSecret: environment.facebook.appSecret || '045f9424e3d03a7dc02c8ca468edfa72',
          accessToken: environment.facebook.accessToken || 'dd03a6d9346805abffd989d966ece52d',
          businessManagerId: environment.facebook.businessManagerId || '630140316714253',
          pageId: environment.facebook.pageId || '579080491964703',
          instagramAccountId: environment.facebook.instagramAccountId || '17841474874248436',
          environment: 'production',
          isActive: true,
          autoSync: false
        },
        metadata: {
          providerId: 'facebook',
          capabilities: ['instagram_media', 'lead_retrieval']
        }
      };


      // Usar o DatabaseService diretamente
      const savedIntegration = await (this.integrationsService as any).databaseService.createIntegration(newIntegration);


      // Adicionar à lista local
      const newConfig = {
        id: savedIntegration.id,
        providerId: 'facebook',
        name: savedIntegration.name,
        status: savedIntegration.status,
        config: savedIntegration.configuration,
        capabilities: savedIntegration.metadata?.capabilities || [],
        createdAt: savedIntegration.createdAt,
        updatedAt: savedIntegration.updatedAt
      };

      this.configurations.push(newConfig);

      // Também adicionar ao BehaviorSubject do service para que o teste funcione
      const serviceConfigurations = (this.integrationsService as any).configurations$.value;
      serviceConfigurations.push(newConfig);
      (this.integrationsService as any).configurations$.next([...serviceConfigurations]);


    } catch (error: any) {
      console.error('❌ ERRO COMPLETO:', error);
      console.error('❌ Stack:', error.stack);
    }
  }

  /**
   * Handle new integration button click
   * Routes to appropriate method based on user type
   */
  async handleNewIntegration() {

    // Verificação especial para analista-meta@teste.com
    if (this.isMetaAnalyst) {
      // Verificar se já existe a integração teste
      const testIntegration = this.configurations.find(config =>
        config.name === 'Redes Sociais Teste' || config.name === 'Facebook Teste'
      );

      if (testIntegration) {
        await this.editConfiguration(testIntegration);
        return;
      }
    }

    // Mostrar loading inline na tela
    this.isCreatingIntegration = true;

    try {
      if (this.isMetaAnalyst) {
        // For analista-meta@teste.com: create test integration directly
        await this.forceCreateIntegration();
      } else {
        // For other users: show normal provider selection modal
        await this.showProvidersModal();
      }
    } finally {
      this.isCreatingIntegration = false;
    }
  }

  async testRealFacebookAPI() {
    try {

      const loading = await this.loadingController.create({
        message: 'Testando API real do Facebook...'
      });
      await loading.present();

      // Usar token das variáveis de ambiente
      const testToken = environment.facebook.accessToken || 'SEU_ACCESS_TOKEN_VALIDO_AQUI';

      // Fazer chamada direta para a API do Facebook
      const testUrl = `https://graph.facebook.com/v18.0/me?access_token=${testToken}&fields=id,name`;


      try {
        const response = await fetch(testUrl);
        const data = await response.json();

        await loading.dismiss();


        if (data.error) {
          // Erro da API do Facebook
          const alert = await this.alertController.create({
            header: 'Erro da API Facebook',
            message: `${data.error.message} (Código: ${data.error.code})`,
            buttons: ['OK']
          });
          await alert.present();
        } else {
          // Sucesso
          const alert = await this.alertController.create({
            header: 'API Facebook Funcionando!',
            message: `Conectado como: ${data.name} (ID: ${data.id})`,
            buttons: ['OK']
          });
          await alert.present();
        }

      } catch (networkError: any) {
        await loading.dismiss();
        console.error('❌ Erro de rede:', networkError);

        let errorMessage = 'Erro de conexão com a API do Facebook';
        if (networkError.name === 'TypeError' && networkError.message.includes('CORS')) {
          errorMessage = 'Erro CORS - As chamadas diretas para a API do Facebook podem ser bloqueadas pelo navegador. Use um proxy ou backend.';
        }

        const alert = await this.alertController.create({
          header: 'Erro de Conexão',
          message: errorMessage,
          buttons: ['OK']
        });
        await alert.present();
      }

    } catch (error: any) {
      console.error('❌ ERRO GERAL:', error);
    }
  }

  async resetAndRecreate() {
    try {

      // Limpar localStorage
      localStorage.removeItem('auto_integration_created');
      localStorage.removeItem('facebook_default_config');

      // Limpar arrays locais
      this.configurations = [];

      // Limpar service
      (this.integrationsService as any).configurations$.next([]);

      // Aguardar um pouco
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Forçar recriação
      await this.autoIntegrationService.forceCreateConfiguration();

      // Recarregar dados
      this.loadData();


    } catch (error: any) {
      console.error('❌ ERRO NO RESET:', error);
    }
  }
}