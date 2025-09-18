import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject, from } from 'rxjs';
import { delay, map, switchMap } from 'rxjs/operators';
import {
  SocialMediaPost,
  SocialMediaCampaign,
  SocialMediaPage,
  SocialMediaStats,
  SocialMediaFilter
} from '../../interfaces/social-media.interface';
import { DatabaseService } from '../database/database.service';
import {
  SocialMediaPageDB,
  SocialMediaPostDB,
  SocialMediaCampaignDB
} from '../../interfaces/database.interface';

@Injectable({
  providedIn: 'root'
})
export class SocialMediaService {
  private postsSubject = new BehaviorSubject<SocialMediaPost[]>([]);
  private campaignsSubject = new BehaviorSubject<SocialMediaCampaign[]>([]);
  private pagesSubject = new BehaviorSubject<SocialMediaPage[]>([]);

  constructor(private databaseService: DatabaseService) {
    this.loadRealData();
  }

  // Posts
  getPosts(filter?: SocialMediaFilter): Observable<SocialMediaPost[]> {
    return this.databaseService.isInitialized$.pipe(
      switchMap(initialized => {
        if (!initialized) {
          return of([]);
        }
        return from(this.loadPostsFromDatabase(filter));
      })
    );
  }

  getPostById(id: string): Observable<SocialMediaPost | undefined> {
    return this.postsSubject.asObservable().pipe(
      map(posts => posts.find(post => post.id === id)),
      delay(300)
    );
  }

  // Campaigns
  getCampaigns(filter?: SocialMediaFilter): Observable<SocialMediaCampaign[]> {
    return this.databaseService.isInitialized$.pipe(
      switchMap(initialized => {
        if (!initialized) {
          return of([]);
        }
        return from(this.loadCampaignsFromDatabase(filter));
      })
    );
  }

  getCampaignById(id: string): Observable<SocialMediaCampaign | undefined> {
    return this.campaignsSubject.asObservable().pipe(
      map(campaigns => campaigns.find(campaign => campaign.id === id)),
      delay(300)
    );
  }

  // Pages
  getPages(): Observable<SocialMediaPage[]> {
    return this.databaseService.isInitialized$.pipe(
      switchMap(initialized => {
        if (!initialized) {
          return of([]);
        }
        return this.loadPagesFromDatabase();
      })
    );
  }

  getConnectedPages(): Observable<SocialMediaPage[]> {
    return this.databaseService.isInitialized$.pipe(
      switchMap(initialized => {
        if (!initialized) {
          return of([]);
        }
        return this.loadConnectedPagesFromDatabase();
      })
    );
  }

  // Stats
  getStats(): Observable<SocialMediaStats> {
    return this.databaseService.isInitialized$.pipe(
      switchMap(async (initialized) => {
        if (!initialized) {
          return this.getEmptyStats();
        }

        const posts = await this.getPostsFromDatabase();
        const campaigns = await this.getCampaignsFromDatabase();

        if (posts.length === 0) {
          return this.getEmptyStats();
        }

        const stats: SocialMediaStats = {
          totalPosts: posts.filter(p => p.type === 'post').length,
          totalReels: posts.filter(p => p.type === 'reel').length,
          totalCampaigns: campaigns.length,
          totalReach: posts.reduce((sum, post) => sum + post.metrics.reach, 0),
          totalEngagement: posts.reduce((sum, post) => sum + post.metrics.engagement, 0),
          totalImpressions: posts.reduce((sum, post) => sum + post.metrics.impressions, 0),
          averageEngagementRate: posts.length > 0 ?
            posts.reduce((sum, post) => sum + post.metrics.engagement, 0) / posts.length : 0,
          topPerformingPost: posts.length > 0 ? posts.sort((a, b) => b.metrics.engagement - a.metrics.engagement)[0] : null as any,
          platformBreakdown: this.calculatePlatformBreakdown(posts)
        };

        return stats;
      }),
      delay(300)
    );
  }

