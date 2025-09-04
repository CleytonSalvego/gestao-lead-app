import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmpresaMapaPage } from './empresa-mapa.page';

const routes: Routes = [
  {
    path: '',
    component: EmpresaMapaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmpresaMapaPageRoutingModule {}
