import { Injectable } from "@angular/core";
import { Router, NavigationExtras } from "@angular/router";
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class ControllService {

  constructor(
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private lodCtrl: LoadingController,
    private router: Router
  ) { }

  navigate(nav: string, params: any = '') {

    let navigationExtras: NavigationExtras = {
      queryParams: {
        params
      }
    };

    this.navCtrl.navigateRoot([nav], navigationExtras);
  };


  navigateRoute(nav: string, params: any = '') {

    if (typeof params === 'string' && params.trim().length === 0)
      this.router.navigate(['/' + nav]);

    if (typeof params === 'object')
      this.router.navigate(['/' + nav, params]);

  }

  navigatePrivacePolicy() {
    this.navCtrl.navigateRoot(['/privace-policy']);
  };

  navigateLogin() {
    this.navCtrl.navigateRoot(['login']);
  };

  navigateHome() {
    this.navCtrl.navigateRoot(['home']);
  };

  navigateDashboard() {
    this.navCtrl.navigateRoot(['dashboard']);
  };

  async toastControllerTop(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2500,
      position: 'top',
      icon: "alert-circle-outline",
      cssClass: 'toast-alert'
    });
    toast.present();
  };

  async toastControllerBottom(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2500,
      position: 'bottom'
    });
    toast.present();
  };

  async toastControllerMiddle(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2500,
      position: 'middle'
    });
    toast.present();
  };

  async alert(css: string, header: string, message: string, buttons: any) {
    const alert = await this.alertCtrl.create({
      cssClass: css,
      header: header,
      message: message,
      buttons: buttons
    });
    return await alert.present();
  };

  async loadingController(message: string) {
    const loading = await this.lodCtrl.create({
      cssClass: 'my-custom-class',
      message: message
    });
    await loading.present();

    return loading;
  };




};
