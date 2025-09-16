import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController, ToastController, ModalController } from '@ionic/angular';
import { SupportService } from '../../services/support/support.service';
import { 
  Ticket, 
  TicketStatus, 
  TicketPriority, 
  TicketCategory,
  SupportMetrics,
  KnowledgeArticle,
  FAQ
} from '../../interfaces/support.interface';

@Component({
  selector: 'app-support',
  templateUrl: './support.page.html',
  styleUrls: ['./support.page.scss'],
})
export class SupportPage implements OnInit {
  selectedSegment = 'tickets';
  tickets: Ticket[] = [];
  knowledgeArticles: KnowledgeArticle[] = [];
  faqs: FAQ[] = [];
  metrics: SupportMetrics | null = null;
  
  showTicketModal = false;
  showArticleModal = false;
  selectedTicket: Ticket | null = null;
  ticketForm: FormGroup;
  articleForm: FormGroup;
  
  ticketCategories = [
    { value: 'technical', label: 'Técnico' },
    { value: 'billing', label: 'Financeiro' },
    { value: 'product', label: 'Produto' },
    { value: 'feature_request', label: 'Solicitação de Feature' }
  ];

  ticketPriorities = [
    { value: 'low', label: 'Baixa' },
    { value: 'medium', label: 'Média' },
    { value: 'high', label: 'Alta' },
    { value: 'critical', label: 'Crítica' }
  ];

