import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrdemServicoListPageRoutingModule } from './ordem-servico-list-routing.module';

import { OrdemServicoListPage } from './ordem-servico-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrdemServicoListPageRoutingModule
  ],
  //declarations: [OrdemServicoListPage]
})
export class OrdemServicoListPageModule {}
