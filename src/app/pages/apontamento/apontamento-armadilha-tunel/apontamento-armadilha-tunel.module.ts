import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ApontamentoArmadilhaTunelPageRoutingModule } from './apontamento-armadilha-tunel-routing.module';

import { ApontamentoArmadilhaTunelPage } from './apontamento-armadilha-tunel.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ApontamentoArmadilhaTunelPageRoutingModule
  ],
 // declarations: [ApontamentoArmadilhaTunelPage]
})
export class ApontamentoArmadilhaTunelPageModule {}
