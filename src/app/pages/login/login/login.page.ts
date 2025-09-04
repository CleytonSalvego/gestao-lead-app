import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { LoginErrorMessageModalComponent } from 'src/app/components/modals/login-error-message-modal/login-error-message-modal.component';
import { LoginInterface, ResetSenhaInterface } from 'src/app/interfaces/login.interface';
import { ControllService } from 'src/app/services/controller.service';
import { LoginService } from 'src/app/services/login.service';
import { SharedService } from 'src/app/services/shared.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule,ReactiveFormsModule]
})
export class LoginPage implements OnInit {

  formGroup!: FormGroup;
  validateForm: boolean = true;

  loginDados: LoginInterface = {
    email: "",
    password: ""
  }

  userData: any = "";
  dados: LoginInterface = {
    email: "",
    password: ""
  }

  
  constructor(
    private userService: UserService,
    private sharedService: SharedService,
    private loginService: LoginService,
    private controllerService: ControllService,
    public formBuilder: FormBuilder,
    private modalCtrl: ModalController,
  ) {
    this.formSetting();
   }

  async ngOnInit() {
    await this.getUserData();

    this.dados.email = "";
    this.dados.password = "";

    this.formGroup.patchValue({
      formEmail: '',
      formSenha: ''
    });
  }

  async ionViewDidEnter() {
    await this.sharedService.hiddenHeader();

  }

  formSetting() {
    this.formGroup = this.formBuilder.group({
      formEmail: ['', [Validators.required]],
      formSenha: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  async login() {
    if (!this.validate()) return;

    this.loginDados.email = this.formGroup.value['formEmail'];
    this.loginDados.password = this.formGroup.value['formSenha'];
    var result =  await this.loginService.login(this.loginDados.email, this.loginDados.password);
    if (result == false) await this.openLoginErrorMessageModal();
  }

  async getUserData() {

    try {
      await this.userService.getUser().then((data) => {
        if (data) this.userData = (this.sharedService.userFormat(data));
      });

      if (this.userData.usuarioId > -1) this.loginService.userLogged();

    } catch (ex: any) {
      this.controllerService.alert("", "Erro", ex.Message, null)
    }

  }

  validate() {
    this.validateForm = true;
    if (this.formGroup.invalid) {
      return this.validateForm = false;
    }
    return this.validateForm = true;
  }

  resetPassword(reset: ResetSenhaInterface) {
    this.loginService.resetPassword(reset);
  }

  async openLoginErrorMessageModal() {

    const modal = await this.modalCtrl.create({
      component: LoginErrorMessageModalComponent,
      backdropDismiss: true,
      initialBreakpoint: 0.40,
      componentProps: {
      }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
  }


}
