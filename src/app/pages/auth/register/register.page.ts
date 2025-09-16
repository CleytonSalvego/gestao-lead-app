import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../../../services/mock/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  ngOnInit() {}

  async onSubmit() {
    if (this.registerForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Criando conta...',
        spinner: 'crescent'
      });
      await loading.present();

      this.isLoading = true;

      this.authService.register(this.registerForm.value).subscribe({
        next: async (response) => {
          await loading.dismiss();
          this.isLoading = false;
          
          const toast = await this.toastController.create({
            message: `Conta criada com sucesso! Bem-vindo, ${response.user.name}!`,
            duration: 3000,
            color: 'success',
            position: 'top'
          });
          await toast.present();

          this.router.navigate(['/dashboard']);
        },
        error: async (error) => {
          await loading.dismiss();
          this.isLoading = false;
          
          const toast = await this.toastController.create({
            message: error.message || 'Erro ao criar conta',
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

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  private markFormGroupTouched() {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} é obrigatório`;
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['minlength']) return `${fieldName} deve ter pelo menos ${field.errors['minlength'].requiredLength} caracteres`;
    }
    return '';
  }
}