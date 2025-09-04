import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmpresaCreatePage } from './empresa-create.page';

const routes: Routes = [
  {
    path: '',
    component: EmpresaCreatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmpresaCreatePageRoutingModule {}
