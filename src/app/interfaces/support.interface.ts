export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  type: TicketType;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  assignedTo?: string;
  assignedToName?: string;
  relatedEntityType?: 'lead' | 'policy' | 'claim' | 'user';
  relatedEntityId?: string;
  tags: string[];
  sla: SLA;
  communications: TicketCommunication[];
  attachments: TicketAttachment[];
  resolution?: TicketResolution;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
}

export type TicketCategory = 
  | 'technical' 
  | 'billing' 
  | 'product' 
  | 'integration' 
  | 'training' 
  | 'feature_request' 
  | 'bug_report'
  | 'other';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';

export type TicketStatus = 
  | 'open' 
  | 'in_progress' 
  | 'waiting_customer' 
  | 'waiting_approval' 
  | 'resolved' 
  | 'closed' 
  | 'cancelled';

export type TicketType = 'incident' | 'request' | 'question' | 'suggestion';

export interface SLA {
  responseTime: number; // minutes
  resolutionTime: number; // minutes
  responseDeadline: Date;
  resolutionDeadline: Date;
  isResponseBreached: boolean;
  isResolutionBreached: boolean;
}

export interface TicketCommunication {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorType: 'agent' | 'customer' | 'system';
  content: string;
  isPublic: boolean;
  attachments: TicketAttachment[];
  createdAt: Date;
}

export interface TicketAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface TicketResolution {
  solution: string;
  resolvedBy: string;
  resolvedByName: string;
  timeSpent: number; // minutes
  resolutionDate: Date;
  customerSatisfaction?: number; // 1-5 rating
  tags: string[];
}

// Knowledge Base
export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  tags: string[];
  authorId: string;
  authorName: string;
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'internal' | 'agents_only';
  views: number;
  likes: number;
  helpful: number;
  notHelpful: number;
  relatedArticles: string[];
  attachments: KnowledgeAttachment[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface KnowledgeAttachment {
  id: string;
  fileName: string;
  fileType: string;
  url: string;
  description?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  views: number;
  helpful: number;
  notHelpful: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Support Metrics
export interface SupportMetrics {
  period: {
    start: Date;
    end: Date;
  };
  tickets: {
    total: number;
    open: number;
    resolved: number;
    closed: number;
    byCategory: Record<TicketCategory, number>;
    byPriority: Record<TicketPriority, number>;
  };
  sla: {
    responseTime: {
      average: number;
      breached: number;
      percentage: number;
    };
    resolutionTime: {
      average: number;
      breached: number;
      percentage: number;
    };
  };
  customerSatisfaction: {
    average: number;
    responses: number;
    distribution: Record<number, number>; // rating -> count
  };
  agents: {
    totalAgents: number;
    activeAgents: number;
    avgTicketsPerAgent: number;
    topPerformers: AgentPerformance[];
  };
}

export interface AgentPerformance {
  agentId: string;
  agentName: string;
  ticketsResolved: number;
  avgResolutionTime: number;
  customerSatisfaction: number;
  slaCompliance: number;
}