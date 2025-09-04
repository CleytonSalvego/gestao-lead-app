import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmpresaListPage } from './empresa-list.page';

const routes: Routes = [
  {
    path: '',
    component: EmpresaListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmpresaListPageRoutingModule {}
