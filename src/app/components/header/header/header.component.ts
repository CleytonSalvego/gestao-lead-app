import { CommonModule, NgIf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { SideMenuComponent } from '../../side-menu/side-menu/side-menu.component';
import { SharedService } from 'src/app/services/shared.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    NgIf,
    SideMenuComponent],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class HeaderComponent  implements OnInit {

  @Input() title: string = "";
  @Input() show: boolean = true;
  dados: any = "";
  list: any[] = [];
  
  constructor(
    private userService: UserService,
    private sharedService: SharedService,
  ) { }

  async ngOnInit() {
    await this.userService.getUser().then((data) => {
      if (data) this.dados = (this.sharedService.userFormat(data));
    });
  }

  loadMenu() {
    //this.userService.getEmitMenu();
    //this.userService.getEmitStatusWifi();
  }

}
