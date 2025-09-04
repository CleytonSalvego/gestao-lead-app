import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-login-error-message-modal',
  templateUrl: './login-error-message-modal.component.html',
  styleUrls: ['./login-error-message-modal.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule]
})
export class LoginErrorMessageModalComponent  implements OnInit {

  @Input() sucesso: boolean = true;
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  confirm() {
    this.modalCtrl.dismiss(null, 'confirm');
  }

}
