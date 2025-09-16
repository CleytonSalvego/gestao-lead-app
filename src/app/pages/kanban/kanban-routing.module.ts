import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { KanbanPage } from './kanban.page';

const routes: Routes = [
  {
    path: '',
    component: KanbanPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class KanbanPageRoutingModule {}