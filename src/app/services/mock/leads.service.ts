import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { 
  Lead, 
  LeadStatus, 
  LeadClassification, 
  LeadPriority, 
  ContactHistory, 
  LeadMetrics 
} from '../../interfaces/lead.interface';

@Injectable({
  providedIn: 'root'
})
export class LeadsService {
  private leadsSubject = new BehaviorSubject<Lead[]>([]);
  public leads$ = this.leadsSubject.asObservable();

  private mockLeads: Lead[] = [
    {
      id: '1',
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      phone: '(11) 99999-1234',
      cpf: '123.456.789-01',
      product: 'Auto',
      status: LeadStatus.ANALYSIS,
      score: 85,
      source: 'Google Ads',
      lastContact: new Date('2024-03-10'),
      createdAt: new Date('2024-03-08'),
      updatedAt: new Date('2024-03-10'),
      consultantId: '2',
      notes: ['Cliente interessado em seguro auto', 'Possui veículo 0km'],
      contactHistory: [
        {
          id: '1',
          leadId: '1',
          type: 'call',
          description: 'Primeira ligação de contato',
          outcome: 'Interessado, agendar retorno',
          createdAt: new Date('2024-03-09'),
          consultantId: '2',
          duration: 15
        }
      ],
      classification: LeadClassification.HOT,
      priority: LeadPriority.HIGH
    },
    {
      id: '2',
      name: 'João Oliveira',
      email: 'joao.oliveira@email.com',
      phone: '(11) 98888-5678',
      cpf: '987.654.321-09',
      product: 'Residencial',
      status: LeadStatus.CLASSIFICATION,
      score: 72,
      source: 'Facebook Ads',
      lastContact: new Date('2024-03-09'),
      createdAt: new Date('2024-03-07'),
      updatedAt: new Date('2024-03-09'),
      consultantId: '2',
      notes: ['Interessado em seguro residencial', 'Casa própria'],
      contactHistory: [],
      classification: LeadClassification.WARM,
      priority: LeadPriority.MEDIUM
    },
    {
      id: '3',
      name: 'Ana Costa',
      email: 'ana.costa@email.com',
      phone: '(11) 97777-9012',
      cpf: '456.789.123-45',
      product: 'Vida',
      status: LeadStatus.INFORMATION,
      score: 91,
      source: 'Site Porto Seguro',
      lastContact: new Date('2024-03-11'),
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date('2024-03-11'),
      consultantId: '2',
      notes: ['Lead qualificado', 'Renda compatível'],
      contactHistory: [
        {
          id: '2',
          leadId: '3',
          type: 'ai_chat',
          description: 'Atendimento inicial via IA',
          outcome: 'Qualificado para consultor humano',
          createdAt: new Date('2024-03-10'),
          duration: 8
        }
      ],
      classification: LeadClassification.HOT,
      priority: LeadPriority.HIGH
    },
    {
      id: '4',
      name: 'Carlos Silva',
      email: 'carlos.silva@email.com',
      phone: '(11) 96666-3456',
      cpf: '789.123.456-78',
      product: 'Saúde',
      status: LeadStatus.INITIAL_SALE,
      score: 68,
      source: 'Indicação',
      lastContact: new Date('2024-03-12'),
      createdAt: new Date('2024-03-05'),
      updatedAt: new Date('2024-03-12'),
      consultantId: '2',
      notes: ['Família de 4 pessoas', 'Orçamento limitado'],
      contactHistory: [
        {
          id: '3',
          leadId: '4',
          type: 'whatsapp',
          description: 'Envio de proposta via WhatsApp',
          outcome: 'Proposta enviada',
          createdAt: new Date('2024-03-11'),
          consultantId: '2'
        }
      ],
      classification: LeadClassification.WARM,
      priority: LeadPriority.MEDIUM
    },
    {
      id: '5',
      name: 'Fernanda Lima',
      email: 'fernanda.lima@email.com',
      phone: '(11) 95555-7890',
      cpf: '321.654.987-12',
      product: 'Auto',
      status: LeadStatus.COMPLETED,
      score: 95,
      source: 'Landing Page',
      lastContact: new Date('2024-03-13'),
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-13'),
      consultantId: '2',
      notes: ['Venda concluída', 'Cliente satisfeito'],
      contactHistory: [
        {
          id: '4',
          leadId: '5',
          type: 'meeting',
          description: 'Reunião presencial para assinatura',
          outcome: 'Contrato assinado',
          createdAt: new Date('2024-03-13'),
          consultantId: '2',
          duration: 60
        }
      ],
      classification: LeadClassification.HOT,
      priority: LeadPriority.HIGH
    }
  ];

  constructor() {
    this.leadsSubject.next(this.mockLeads);
  }

  getLeads(): Observable<Lead[]> {
    return of(this.mockLeads).pipe(delay(500));
  }

