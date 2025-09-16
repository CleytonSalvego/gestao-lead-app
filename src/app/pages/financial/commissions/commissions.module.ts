import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CommissionsPageRoutingModule } from './commissions-routing.module';
import { ComingSoonModule } from '../../../components/coming-soon.module';

import { CommissionsPage } from './commissions.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CommissionsPageRoutingModule,
    ComingSoonModule
  ],
  declarations: [CommissionsPage]
})
export class CommissionsPageModule {}
