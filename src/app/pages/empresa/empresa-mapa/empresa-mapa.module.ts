import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EmpresaMapaPageRoutingModule } from './empresa-mapa-routing.module';

import { EmpresaMapaPage } from './empresa-mapa.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EmpresaMapaPageRoutingModule
  ],
  //declarations: [EmpresaMapaPage]
})
export class EmpresaMapaPageModule {}
