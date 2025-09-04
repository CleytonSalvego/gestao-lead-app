import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApontamentoArmadilhaLuminosaPage } from './apontamento-armadilha-luminosa.page';

const routes: Routes = [
  {
    path: '',
    component: ApontamentoArmadilhaLuminosaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApontamentoArmadilhaLuminosaPageRoutingModule {}
