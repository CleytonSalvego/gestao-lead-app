import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
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
        return this.loadPostsFromDatabase(filter);
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
    return this.campaignsSubject.asObservable().pipe(
      map(campaigns => this.applyCampaignFilter(campaigns, filter)),
      delay(500)
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
    if (!filter) return posts;

    let filtered = [...posts];

    if (filter.platform && filter.platform !== 'all') {
      filtered = filtered.filter(post => post.platform === filter.platform);
    }

    if (filter.type && filter.type !== 'all') {
      filtered = filtered.filter(post => post.type === filter.type);
    }

    if (filter.status && filter.status !== 'all') {
      filtered = filtered.filter(post => post.status === filter.status);
    }

    if (filter.pageId) {
      filtered = filtered.filter(post => post.pageId === filter.pageId);
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
      const dbPosts = await this.databaseService.getSocialMediaPosts(undefined, 50);
      const posts = this.convertDBPostsToInterface(dbPosts);
      const filteredPosts = this.applyFilter(posts, filter);
      this.postsSubject.next(filteredPosts);
      return filteredPosts;
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
      const dbPages = await this.databaseService.getSocialMediaPages();
      const allPages = this.convertDBPagesToInterface(dbPages);
      const connectedPages = allPages.filter(page => page.isConnected);
      return connectedPages;
    } catch (error) {
      console.error('Error loading connected pages from database:', error);
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

  private async getCampaignsFromDatabase(): Promise<SocialMediaCampaign[]> {
    // For now, return empty array as campaigns will be implemented later
    // when we have real campaign data from integrations
    return [];
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
}