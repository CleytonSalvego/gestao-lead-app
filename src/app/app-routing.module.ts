import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/auth/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/auth/register/register.module').then(m => m.RegisterPageModule)
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./pages/auth/forgot-password/forgot-password.module').then(m => m.ForgotPasswordPageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardPageModule)
  },
  {
    path: 'kanban',
    loadChildren: () => import('./pages/kanban/kanban.module').then(m => m.KanbanPageModule)
  },
  {
    path: 'leads',
    loadChildren: () => import('./pages/leads/leads.module').then(m => m.LeadsPageModule)
  },
  {
    path: 'lead-detail/:id',
    loadChildren: () => import('./pages/lead-detail/lead-detail.module').then(m => m.LeadDetailPageModule)
  },
  {
    path: 'consultants',
    loadChildren: () => import('./pages/consultants/consultants.module').then(m => m.ConsultantsPageModule)
  },
  {
    path: 'consultant-detail/:id',
    loadChildren: () => import('./pages/consultant-detail/consultant-detail.module').then(m => m.ConsultantDetailPageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./pages/settings/settings.module').then(m => m.SettingsPageModule)
  },
  {
    path: 'integrations',
    loadChildren: () => import('./pages/integrations/integrations.module').then(m => m.IntegrationsPageModule)
  },
  {
    path: 'support',
    loadChildren: () => import('./pages/support/support.module').then(m => m.SupportPageModule)
  },
  // Financial Pages
  {
    path: 'invoices',
    loadChildren: () => import('./pages/financial/invoices/invoices.module').then(m => m.InvoicesPageModule)
  },
  {
    path: 'commissions',
    loadChildren: () => import('./pages/financial/commissions/commissions.module').then(m => m.CommissionsPageModule)
  },
  {
    path: 'payments',
    loadChildren: () => import('./pages/financial/payments/payments.module').then(m => m.PaymentsPageModule)
  },
  // Integration Pages
  {
    path: 'automations',
    loadChildren: () => import('./pages/automations/automations.module').then(m => m.AutomationsPageModule)
  },
  {
    path: 'knowledge-base',
    loadChildren: () => import('./pages/knowledge-base/knowledge-base.module').then(m => m.KnowledgeBasePageModule)
  },
  // Administration Pages
  {
    path: 'users',
    loadChildren: () => import('./pages/admin/users/users.module').then(m => m.UsersPageModule)
  },
  {
    path: 'roles',
    loadChildren: () => import('./pages/admin/roles/roles.module').then(m => m.RolesPageModule)
  },
  {
    path: 'audit-logs',
    loadChildren: () => import('./pages/admin/audit-logs/audit-logs.module').then(m => m.AuditLogsPageModule)
  },
  {
    path: 'home',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'erp',
    loadChildren: () => import('./pages/erp/erp.module').then( m => m.ErpPageModule)
  },
  {
    path: 'social-media',
    loadChildren: () => import('./pages/social-media/social-media.module').then(m => m.SocialMediaPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
