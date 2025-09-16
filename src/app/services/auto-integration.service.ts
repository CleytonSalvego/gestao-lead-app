import { Injectable } from '@angular/core';
import { IntegrationsService } from './integrations/integrations.service';
import { FacebookConfigService } from './facebook-config.service';
import { DatabaseService } from './database/database.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { IntegrationConfiguration } from '../interfaces/integration.interface';

@Injectable({
  providedIn: 'root'
})
export class AutoIntegrationService {
  private readonly AUTO_CONFIG_KEY = 'auto_integration_created';
  private autoConfigCreatedSubject = new BehaviorSubject<boolean>(false);
  public autoConfigCreated$ = this.autoConfigCreatedSubject.asObservable();

  constructor(
    private integrationsService: IntegrationsService,
    private facebookConfigService: FacebookConfigService,
    private databaseService: DatabaseService
  ) {
    console.log('🔧 AutoIntegrationService inicializado');
    console.log('🔧 Facebook config:', this.facebookConfigService.getDefaultConfig());
    this.checkAndCreateAutoConfig();
  }

  private async checkAndCreateAutoConfig(): Promise<void> {
    try {
      const alreadyCreated = localStorage.getItem(this.AUTO_CONFIG_KEY);

      if (!alreadyCreated) {
        console.log('🚀 Primeira execução - criando configuração automática do Facebook');
        setTimeout(async () => {
          try {
            await this.createAutoFacebookConfiguration();
          } catch (error) {
            console.error('❌ Falha na criação automática:', error);
          }
        }, 2000);
      } else {
        console.log('📋 Configuração automática do Facebook já foi criada');
        this.autoConfigCreatedSubject.next(true);
      }
    } catch (error) {
      console.error('❌ Erro no checkAndCreateAutoConfig:', error);
    }
  }

  private async createAutoFacebookConfiguration(): Promise<void> {
    try {
      console.log('🚀 Iniciando criação da configuração automática do Facebook');

      // Aguardar inicialização do banco
      await this.databaseService.waitForInitialization();
      console.log('🗃️ Banco inicializado para auto-configuração');

      // Verificar se já existe uma configuração Facebook
      try {
        const existingConfigs = await this.integrationsService.getConfigurations().toPromise();
        const facebookExists = existingConfigs?.some((config: any) => config.providerId === 'facebook');

        if (facebookExists) {
          console.log('📋 Configuração Facebook já existe, pulando criação automática');
          this.markAutoConfigAsCreated();
          return;
        }
      } catch (error) {
        console.log('⚠️ Continuando criação...');
      }

      // Criar configuração diretamente
      const autoConfig = {
        providerId: 'facebook',
        name: 'Facebook & Instagram - Configuração Automática',
        status: 'active' as const,
        config: {
          appId: '722085609076707',
          appSecret: '045f9424e3d03a7dc02c8ca468edfa72',
          accessToken: 'dd03a6d9346805abffd989d966ece52d',
          businessManagerId: '630140316714253',
          pageId: '579080491964703',
          instagramAccountId: '',
          environment: 'production',
          permissions: ['instagram_basic', 'instagram_manage_insights', 'ads_read', 'leads_retrieval', 'pages_read_engagement', 'pages_manage_metadata']
        },
        capabilities: ['instagram_media', 'lead_retrieval', 'campaign_insights', 'page_management', 'audience_insights']
      };

      console.log('💾 Criando configuração automática do Facebook...');
      const savedConfig = await this.integrationsService.saveConfiguration(autoConfig).toPromise();

      if (savedConfig) {
        console.log('✅ Configuração automática criada com sucesso:', savedConfig.id);
        this.markAutoConfigAsCreated();

        // Criar páginas sociais
        try {
          await this.createSocialMediaPage(savedConfig.id!);
        } catch (pageError) {
          console.error('⚠️ Erro ao criar páginas sociais:', pageError);
        }
      }

    } catch (error) {
      console.error('❌ Erro ao criar configuração automática:', error);
    }
  }

