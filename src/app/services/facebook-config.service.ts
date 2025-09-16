import { Injectable } from '@angular/core';
import { IntegrationConfiguration } from '../interfaces/integration.interface';
import { environment } from '../../environments/environment';

export interface FacebookConfigData {
  appId: string;
  appSecret: string;
  accessToken: string;
  businessManagerId: string;
  pageId: string;
  instagramAccountId: string;
}

@Injectable({
  providedIn: 'root'
})
export class FacebookConfigService {
  private readonly STORAGE_KEY = 'facebook_default_config';

  private defaultConfig: FacebookConfigData = {
    appId: environment.facebook.appId || 'SEU_APP_ID_AQUI',
    appSecret: environment.facebook.appSecret || 'SEU_APP_SECRET_AQUI',
    accessToken: environment.facebook.accessToken || 'SEU_ACCESS_TOKEN_VALIDO_AQUI',
    businessManagerId: environment.facebook.businessManagerId || 'SEU_BUSINESS_MANAGER_ID',
    pageId: environment.facebook.pageId || 'SEU_PAGE_ID',
    instagramAccountId: environment.facebook.instagramAccountId || 'SEU_INSTAGRAM_ACCOUNT_ID'
  };

  constructor() {
    this.initializeStorage();
  }

  private initializeStorage(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) {
      this.saveDefaultConfig();
      console.log('📱 Configuração padrão do Facebook salva no storage');
    } else {
      console.log('📱 Configuração do Facebook já existe no storage');
    }
  }

  private saveDefaultConfig(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.defaultConfig));
  }

  getDefaultConfig(): FacebookConfigData {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Erro ao parsear configuração do Facebook:', error);
        this.saveDefaultConfig();
        return this.defaultConfig;
      }
    }
    return this.defaultConfig;
  }

  updateConfig(config: FacebookConfigData): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
    console.log('📱 Configuração do Facebook atualizada no storage');
  }

  createIntegrationConfiguration(name: string = 'Facebook & Instagram'): Partial<IntegrationConfiguration> {
    const config = this.getDefaultConfig();
    console.log('🏗️ FacebookConfigService criando configuração:', { name, config });

    return {
      providerId: 'facebook',
      name: name,
      status: 'active' as const,
      config: {
        appId: config.appId,
        appSecret: config.appSecret,
        accessToken: config.accessToken,
        businessManagerId: config.businessManagerId,
        pageId: config.pageId,
        instagramAccountId: config.instagramAccountId,
        environment: 'production',
        permissions: ['instagram_basic', 'instagram_manage_insights', 'ads_read', 'leads_retrieval', 'pages_read_engagement', 'pages_manage_metadata']
      },
      capabilities: ['instagram_media', 'lead_retrieval', 'campaign_insights', 'page_management', 'audience_insights']
    };
  }

  hasValidConfig(): boolean {
    const config = this.getDefaultConfig();
    return !!(
      config.appId &&
      config.appSecret &&
      config.accessToken &&
      config.businessManagerId &&
      config.pageId &&
      config.instagramAccountId
    );
  }

  resetToDefault(): void {
    this.saveDefaultConfig();
    console.log('📱 Configuração do Facebook resetada para valores padrão');
  }

  getConfigForForm(): { [key: string]: any } {
    const config = this.getDefaultConfig();
    return {
      appId: config.appId,
      appSecret: config.appSecret,
      accessToken: config.accessToken,
      businessManagerId: config.businessManagerId,
      pageId: config.pageId,
      instagramAccountId: config.instagramAccountId
    };
  }

  isConfigComplete(formData: any): boolean {
    const requiredFields = ['appId', 'appSecret', 'accessToken', 'businessManagerId', 'pageId', 'instagramAccountId'];
    return requiredFields.every(field => formData[field] && formData[field].trim() !== '');
  }
}