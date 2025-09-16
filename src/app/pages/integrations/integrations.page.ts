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

  constructor(
    private integrationsService: IntegrationsService,
    private modalController: ModalController,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.loadData();
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
        this.configurations = configs;
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

    const modal = await this.modalController.create({
      component: IntegrationConfigComponent,
      componentProps: {
        provider: provider,
        configuration: config
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
    console.log('Creating webhook...');
  }

  async testWebhook(webhook: WebhookConfiguration) {
    console.log('Testing webhook:', webhook.name);
    // TODO: Implement webhook testing
  }

  // Utility methods
  exportLogs() {
    console.log('Exporting logs...');
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
}