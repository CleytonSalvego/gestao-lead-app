import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-page-transition',
  templateUrl: './page-transition.component.html',
  styleUrls: ['./page-transition.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class PageTransitionComponent {
  @Input() show: boolean = false;
  @Input() message: string = 'Carregando...';
  @Input() icon: string = 'pulse-outline';
}