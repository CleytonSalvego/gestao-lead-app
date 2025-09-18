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
import { SocialMediaPageDB } from '../../interfaces/database.interface';

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

  // New step-based flow
  currentStep: 'integrations' | 'pages' | 'content' = 'integrations';
  availablePages: SocialMediaPageDB[] = [];
  selectedPage: SocialMediaPageDB | null = null;
  isLoadingPages = false;
  contentType: 'posts' | 'campaigns' = 'posts';

  constructor(
    private socialMediaService: SocialMediaService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.loadData();
  }

  ionViewWillEnter() {
    console.log('🚀 Entrando na tela Redes Sociais - carregando dados automaticamente...');
    this.loadData();
  }

  async loadData() {
    console.log('🔄 Carregando dados da tela Redes Sociais...');
    this.isLoading = true;

    try {
      await this.loadAvailableIntegrations();
      console.log('📊 Integrações carregadas:', this.availableIntegrations.length);

      // Carregar todas as páginas de todas as integrações
      await this.loadAllPagesFromAllIntegrations();

      // Se há páginas disponíveis, selecionar a primeira automaticamente
      if (this.availablePages.length > 0) {
        this.selectedPage = this.availablePages[0];

        // Encontrar a integração correspondente à página selecionada
        this.selectedIntegration = this.availableIntegrations.find(
          integration => integration.id === this.selectedPage!.integrationId
        );

        console.log('🎯 Página selecionada automaticamente:', this.selectedPage.pageName);
        console.log('🔗 Integração correspondente:', this.selectedIntegration?.name);

        await this.loadContentForPage();
      } else {
        console.log('⚠️ Nenhuma página encontrada em nenhuma integração');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
    } finally {
      this.isLoading = false;
    }

    // Carregar dados adicionais se necessário
    this.loadConnectedPages();
  }

  async loadAvailableIntegrations() {
    try {
      const dbIntegrations = await this.socialMediaService['databaseService'].getIntegrations();
      // Carregar TODAS as integrações ativas, não apenas Facebook
      this.availableIntegrations = dbIntegrations.filter((integration: any) =>
        integration.status === 'active'
      );
      console.log('🔗 Todas as integrações ativas carregadas:', this.availableIntegrations.length);

      // Log das integrações encontradas
      this.availableIntegrations.forEach((integration: any) => {
        console.log(`📊 Integração: ${integration.name} (${integration.type})`);
      });

      // Se não há integrações, resetar estado
      if (this.availableIntegrations.length === 0) {
        this.selectedPage = null;
      }
    } catch (error) {
      console.error('❌ Erro ao carregar integrações:', error);
      this.availableIntegrations = [];
    }
  }

  async loadAllPagesFromAllIntegrations() {
    this.isLoadingPages = true;
    this.availablePages = [];

    try {
      console.log('📱 Carregando páginas de todas as integrações...');

      // Buscar todas as páginas no banco de dados
      const dbPages = await this.socialMediaService['databaseService'].getSocialMediaPages();

      // Filtrar páginas que pertencem às integrações ativas
      const integrationIds = this.availableIntegrations.map(integration => integration.id);
      this.availablePages = dbPages.filter((page: SocialMediaPageDB) =>
        integrationIds.includes(page.integrationId)
      );

      console.log('✅ Total de páginas encontradas de todas as integrações:', this.availablePages.length);

      // Log das páginas por integração
      this.availableIntegrations.forEach((integration: any) => {
        const pagesForIntegration = this.availablePages.filter(page => page.integrationId === integration.id);
        console.log(`📄 Integração ${integration.name}: ${pagesForIntegration.length} páginas`);
      });

      // Se não há páginas no banco, tentar carregar da API para todas as integrações
      if (this.availablePages.length === 0) {
        console.log('🔄 Nenhuma página no banco, tentando carregar das APIs...');

        for (const integration of this.availableIntegrations) {
          console.log(`🔄 Carregando páginas da API para ${integration.name}...`);
          await this.loadPagesForSpecificIntegration(integration);
        }

        // Recarregar após criar as páginas
        const updatedPages = await this.socialMediaService['databaseService'].getSocialMediaPages();
        this.availablePages = updatedPages.filter((page: SocialMediaPageDB) =>
          integrationIds.includes(page.integrationId)
        );
        console.log('✅ Total de páginas após carregamento das APIs:', this.availablePages.length);
      }

    } catch (error) {
      console.error('❌ Erro ao carregar páginas de todas as integrações:', error);
    } finally {
      this.isLoadingPages = false;
    }
  }

  async loadPagesForSpecificIntegration(integration: any) {
    try {
      console.log(`🔄 Carregando páginas para integração específica: ${integration.name} (${integration.type})`);

      // Diferentes tipos de integração podem ter diferentes formas de carregar páginas
      switch (integration.type) {
        case 'facebook':
          await this.loadRealDataFromIntegration(integration);
          break;
        case 'instagram':
          // Para Instagram puro (não via Facebook)
          console.log('📸 Carregando dados do Instagram...');
          // Implementar se necessário
          break;
        case 'linkedin':
          console.log('💼 Carregando dados do LinkedIn...');
          // Implementar se necessário
          break;
        case 'google':
          console.log('🌐 Carregando dados do Google My Business...');
          // Implementar se necessário
          break;
        default:
          console.log(`⚠️ Tipo de integração não suportado: ${integration.type}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao carregar páginas para ${integration.name}:`, error);
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

    // Filter posts by selected page if available
    const filter = { ...this.currentFilter };
    if (this.selectedPage) {
      // Use the internal page ID (with prefix) to match saved posts
      filter.pageId = this.selectedPage.id;
      filter.platform = this.selectedPage.platform;
      console.log('🔍 Filtrando posts por página:', this.selectedPage.id, 'plataforma:', this.selectedPage.platform);
    }

    this.socialMediaService.getPosts(filter).subscribe({
      next: (posts) => {
        console.log('📊 Posts recebidos no componente:', posts.length, posts);
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

    // Filter campaigns by selected page if available
    const filter = { ...this.currentFilter };
    if (this.selectedPage) {
      // Use the internal page ID (with prefix) to match saved campaigns
      filter.pageId = this.selectedPage.id;
      filter.platform = this.selectedPage.platform;
      console.log('🔍 Filtrando campanhas por página:', this.selectedPage.id, 'plataforma:', this.selectedPage.platform);
    }

    this.socialMediaService.getCampaigns(filter).subscribe({
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

  async refreshData() {
    console.log('🔄 Atualizando dados da tela Redes Sociais...');
    await this.loadData();
  }

  // New step-based flow methods
  onStepChange(event: any) {
    const newStep = event.detail.value;
    this.currentStep = newStep;

    if (newStep === 'pages' && this.selectedIntegration) {
      this.loadPagesForIntegration();
    }
  }

  // Método removido - não é mais necessário pois não há seleção de integração na UI

  async loadPagesForIntegration() {
    if (!this.selectedIntegration) return;

    this.isLoadingPages = true;
    this.availablePages = [];

    try {
      console.log('📱 Carregando páginas para integração:', this.selectedIntegration.name, 'tipo:', this.selectedIntegration.type);

      // Buscar páginas no banco de dados
      const dbPages = await this.socialMediaService['databaseService'].getSocialMediaPages();
      this.availablePages = dbPages.filter((page: SocialMediaPageDB) =>
        page.integrationId === this.selectedIntegration.id
      );

      console.log('✅ Páginas encontradas no banco:', this.availablePages.length);

      // Se não há páginas no banco, tentar carregar da API baseado no tipo
      if (this.availablePages.length === 0) {
        console.log('🔄 Tentando carregar páginas da API para tipo:', this.selectedIntegration.type);

        // Diferentes tipos de integração podem ter diferentes formas de carregar páginas
        switch (this.selectedIntegration.type) {
          case 'facebook':
            await this.loadRealDataFromIntegration(this.selectedIntegration);
            break;
          case 'instagram':
            await this.loadInstagramOnlyData(this.selectedIntegration);
            break;
          case 'linkedin':
            await this.loadLinkedInData(this.selectedIntegration);
            break;
          case 'google':
            await this.loadGoogleMyBusinessData(this.selectedIntegration);
            break;
          default:
            console.log('⚠️ Tipo de integração não suportado para carregamento de páginas:', this.selectedIntegration.type);
        }

        // Recarregar após tentar criar as páginas
        const updatedPages = await this.socialMediaService['databaseService'].getSocialMediaPages();
        this.availablePages = updatedPages.filter((page: SocialMediaPageDB) =>
          page.integrationId === this.selectedIntegration.id
        );
        console.log('✅ Páginas após carregamento da API:', this.availablePages.length);
      }

    } catch (error) {
      console.error('❌ Erro ao carregar páginas:', error);
    } finally {
      this.isLoadingPages = false;
    }
  }

  selectPage(page: SocialMediaPageDB) {
    this.selectedPage = page;
    console.log('📄 Página selecionada:', page.pageName, 'da integração:', page.integrationId);

    // Encontrar a integração correspondente à página
    this.selectedIntegration = this.availableIntegrations.find(
      integration => integration.id === page.integrationId
    );

    // Carregar dados automaticamente ao selecionar a página
    this.loadContentForPage();
  }

  goToNextStep(step: 'pages' | 'content') {
    if (step === 'pages' && this.selectedIntegration) {
      this.currentStep = 'pages';
      this.loadPagesForIntegration();
    } else if (step === 'content' && this.selectedPage) {
      this.currentStep = 'content';
      this.loadContentForPage();
    }
  }

  goToPreviousStep(step: 'integrations' | 'pages') {
    this.currentStep = step;
    if (step === 'integrations') {
      this.selectedIntegration = null;
      this.selectedPage = null;
      this.availablePages = [];
    } else if (step === 'pages') {
      this.selectedPage = null;
    }
  }

  onContentTypeChange(event: any) {
    this.contentType = event.detail.value;
    console.log('🔄 Mudando tipo de conteúdo para:', this.contentType);
    // Não precisa recarregar, os dados já estão disponíveis
  }

  async loadContentForPage() {
    if (!this.selectedPage) return;

    console.log('📊 Carregando conteúdo para página:', this.selectedPage.pageName, 'tipo de conteúdo:', this.contentType);

    // First try to load real data from Facebook API
    await this.loadRealContentFromFacebook();

    // Then load the processed data
    this.loadStats();

    // Sempre carregar posts E campanhas para garantir que ambos estejam disponíveis
    this.loadPosts();
    this.loadCampaigns();
  }

  openPostDetail(post: SocialMediaPost) {
    // Navigate to post detail or show modal
    console.log('Opening post detail:', post);
  }

  openCampaignDetail(campaign: SocialMediaCampaign) {
    // Navigate to campaign detail or show modal
    console.log('Opening campaign detail:', campaign);
  }

  // Helper methods for integration and platform display
  getIntegrationIcon(type: string, integrationName?: string): string {
    // Se for a integração teste "Redes Sociais Teste", usar ícone de redes sociais
    if (integrationName === 'Redes Sociais Teste' || this.selectedIntegration?.name === 'Redes Sociais Teste') {
      return 'share-social-outline';
    }

    const icons: { [key: string]: string } = {
      facebook: 'logo-facebook',
      instagram: 'logo-instagram',
      linkedin: 'logo-linkedin',
      google: 'logo-google'
    };
    return icons[type] || 'link-outline';
  }

  getIntegrationColor(type: string): string {
    const colors: { [key: string]: string } = {
      facebook: 'primary',
      instagram: 'secondary',
      linkedin: 'tertiary',
      google: 'success'
    };
    return colors[type] || 'medium';
  }

  getIntegrationDescription(type: string): string {
    const descriptions: { [key: string]: string } = {
      facebook: 'Facebook Pages e Instagram Business',
      instagram: 'Instagram Business Account',
      linkedin: 'LinkedIn Company Pages',
      google: 'Google My Business'
    };
    return descriptions[type] || 'Integração de redes sociais';
  }

  getPlatformColor(platform: string): string {
    const colors: { [key: string]: string } = {
      facebook: 'primary',
      instagram: 'secondary',
      linkedin: 'tertiary',
      twitter: 'dark'
    };
    return colors[platform] || 'medium';
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
      console.log('⚠️ Nenhuma integração disponível');
      return;
    }

    if (this.availableIntegrations.length === 1) {
      // Se só há uma integração, usar diretamente
      this.selectedIntegration = this.availableIntegrations[0];
      await this.loadRealDataFromIntegration(this.selectedIntegration);
      return;
    }

    // Se há múltiplas integrações, usar a primeira automaticamente
    this.selectedIntegration = this.availableIntegrations[0];
    await this.loadRealDataFromIntegration(this.selectedIntegration);
  }

  async loadRealDataFromIntegration(integration: any) {
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

      console.log('✅ Dados reais carregados com sucesso!');

    } catch (error: any) {
      console.error('❌ Erro ao carregar dados reais:', error);
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

  async loadRealContentFromFacebook() {
    if (!this.selectedPage || !this.selectedIntegration) return;

    try {
      console.log('🚀 Carregando posts reais da página:', this.selectedPage.pageName);

      const config = this.selectedIntegration.configuration || this.selectedIntegration.config;
      const accessToken = config?.accessToken;
      const pageId = this.selectedPage.pageId;

      if (!accessToken) {
        throw new Error('Token de acesso não encontrado na integração');
      }

      // Carregar posts do Facebook
      if (this.selectedPage.platform === 'facebook') {
        await this.loadFacebookPosts(accessToken, pageId, this.selectedIntegration.id);
      }

      // Carregar posts do Instagram
      if (this.selectedPage.platform === 'instagram') {
        await this.loadInstagramPosts(accessToken, pageId, this.selectedIntegration.id);
      }

      console.log('✅ Posts reais carregados com sucesso!');

    } catch (error: any) {
      console.error('❌ Erro ao carregar posts reais:', error);
    }
  }

  async loadFacebookPosts(accessToken: string, pageId: string, integrationId: string) {
    try {
      console.log('📱 Carregando posts do Facebook...');

      // Buscar posts da página Facebook
      const response = await fetch(`https://graph.facebook.com/v18.0/${pageId}/posts?fields=id,message,created_time,story,link,picture,full_picture,attachments,insights.metric(post_impressions,post_engaged_users,post_reactions_like_total,post_reactions_love_total,post_reactions_wow_total,post_reactions_haha_total,post_reactions_sorry_total,post_reactions_anger_total,post_clicks,post_shares)&limit=25&access_token=${accessToken}`);

      const data = await response.json();

      if (data.error) {
        throw new Error(`Facebook API Error: ${data.error.message}`);
      }

      console.log('📊 Posts recebidos do Facebook:', data.data?.length || 0);

      // Processar e salvar posts no banco
      if (data.data) {
        for (const post of data.data) {
          await this.processFacebookPost(post, pageId, integrationId);
        }
      }

    } catch (error) {
      console.error('❌ Erro ao carregar posts Facebook:', error);
      throw error;
    }
  }

  async loadInstagramPosts(accessToken: string, instagramAccountId: string, integrationId: string) {
    try {
      console.log('📸 Carregando posts do Instagram...');

      // Buscar media do Instagram
      const response = await fetch(`https://graph.facebook.com/v18.0/${instagramAccountId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,insights.metric(impressions,reach,likes,comments,shares,saved)&limit=25&access_token=${accessToken}`);

      const data = await response.json();

      if (data.error) {
        throw new Error(`Instagram API Error: ${data.error.message}`);
      }

      console.log('📊 Posts recebidos do Instagram:', data.data?.length || 0);

      // Processar e salvar posts no banco
      if (data.data) {
        for (const media of data.data) {
          await this.processInstagramPost(media, instagramAccountId, integrationId);
        }
      }

    } catch (error) {
      console.error('❌ Erro ao carregar posts Instagram:', error);
      throw error;
    }
  }

  async processFacebookPost(post: any, pageId: string, integrationId: string) {
    try {
      // Extrair métricas do post
      const insights = post.insights?.data || [];
      const impressions = this.getInsightValue(insights, 'post_impressions');
      const engagedUsers = this.getInsightValue(insights, 'post_engaged_users');
      const likes = this.getInsightValue(insights, 'post_reactions_like_total');
      const loves = this.getInsightValue(insights, 'post_reactions_love_total');
      const wows = this.getInsightValue(insights, 'post_reactions_wow_total');
      const hahas = this.getInsightValue(insights, 'post_reactions_haha_total');
      const sorrys = this.getInsightValue(insights, 'post_reactions_sorry_total');
      const angers = this.getInsightValue(insights, 'post_reactions_anger_total');
      const clicks = this.getInsightValue(insights, 'post_clicks');
      const shares = this.getInsightValue(insights, 'post_shares');

      const totalReactions = likes + loves + wows + hahas + sorrys + angers;

      // Criar objeto de post para o banco
      const postData = {
        id: `fb_post_${post.id}`,
        pageId: `page_facebook_${pageId}`,
        platform: 'facebook' as const,
        postId: post.id,
        type: 'post' as const,
        content: post.message || post.story || '',
        mediaUrls: post.full_picture ? [post.full_picture] : [],
        hashtags: this.extractHashtags(post.message || ''),
        likes: likes,
        comments: 0, // Facebook não fornece comments facilmente nas insights básicas
        shares: shares,
        reactions: totalReactions,
        reach: engagedUsers,
        impressions: impressions,
        engagement: impressions > 0 ? (engagedUsers / impressions) * 100 : 0,
        clicks: clicks,
        saves: 0,
        publishedAt: new Date(post.created_time),
        isActive: true
      };

      // Salvar ou atualizar no banco
      await this.socialMediaService['databaseService'].upsertSocialMediaPost(postData);
      console.log('✅ Post Facebook salvo:', post.id);

    } catch (error) {
      console.error('❌ Erro ao processar post Facebook:', error);
    }
  }

  async processInstagramPost(media: any, instagramAccountId: string, integrationId: string) {
    try {
      // Extrair métricas do post
      const insights = media.insights?.data || [];
      const impressions = this.getInsightValue(insights, 'impressions');
      const reach = this.getInsightValue(insights, 'reach');
      const likes = this.getInsightValue(insights, 'likes');
      const comments = this.getInsightValue(insights, 'comments');
      const shares = this.getInsightValue(insights, 'shares');
      const saved = this.getInsightValue(insights, 'saved');

      // Determinar tipo de mídia
      let postType: 'post' | 'reel' | 'story' = 'post';
      if (media.media_type === 'VIDEO') {
        postType = 'reel'; // Assumindo que vídeos são reels
      }

      // Criar objeto de post para o banco
      const postData = {
        id: `ig_post_${media.id}`,
        pageId: `page_instagram_${instagramAccountId}`,
        platform: 'instagram' as const,
        postId: media.id,
        type: postType,
        content: media.caption || '',
        mediaUrls: media.media_url ? [media.media_url] : [],
        hashtags: this.extractHashtags(media.caption || ''),
        likes: likes,
        comments: comments,
        shares: shares,
        reactions: likes, // Instagram só tem likes como reação principal
        reach: reach,
        impressions: impressions,
        engagement: impressions > 0 ? ((likes + comments + shares) / impressions) * 100 : 0,
        clicks: 0, // Instagram não fornece clicks nas insights básicas
        saves: saved,
        publishedAt: new Date(media.timestamp),
        isActive: true
      };

      // Salvar ou atualizar no banco
      await this.socialMediaService['databaseService'].upsertSocialMediaPost(postData);
      console.log('✅ Post Instagram salvo:', media.id);

    } catch (error) {
      console.error('❌ Erro ao processar post Instagram:', error);
    }
  }

  private getInsightValue(insights: any[], metricName: string): number {
    const insight = insights.find(i => i.name === metricName);
    return insight?.values?.[0]?.value || 0;
  }

  private extractHashtags(text: string): string[] {
    const hashtagRegex = /#\w+/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.toLowerCase()) : [];
  }

  // Real stats calculation methods
  getTotalPosts(): number {
    return this.filteredPosts.filter(post => post.type === 'post').length;
  }

  getTotalReels(): number {
    return this.filteredPosts.filter(post => post.type === 'reel').length;
  }

  getTotalCampaigns(): number {
    return this.campaigns.length;
  }

  getTotalReach(): number {
    return this.filteredPosts.reduce((total, post) => total + (post.metrics?.reach || 0), 0);
  }

  // Methods for template that were missing
  getIntegrationTypeName(type: string): string {
    const names: { [key: string]: string } = {
      facebook: 'Facebook',
      instagram: 'Instagram',
      linkedin: 'LinkedIn',
      google: 'Google My Business'
    };
    return names[type] || type;
  }

  getPostTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      post: 'image-outline',
      reel: 'videocam-outline',
      story: 'play-circle-outline',
      video: 'videocam-outline'
    };
    return icons[type] || 'document-outline';
  }

  getPostTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      post: 'Post',
      reel: 'Reel',
      story: 'Story',
      video: 'Vídeo'
    };
    return labels[type] || type;
  }

  // Helper methods for post data extraction
  getPostMediaUrl(post: SocialMediaPost): string {
    if (post.content?.media && post.content.media.length > 0) {
      return post.content.media[0].url;
    }
    return post.thumbnail || 'https://via.placeholder.com/400x400/f0f0f0/999999?text=No+Image';
  }

  getPostCaption(post: SocialMediaPost): string {
    return post.content?.text || '';
  }

  // Helper methods for campaign data extraction
  getCampaignObjective(campaign: SocialMediaCampaign): string {
    const objectives: { [key: string]: string } = {
      lead_generation: 'Geração de Leads',
      traffic: 'Tráfego',
      awareness: 'Reconhecimento',
      conversions: 'Conversões',
      engagement: 'Engajamento'
    };
    return objectives[campaign.type] || campaign.type;
  }

  // Navigation method for creating integration
  createIntegration() {
    console.log('🔗 Navegando para criar nova integração...');
    this.router.navigate(['/integrations']);
  }

  // Track by function for performance
  trackByIntegrationId(index: number, integration: any): any {
    return integration.id;
  }

  trackByPageId(index: number, page: any): any {
    return page.id;
  }

  trackByPostId(index: number, post: any): any {
    return post.id;
  }

  // Missing integration loading methods
  async loadInstagramOnlyData(integration: any) {
    try {
      console.log('📸 Carregando dados específicos do Instagram para:', integration.name);

      const config = integration.configuration || integration.config;
      const accessToken = config?.accessToken;
      const instagramAccountId = config?.instagramAccountId;

      if (!accessToken || !instagramAccountId) {
        console.log('⚠️ Token de acesso ou ID da conta Instagram não encontrado');
        return;
      }

      await this.loadInstagramPageInfo(accessToken, instagramAccountId, integration.id);
      console.log('✅ Dados do Instagram carregados com sucesso');

    } catch (error) {
      console.error('❌ Erro ao carregar dados do Instagram:', error);
    }
  }

  async loadLinkedInData(integration: any) {
    try {
      console.log('💼 Carregando dados do LinkedIn para:', integration.name);

      // Implementação futura para LinkedIn
      // Por enquanto, apenas log de placeholder
      console.log('⚠️ Carregamento de dados do LinkedIn ainda não implementado');

    } catch (error) {
      console.error('❌ Erro ao carregar dados do LinkedIn:', error);
    }
  }

  async loadGoogleMyBusinessData(integration: any) {
    try {
      console.log('🌐 Carregando dados do Google My Business para:', integration.name);

      // Implementação futura para Google My Business
      // Por enquanto, apenas log de placeholder
      console.log('⚠️ Carregamento de dados do Google My Business ainda não implementado');

    } catch (error) {
      console.error('❌ Erro ao carregar dados do Google My Business:', error);
    }
  }
}