  constructor(
    private fb: FormBuilder,
    private supportService: SupportService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private modalController: ModalController
  ) {
    this.ticketForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      category: ['', [Validators.required]],
      priority: ['', [Validators.required]]
    });

    this.articleForm = this.fb.group({
      title: ['', [Validators.required]],
      content: ['', [Validators.required]],
      category: ['', [Validators.required]],
      tags: ['']
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.supportService.tickets$.subscribe(tickets => {
      this.tickets = tickets;
    });

    this.supportService.knowledgeArticles$.subscribe(articles => {
      this.knowledgeArticles = articles;
    });

    this.supportService.faqs$.subscribe(faqs => {
      this.faqs = faqs;
    });

    this.supportService.metrics$.subscribe(metrics => {
      this.metrics = metrics;
    });
  }

  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  }

  // Ticket Management
  openTicketModal(ticket?: Ticket) {
    this.selectedTicket = ticket || null;
    
    if (ticket) {
      this.ticketForm.patchValue({
        title: ticket.title,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority
      });
    } else {
      this.ticketForm.reset();
    }
    
    this.showTicketModal = true;
  }

  async saveTicket() {
    if (this.ticketForm.invalid) {
      const toast = await this.toastController.create({
        message: 'Por favor, preencha todos os campos obrigatórios',
        duration: 3000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Salvando ticket...'
    });
    await loading.present();

    const formValue = this.ticketForm.value;
    const ticketData = {
      title: formValue.title,
      description: formValue.description,
      category: formValue.category,
      priority: formValue.priority,
      customerId: 'current-user', // In real app, get from auth service
      status: 'open' as TicketStatus
    };

    const operation = this.selectedTicket
      ? this.supportService.updateTicket(this.selectedTicket.id, ticketData)
      : this.supportService.createTicket(ticketData);

    operation.subscribe({
      next: async () => {
        loading.dismiss();
        this.showTicketModal = false;
        
        const toast = await this.toastController.create({
          message: 'Ticket salvo com sucesso!',
          duration: 3000,
          color: 'success'
        });
        await toast.present();
      },
      error: async (error) => {
        loading.dismiss();
        const toast = await this.toastController.create({
          message: 'Erro ao salvar ticket',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }

  async changeTicketStatus(ticket: Ticket, newStatus: TicketStatus) {
    const loading = await this.loadingController.create({
      message: 'Atualizando status...'
    });
    await loading.present();

    this.supportService.changeTicketStatus(ticket.id, newStatus).subscribe({
      next: async () => {
        loading.dismiss();
        const toast = await this.toastController.create({
          message: 'Status atualizado com sucesso!',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
      },
      error: async (error) => {
        loading.dismiss();
        const toast = await this.toastController.create({
          message: 'Erro ao atualizar status',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }

  async deleteTicket(ticket: Ticket) {
    const alert = await this.alertController.create({
      header: 'Excluir Ticket',
      message: 'Tem certeza que deseja excluir este ticket? Esta ação não pode ser desfeita.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Excluindo ticket...'
            });
            await loading.present();

            this.supportService.deleteTicket(ticket.id).subscribe({
              next: async () => {
                loading.dismiss();
                const toast = await this.toastController.create({
                  message: 'Ticket excluído com sucesso!',
                  duration: 3000,
                  color: 'success'
                });
                await toast.present();
              },
              error: async (error) => {
                loading.dismiss();
                const toast = await this.toastController.create({
                  message: 'Erro ao excluir ticket',
                  duration: 3000,
                  color: 'danger'
                });
                await toast.present();
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  // Knowledge Base Management
  openArticleModal(article?: KnowledgeArticle) {
    if (article) {
      this.articleForm.patchValue({
        title: article.title,
        content: article.content,
        category: article.category,
        tags: article.tags.join(', ')
      });
    } else {
      this.articleForm.reset();
    }
    
    this.showArticleModal = true;
  }

  async saveArticle() {
    if (this.articleForm.invalid) {
      const toast = await this.toastController.create({
        message: 'Por favor, preencha todos os campos obrigatórios',
        duration: 3000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Salvando artigo...'
    });
    await loading.present();

    const formValue = this.articleForm.value;
    const articleData = {
      title: formValue.title,
      content: formValue.content,
      category: formValue.category,
      tags: formValue.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag),
      author: 'current-user', // In real app, get from auth service
      status: 'published' as const
    };

    this.supportService.createKnowledgeArticle(articleData).subscribe({
      next: async () => {
        loading.dismiss();
        this.showArticleModal = false;
        
        const toast = await this.toastController.create({
          message: 'Artigo salvo com sucesso!',
          duration: 3000,
          color: 'success'
        });
        await toast.present();
      },
      error: async (error) => {
        loading.dismiss();
        const toast = await this.toastController.create({
          message: 'Erro ao salvar artigo',
          duration: 3000,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }

  // Utility Methods
  getStatusColor(status: TicketStatus): string {
    switch (status) {
      case 'open': return 'primary';
      case 'in_progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'medium';
      default: return 'medium';
    }
  }

  getStatusText(status: TicketStatus): string {
    switch (status) {
      case 'open': return 'Aberto';
      case 'in_progress': return 'Em Andamento';
      case 'resolved': return 'Resolvido';
      case 'closed': return 'Fechado';
      default: return 'Desconhecido';
    }
  }

  getPriorityColor(priority: TicketPriority): string {
    switch (priority) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'danger';
      case 'critical': return 'dark';
      default: return 'medium';
    }
  }

  getPriorityText(priority: TicketPriority): string {
    switch (priority) {
      case 'low': return 'Baixa';
      case 'medium': return 'Média';
      case 'high': return 'Alta';
      case 'critical': return 'Crítica';
      default: return 'Desconhecida';
    }
  }

  getCategoryText(category: TicketCategory): string {
    const categoryMap: Record<TicketCategory, string> = {
      'technical': 'Técnico',
      'billing': 'Financeiro',
      'product': 'Produto',
      'integration': 'Integração',
      'training': 'Treinamento',
      'feature_request': 'Solicitação de Feature',
      'bug_report': 'Relatório de Bug',
      'other': 'Outros'
    };
    return categoryMap[category] || category;
  }

  closeModal() {
    this.showTicketModal = false;
    this.showArticleModal = false;
  }
}