import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AutomationsPage } from './automations.page';

const routes: Routes = [
  {
    path: '',
    component: AutomationsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AutomationsPageRoutingModule {}
