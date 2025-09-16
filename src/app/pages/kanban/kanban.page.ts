import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { LeadsService } from '../../services/mock/leads.service';
import { Lead, LeadStatus, LeadClassification, LeadPriority } from '../../interfaces/lead.interface';

export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  position: number;
  status: string;
}

@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.page.html',
  styleUrls: ['./kanban.page.scss'],
})
export class KanbanPage implements OnInit {
  kanbanData: { [key: string]: Lead[] } = {};
  isLoading = true;
  selectedFilter = 'all';
  columns: KanbanColumn[] = [];
  showColumnManagement = false;
  draggedLead: Lead | null = null;

  constructor(
    private leadsService: LeadsService,
    private router: Router,
    private alertController: AlertController,
    private modalController: ModalController
  ) {
    this.initializeDefaultColumns();
  }

  ngOnInit() {
    this.loadKanbanData();
  }

  initializeDefaultColumns() {
    const savedColumns = localStorage.getItem('kanbanColumns');
    if (savedColumns) {
      this.columns = JSON.parse(savedColumns);
    } else {
      this.columns = [
        { id: '1', status: 'analysis', title: 'Análise de Lead', color: 'primary', position: 1 },
        { id: '2', status: 'classification', title: 'Classificação', color: 'secondary', position: 2 },
        { id: '3', status: 'information', title: 'Informações', color: 'tertiary', position: 3 },
        { id: '4', status: 'initial_sale', title: 'Venda Inicial', color: 'warning', position: 4 },
        { id: '5', status: 'support_sale', title: 'Venda Suporte', color: 'success', position: 5 }
      ];
      this.saveColumns();
    }
    this.columns.sort((a, b) => a.position - b.position);
  }

  saveColumns() {
    localStorage.setItem('kanbanColumns', JSON.stringify(this.columns));
  }

  loadKanbanData() {
    this.isLoading = true;
    this.leadsService.getKanbanData().subscribe({
      next: (data) => {
        this.kanbanData = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading kanban data:', error);
        this.isLoading = false;
      }
    });
  }

  getColumnLeads(status: string): Lead[] {
    return this.kanbanData[status] || [];
  }

  // Search functionality
  onSearchChange(event: any) {
    const searchTerm = event.target.value;
    console.log('Search term:', searchTerm);
    // Implement search logic here
  }

