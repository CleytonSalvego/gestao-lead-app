import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ApontamentoArmadilhaTunelCapturaPageRoutingModule } from './apontamento-armadilha-tunel-captura-routing.module';

import { ApontamentoArmadilhaTunelCapturaPage } from './apontamento-armadilha-tunel-captura.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ApontamentoArmadilhaTunelCapturaPageRoutingModule
  ],
  //declarations: [ApontamentoArmadilhaTunelCapturaPage]
})
export class ApontamentoArmadilhaTunelCapturaPageModule {}
