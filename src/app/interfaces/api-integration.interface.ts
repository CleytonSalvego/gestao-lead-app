export type APIType = 'REST' | 'GRAPHQL' | 'SOAP' | 'WEBHOOK' | 'WEBSOCKET';
export type APIMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type WebhookEvent = 'lead.created' | 'lead.updated' | 'lead.converted' | 'policy.created' | 'payment.received' | 'commission.calculated';

export interface APIIntegration {
  id: string;
  name: string;
  type: APIType;
  status: 'active' | 'inactive' | 'error';
  config: APIConfig;
  lastCall: Date;
  totalCalls: number;
  successRate: number;
  createdAt: Date;
}

export interface APIConfig {
  endpoint: string;
  method?: APIMethod;
  headers: Record<string, string>;
  authentication: AuthConfig;
  timeout: number;
  retryAttempts: number;
  enableLogs: boolean;
  rateLimit?: RateLimit;
}

export interface AuthConfig {
  type: 'none' | 'basic' | 'bearer' | 'apikey' | 'oauth2';
  username?: string;
  password?: string;
  token?: string;
  apiKey?: string;
  apiKeyHeader?: string;
  clientId?: string;
  clientSecret?: string;
  scope?: string;
}

export interface RateLimit {
  maxRequests: number;
  windowMs: number;
}

export interface WebhookIntegration {
  id: string;
  name: string;
  endpoint: string;
  events: WebhookEvent[];
  status: 'active' | 'inactive' | 'error';
  secret: string;
  lastTriggered?: Date;
  totalTriggers: number;
  successRate: number;
  retryAttempts: number;
  timeout: number;
  createdAt: Date;
}

export interface APICallLog {
  id: string;
  integrationId: string;
  method: string;
  endpoint: string;
  statusCode: number;
  responseTime: number;
  success: boolean;
  error?: string;
  timestamp: Date;
}

export interface WebhookLog {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: any;
  statusCode: number;
  responseTime: number;
  success: boolean;
  error?: string;
  attempts: number;
  timestamp: Date;
}

export interface IntegrationStats {
  totalAPIs: number;
  activeAPIs: number;
  totalWebhooks: number;
  activeWebhooks: number;
  todayCalls: number;
  avgResponseTime: number;
  errorRate: number;
}