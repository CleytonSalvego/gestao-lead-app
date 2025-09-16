import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { 
  Ticket, 
  TicketStatus, 
  TicketPriority, 
  TicketCategory,
  SLA,
  KnowledgeArticle,
  FAQ,
  SupportMetrics,
  TicketCommunication 
} from '../../interfaces/support.interface';

@Injectable({
  providedIn: 'root'
})
export class SupportService {
  private apiUrl = '/api/support';
  private ticketsSubject = new BehaviorSubject<Ticket[]>([]);
  private knowledgeArticlesSubject = new BehaviorSubject<KnowledgeArticle[]>([]);
  private faqsSubject = new BehaviorSubject<FAQ[]>([]);
  private metricsSubject = new BehaviorSubject<SupportMetrics | null>(null);

  tickets$ = this.ticketsSubject.asObservable();
  knowledgeArticles$ = this.knowledgeArticlesSubject.asObservable();
  faqs$ = this.faqsSubject.asObservable();
  metrics$ = this.metricsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadMockData();
  }

  // Ticket Management
  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/tickets`)
      .pipe(catchError(this.handleError));
  }

  getTicketById(id: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/tickets/${id}`)
      .pipe(catchError(this.handleError));
  }

  createTicket(ticket: Partial<Ticket>): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.apiUrl}/tickets`, ticket)
      .pipe(
        map(newTicket => {
          const currentTickets = this.ticketsSubject.value;
          this.ticketsSubject.next([newTicket, ...currentTickets]);
          this.updateMetrics();
          return newTicket;
        }),
        catchError(this.handleError)
      );
  }

  updateTicket(id: string, updates: Partial<Ticket>): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/tickets/${id}`, updates)
      .pipe(
        map(updatedTicket => {
          const currentTickets = this.ticketsSubject.value;
          const index = currentTickets.findIndex(t => t.id === id);
          if (index !== -1) {
            currentTickets[index] = updatedTicket;
            this.ticketsSubject.next([...currentTickets]);
          }
          this.updateMetrics();
          return updatedTicket;
        }),
        catchError(this.handleError)
      );
  }

  deleteTicket(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tickets/${id}`)
      .pipe(
        map(() => {
          const currentTickets = this.ticketsSubject.value;
          const filteredTickets = currentTickets.filter(t => t.id !== id);
          this.ticketsSubject.next(filteredTickets);
          this.updateMetrics();
        }),
        catchError(this.handleError)
      );
  }

  assignTicket(ticketId: string, assigneeId: string): Observable<Ticket> {
    return this.updateTicket(ticketId, { assignedTo: assigneeId });
  }

  changeTicketStatus(ticketId: string, status: TicketStatus): Observable<Ticket> {
    return this.updateTicket(ticketId, { 
      status,
      updatedAt: new Date()
    });
  }

  addCommunication(ticketId: string, communication: Partial<TicketCommunication>): Observable<Ticket> {
    const ticket = this.ticketsSubject.value.find(t => t.id === ticketId);
    if (ticket) {
      const newCommunication: TicketCommunication = {
        id: Date.now().toString(),
        ticketId,
        authorId: communication.authorId!,
        authorName: communication.authorName!,
        authorType: communication.authorType!,
        content: communication.content!,
        isPublic: communication.isPublic || true,
        attachments: communication.attachments || [],
        createdAt: new Date()
      };
      
      const updatedCommunications = [...ticket.communications, newCommunication];
      return this.updateTicket(ticketId, { 
        communications: updatedCommunications,
        updatedAt: new Date()
      });
    }
    return throwError('Ticket not found');
  }

  // Knowledge Base Management
  getKnowledgeArticles(): Observable<KnowledgeArticle[]> {
    return this.http.get<KnowledgeArticle[]>(`${this.apiUrl}/knowledge-base`)
      .pipe(catchError(this.handleError));
  }

  getKnowledgeArticleById(id: string): Observable<KnowledgeArticle> {
    return this.http.get<KnowledgeArticle>(`${this.apiUrl}/knowledge-base/${id}`)
      .pipe(catchError(this.handleError));
  }

  createKnowledgeArticle(article: Partial<KnowledgeArticle>): Observable<KnowledgeArticle> {
    return this.http.post<KnowledgeArticle>(`${this.apiUrl}/knowledge-base`, article)
      .pipe(
        map(newArticle => {
          const currentArticles = this.knowledgeArticlesSubject.value;
          this.knowledgeArticlesSubject.next([newArticle, ...currentArticles]);
          return newArticle;
        }),
        catchError(this.handleError)
      );
  }

  updateKnowledgeArticle(id: string, updates: Partial<KnowledgeArticle>): Observable<KnowledgeArticle> {
    return this.http.put<KnowledgeArticle>(`${this.apiUrl}/knowledge-base/${id}`, updates)
      .pipe(
        map(updatedArticle => {
          const currentArticles = this.knowledgeArticlesSubject.value;
          const index = currentArticles.findIndex(a => a.id === id);
          if (index !== -1) {
            currentArticles[index] = updatedArticle;
            this.knowledgeArticlesSubject.next([...currentArticles]);
          }
          return updatedArticle;
        }),
        catchError(this.handleError)
      );
  }

  searchKnowledgeBase(query: string): Observable<KnowledgeArticle[]> {
    return this.http.get<KnowledgeArticle[]>(`${this.apiUrl}/knowledge-base/search`, {
      params: { q: query }
    }).pipe(catchError(this.handleError));
  }

  // FAQ Management
  getFAQs(): Observable<FAQ[]> {
    return this.http.get<FAQ[]>(`${this.apiUrl}/faqs`)
      .pipe(catchError(this.handleError));
  }

  createFAQ(faq: Partial<FAQ>): Observable<FAQ> {
    return this.http.post<FAQ>(`${this.apiUrl}/faqs`, faq)
      .pipe(
        map(newFAQ => {
          const currentFAQs = this.faqsSubject.value;
          this.faqsSubject.next([newFAQ, ...currentFAQs]);
          return newFAQ;
        }),
        catchError(this.handleError)
      );
  }

  // SLA Management
  checkSLAViolations(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/sla/violations`)
      .pipe(catchError(this.handleError));
  }

  calculateSLATimeRemaining(ticket: Ticket): number {
    const now = new Date();
    const deadline = new Date(ticket.createdAt.getTime() + (ticket.sla.responseTime * 60 * 60 * 1000));
    return Math.max(0, deadline.getTime() - now.getTime());
  }

  // Metrics and Reporting
  getMetrics(): Observable<SupportMetrics> {
    return this.http.get<SupportMetrics>(`${this.apiUrl}/metrics`)
      .pipe(catchError(this.handleError));
  }

  private updateMetrics(): void {
    const tickets = this.ticketsSubject.value;
    const totalTickets = tickets.length;
    const openTickets = tickets.filter(t => t.status === 'open').length;
    const closedTickets = tickets.filter(t => t.status === 'closed').length;
    
    const responseTimes = tickets
      .filter(t => t.communications.length > 0)
      .map(t => {
        const firstResponse = t.communications.find(c => c.isPublic);
        if (firstResponse) {
          return (firstResponse.createdAt.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60);
        }
        return 0;
      });

    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;

    const slaViolations = tickets.filter(t => {
      const timeRemaining = this.calculateSLATimeRemaining(t);
      return timeRemaining <= 0 && t.status !== 'closed';
    }).length;

    const metrics: SupportMetrics = {
      period: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      },
      tickets: {
        total: totalTickets,
        open: openTickets,
        resolved: tickets.filter(t => t.status === 'resolved').length,
        closed: closedTickets,
        byCategory: tickets.reduce((acc, ticket) => {
          acc[ticket.category] = (acc[ticket.category] || 0) + 1;
          return acc;
        }, {} as Record<TicketCategory, number>),
        byPriority: {
          low: tickets.filter(t => t.priority === 'low').length,
          medium: tickets.filter(t => t.priority === 'medium').length,
          high: tickets.filter(t => t.priority === 'high').length,
          urgent: tickets.filter(t => t.priority === 'urgent').length,
          critical: tickets.filter(t => t.priority === 'critical').length
        }
      },
      sla: {
        responseTime: {
          average: avgResponseTime,
          breached: slaViolations,
          percentage: ((totalTickets - slaViolations) / totalTickets) * 100 || 100
        },
        resolutionTime: {
          average: avgResponseTime * 2,
          breached: slaViolations,
          percentage: ((totalTickets - slaViolations) / totalTickets) * 100 || 100
        }
      },
      customerSatisfaction: {
        average: 4.2,
        responses: totalTickets,
        distribution: { 5: 60, 4: 25, 3: 10, 2: 3, 1: 2 }
      },
      agents: {
        totalAgents: 5,
        activeAgents: 4,
        avgTicketsPerAgent: totalTickets / 4,
        topPerformers: []
      }
    };

    this.metricsSubject.next(metrics);
  }

  private loadMockData(): void {
    const mockTickets: Ticket[] = [
      {
        id: '1',
        title: 'Problema com login na plataforma',
        description: 'Usuário não consegue fazer login após reset de senha',
        category: 'technical',
        priority: 'high',
        status: 'open',
        type: 'incident',
        requesterId: 'customer-1',
        requesterName: 'João Silva',
        requesterEmail: 'joao@email.com',
        assignedTo: 'agent-1',
        assignedToName: 'Ana Santos',
        tags: ['login', 'senha'],
        sla: {
          responseTime: 4 * 60,
          resolutionTime: 24 * 60,
          responseDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000),
          resolutionDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
          isResponseBreached: false,
          isResolutionBreached: false
        },
        communications: [],
        attachments: [],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: '2',
        title: 'Dúvida sobre cobertura de apólice',
        description: 'Cliente quer entender melhor a cobertura do seu seguro auto',
        category: 'product',
        priority: 'medium',
        status: 'in_progress',
        type: 'question',
        requesterId: 'customer-2',
        requesterName: 'Maria Oliveira',
        requesterEmail: 'maria@email.com',
        assignedTo: 'agent-2',
        assignedToName: 'Carlos Lima',
        tags: ['cobertura', 'seguro-auto'],
        sla: {
          responseTime: 8 * 60,
          resolutionTime: 48 * 60,
          responseDeadline: new Date(Date.now() + 8 * 60 * 60 * 1000),
          resolutionDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
          isResponseBreached: false,
          isResolutionBreached: false
        },
        communications: [],
        attachments: [],
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ];

    const mockArticles: KnowledgeArticle[] = [
      {
        id: '1',
        title: 'Como redefinir senha do sistema',
        content: 'Passo a passo para redefinir a senha...',
        summary: 'Guia rápido para redefinir senhas',
        category: 'technical',
        tags: ['senha', 'login', 'acesso'],
        authorId: 'admin',
        authorName: 'Administrador',
        status: 'published',
        visibility: 'public',
        views: 156,
        likes: 45,
        helpful: 23,
        notHelpful: 2,
        relatedArticles: [],
        attachments: [],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    const mockFAQs: FAQ[] = [
      {
        id: '1',
        question: 'Como posso alterar meus dados pessoais?',
        answer: 'Acesse Configurações > Perfil e clique em Editar.',
        category: 'account',
        tags: ['perfil', 'dados', 'configurações'],
        isPublic: true,
        views: 89,
        helpful: 12,
        notHelpful: 1,
        createdBy: 'admin',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ];

    this.ticketsSubject.next(mockTickets);
    this.knowledgeArticlesSubject.next(mockArticles);
    this.faqsSubject.next(mockFAQs);
    this.updateMetrics();
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Support Service Error:', error);
    return throwError(error);
  }
}