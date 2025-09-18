import { CommonModule, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, MenuController, NavController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { AuthService as MockAuthService } from 'src/app/services/mock/auth.service';
import { ControllService } from 'src/app/services/controller.service';
import { PageTransitionService } from 'src/app/services/page-transition.service';
import { SharedService } from 'src/app/services/shared.service';
import { UserService } from 'src/app/services/user.service';
import { VersionService } from 'src/app/services/version.service';
import { Permission, User } from 'src/app/interfaces/auth.interface';

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
  dados: any = {};
  currentUser: User | null = null;

  constructor(
    private platform: Platform,
    private versionService: VersionService,
    private userService: UserService,
    private controllerService: ControllService,
    private sharedService: SharedService,
    private navCtrl: NavController,
    private menuCtrl: MenuController,
    private router: Router,
    private authService: AuthService,
    private mockAuthService: MockAuthService,
    private pageTransitionService: PageTransitionService
  ) { }

  async ngOnInit() {

    await this.getVersion();

    await this.userService.getUser().then((data) => {
      if (data) this.dados = (this.sharedService.userFormat(data));
    });

    await this.getRoleUser();

  }

  async getRoleUser() {
    // Updated to use new auth service pattern
    this.subscription = this.mockAuthService.currentUser$.subscribe(async (user: User | null) => {
      this.currentUser = user;
      this.dados.admin = user?.role === 'admin';
    });
  }

  // Helper methods for checking permissions
  hasPermission(permission: Permission): boolean {
    return this.mockAuthService.hasPermission(permission);
  }

  canViewDashboard(): boolean {
    return this.hasPermission(Permission.VIEW_DASHBOARD);
  }

  canViewLeads(): boolean {
    return this.hasPermission(Permission.MANAGE_LEADS);
  }

  canViewConsultants(): boolean {
    return this.hasPermission(Permission.MANAGE_CONSULTANTS);
  }

  canViewReports(): boolean {
    return this.hasPermission(Permission.VIEW_REPORTS);
  }

  canViewSettings(): boolean {
    return this.hasPermission(Permission.MANAGE_SETTINGS);
  }

  canViewIntegrations(): boolean {
    return this.hasPermission(Permission.VIEW_INTEGRATIONS);
  }

  canViewSocialMedia(): boolean {
    return this.hasPermission(Permission.VIEW_SOCIAL_MEDIA);
  }

  isMetaAnalyst(): boolean {
    return this.currentUser?.role === 'meta_analyst';
  }


  getVersion() {
    this.platform.ready().then(() => {
      this.isAndroid = this.platform.is('ios') == true ? false  : true;
      this.version = this.versionService.getVersion();
    });

  }

  goToHome() {
    // Close menu first
    this.menuCtrl.toggle();
    
    // Navigate with transition animation
    this.pageTransitionService.navigateWithTransition('/dashboard', 'Carregando início...');
  }

  async logout() {
    try {
      // Primeiro chama o logout do userService para limpar storage local
      await this.userService.logout();

      // Depois chama o logout do authService e aguarda a conclusão
      await new Promise((resolve, reject) => {
        this.mockAuthService.logout().subscribe({
          next: () => {
            console.log('Logout completo realizado');
            resolve(true);
          },
          error: (error) => {
            console.error('Erro durante logout:', error);
            reject(error);
          }
        });
      });

      // Navega para tela de login apenas após logout completo
      return await this.controllerService.navigateLogin();
    } catch (error) {
      console.error('Erro no processo de logout:', error);
      // Mesmo com erro, navega para login
      return await this.controllerService.navigateLogin();
    }
  }

  toggleDarkTheme() {
    this.currentTheme  = this.currentTheme == 'ligth' ? 'dark' : 'ligth';
    this.themeToggle = this.currentTheme  == 'dark' ? true : false;
    document.body.classList.toggle('dark', this.themeToggle);
    this.userService.insertCurrentTheme(this.currentTheme);
  }

  goTo(pagina: string){
    // Close menu first
    this.menuCtrl.toggle();
    
    // Navigate with transition animation
    this.pageTransitionService.quickTransition(pagina);
  }


}