  getLeadById(id: string): Observable<Lead | undefined> {
    return of(this.mockLeads.find(lead => lead.id === id)).pipe(delay(300));
  }

  getLeadsByStatus(status: LeadStatus): Observable<Lead[]> {
    return of(this.mockLeads.filter(lead => lead.status === status)).pipe(delay(300));
  }

  getLeadsByConsultant(consultantId: string): Observable<Lead[]> {
    return of(this.mockLeads.filter(lead => lead.consultantId === consultantId)).pipe(delay(300));
  }

  updateLeadStatus(leadId: string, status: LeadStatus): Observable<Lead> {
    return of(null).pipe(
      delay(500),
      map(() => {
        const leadIndex = this.mockLeads.findIndex(lead => lead.id === leadId);
        if (leadIndex === -1) {
          throw new Error('Lead não encontrado');
        }

        this.mockLeads[leadIndex].status = status;
        this.mockLeads[leadIndex].updatedAt = new Date();
        
        this.leadsSubject.next([...this.mockLeads]);
        return this.mockLeads[leadIndex];
      })
    );
  }

  addContactHistory(leadId: string, contact: Omit<ContactHistory, 'id' | 'leadId' | 'createdAt'>): Observable<Lead> {
    return of(null).pipe(
      delay(300),
      map(() => {
        const leadIndex = this.mockLeads.findIndex(lead => lead.id === leadId);
        if (leadIndex === -1) {
          throw new Error('Lead não encontrado');
        }

        const newContact: ContactHistory = {
          ...contact,
          id: Date.now().toString(),
          leadId,
          createdAt: new Date()
        };

        this.mockLeads[leadIndex].contactHistory.push(newContact);
        this.mockLeads[leadIndex].lastContact = new Date();
        this.mockLeads[leadIndex].updatedAt = new Date();
        
        this.leadsSubject.next([...this.mockLeads]);
        return this.mockLeads[leadIndex];
      })
    );
  }

  createLead(lead: Lead): Observable<Lead> {
    return of(null).pipe(
      delay(500),
      map(() => {
        const newLead = {
          ...lead,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
          consultantId: '1',
          contactHistory: [],
          classification: LeadClassification.WARM,
          priority: LeadPriority.MEDIUM,
          source: 'Kanban'
        };

        this.mockLeads.unshift(newLead);
        this.leadsSubject.next([...this.mockLeads]);
        return newLead;
      })
    );
  }


  generatePaymentLink(leadId: string): Observable<string> {
    return of(`https://pagamento.portoseguro.com.br/lead/${leadId}/${Date.now()}`).pipe(delay(1000));
  }

  getMetrics(): Observable<LeadMetrics> {
    return of(null).pipe(
      delay(800),
      map(() => {
        const totalLeads = this.mockLeads.length;
        const today = new Date();
        const todayLeads = this.mockLeads.filter(lead => 
          lead.createdAt.toDateString() === today.toDateString()
        ).length;

        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthLeads = this.mockLeads.filter(lead => 
          lead.createdAt >= monthStart
        ).length;

        const conversions = this.mockLeads.filter(lead => 
          lead.status === LeadStatus.COMPLETED
        ).length;

        const conversionRate = totalLeads > 0 ? (conversions / totalLeads) * 100 : 0;

        const productCounts = this.mockLeads.reduce((acc, lead) => {
          acc[lead.product] = (acc[lead.product] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const productDistribution = Object.entries(productCounts).map(([product, count]) => ({
          product,
          count,
          percentage: (count / totalLeads) * 100
        }));

        const aiContacts = this.mockLeads.reduce((acc, lead) => 
          acc + lead.contactHistory.filter(c => c.type === 'ai_chat').length, 0
        );

        const humanContacts = this.mockLeads.reduce((acc, lead) => 
          acc + lead.contactHistory.filter(c => c.type !== 'ai_chat').length, 0
        );

        const totalContacts = aiContacts + humanContacts;

        return {
          totalLeads,
          todayLeads,
          monthLeads,
          conversions,
          conversionRate,
          averageTicket: 2500,
          contactRate: 85,
          productDistribution,
          aiVsHumanContacts: [
            {
              type: 'ai',
              count: aiContacts,
              percentage: totalContacts > 0 ? (aiContacts / totalContacts) * 100 : 0
            },
            {
              type: 'human',
              count: humanContacts,
              percentage: totalContacts > 0 ? (humanContacts / totalContacts) * 100 : 0
            }
          ]
        };
      })
    );
  }

  getKanbanData(): Observable<{ [key: string]: Lead[] }> {
    return of(null).pipe(
      delay(500),
      map(() => {
        const kanbanData: { [key: string]: Lead[] } = {};
        
        Object.values(LeadStatus).forEach(status => {
          kanbanData[status] = this.mockLeads.filter(lead => lead.status === status);
        });

        return kanbanData;
      })
    );
  }
}