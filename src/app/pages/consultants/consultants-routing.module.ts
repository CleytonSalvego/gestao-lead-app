import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConsultantsPage } from './consultants.page';

const routes: Routes = [
  {
    path: '',
    component: ConsultantsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConsultantsPageRoutingModule {}
