import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AuditLogsPageRoutingModule } from './audit-logs-routing.module';
import { ComingSoonModule } from '../../../components/coming-soon.module';

import { AuditLogsPage } from './audit-logs.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AuditLogsPageRoutingModule,
    ComingSoonModule
  ],
  declarations: [AuditLogsPage]
})
export class AuditLogsPageModule {}
