import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';

import { IntegrationsPageRoutingModule } from './integrations-routing.module';
import { ComingSoonModule } from '../../components/coming-soon.module';
import { IntegrationConfigModule } from '../../components/integration-config/integration-config.module';
import { IntegrationsPage } from './integrations.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    HttpClientModule,
    IntegrationsPageRoutingModule,
    ComingSoonModule,
    IntegrationConfigModule
  ],
  declarations: [IntegrationsPage]
})
export class IntegrationsPageModule {}