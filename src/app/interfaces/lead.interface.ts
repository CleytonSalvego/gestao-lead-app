export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  product: string;
  status: LeadStatus;
  score: number;
  source: string;
  lastContact: Date;
  createdAt: Date;
  updatedAt: Date;
  consultantId?: string;
  notes: string[];
  contactHistory: ContactHistory[];
  classification: LeadClassification;
  priority: LeadPriority;
}

export interface ContactHistory {
  id: string;
  leadId: string;
  type: 'call' | 'email' | 'whatsapp' | 'meeting' | 'ai_chat';
  description: string;
  outcome: string;
  createdAt: Date;
  consultantId?: string;
  duration?: number;
}

export enum LeadStatus {
  ANALYSIS = 'analysis',
  CLASSIFICATION = 'classification',
  INFORMATION = 'information',
  INITIAL_SALE = 'initial_sale',
  SUPPORT_SALE = 'support_sale',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  PENDING = 'pending'
}

export enum LeadClassification {
  HOT = 'hot',
  WARM = 'warm', 
  COLD = 'cold'
}

export enum LeadPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export interface LeadMetrics {
  totalLeads: number;
  todayLeads: number;
  monthLeads: number;
  conversions: number;
  conversionRate: number;
  averageTicket: number;
  contactRate: number;
  productDistribution: ProductMetric[];
  aiVsHumanContacts: ContactMetric[];
}

export interface ProductMetric {
  product: string;
  count: number;
  percentage: number;
}

export interface ContactMetric {
  type: 'ai' | 'human';
  count: number;
  percentage: number;
}