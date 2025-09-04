import { NgIf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HeaderComponent } from 'src/app/components/header/header/header.component';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports:[
    HeaderComponent,
    NgIf
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomePage {

  showBackDrop: boolean = false;

  constructor(
    private sharedService: SharedService
  ) {}

  async ionViewDidEnter() {
    await this.sharedService.setTitle("Home");
    await this.sharedService.adjustTop();
    await this.sharedService.showSideMenu();

  }

}
