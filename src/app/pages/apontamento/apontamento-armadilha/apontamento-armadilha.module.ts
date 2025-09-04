import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ApontamentoArmadilhaPageRoutingModule } from './apontamento-armadilha-routing.module';

import { ApontamentoArmadilhaPage } from './apontamento-armadilha.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ApontamentoArmadilhaPageRoutingModule
  ],
 // declarations: [ApontamentoArmadilhaPage]
})
export class ApontamentoArmadilhaPageModule {}
