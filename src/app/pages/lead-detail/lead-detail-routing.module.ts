import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LeadDetailPage } from './lead-detail.page';

const routes: Routes = [
  {
    path: '',
    component: LeadDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeadDetailPageRoutingModule {}
