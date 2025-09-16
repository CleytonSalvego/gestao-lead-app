import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(
    private socialMediaService: SocialMediaService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loadStats();
    this.loadPosts();
    this.loadCampaigns();
    this.loadConnectedPages();
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
    this.socialMediaService.getConnectedPages().subscribe({
      next: (pages) => {
        this.connectedPages = pages;
      },
      error: (error) => {
        console.error('Error loading connected pages:', error);
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
}