  private async createSocialMediaPage(integrationId: string): Promise<void> {
    try {
      const facebookConfig = this.facebookConfigService.getDefaultConfig();

      const pageData = {
        id: `page_facebook_${Date.now()}`,
        platform: 'facebook' as const,
        pageId: facebookConfig.pageId,
        pageName: 'Facebook Business Page',
        username: '@facebook_business',
        profilePicture: 'https://via.placeholder.com/150x150/1877f2/ffffff?text=FB',
        isConnected: true,
        isVerified: true,
        followers: 2500,
        posts: 67,
        engagement: 6.2,
        integrationId: integrationId,
        lastActivity: new Date()
      };

      const savedPage = await this.databaseService.createSocialMediaPage(pageData);
      console.log('✅ Página Facebook criada automaticamente:', savedPage);

      // Criar também página Instagram
      const instagramPageData = {
        id: `page_instagram_${Date.now()}`,
        platform: 'instagram' as const,
        pageId: facebookConfig.instagramAccountId,
        pageName: 'Instagram Business Account',
        username: '@instagram_business',
        profilePicture: 'https://via.placeholder.com/150x150/833ab4/ffffff?text=IG',
        isConnected: true,
        isVerified: true,
        followers: 1800,
        posts: 89,
        engagement: 5.8,
        integrationId: integrationId,
        lastActivity: new Date()
      };

      const savedInstagramPage = await this.databaseService.createSocialMediaPage(instagramPageData);
      console.log('✅ Página Instagram criada automaticamente:', savedInstagramPage);

    } catch (error) {
      console.error('❌ Erro ao criar páginas sociais automáticas:', error);
    }
  }

  private markAutoConfigAsCreated(): void {
    localStorage.setItem(this.AUTO_CONFIG_KEY, 'true');
    this.autoConfigCreatedSubject.next(true);
    console.log('✅ Auto-configuração marcada como criada');
  }

  public resetAutoConfig(): void {
    localStorage.removeItem(this.AUTO_CONFIG_KEY);
    this.autoConfigCreatedSubject.next(false);
    console.log('🔄 Reset da auto-configuração - será recriada na próxima inicialização');
  }

  public isAutoConfigCreated(): boolean {
    return !!localStorage.getItem(this.AUTO_CONFIG_KEY);
  }

  public async recreateAutoConfig(): Promise<void> {
    this.resetAutoConfig();
    setTimeout(async () => {
      try {
        await this.createAutoFacebookConfiguration();
      } catch (error) {
        console.error('❌ Erro na recriação:', error);
      }
    }, 1000);
  }

  public getDefaultFacebookConfig(): any {
    return this.facebookConfigService.getConfigForForm();
  }

  public async forceCreateConfiguration(): Promise<void> {
    console.log('🔄 Criando configuração...');

    try {
      // Aguardar banco
      console.log('⏳ Aguardando inicialização do banco...');
      await this.databaseService.waitForInitialization();
      console.log('✅ Banco inicializado');

      // Obter configuração do Facebook
      const fbConfig = this.facebookConfigService.getDefaultConfig();
      console.log('📱 Config do Facebook obtida:', fbConfig);

      // Criar configuração diretamente
      const autoConfig = {
        providerId: 'facebook',
        name: 'Facebook & Instagram - Configuração Forçada',
        status: 'active' as const,
        config: {
          appId: fbConfig.appId,
          appSecret: fbConfig.appSecret,
          accessToken: fbConfig.accessToken,
          businessManagerId: fbConfig.businessManagerId,
          pageId: fbConfig.pageId,
          instagramAccountId: fbConfig.instagramAccountId,
          environment: 'production',
          permissions: ['instagram_basic', 'instagram_manage_insights', 'ads_read', 'leads_retrieval', 'pages_read_engagement', 'pages_manage_metadata']
        },
        capabilities: ['instagram_media', 'lead_retrieval', 'campaign_insights', 'page_management', 'audience_insights']
      };

      console.log('📝 Configuração para salvar:', autoConfig);

      const savedConfig = await this.integrationsService.saveConfiguration(autoConfig).toPromise();
      console.log('💾 Resultado do save:', savedConfig);

      if (savedConfig) {
        console.log('✅ Configuração criada com sucesso:', savedConfig.id);
        this.markAutoConfigAsCreated();
      } else {
        console.error('❌ SavedConfig é null/undefined');
      }

    } catch (error) {
      console.error('❌ Erro ao criar configuração:', error);
      console.error('❌ Stack trace:', (error as Error).stack);
      throw error;
    }
  }

}