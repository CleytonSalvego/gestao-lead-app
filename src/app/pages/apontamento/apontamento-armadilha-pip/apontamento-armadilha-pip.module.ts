import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ApontamentoArmadilhaPipPageRoutingModule } from './apontamento-armadilha-pip-routing.module';

import { ApontamentoArmadilhaPipPage } from './apontamento-armadilha-pip.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ApontamentoArmadilhaPipPageRoutingModule
  ],
  //declarations: [ApontamentoArmadilhaPipPage]
})
export class ApontamentoArmadilhaPipPageModule {}
