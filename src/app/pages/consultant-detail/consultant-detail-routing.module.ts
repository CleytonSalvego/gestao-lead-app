import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConsultantDetailPage } from './consultant-detail.page';

const routes: Routes = [
  {
    path: '',
    component: ConsultantDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsultantDetailPageRoutingModule {}
