import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ErpPage } from './erp.page';

const routes: Routes = [
  {
    path: '',
    component: ErpPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ErpPageRoutingModule {}
