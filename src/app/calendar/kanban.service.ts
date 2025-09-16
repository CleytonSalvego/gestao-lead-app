import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface KanbanItem {
  id: string;
  title: string;
  platform: string;
  date: string;
  status: string;
}

export interface KanbanColumn {
  title: string;
  status: string;
  next?: string;
  items: KanbanItem[];
}

@Injectable({ providedIn: 'root' })
export class KanbanService {
  private columnsSubject = new BehaviorSubject<KanbanColumn[]>([]);
  private apiUrl = '/api/kanban'; // Ajuste conforme backend

  constructor(private http: HttpClient) {}

  getColumns(): Observable<KanbanColumn[]> {
    // MOCK: Dados de exemplo para Kanban de campanhas/posts
    const mockItems: any[] = [
      { id: '1', title: 'Promoção de Verão', platform: 'instagram', date: '2025-09-10 10:00', status: 'scheduled' },
      { id: '2', title: 'Lançamento Produto X', platform: 'facebook', date: '2025-09-11 14:00', status: 'scheduled' },
      { id: '3', title: 'Google Ads - Black Friday', platform: 'google', date: '2025-09-12 09:00', status: 'in_progress' },
      { id: '4', title: 'Post Engajamento', platform: 'instagram', date: '2025-09-13 18:00', status: 'in_progress' },
      { id: '5', title: 'Campanha Stories', platform: 'facebook', date: '2025-09-14 12:00', status: 'published' },
      { id: '6', title: 'Google Ads - Natal', platform: 'google', date: '2025-09-15 08:00', status: 'published' },
      { id: '7', title: 'Post Finalizado', platform: 'instagram', date: '2025-09-16 20:00', status: 'finished' },
      { id: '8', title: 'Campanha Encerrada', platform: 'facebook', date: '2025-09-17 16:00', status: 'finished' }
    ];
    const statuses = [
      { title: 'Agendado', status: 'scheduled' },
      { title: 'Em andamento', status: 'in_progress' },
      { title: 'Publicado', status: 'published' },
      { title: 'Finalizado', status: 'finished' }
    ];
    const columns = statuses.map(col => ({
      ...col,
      items: mockItems.filter(i => i.status === col.status)
    }));
    this.columnsSubject.next(columns);
    return this.columnsSubject.asObservable();
  }

  moveItem(itemId: string, toStatus: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/move`, { itemId, toStatus });
  }

  private groupByStatus(items: KanbanItem[]): KanbanColumn[] {
    const statuses = [
      { title: 'Agendado', status: 'scheduled', next: 'in_progress' },
      { title: 'Em andamento', status: 'in_progress', next: 'published' },
      { title: 'Publicado', status: 'published', next: 'finished' },
      { title: 'Finalizado', status: 'finished' }
    ];
    return statuses.map(col => ({
      ...col,
      items: items.filter(i => i.status === col.status)
    }));
  }
}
// Serviço com chamadas HTTP e gerenciamento de estado reativo.
