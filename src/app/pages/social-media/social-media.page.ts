import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { SocialMediaService } from '../../services/mock/social-media.service';
import {
  SocialMediaPost,
  SocialMediaCampaign,
  SocialMediaPage as ISocialMediaPage,
  SocialMediaStats,
  SocialMediaFilter
} from '../../interfaces/social-media.interface';

@Component({
  selector: 'app-social-media',
  templateUrl: './social-media.page.html',
  styleUrls: ['./social-media.page.scss'],
})
export class SocialMediaPage implements OnInit {
  stats?: SocialMediaStats;
  posts: SocialMediaPost[] = [];
  campaigns: SocialMediaCampaign[] = [];
  connectedPages: ISocialMediaPage[] = [];

  filteredPosts: SocialMediaPost[] = [];
  filteredCampaigns: SocialMediaCampaign[] = [];

  isLoading = false;
  isLoadingCampaigns = false;

  viewMode: 'all' | 'posts' | 'campaigns' = 'all';

  currentFilter: SocialMediaFilter = {
    platform: 'all',
    type: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  };

  // Integration management
  availableIntegrations: any[] = [];
  selectedIntegration: any = null;

  constructor(
    private socialMediaService: SocialMediaService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    await this.loadAvailableIntegrations();
    this.loadStats();
    this.loadPosts();
    this.loadCampaigns();
    this.loadConnectedPages();
  }

  async loadAvailableIntegrations() {
    try {
      const dbIntegrations = await this.socialMediaService['databaseService'].getIntegrations();
      this.availableIntegrations = dbIntegrations.filter((integration: any) =>
        integration.type === 'facebook' || integration.metadata?.providerId === 'facebook'
      );
      console.log('🔗 Integrações Facebook disponíveis:', this.availableIntegrations.length);
    } catch (error) {
      console.error('❌ Erro ao carregar integrações:', error);
      this.availableIntegrations = [];
    }
  }

