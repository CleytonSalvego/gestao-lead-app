export interface SocialMediaPost {
  id: string;
  platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter';
  type: 'post' | 'reel' | 'story' | 'campaign';
  content: {
    text?: string;
    media?: SocialMediaAsset[];
    hashtags?: string[];
    mentions?: string[];
  };
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
    impressions: number;
    engagement: number;
    clicks?: number;
    saves?: number;
  };
  status: 'published' | 'scheduled' | 'draft' | 'archived';
  createdAt: Date;
  publishedAt?: Date;
  scheduledFor?: Date;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  pageId: string;
  pageName: string;
  url?: string;
  thumbnail?: string;
}

export interface SocialMediaAsset {
  id: string;
  type: 'image' | 'video' | 'carousel';
  url: string;
  thumbnailUrl?: string;
  duration?: number; // for videos in seconds
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface SocialMediaCampaign {
  id: string;
  name: string;
  platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter';
  type: 'lead_generation' | 'traffic' | 'awareness' | 'conversions' | 'engagement';
  status: 'active' | 'paused' | 'completed' | 'draft';
  budget: {
    total: number;
    spent: number;
    currency: string;
    type: 'daily' | 'lifetime';
  };
  metrics: {
    impressions: number;
    clicks: number;
    reach: number;
    ctr: number; // Click Through Rate
    cpm: number; // Cost Per Mille
    cpc: number; // Cost Per Click
    conversions: number;
    leads: number;
    spent: number;
  };
  targeting: {
    age?: { min: number; max: number };
    gender?: 'male' | 'female' | 'all';
    location?: string[];
    interests?: string[];
    behaviors?: string[];
  };
  createdAt: Date;
  startDate: Date;
  endDate?: Date;
  posts: SocialMediaPost[];
}

export interface SocialMediaPage {
  id: string;
  name: string;
  platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter';
  username: string;
  profilePicture?: string;
  followers: number;
  following: number;
  verified: boolean;
  category?: string;
  bio?: string;
  website?: string;
  location?: string;
  isConnected: boolean;
  integrationId: string;
  lastSync: Date;
  metrics: {
    totalPosts: number;
    avgEngagement: number;
    totalReach: number;
    totalImpressions: number;
    followerGrowth: number;
  };
}

export interface SocialMediaStats {
  totalPosts: number;
  totalReels: number;
  totalCampaigns: number;
  totalReach: number;
  totalEngagement: number;
  totalImpressions: number;
  averageEngagementRate: number;
  topPerformingPost: SocialMediaPost;
  platformBreakdown: {
    [platform: string]: {
      posts: number;
      reach: number;
      engagement: number;
    };
  };
}

export interface SocialMediaFilter {
  platform?: 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'all';
  type?: 'post' | 'reel' | 'story' | 'campaign' | 'all';
  status?: 'published' | 'scheduled' | 'draft' | 'archived' | 'active' | 'paused' | 'completed' | 'all';
  dateRange?: {
    start: Date;
    end: Date;
  };
  pageId?: string;
  sortBy?: 'date' | 'engagement' | 'reach' | 'likes';
  sortOrder?: 'asc' | 'desc';
}