  private applyFilter(posts: SocialMediaPost[], filter?: SocialMediaFilter): SocialMediaPost[] {
    console.log('🔍 Aplicando filtro:', filter);
    console.log('📊 Posts antes do filtro:', posts.length, posts.map(p => ({ id: p.id, pageId: p.pageId, platform: p.platform })));

    if (!filter) return posts;

    let filtered = [...posts];

    if (filter.platform && filter.platform !== 'all') {
      filtered = filtered.filter(post => post.platform === filter.platform);
      console.log('📱 Filtro por plataforma:', filter.platform, 'posts restantes:', filtered.length);
    }

    if (filter.type && filter.type !== 'all') {
      filtered = filtered.filter(post => post.type === filter.type);
      console.log('🏷️ Filtro por tipo:', filter.type, 'posts restantes:', filtered.length);
    }

    if (filter.status && filter.status !== 'all') {
      filtered = filtered.filter(post => post.status === filter.status);
      console.log('📈 Filtro por status:', filter.status, 'posts restantes:', filtered.length);
    }

    if (filter.pageId) {
      console.log('🔍 Filtrando por pageId:', filter.pageId);
      filtered = filtered.filter(post => {
        console.log(`📄 Comparando: post.pageId="${post.pageId}" com filter.pageId="${filter.pageId}"`);
        return post.pageId === filter.pageId;
      });
      console.log('📄 Filtro por página:', filter.pageId, 'posts restantes:', filtered.length);
    }

    if (filter.dateRange) {
      filtered = filtered.filter(post => {
        const postDate = new Date(post.createdAt);
        return postDate >= filter.dateRange!.start && postDate <= filter.dateRange!.end;
      });
    }

    if (filter.sortBy) {
      filtered.sort((a, b) => {
        let aValue: number, bValue: number;

        switch (filter.sortBy) {
          case 'date':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          case 'engagement':
            aValue = a.metrics.engagement;
            bValue = b.metrics.engagement;
            break;
          case 'reach':
            aValue = a.metrics.reach;
            bValue = b.metrics.reach;
            break;
          case 'likes':
            aValue = a.metrics.likes;
            bValue = b.metrics.likes;
            break;
          default:
            return 0;
        }

        return filter.sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      });
    }

    console.log('✅ Posts finais após filtro:', filtered.length, filtered.map(p => ({ id: p.id, pageId: p.pageId, platform: p.platform })));
    return filtered;
  }

  private applyCampaignFilter(campaigns: SocialMediaCampaign[], filter?: SocialMediaFilter): SocialMediaCampaign[] {
    if (!filter) return campaigns;

    let filtered = [...campaigns];

    if (filter.platform && filter.platform !== 'all') {
      filtered = filtered.filter(campaign => campaign.platform === filter.platform);
    }

    if (filter.status && filter.status !== 'all') {
      filtered = filtered.filter(campaign => campaign.status === filter.status);
    }

    return filtered;
  }

  private calculatePlatformBreakdown(posts: SocialMediaPost[]) {
    const breakdown: { [platform: string]: { posts: number; reach: number; engagement: number } } = {};

    posts.forEach(post => {
      if (!breakdown[post.platform]) {
        breakdown[post.platform] = { posts: 0, reach: 0, engagement: 0 };
      }
      breakdown[post.platform].posts++;
      breakdown[post.platform].reach += post.metrics.reach;
      breakdown[post.platform].engagement += post.metrics.engagement;
    });

    return breakdown;
  }

  private loadRealData(): void {
    // Data will be loaded from database when requested
    console.log('Social Media Service initialized - data will be loaded from database');
  }

