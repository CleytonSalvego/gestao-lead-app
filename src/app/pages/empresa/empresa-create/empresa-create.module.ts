import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EmpresaCreatePageRoutingModule } from './empresa-create-routing.module';

import { EmpresaCreatePage } from './empresa-create.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EmpresaCreatePageRoutingModule
  ],
  //declarations: [EmpresaCreatePage]
})
export class EmpresaCreatePageModule {}
