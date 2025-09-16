export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  newLeads: boolean;
  leadUpdates: boolean;
  reminders: boolean;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  CONSULTANT = 'consultant',
  VIEWER = 'viewer',
  META_ANALYST = 'meta_analyst'
}

export enum Permission {
  VIEW_DASHBOARD = 'view_dashboard',
  MANAGE_LEADS = 'manage_leads',
  MANAGE_CONSULTANTS = 'manage_consultants',
  VIEW_REPORTS = 'view_reports',
  MANAGE_SETTINGS = 'manage_settings',
  EXPORT_DATA = 'export_data',
  VIEW_INTEGRATIONS = 'view_integrations',
  VIEW_SOCIAL_MEDIA = 'view_social_media'
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: UserRole;
}