import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ErpPageRoutingModule } from './erp-routing.module';

import { ErpPage } from './erp.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ErpPageRoutingModule
  ],
  declarations: [ErpPage]
})
export class ErpPageModule {}
