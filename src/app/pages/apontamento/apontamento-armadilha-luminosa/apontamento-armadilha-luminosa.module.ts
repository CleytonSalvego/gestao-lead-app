import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ApontamentoArmadilhaLuminosaPageRoutingModule } from './apontamento-armadilha-luminosa-routing.module';

import { ApontamentoArmadilhaLuminosaPage } from './apontamento-armadilha-luminosa.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ApontamentoArmadilhaLuminosaPageRoutingModule
  ],
  //declarations: [ApontamentoArmadilhaLuminosaPage]
})
export class ApontamentoArmadilhaLuminosaPageModule {}
