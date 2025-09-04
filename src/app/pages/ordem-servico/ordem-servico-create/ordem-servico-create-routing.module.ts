import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrdemServicoCreatePage } from './ordem-servico-create.page';

const routes: Routes = [
  {
    path: '',
    component: OrdemServicoCreatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrdemServicoCreatePageRoutingModule {}
