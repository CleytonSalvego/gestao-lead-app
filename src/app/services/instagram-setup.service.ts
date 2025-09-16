import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from './mock/auth.service';
import { IntegrationsService } from './integrations/integrations.service';
import { DatabaseService } from './database/database.service';
import { FacebookConfigService } from './facebook-config.service';

@Injectable({
  providedIn: 'root'
})
export class InstagramSetupService implements OnDestroy {
  private subscription?: Subscription;

  constructor(
    private authService: AuthService,
    private integrationsService: IntegrationsService,
    private databaseService: DatabaseService,
    private facebookConfigService: FacebookConfigService
  ) {
    console.log('🚀 InstagramSetupService inicializado');
    this.initializeAutoSetup();
  }

  private initializeAutoSetup() {
    console.log('📡 Configurando observador para setup do Instagram');
    this.subscription = this.authService.needsInstagramSetup$.subscribe(needsSetup => {
      console.log('🔔 Sinal recebido - needsInstagramSetup:', needsSetup);
      if (needsSetup) {
        this.setupInstagramIntegration();
      }
    });
  }

  private async setupInstagramIntegration() {
    console.log('⚙️ Iniciando setup da integração do Facebook/Instagram');

    // Aguardar a inicialização do banco antes de prosseguir
    try {
      await this.databaseService.waitForInitialization();
      console.log('🗃️ Banco de dados inicializado, prosseguindo com setup...');
    } catch (error) {
      console.log('⚠️ Timeout do banco, usando fallback para localStorage...');
    }

    // Usar dados do FacebookConfigService
    const integrationConfiguration = this.facebookConfigService.createIntegrationConfiguration('Facebook & Instagram - Auto Setup');

    console.log('💾 Salvando configuração do Instagram no banco de dados...');

    this.integrationsService.saveConfiguration(integrationConfiguration).subscribe(
      savedConfig => {
        console.log('✅ Configuração do Facebook/Instagram criada automaticamente:', savedConfig);
        // Após criar a integração, criar a página social media usando o ID da integração criada
        if (savedConfig && savedConfig.id) {
          const facebookConfig = this.facebookConfigService.getDefaultConfig();
          this.createInstagramPageInDatabase(facebookConfig, savedConfig.id!);
        }
        this.authService.markInstagramSetupComplete();
      },
      error => {
        console.error('❌ Erro ao criar configuração do Instagram:', error);
        this.authService.markInstagramSetupComplete();
      }
    );
  }

  private async createInstagramPageInDatabase(config: any, integrationId: string) {
    console.log('📄 Criando página do Instagram no banco de dados...');

    const pageData = {
      id: `page_instagram_${Date.now()}`,
      platform: 'instagram' as const,
      pageId: config.instagramAccountId,
      pageName: 'Instagram Business',
      username: '@business_account',
      profilePicture: 'https://via.placeholder.com/150x150/833ab4/ffffff?text=IG',
      isConnected: true,
      isVerified: true,
      followers: 1250,
      posts: 45,
      engagement: 4.8,
      integrationId: integrationId, // Usar o ID da integração criada
      lastActivity: new Date()
    };

    try {
      const savedPage = await this.databaseService.createSocialMediaPage(pageData);
      console.log('✅ Página criada no banco:', savedPage);

      // Criar alguns posts mock para demonstração
      await this.createMockInstagramPosts(savedPage.id);

      return savedPage;
    } catch (error) {
      console.error('❌ Erro ao criar página:', error);
      throw error;
    }
  }

  private async createMockInstagramPosts(pageId: string) {
    console.log('📸 Criando posts mock do Instagram...');

    const mockPosts = [
      {
        id: `post_ig_${Date.now()}_1`,
        pageId: pageId,
        platform: 'instagram' as const,
        type: 'post' as const,
        postId: 'CXBz7KYB5Jp',
        content: 'Conheça nossos seguros auto com as melhores condições do mercado! 🚗💙 #PortoSeguro #SeguroAuto',
        hashtags: ['#PortoSeguro', '#SeguroAuto'],
        mediaUrls: ['https://via.placeholder.com/400x400/1DA1F2/ffffff?text=Instagram+Post+1'],
        likes: 324,
        comments: 18,
        shares: 12,
        reach: 2890,
        impressions: 3450,
        engagement: 354,
        clicks: 45,
        saves: 23,
        reactions: 0,
        isActive: true,
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 dias atrás
      },
      {
        id: `post_ig_${Date.now()}_2`,
        pageId: pageId,
        platform: 'instagram' as const,
        type: 'reel' as const,
        postId: 'CYDm9NzF8Kp',
        content: 'Dicas rápidas sobre seguro residencial! Proteja seu lar 🏠✨',
        hashtags: ['#PortoSeguro', '#SeguroResidencial', '#DicasSeguro'],
        mediaUrls: ['https://via.placeholder.com/400x600/833ab4/ffffff?text=Instagram+Reel'],
        likes: 892,
        comments: 67,
        shares: 34,
        reach: 8920,
        impressions: 12450,
        engagement: 993,
        clicks: 156,
        saves: 78,
        reactions: 45,
        isActive: true,
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 dia atrás
      },
      {
        id: `post_ig_${Date.now()}_3`,
        pageId: pageId,
        platform: 'instagram' as const,
        type: 'post' as const,
        postId: 'CZFp2QvL9Mn',
        content: 'Vida segura é vida tranquila! Conheça nossos planos de seguro de vida 💙👨‍👩‍👧‍👦',
        hashtags: ['#PortoSeguro', '#SeguroVida', '#Familia'],
        mediaUrls: ['https://via.placeholder.com/400x400/0047AB/ffffff?text=Seguro+Vida'],
        likes: 567,
        comments: 29,
        shares: 19,
        reach: 4560,
        impressions: 6780,
        engagement: 615,
        clicks: 78,
        saves: 45,
        reactions: 22,
        isActive: true,
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 horas atrás
      }
    ];

    for (const post of mockPosts) {
      try {
        await this.databaseService.createSocialMediaPost(post);
        console.log('✅ Post mock criado:', post.id);
      } catch (error) {
        console.error('❌ Erro ao criar post mock:', error);
      }
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}