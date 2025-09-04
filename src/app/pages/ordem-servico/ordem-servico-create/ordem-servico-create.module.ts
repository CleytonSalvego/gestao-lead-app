import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrdemServicoCreatePageRoutingModule } from './ordem-servico-create-routing.module';

import { OrdemServicoCreatePage } from './ordem-servico-create.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrdemServicoCreatePageRoutingModule
  ],
  //declarations: [OrdemServicoCreatePage]
})
export class OrdemServicoCreatePageModule {}
