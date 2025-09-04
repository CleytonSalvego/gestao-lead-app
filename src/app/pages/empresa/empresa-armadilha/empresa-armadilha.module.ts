import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EmpresaArmadilhaPageRoutingModule } from './empresa-armadilha-routing.module';

import { EmpresaArmadilhaPage } from './empresa-armadilha.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EmpresaArmadilhaPageRoutingModule
  ],
  //declarations: [EmpresaArmadilhaPage]
})
export class EmpresaArmadilhaPageModule {}