  // Lead actions
  async createNewLead() {
    const alert = await this.alertController.create({
      header: 'Novo Lead',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nome do lead',
          attributes: {
            required: true,
            maxlength: 100
          }
        },
        {
          name: 'email',
          type: 'email',
          placeholder: 'Email do lead'
        },
        {
          name: 'phone',
          type: 'tel',
          placeholder: 'Telefone do lead'
        },
        {
          name: 'product',
          type: 'text',
          placeholder: 'Produto (Auto, Vida, Residencial, Saúde)',
          value: 'Auto'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Criar Lead',
          handler: (data) => {
            if (data.name && data.name.trim()) {
              this.addNewLeadToKanban(data);
              return true;
            }
            return false;
          }
        }
      ]
    });

    await alert.present();
  }

  addNewLeadToKanban(leadData: any) {
    const firstColumnStatus = this.columns[0]?.status || 'analysis';
    const newLead: Lead = {
      id: Date.now().toString(),
      name: leadData.name.trim(),
      email: leadData.email || '',
      phone: leadData.phone || '',
      cpf: '',
      product: leadData.product || 'Auto',
      status: firstColumnStatus as LeadStatus,
      score: Math.floor(Math.random() * 100),
      source: 'Kanban',
      lastContact: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      consultantId: '1',
      notes: [],
      contactHistory: [],
      classification: LeadClassification.WARM,
      priority: LeadPriority.MEDIUM
    };

    // Adicionar o lead à primeira coluna
    if (!this.kanbanData[firstColumnStatus]) {
      this.kanbanData[firstColumnStatus] = [];
    }
    this.kanbanData[firstColumnStatus].unshift(newLead);

    // Salvar no serviço
    this.leadsService.createLead(newLead).subscribe({
      next: () => {
        console.log('Lead criado com sucesso');
      },
      error: (error: any) => {
        console.error('Erro ao criar lead:', error);
      }
    });
  }

  openLead(lead: any) {
    this.router.navigate(['/leads', lead.id]);
  }

  chatWithAI(lead: any) {
    console.log('Chat with AI for lead:', lead.id);
    // Implement AI chat functionality
  }

  viewHistory(lead: any) {
    console.log('View history for lead:', lead.id);
    // Implement history view functionality
  }

  async doRefresh(event: any) {
    await this.loadKanbanData();
    event.target.complete();
  }

  onRefresh() {
    this.loadKanbanData();
  }

  // Column Management Methods
  toggleColumnManagement() {
    this.showColumnManagement = !this.showColumnManagement;
  }

  async addColumn() {
    const alert = await this.alertController.create({
      header: 'Nova Coluna',
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'Nome da coluna',
          attributes: {
            required: true,
            maxlength: 50
          }
        },
        {
          name: 'color',
          type: 'text',
          placeholder: 'Cor (ex: primary, secondary, success)',
          value: 'primary'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Adicionar',
          handler: (data) => {
            if (data.title && data.title.trim()) {
              const newColumn: KanbanColumn = {
                id: Date.now().toString(),
                title: data.title.trim(),
                color: data.color || 'primary',
                position: this.columns.length + 1,
                status: data.title.toLowerCase().replace(/\s+/g, '_')
              };
              this.columns.push(newColumn);
              this.columns.sort((a, b) => a.position - b.position);
              this.saveColumns();
              return true;
            }
            return false;
          }
        }
      ]
    });

    await alert.present();
  }

  async editColumn(column: KanbanColumn) {
    const alert = await this.alertController.create({
      header: 'Editar Coluna',
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'Nome da coluna',
          value: column.title,
          attributes: {
            required: true,
            maxlength: 50
          }
        },
        {
          name: 'color',
          type: 'text',
          placeholder: 'Cor (ex: primary, secondary, success)',
          value: column.color
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Salvar',
          handler: (data) => {
            if (data.title && data.title.trim()) {
              column.title = data.title.trim();
              column.color = data.color || 'primary';
              this.saveColumns();
              return true;
            }
            return false;
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteColumn(column: KanbanColumn) {
    const alert = await this.alertController.create({
      header: 'Excluir Coluna',
      message: `Deseja realmente excluir a coluna "${column.title}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            const index = this.columns.findIndex(c => c.id === column.id);
            if (index > -1) {
              this.columns.splice(index, 1);
              // Reorganizar posições
              this.columns.forEach((col, idx) => {
                col.position = idx + 1;
              });
              this.saveColumns();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  moveColumn(column: KanbanColumn, direction: 'left' | 'right') {
    const currentIndex = this.columns.findIndex(c => c.id === column.id);
    
    if (direction === 'left' && currentIndex > 0) {
      // Trocar com a coluna anterior
      [this.columns[currentIndex - 1], this.columns[currentIndex]] = 
      [this.columns[currentIndex], this.columns[currentIndex - 1]];
    } else if (direction === 'right' && currentIndex < this.columns.length - 1) {
      // Trocar com a próxima coluna
      [this.columns[currentIndex], this.columns[currentIndex + 1]] = 
      [this.columns[currentIndex + 1], this.columns[currentIndex]];
    }

    // Reorganizar posições
    this.columns.forEach((col, idx) => {
      col.position = idx + 1;
    });
    
    this.saveColumns();
  }

  // Drag and Drop Methods
  onDragStart(event: DragEvent, lead: Lead) {
    this.draggedLead = lead;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/html', lead.id);
    }
    
    // Add visual feedback
    const target = event.target as HTMLElement;
    target.style.opacity = '0.5';
  }

  onDragEnd(event: DragEvent) {
    // Reset visual feedback
    const target = event.target as HTMLElement;
    target.style.opacity = '1';
    this.draggedLead = null;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
    
    // Add visual feedback to column
    const target = event.currentTarget as HTMLElement;
    target.classList.add('drag-over');
  }

  onDragLeave(event: DragEvent) {
    // Remove visual feedback when leaving column
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    // Only remove class if actually leaving the element bounds
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      target.classList.remove('drag-over');
    }
  }

  onDrop(event: DragEvent, targetStatus: string) {
    event.preventDefault();
    
    // Remove visual feedback
    const target = event.currentTarget as HTMLElement;
    target.classList.remove('drag-over');

    if (!this.draggedLead) return;

    const originalStatus = this.draggedLead.status;
    
    // Don't do anything if dropped on same column
    if (originalStatus === targetStatus) {
      this.draggedLead = null;
      return;
    }

    // Update lead status locally
    this.draggedLead.status = targetStatus as LeadStatus;

    // Move lead in data structure
    const originalColumn = this.kanbanData[originalStatus] || [];
    const targetColumn = this.kanbanData[targetStatus] || [];

    // Remove from original column
    const leadIndex = originalColumn.findIndex(l => l.id === this.draggedLead!.id);
    if (leadIndex > -1) {
      originalColumn.splice(leadIndex, 1);
    }

    // Add to target column
    targetColumn.unshift(this.draggedLead);

    // Update in service
    this.leadsService.updateLeadStatus(this.draggedLead.id, targetStatus as LeadStatus).subscribe({
      next: (updatedLead) => {
        console.log('Lead status updated:', updatedLead);
      },
      error: (error) => {
        console.error('Erro ao atualizar status do lead:', error);
        // Revert changes on error
        this.loadKanbanData();
      }
    });

    this.draggedLead = null;
  }

  private getColumnTitle(status: string): string {
    const column = this.columns.find(c => c.status === status);
    return column ? column.title : status;
  }
}