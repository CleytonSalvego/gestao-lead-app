import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApontamentoArmadilhaFeromonioPage } from './apontamento-armadilha-feromonio.page';

const routes: Routes = [
  {
    path: '',
    component: ApontamentoArmadilhaFeromonioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApontamentoArmadilhaFeromonioPageRoutingModule {}
