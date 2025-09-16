import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ConsultantDetailPageRoutingModule } from './consultant-detail-routing.module';
import { ConsultantDetailPage } from './consultant-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConsultantDetailPageRoutingModule
  ],
  declarations: [ConsultantDetailPage]
})
export class ConsultantDetailPageModule {}
