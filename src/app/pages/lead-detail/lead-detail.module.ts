import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LeadDetailPageRoutingModule } from './lead-detail-routing.module';
import { LeadDetailPage } from './lead-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LeadDetailPageRoutingModule
  ],
  declarations: [LeadDetailPage]
})
export class LeadDetailPageModule {}
