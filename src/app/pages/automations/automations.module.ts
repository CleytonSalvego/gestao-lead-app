import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AutomationsPageRoutingModule } from './automations-routing.module';
import { ComingSoonModule } from '../../components/coming-soon.module';

import { AutomationsPage } from './automations.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AutomationsPageRoutingModule,
    ComingSoonModule
  ],
  declarations: [AutomationsPage]
})
export class AutomationsPageModule {}
