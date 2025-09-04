import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApontamentoArmadilhaPipPage } from './apontamento-armadilha-pip.page';

const routes: Routes = [
  {
    path: '',
    component: ApontamentoArmadilhaPipPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApontamentoArmadilhaPipPageRoutingModule {}
