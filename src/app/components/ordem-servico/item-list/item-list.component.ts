import { CommonModule, NgIf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    NgIf],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class ItemListComponent  implements OnInit {

  @Input() codigo: number | undefined = 0;
  @Input() data: string | Date = "";
  @Input() hora: string = "";
  @Input() empresa: string = "";
  @Input() tecnico: string = "";
  @Input() local?: string = "";
  @Input() status: string = "";  
  
  constructor(private sharedService: SharedService) { }

  ngOnInit() {
    this.data = this.sharedService.formatFilterDateListagem(this.data.toString());
  }

  setStatus(status: string) {

    switch (status.toUpperCase()) {
        case "PENDENTE": return 'status-pendente';
        case "ANDAMENTO": return 'status-andamento';
        case "CONCLUÍDO": return 'status-concluido';
        default: return 'circle-status-nulo';
    }
}


}
