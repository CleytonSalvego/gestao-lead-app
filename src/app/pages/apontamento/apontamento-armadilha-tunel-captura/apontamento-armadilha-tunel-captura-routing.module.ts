import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApontamentoArmadilhaTunelCapturaPage } from './apontamento-armadilha-tunel-captura.page';

const routes: Routes = [
  {
    path: '',
    component: ApontamentoArmadilhaTunelCapturaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApontamentoArmadilhaTunelCapturaPageRoutingModule {}
