import { Component, OnInit } from '@angular/core';
import { KanbanService, KanbanItem, KanbanColumn } from './kanban.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-kanban-board',
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.scss']
})
export class KanbanBoardComponent implements OnInit {
  columns$: Observable<KanbanColumn[]> = new Observable<KanbanColumn[]>();
  loading = false;

  constructor(private kanbanService: KanbanService) {}

  ngOnInit() {
    this.loading = true;
    this.columns$ = this.kanbanService.getColumns();
    this.columns$.subscribe(() => this.loading = false);
  }

  moveItem(item: KanbanItem, toColumn: string | undefined) {
    if (!toColumn) return;
    this.kanbanService.moveItem(item.id, toColumn).subscribe();
  }

  getNextStatus(current: string): string | undefined {
    const order = ['scheduled', 'in_progress', 'published', 'finished'];
    const idx = order.indexOf(current);
    return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : undefined;
  }


  editItem(item: KanbanItem) {
    // Abrir modal de edição (implementar)
  }

  viewMetrics(item: KanbanItem) {
    // Abrir modal de métricas (implementar)
  }

}
