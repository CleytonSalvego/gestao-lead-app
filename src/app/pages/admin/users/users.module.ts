import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UsersPageRoutingModule } from './users-routing.module';
import { ComingSoonModule } from '../../../components/coming-soon.module';

import { UsersPage } from './users.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UsersPageRoutingModule,
    ComingSoonModule
  ],
  declarations: [UsersPage]
})
export class UsersPageModule {}
