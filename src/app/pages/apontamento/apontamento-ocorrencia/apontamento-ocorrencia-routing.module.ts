import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApontamentoOcorrenciaPage } from './apontamento-ocorrencia.page';

const routes: Routes = [
  {
    path: '',
    component: ApontamentoOcorrenciaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApontamentoOcorrenciaPageRoutingModule {}
