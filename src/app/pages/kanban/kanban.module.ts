import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { KanbanPageRoutingModule } from './kanban-routing.module';
import { KanbanPage } from './kanban.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    KanbanPageRoutingModule
  ],
  declarations: [KanbanPage]
})
export class KanbanPageModule {}