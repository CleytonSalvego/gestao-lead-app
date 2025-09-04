import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ApontamentoArmadilhaFeromonioPageRoutingModule } from './apontamento-armadilha-feromonio-routing.module';

import { ApontamentoArmadilhaFeromonioPage } from './apontamento-armadilha-feromonio.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ApontamentoArmadilhaFeromonioPageRoutingModule
  ],
  //declarations: [ApontamentoArmadilhaFeromonioPage]
})
export class ApontamentoArmadilhaFeromonioPageModule {}
