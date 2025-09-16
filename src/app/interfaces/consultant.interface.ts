export interface Consultant {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  isActive: boolean;
  specialties: string[];
  createdAt: Date;
  updatedAt: Date;
  kpis: ConsultantKPIs;
  region: string;
  managerName: string;
}

export interface ConsultantKPIs {
  leadsAttended: number;
  conversions: number;
  conversionRate: number;
  averageTicket: number;
  totalSales: number;
  monthlyGoal: number;
  goalProgress: number;
  averageResponseTime: number; // in minutes
  customerSatisfaction: number; // 1-5 rating
  activeLeads: number;
  closedDeals: number;
}