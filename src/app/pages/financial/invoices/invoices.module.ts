import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InvoicesPageRoutingModule } from './invoices-routing.module';
import { ComingSoonModule } from '../../../components/coming-soon.module';

import { InvoicesPage } from './invoices.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InvoicesPageRoutingModule,
    ComingSoonModule
  ],
  declarations: [InvoicesPage]
})
export class InvoicesPageModule {}
