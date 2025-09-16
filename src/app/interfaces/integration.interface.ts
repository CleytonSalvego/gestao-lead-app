export interface IntegrationProvider {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  color: string;
  category: 'social-media' | 'advertising' | 'crm' | 'analytics' | 'email' | 'other';
  fields: IntegrationField[];
  capabilities: IntegrationCapability[];
  documentation?: string;
  webhookSupport: boolean;
  authType: 'oauth2' | 'api-key' | 'basic' | 'custom';
  testEndpoint?: string;
}

export interface IntegrationField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'select' | 'number' | 'boolean' | 'textarea';
  required: boolean;
  placeholder?: string;
  description?: string;
  validation?: IntegrationFieldValidation;
  options?: Array<{ value: string; label: string }>;
  dependsOn?: string; // Field dependency
  showWhen?: { field: string; value: any }; // Conditional visibility
  group?: string; // Group fields together
}

export interface IntegrationFieldValidation {
  pattern?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  custom?: (value: any) => boolean | string;
}

export interface IntegrationCapability {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  endpoints?: string[];
  permissions?: string[];
}

export interface IntegrationConfiguration {
  id: string;
  providerId: string;
  name: string;
  status: 'active' | 'inactive' | 'error' | 'testing' | 'pending';
  config: { [key: string]: any };
  capabilities: string[]; // enabled capability IDs
  createdAt: Date;
  updatedAt: Date;
  lastTested?: Date;
  testResults?: IntegrationTestResult;
  metadata?: { [key: string]: any };
}

export interface IntegrationTestResult {
  success: boolean;
  timestamp: Date;
  responseTime: number;
  statusCode?: number;
  error?: string;
  details?: { [key: string]: any };
}

export interface WebhookConfiguration {
  id: string;
  integrationId: string;
  name: string;
  endpoint: string;
  events: string[];
  secret?: string;
  active: boolean;
  headers?: { [key: string]: string };
  retryPolicy?: {
    maxRetries: number;
    retryDelay: number;
  };
  // Additional properties for UI
  status: 'active' | 'inactive' | 'error';
  lastTriggered?: Date;
  totalTriggers: number;
  successRate: number;
}

// Specific provider interfaces
export interface FacebookIntegrationConfig {
  appId: string;
  appSecret: string;
  accessToken: string;
  businessManagerId?: string;
  adAccountId?: string;
  pageId?: string;
  instagramAccountId?: string;
  permissions: string[];
  environment: 'sandbox' | 'production';
}

export interface GoogleAdsIntegrationConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  customerId: string;
  developerToken: string;
  loginCustomerId?: string;
}

export interface IntegrationStats {
  totalIntegrations: number;
  activeIntegrations: number;
  totalCalls: number;
  todayCalls: number;
  avgResponseTime: number;
  errorRate: number;
  successRate: number;
  // Backward compatibility
  totalAPIs: number;
  activeAPIs: number;
  totalWebhooks: number;
  activeWebhooks: number;
}

export interface APICall {
  id: string;
  integrationId: string;
  method: string;
  endpoint: string;
  timestamp: Date;
  responseTime: number;
  statusCode: number;
  success: boolean;
  error?: string;
  requestData?: any;
  responseData?: any;
}

export interface WebhookLog {
  id: string;
  webhookId: string;
  event: string;
  timestamp: Date;
  statusCode: number;
  success: boolean;
  attempts: number;
  error?: string;
  payload?: any;
}