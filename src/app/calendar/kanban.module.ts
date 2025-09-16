import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { KanbanBoardComponent } from './kanban-board.component';

const routes: Routes = [
  { path: '', component: KanbanBoardComponent }
];

@NgModule({
  declarations: [KanbanBoardComponent],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes)
  ]
})
export class KanbanModule {}
