import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../../../services/mock/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  forgotForm: FormGroup;
  isLoading = false;
  emailSent = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {}

  async onSubmit() {
    if (this.forgotForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Enviando email...',
        spinner: 'crescent'
      });
      await loading.present();

      this.isLoading = true;

      this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
        next: async () => {
          await loading.dismiss();
          this.isLoading = false;
          this.emailSent = true;
          
          const toast = await this.toastController.create({
            message: 'Email de recuperação enviado com sucesso!',
            duration: 3000,
            color: 'success',
            position: 'top'
          });
          await toast.present();
        },
        error: async (error) => {
          await loading.dismiss();
          this.isLoading = false;
          
          const toast = await this.toastController.create({
            message: error.message || 'Erro ao enviar email',
            duration: 3000,
            color: 'danger',
            position: 'top'
          });
          await toast.present();
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  private markFormGroupTouched() {
    Object.keys(this.forgotForm.controls).forEach(key => {
      const control = this.forgotForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.forgotForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return 'Email é obrigatório';
      if (field.errors['email']) return 'Email inválido';
    }
    return '';
  }
}