import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { IntegrationConfigComponent } from './integration-config.component';

@NgModule({
  declarations: [
    IntegrationConfigComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule
  ],
  exports: [
    IntegrationConfigComponent
  ]
})
export class IntegrationConfigModule { }