import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuditLogsPage } from './audit-logs.page';

const routes: Routes = [
  {
    path: '',
    component: AuditLogsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuditLogsPageRoutingModule {}
