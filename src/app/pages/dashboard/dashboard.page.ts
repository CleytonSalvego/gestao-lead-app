import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/mock/auth.service';
import { LeadsService } from '../../services/mock/leads.service';
import { ConsultantsService } from '../../services/mock/consultants.service';
import { LeadMetrics } from '../../interfaces/lead.interface';
import { User } from '../../interfaces/auth.interface';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  currentUser: User | null = null;
  metrics: LeadMetrics | null = null;
  teamMetrics: any = null;
  topPerformers: any[] = [];
  isLoading = true;

  // Chart data
  productChartData: any = {};
  contactChartData: any = {};

  constructor(
    private authService: AuthService,
    private leadsService: LeadsService,
    private consultantsService: ConsultantsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadDashboardData();
  }

  async loadDashboardData() {
    this.isLoading = true;

    try {
      // Load all data in parallel
      const [metrics, teamMetrics, topPerformers] = await Promise.all([
        this.leadsService.getMetrics().toPromise(),
        this.consultantsService.getTeamMetrics().toPromise(),
        this.consultantsService.getTopPerformers(3).toPromise()
      ]);

      this.metrics = metrics!;
      this.teamMetrics = teamMetrics;
      this.topPerformers = topPerformers!;

      this.setupChartData();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  setupChartData() {
    if (this.metrics) {
      // Product distribution chart
      this.productChartData = {
        labels: this.metrics.productDistribution.map(p => p.product),
        datasets: [{
          data: this.metrics.productDistribution.map(p => p.count),
          backgroundColor: [
            '#3498db',
            '#e74c3c',
            '#2ecc71',
            '#f39c12'
          ]
        }]
      };

      // AI vs Human contacts chart
      this.contactChartData = {
        labels: ['IA', 'Humano'],
        datasets: [{
          data: this.metrics.aiVsHumanContacts.map(c => c.count),
          backgroundColor: ['#9b59b6', '#34495e']
        }]
      };
    }
  }

  navigateToLeads() {
    this.router.navigate(['/leads']);
  }

  navigateToKanban() {
    this.router.navigate(['/kanban']);
  }

  navigateToConsultants() {
    this.router.navigate(['/consultants']);
  }

  async doRefresh(event: any) {
    await this.loadDashboardData();
    event.target.complete();
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }
}