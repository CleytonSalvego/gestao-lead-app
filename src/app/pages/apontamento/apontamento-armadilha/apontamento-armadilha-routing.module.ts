import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApontamentoArmadilhaPage } from './apontamento-armadilha.page';

const routes: Routes = [
  {
    path: '',
    component: ApontamentoArmadilhaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApontamentoArmadilhaPageRoutingModule {}
