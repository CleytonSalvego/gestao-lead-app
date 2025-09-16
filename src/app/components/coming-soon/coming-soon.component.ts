import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-coming-soon',
  templateUrl: './coming-soon.component.html',
  styleUrls: ['./coming-soon.component.scss'],
})
export class ComingSoonComponent {
  @Input() title: string = 'Funcionalidade em Desenvolvimento';
  @Input() subtitle: string = 'Esta funcionalidade estará disponível em breve';
  @Input() description: string = 'Nossa equipe está trabalhando para trazer esta funcionalidade o mais rápido possível.';
  @Input() icon: string = 'construct-outline';
  @Input() iconColor: string = 'primary';

  constructor() { }
}