  private async loadPostsFromDatabase(filter?: SocialMediaFilter): Promise<SocialMediaPost[]> {
    try {
      console.log('📊 Carregando posts do banco de dados...');

      // Buscar posts no banco de dados (limitado a 3 mais recentes)
      const dbPosts = await this.databaseService.getSocialMediaPosts(undefined, 3);
      console.log('📊 Posts encontrados no banco:', dbPosts.length);

      // Se há posts no banco, usar eles
      if (dbPosts.length > 0) {
        const posts = this.convertDBPostsToInterface(dbPosts);
        const filteredPosts = this.applyFilter(posts, filter);

        // Limitar a 3 posts mais recentes após filtragem
        const recentPosts = filteredPosts
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);

        console.log('✅ Posts filtrados (limitados a 3 mais recentes):', recentPosts.length);
        this.postsSubject.next(recentPosts);
        return recentPosts;
      }

      // Se não há posts, retornar array vazio (não usar dados mock)
      console.log('ℹ️ Nenhum post encontrado no banco. Use a função "Carregar dados reais" para importar posts.');
      this.postsSubject.next([]);
      return [];
    } catch (error) {
      console.error('Error loading posts from database:', error);
      return [];
    }
  }

  private async loadPagesFromDatabase(): Promise<SocialMediaPage[]> {
    try {
      const dbPages = await this.databaseService.getSocialMediaPages();
      const pages = this.convertDBPagesToInterface(dbPages);
      this.pagesSubject.next(pages);
      return pages;
    } catch (error) {
      console.error('Error loading pages from database:', error);
      return [];
    }
  }

  private async loadConnectedPagesFromDatabase(): Promise<SocialMediaPage[]> {
    try {
      console.log('🔍 [SocialMedia] Carregando páginas conectadas do banco...');
      const dbPages = await this.databaseService.getSocialMediaPages();
      console.log('📊 [SocialMedia] Páginas do banco:', dbPages.length, dbPages);

      const allPages = this.convertDBPagesToInterface(dbPages);
      console.log('🔄 [SocialMedia] Páginas convertidas:', allPages.length, allPages);

      const connectedPages = allPages.filter(page => page.isConnected);
      console.log('✅ [SocialMedia] Páginas conectadas:', connectedPages.length, connectedPages);

      return connectedPages;
    } catch (error) {
      console.error('❌ [SocialMedia] Error loading connected pages from database:', error);
      return [];
    }
  }

  private async getPostsFromDatabase(): Promise<SocialMediaPost[]> {
    try {
      const dbPosts = await this.databaseService.getSocialMediaPosts();
      return this.convertDBPostsToInterface(dbPosts);
    } catch (error) {
      console.error('Error getting posts from database:', error);
      return [];
    }
  }

  private async loadCampaignsFromDatabase(filter?: SocialMediaFilter): Promise<SocialMediaCampaign[]> {
    try {
      console.log('📊 Carregando campanhas do banco de dados...');

      // Por enquanto, campanhas retornam vazio até implementarmos a API do Facebook Ads
      // TODO: Implementar carregamento de campanhas reais da API do Facebook Ads
      console.log('ℹ️ Carregamento de campanhas reais será implementado em breve.');

      const campaigns: SocialMediaCampaign[] = [];
      this.campaignsSubject.next(campaigns);
      return campaigns;
    } catch (error) {
      console.error('Error loading campaigns from database:', error);
      return [];
    }
  }

  private async getCampaignsFromDatabase(): Promise<SocialMediaCampaign[]> {
    // Método mantido para compatibilidade com getStats
    return this.generateMockCampaigns();
  }

  private convertDBPostsToInterface(dbPosts: SocialMediaPostDB[]): SocialMediaPost[] {
    return dbPosts.map(dbPost => ({
      id: dbPost.id,
      platform: dbPost.platform,
      type: dbPost.type,
      content: {
        text: dbPost.content || '',
        hashtags: dbPost.hashtags || [],
        media: dbPost.mediaUrls ? dbPost.mediaUrls.map((url, index) => ({
          id: `media_${dbPost.id}_${index}`,
          type: 'image', // Default to image, can be enhanced later
          url: url,
          thumbnailUrl: url
        })) : []
      },
      metrics: {
        likes: dbPost.likes,
        comments: dbPost.comments,
        shares: dbPost.shares,
        reach: dbPost.reach,
        impressions: dbPost.impressions,
        engagement: dbPost.engagement,
        clicks: dbPost.clicks,
        saves: dbPost.saves
      },
      status: 'published', // Assuming published since it's in DB
      createdAt: dbPost.createdAt,
      publishedAt: dbPost.publishedAt,
      author: {
        id: 'author_1',
        name: 'Social Media Page',
        avatar: ''
      },
      pageId: dbPost.pageId,
      pageName: 'Connected Page',
      url: `https://${dbPost.platform}.com/posts/${dbPost.postId}`,
      thumbnail: dbPost.mediaUrls?.[0] || ''
    }));
  }

  private convertDBPagesToInterface(dbPages: SocialMediaPageDB[]): SocialMediaPage[] {
    return dbPages.map(dbPage => ({
      id: dbPage.id,
      name: dbPage.pageName,
      platform: dbPage.platform,
      username: dbPage.username || '',
      profilePicture: dbPage.profilePicture || '',
      followers: dbPage.followers || 0,
      following: 0, // Not stored in DB yet
      verified: dbPage.isVerified,
      category: 'Business',
      bio: '',
      website: '',
      location: '',
      isConnected: dbPage.isConnected,
      integrationId: dbPage.integrationId,
      lastSync: dbPage.lastActivity || new Date(),
      metrics: {
        totalPosts: dbPage.posts || 0,
        avgEngagement: dbPage.engagement || 0,
        totalReach: 0, // Will be calculated from posts
        totalImpressions: 0, // Will be calculated from posts
        followerGrowth: 0 // Not tracked yet
      }
    }));
  }

  private getEmptyStats(): SocialMediaStats {
    return {
      totalPosts: 0,
      totalReels: 0,
      totalCampaigns: 0,
      totalReach: 0,
      totalEngagement: 0,
      totalImpressions: 0,
      averageEngagementRate: 0,
      topPerformingPost: null as any,
      platformBreakdown: {}
    };
  }

  private generateMockCampaigns(): SocialMediaCampaign[] {
    return [
      {
        id: 'campaign_1',
        name: 'Campanha Seguros Auto - Março 2024',
        platform: 'facebook',
        type: 'lead_generation',
        status: 'active',
        budget: {
          total: 5000,
          spent: 3200,
          currency: 'BRL',
          type: 'lifetime'
        },
        metrics: {
          impressions: 45000,
          clicks: 1200,
          reach: 38000,
          ctr: 2.67,
          cpm: 8.50,
          cpc: 2.67,
          conversions: 85,
          leads: 85,
          spent: 3200
        },
        targeting: {
          age: { min: 25, max: 55 },
          gender: 'all',
          location: ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte'],
          interests: ['Seguros', 'Automóveis', 'Proteção Familiar'],
          behaviors: ['Compradores de seguro online']
        },
        createdAt: new Date('2024-03-01'),
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-31'),
        posts: []
      },
      {
        id: 'campaign_2',
        name: 'Campanha Seguros Residenciais',
        platform: 'instagram',
        type: 'awareness',
        status: 'paused',
        budget: {
          total: 3000,
          spent: 1800,
          currency: 'BRL',
          type: 'lifetime'
        },
        metrics: {
          impressions: 28000,
          clicks: 680,
          reach: 22000,
          ctr: 2.43,
          cpm: 6.42,
          cpc: 2.65,
          conversions: 42,
          leads: 42,
          spent: 1800
        },
        targeting: {
          age: { min: 30, max: 65 },
          gender: 'all',
          location: ['São Paulo', 'Campinas', 'Santos'],
          interests: ['Casa própria', 'Segurança residencial', 'Proteção patrimonial'],
          behaviors: ['Proprietários de imóveis']
        },
        createdAt: new Date('2024-02-15'),
        startDate: new Date('2024-02-15'),
        endDate: new Date('2024-04-15'),
        posts: []
      }
    ];
  }
}