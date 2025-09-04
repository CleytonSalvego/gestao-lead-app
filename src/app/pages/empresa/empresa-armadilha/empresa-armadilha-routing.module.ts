import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmpresaArmadilhaPage } from './empresa-armadilha.page';

const routes: Routes = [
  {
    path: '',
    component: EmpresaArmadilhaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmpresaArmadilhaPageRoutingModule {}
