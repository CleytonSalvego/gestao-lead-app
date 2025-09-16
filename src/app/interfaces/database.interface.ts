export interface DatabaseIntegration {
  id: string;
  name: string;
  type: 'facebook' | 'instagram' | 'google_ads' | 'meta_ads' | 'tiktok_ads' | 'linkedin_ads' | 'webhook' | 'api';
  status: 'active' | 'inactive' | 'error' | 'pending' | 'testing';
  configuration: IntegrationConfiguration;
  createdAt: Date;
  updatedAt: Date;
  lastSync?: Date;
  metadata?: Record<string, any>;
}

export interface IntegrationConfiguration {
  // API/Webhook Configuration
  apiKey?: string;
  secretKey?: string;
  accessToken?: string;
  refreshToken?: string;
  webhookUrl?: string;

  // Social Media Configuration
  pageId?: string;
  pageName?: string;
  platformUserId?: string;
  permissions?: string[];

  // Additional settings
  isActive: boolean;
  autoSync: boolean;
  syncInterval?: number; // in minutes

  // Connection settings
  baseUrl?: string;
  version?: string;
  scopes?: string[];
}

export interface SocialMediaPageDB {
  id: string;
  integrationId: string; // Foreign key to DatabaseIntegration
  platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter';
  pageId: string;
  pageName: string;
  username?: string;
  profilePicture?: string;
  isConnected: boolean;
  isVerified: boolean;
  followers?: number;
  posts?: number;
  engagement?: number;
  lastActivity?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialMediaPostDB {
  id: string;
  pageId: string; // Foreign key to SocialMediaPageDB
  platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter';
  postId: string;
  type: 'post' | 'reel' | 'story' | 'campaign';
  content: string;
  mediaUrls?: string[];
  hashtags?: string[];

  // Metrics
  likes: number;
  comments: number;
  shares: number;
  reactions: number;
  reach: number;
  impressions: number;
  engagement: number;
  clicks?: number;
  saves?: number;

  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface SocialMediaCampaignDB {
  id: string;
  integrationId: string; // Foreign key to DatabaseIntegration
  platform: 'facebook' | 'instagram' | 'google_ads' | 'meta_ads' | 'tiktok_ads' | 'linkedin_ads';
  campaignId: string;
  name: string;
  objective: string;
  status: 'active' | 'paused' | 'completed' | 'draft';

  // Budget
  budgetTotal: number;
  budgetSpent: number;
  budgetCurrency: string;

  // Dates
  startDate: Date;
  endDate?: Date;

  // Metrics
  impressions: number;
  clicks: number;
  reach: number;
  conversions: number;
  cost: number;
  cpm: number; // Cost per mille
  cpc: number; // Cost per click
  ctr: number; // Click-through rate

  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Database schema definitions for SQLite
export interface DatabaseSchema {
  integrations: string;
  social_media_pages: string;
  social_media_posts: string;
  social_media_campaigns: string;
}

export interface DatabaseConfig {
  name: string;
  version: number;
  encrypted: boolean;
  mode: 'full' | 'partial';
}