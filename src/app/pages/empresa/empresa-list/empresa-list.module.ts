import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EmpresaListPageRoutingModule } from './empresa-list-routing.module';

import { EmpresaListPage } from './empresa-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EmpresaListPageRoutingModule
  ],
  //declarations: [EmpresaListPage]
})
export class EmpresaListPageModule {}
