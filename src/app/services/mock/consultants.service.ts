import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Consultant } from '../../interfaces/consultant.interface';

@Injectable({
  providedIn: 'root'
})
export class ConsultantsService {
  private consultantsSubject = new BehaviorSubject<Consultant[]>([]);
  public consultants$ = this.consultantsSubject.asObservable();

  private mockConsultants: Consultant[] = [
    {
      id: '1',
      name: 'João Silva',
      email: 'joao.silva@portoseguro.com.br',
      phone: '(11) 99999-1111',
      avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      isActive: true,
      specialties: ['Auto', 'Residencial'],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-03-10'),
      region: 'São Paulo - Capital',
      managerName: 'Carlos Mendes',
      kpis: {
        leadsAttended: 45,
        conversions: 12,
        conversionRate: 26.7,
        averageTicket: 2800,
        totalSales: 33600,
        monthlyGoal: 40000,
        goalProgress: 84,
        averageResponseTime: 25,
        customerSatisfaction: 4.5,
        activeLeads: 18,
        closedDeals: 12
      }
    },
    {
      id: '2',
      name: 'Maria Fernanda',
      email: 'maria.fernanda@portoseguro.com.br',
      phone: '(11) 98888-2222',
      avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      isActive: true,
      specialties: ['Vida', 'Saúde'],
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-03-12'),
      region: 'São Paulo - ABC',
      managerName: 'Ana Paula',
      kpis: {
        leadsAttended: 38,
        conversions: 15,
        conversionRate: 39.5,
        averageTicket: 3200,
        totalSales: 48000,
        monthlyGoal: 45000,
        goalProgress: 106.7,
        averageResponseTime: 18,
        customerSatisfaction: 4.8,
        activeLeads: 15,
        closedDeals: 15
      }
    },
    {
      id: '3',
      name: 'Pedro Santos',
      email: 'pedro.santos@portoseguro.com.br',
      phone: '(11) 97777-3333',
      avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      isActive: true,
      specialties: ['Auto', 'Vida', 'Residencial'],
      createdAt: new Date('2023-11-10'),
      updatedAt: new Date('2024-03-11'),
      region: 'Rio de Janeiro',
      managerName: 'Roberto Silva',
      kpis: {
        leadsAttended: 52,
        conversions: 18,
        conversionRate: 34.6,
        averageTicket: 2600,
        totalSales: 46800,
        monthlyGoal: 50000,
        goalProgress: 93.6,
        averageResponseTime: 30,
        customerSatisfaction: 4.3,
        activeLeads: 22,
        closedDeals: 18
      }
    },
    {
      id: '4',
      name: 'Ana Carolina',
      email: 'ana.carolina@portoseguro.com.br',
      phone: '(11) 96666-4444',
      avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      isActive: false,
      specialties: ['Saúde'],
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-03-01'),
      region: 'Belo Horizonte',
      managerName: 'Luciana Costa',
      kpis: {
        leadsAttended: 28,
        conversions: 8,
        conversionRate: 28.6,
        averageTicket: 2400,
        totalSales: 19200,
        monthlyGoal: 35000,
        goalProgress: 54.9,
        averageResponseTime: 45,
        customerSatisfaction: 4.1,
        activeLeads: 8,
        closedDeals: 8
      }
    },
    {
      id: '5',
      name: 'Ricardo Oliveira',
      email: 'ricardo.oliveira@portoseguro.com.br',
      phone: '(11) 95555-5555',
      avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg',
      isActive: true,
      specialties: ['Auto', 'Residencial', 'Vida'],
      createdAt: new Date('2023-09-05'),
      updatedAt: new Date('2024-03-13'),
      region: 'Porto Alegre',
      managerName: 'Marcos Pereira',
      kpis: {
        leadsAttended: 61,
        conversions: 22,
        conversionRate: 36.1,
        averageTicket: 3100,
        totalSales: 68200,
        monthlyGoal: 60000,
        goalProgress: 113.7,
        averageResponseTime: 20,
        customerSatisfaction: 4.7,
        activeLeads: 26,
        closedDeals: 22
      }
    }
  ];

  constructor() {
    this.consultantsSubject.next(this.mockConsultants);
  }

