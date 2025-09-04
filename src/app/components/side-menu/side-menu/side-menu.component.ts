import { CommonModule, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, MenuController, NavController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ControllService } from 'src/app/services/controller.service';
import { SharedService } from 'src/app/services/shared.service';
import { UserService } from 'src/app/services/user.service';
import { VersionService } from 'src/app/services/version.service';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    NgIf]
})
export class SideMenuComponent  implements OnInit {

  subscription!: Subscription;

  showBackDrop: boolean = false;
  version: string = '';
  themeToggle = false;
  currentTheme: string = 'ligth';
  isAndroid: boolean = true;
  dados: any = "";

  constructor(
    private platform: Platform,
    private versionService: VersionService,
    private userService: UserService,
    private controllerService: ControllService,
    private sharedService: SharedService,
    private navCtrl: NavController,
    private menuCtrl: MenuController,
    private router: Router,
    private authService: AuthService
  ) { }

  async ngOnInit() {

    await this.getVersion();

    await this.userService.getUser().then((data) => {
      if (data) this.dados = (this.sharedService.userFormat(data));
    });

    await this.getRoleUser();

  }

  async getRoleUser() {
    this.subscription = await this.authService.emitLoginUser.subscribe(async (admin: any) => {
      this.dados.admin = admin;
      //this.subscription.unsubscribe();
    });
  }


  getVersion() {
    this.platform.ready().then(() => {
      this.isAndroid = this.platform.is('ios') == true ? false  : true;
      this.version = this.versionService.getVersion();
    });

  }

  goToHome() {
    this.navCtrl.setDirection('root');
    this.router.navigateByUrl('home');
    this.menuCtrl.toggle();
  }

  async logout() {
    await this.userService.logout();
    return await this.controllerService.navigateLogin();
  }

  toggleDarkTheme() {
    this.currentTheme  = this.currentTheme == 'ligth' ? 'dark' : 'ligth';
    this.themeToggle = this.currentTheme  == 'dark' ? true : false;
    document.body.classList.toggle('dark', this.themeToggle);
    this.userService.insertCurrentTheme(this.currentTheme);
  }

  goTo(pagina: string){
    this.controllerService.navigate(pagina);
    this.menuCtrl.toggle();
  }


}
