import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-error-message-modal',
  templateUrl: './error-message-modal.component.html',
  styleUrls: ['./error-message-modal.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule]
})
export class ErrorMessageModalComponent  implements OnInit {

  title = "";
  message = "";

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  confirm() {
    this.modalCtrl.dismiss(null, 'confirm');
  }

}
