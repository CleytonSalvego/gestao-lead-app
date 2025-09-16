import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ComingSoonComponent } from './coming-soon/coming-soon.component';

@NgModule({
  declarations: [
    ComingSoonComponent
  ],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [
    ComingSoonComponent
  ]
})
export class ComingSoonModule { }