  getConsultants(): Observable<Consultant[]> {
    return of(this.mockConsultants).pipe(delay(500));
  }

  getConsultantById(id: string): Observable<Consultant | undefined> {
    return of(this.mockConsultants.find(consultant => consultant.id === id)).pipe(delay(300));
  }

  getActiveConsultants(): Observable<Consultant[]> {
    return of(this.mockConsultants.filter(consultant => consultant.isActive)).pipe(delay(300));
  }

  getConsultantsByRegion(region: string): Observable<Consultant[]> {
    return of(this.mockConsultants.filter(consultant => consultant.region === region)).pipe(delay(300));
  }

  createConsultant(consultantData: Omit<Consultant, 'id' | 'createdAt' | 'updatedAt' | 'kpis'>): Observable<Consultant> {
    return of(null).pipe(
      delay(1000),
      map(() => {
        const newConsultant: Consultant = {
          ...consultantData,
          id: (this.mockConsultants.length + 1).toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
          kpis: {
            leadsAttended: 0,
            conversions: 0,
            conversionRate: 0,
            averageTicket: 0,
            totalSales: 0,
            monthlyGoal: 30000,
            goalProgress: 0,
            averageResponseTime: 0,
            customerSatisfaction: 0,
            activeLeads: 0,
            closedDeals: 0
          }
        };

        this.mockConsultants.push(newConsultant);
        this.consultantsSubject.next([...this.mockConsultants]);
        
        return newConsultant;
      })
    );
  }

  updateConsultant(id: string, consultantData: Partial<Consultant>): Observable<Consultant> {
    return of(null).pipe(
      delay(800),
      map(() => {
        const consultantIndex = this.mockConsultants.findIndex(consultant => consultant.id === id);
        if (consultantIndex === -1) {
          throw new Error('Consultor não encontrado');
        }

        this.mockConsultants[consultantIndex] = {
          ...this.mockConsultants[consultantIndex],
          ...consultantData,
          updatedAt: new Date()
        };

        this.consultantsSubject.next([...this.mockConsultants]);
        return this.mockConsultants[consultantIndex];
      })
    );
  }

  toggleConsultantStatus(id: string): Observable<Consultant> {
    return of(null).pipe(
      delay(500),
      map(() => {
        const consultantIndex = this.mockConsultants.findIndex(consultant => consultant.id === id);
        if (consultantIndex === -1) {
          throw new Error('Consultor não encontrado');
        }

        this.mockConsultants[consultantIndex].isActive = !this.mockConsultants[consultantIndex].isActive;
        this.mockConsultants[consultantIndex].updatedAt = new Date();

        this.consultantsSubject.next([...this.mockConsultants]);
        return this.mockConsultants[consultantIndex];
      })
    );
  }

  getTeamMetrics(): Observable<any> {
    return of(null).pipe(
      delay(600),
      map(() => {
        const activeConsultants = this.mockConsultants.filter(c => c.isActive);
        const totalLeadsAttended = activeConsultants.reduce((sum, c) => sum + c.kpis.leadsAttended, 0);
        const totalConversions = activeConsultants.reduce((sum, c) => sum + c.kpis.conversions, 0);
        const totalSales = activeConsultants.reduce((sum, c) => sum + c.kpis.totalSales, 0);
        const totalGoals = activeConsultants.reduce((sum, c) => sum + c.kpis.monthlyGoal, 0);

        return {
          totalConsultants: activeConsultants.length,
          totalLeadsAttended,
          totalConversions,
          teamConversionRate: totalLeadsAttended > 0 ? (totalConversions / totalLeadsAttended) * 100 : 0,
          totalSales,
          totalGoals,
          teamGoalProgress: totalGoals > 0 ? (totalSales / totalGoals) * 100 : 0,
          averageCustomerSatisfaction: activeConsultants.reduce((sum, c) => sum + c.kpis.customerSatisfaction, 0) / activeConsultants.length
        };
      })
    );
  }

  getTopPerformers(limit: number = 3): Observable<Consultant[]> {
    return of(null).pipe(
      delay(400),
      map(() => {
        return this.mockConsultants
          .filter(c => c.isActive)
          .sort((a, b) => b.kpis.goalProgress - a.kpis.goalProgress)
          .slice(0, limit);
      })
    );
  }
}