import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ApontamentoOcorrenciaPageRoutingModule } from './apontamento-ocorrencia-routing.module';

import { ApontamentoOcorrenciaPage } from './apontamento-ocorrencia.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ApontamentoOcorrenciaPageRoutingModule
  ],
  //declarations: [ApontamentoOcorrenciaPage]
})
export class ApontamentoOcorrenciaPageModule {}
