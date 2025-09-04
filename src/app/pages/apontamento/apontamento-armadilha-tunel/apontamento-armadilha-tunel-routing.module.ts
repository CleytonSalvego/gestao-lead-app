import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApontamentoArmadilhaTunelPage } from './apontamento-armadilha-tunel.page';

const routes: Routes = [
  {
    path: '',
    component: ApontamentoArmadilhaTunelPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApontamentoArmadilhaTunelPageRoutingModule {}