  loadStats() {
    this.socialMediaService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  loadPosts() {
    this.isLoading = true;
    this.socialMediaService.getPosts(this.currentFilter).subscribe({
      next: (posts) => {
        this.posts = posts;
        this.filteredPosts = posts;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.isLoading = false;
      }
    });
  }

  loadCampaigns() {
    this.isLoadingCampaigns = true;
    this.socialMediaService.getCampaigns(this.currentFilter).subscribe({
      next: (campaigns) => {
        this.campaigns = campaigns;
        this.filteredCampaigns = campaigns;
        this.isLoadingCampaigns = false;
      },
      error: (error) => {
        console.error('Error loading campaigns:', error);
        this.isLoadingCampaigns = false;
      }
    });
  }

  loadConnectedPages() {
    console.log('🔍 [SocialMediaPage] Iniciando carregamento de páginas conectadas...');
    this.socialMediaService.getConnectedPages().subscribe({
      next: (pages) => {
        console.log('✅ [SocialMediaPage] Páginas conectadas recebidas:', pages.length, pages);
        this.connectedPages = pages;
      },
      error: (error) => {
        console.error('❌ [SocialMediaPage] Error loading connected pages:', error);
      }
    });
  }

  onFilterChange() {
    this.loadPosts();
    this.loadCampaigns();
  }

  onViewModeChange() {
    // Additional logic if needed when view mode changes
  }

  setViewMode(mode: 'all' | 'posts' | 'campaigns') {
    this.viewMode = mode;
  }

  refreshData() {
    this.loadData();
  }

  openPostDetail(post: SocialMediaPost) {
    // Navigate to post detail or show modal
    console.log('Opening post detail:', post);
  }

  openCampaignDetail(campaign: SocialMediaCampaign) {
    // Navigate to campaign detail or show modal
    console.log('Opening campaign detail:', campaign);
  }

  // Helper methods for template
  getPlatformIcon(platform: string): string {
    const icons: { [key: string]: string } = {
      facebook: 'logo-facebook',
      instagram: 'logo-instagram',
      linkedin: 'logo-linkedin',
      twitter: 'logo-twitter'
    };
    return icons[platform] || 'globe-outline';
  }

  getPlatformName(platform: string): string {
    const names: { [key: string]: string } = {
      facebook: 'Facebook',
      instagram: 'Instagram',
      linkedin: 'LinkedIn',
      twitter: 'Twitter'
    };
    return names[platform] || platform;
  }

  getTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      post: 'primary',
      reel: 'secondary',
      story: 'tertiary',
      campaign: 'success'
    };
    return colors[type] || 'medium';
  }

  getTypeName(type: string): string {
    const names: { [key: string]: string } = {
      post: 'Post',
      reel: 'Reel',
      story: 'Story',
      campaign: 'Campanha'
    };
    return names[type] || type;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      active: 'success',
      paused: 'warning',
      completed: 'medium',
      draft: 'tertiary',
      published: 'success',
      scheduled: 'primary',
      archived: 'medium'
    };
    return colors[status] || 'medium';
  }

  getStatusName(status: string): string {
    const names: { [key: string]: string } = {
      active: 'Ativa',
      paused: 'Pausada',
      completed: 'Finalizada',
      draft: 'Rascunho',
      published: 'Publicado',
      scheduled: 'Agendado',
      archived: 'Arquivado'
    };
    return names[status] || status;
  }

  formatNumber(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  }

  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  async debugDatabase() {
    console.log('🔍 DEBUG: Verificando dados no localStorage e banco...');

    // Check localStorage
    console.log('📦 localStorage integrations:', localStorage.getItem('gestao_lead_integrations'));
    console.log('📦 localStorage pages:', localStorage.getItem('gestao_lead_pages'));
    console.log('📦 localStorage auto_integration_created:', localStorage.getItem('auto_integration_created'));

    // Check if DatabaseService is initialized
    console.log('🗃️ Database initialized?:', await this.socialMediaService['databaseService'].isInitialized$.toPromise());

    // Try to get pages directly from database service
    try {
      const dbPages = await this.socialMediaService['databaseService'].getSocialMediaPages();
      console.log('📊 Pages from database:', dbPages);
    } catch (error) {
      console.error('❌ Error getting pages from database:', error);
    }

    // Check integrations from database
    try {
      const dbIntegrations = await this.socialMediaService['databaseService'].getIntegrations();
      console.log('🔗 Integrations from database:', dbIntegrations);
    } catch (error) {
      console.error('❌ Error getting integrations from database:', error);
    }

    // Check current service state
    console.log('🔄 Current connected pages from service:', this.connectedPages);
  }

  async selectIntegrationAndLoadData() {
    if (this.availableIntegrations.length === 0) {
      const alert = await this.alertController.create({
        header: 'Nenhuma Integração',
        message: 'Não há integrações Facebook disponíveis. Configure uma integração primeiro.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    if (this.availableIntegrations.length === 1) {
      // Se só há uma integração, usar diretamente
      this.selectedIntegration = this.availableIntegrations[0];
      await this.loadRealDataFromIntegration(this.selectedIntegration);
      return;
    }

    // Se há múltiplas integrações, permitir seleção
    const alert = await this.alertController.create({
      header: 'Selecionar Integração',
      message: 'Escolha qual integração usar para carregar os dados:',
      inputs: this.availableIntegrations.map(integration => ({
        name: 'integration',
        type: 'radio',
        label: `${integration.name} (${integration.id})`,
        value: integration,
        checked: this.selectedIntegration?.id === integration.id
      })),
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Carregar Dados',
          handler: async (selectedIntegration) => {
            if (selectedIntegration) {
              this.selectedIntegration = selectedIntegration;
              await this.loadRealDataFromIntegration(selectedIntegration);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async loadRealDataFromIntegration(integration: any) {
    const loading = await this.loadingController.create({
      message: 'Carregando dados reais do Facebook...'
    });
    await loading.present();

    try {
      console.log('🚀 Carregando dados reais da integração:', integration.name);

      const config = integration.configuration || integration.config;
      const accessToken = config?.accessToken;
      const pageId = config?.pageId;
      const instagramAccountId = config?.instagramAccountId;

      if (!accessToken) {
        throw new Error('Token de acesso não encontrado na integração');
      }

      // Carregar informações da página Facebook
      await this.loadFacebookPageInfo(accessToken, pageId, integration.id);

      // Carregar informações do Instagram (se disponível)
      if (instagramAccountId) {
        await this.loadInstagramPageInfo(accessToken, instagramAccountId, integration.id);
      }

      // Recarregar dados da página
      this.loadConnectedPages();

      await loading.dismiss();

      const successAlert = await this.alertController.create({
        header: 'Sucesso!',
        message: 'Dados reais carregados com sucesso!',
        buttons: ['OK']
      });
      await successAlert.present();

    } catch (error: any) {
      await loading.dismiss();
      console.error('❌ Erro ao carregar dados reais:', error);

      const errorAlert = await this.alertController.create({
        header: 'Erro',
        message: `Erro ao carregar dados: ${error.message}`,
        buttons: ['OK']
      });
      await errorAlert.present();
    }
  }

  async loadFacebookPageInfo(accessToken: string, pageId: string, integrationId: string) {
    try {
      console.log('📱 Carregando informações da página Facebook...');

      const response = await fetch(`https://graph.facebook.com/v18.0/${pageId}?fields=id,name,username,picture,fan_count&access_token=${accessToken}`);
      const pageData = await response.json();

      if (pageData.error) {
        throw new Error(`Facebook API Error: ${pageData.error.message}`);
      }

      console.log('📊 Dados recebidos do Facebook:', pageData);

      // Criar/atualizar página no banco
      const facebookPageData = {
        id: `page_facebook_${pageId}`,
        integrationId: integrationId,
        platform: 'facebook' as const,
        pageId: pageData.id,
        pageName: pageData.name || 'Facebook Page',
        username: pageData.username ? `@${pageData.username}` : '@facebook_page',
        profilePicture: pageData.picture?.data?.url || 'https://via.placeholder.com/150x150/1877f2/ffffff?text=FB',
        isConnected: true,
        isVerified: true,
        followers: pageData.fan_count || 0,
        posts: 0, // Posts serão carregados separadamente se necessário
        engagement: 0, // Engagement será calculado separadamente se necessário
        lastActivity: new Date()
      };

      const savedPage = await this.socialMediaService['databaseService'].createSocialMediaPage(facebookPageData);
      console.log('✅ Página Facebook salva:', savedPage);

    } catch (error) {
      console.error('❌ Erro ao carregar página Facebook:', error);
      throw error;
    }
  }

  async loadInstagramPageInfo(accessToken: string, instagramAccountId: string, integrationId: string) {
    try {
      console.log('📸 Carregando informações da conta Instagram...');

      const response = await fetch(`https://graph.facebook.com/v18.0/${instagramAccountId}?fields=id,username,profile_picture_url,followers_count,media_count&access_token=${accessToken}`);
      const instagramData = await response.json();

      if (instagramData.error) {
        throw new Error(`Instagram API Error: ${instagramData.error.message}`);
      }

      console.log('📊 Dados recebidos do Instagram:', instagramData);

      // Criar/atualizar página Instagram no banco
      const instagramPageData = {
        id: `page_instagram_${instagramAccountId}`,
        integrationId: integrationId,
        platform: 'instagram' as const,
        pageId: instagramData.id,
        pageName: 'Instagram Business Account',
        username: instagramData.username ? `@${instagramData.username}` : '@instagram_account',
        profilePicture: instagramData.profile_picture_url || 'https://via.placeholder.com/150x150/833ab4/ffffff?text=IG',
        isConnected: true,
        isVerified: true,
        followers: instagramData.followers_count || 0,
        posts: instagramData.media_count || 0,
        engagement: 0, // Instagram não fornece taxa de engajamento diretamente
        lastActivity: new Date()
      };

      const savedPage = await this.socialMediaService['databaseService'].createSocialMediaPage(instagramPageData);
      console.log('✅ Página Instagram salva:', savedPage);

    } catch (error) {
      console.error('❌ Erro ao carregar página Instagram:', error);
      throw error;
    }
  }
}