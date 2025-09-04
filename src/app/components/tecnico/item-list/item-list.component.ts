import { CommonModule, NgIf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

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

  @Input() nome: string = "";
  @Input() data_cadastro?: string = "";
  @Input() tecnico: boolean = false;
  @Input() admin: boolean = false;
  @Input() ativo: boolean = true;
  ativoDescricao = "";
  perfil = "";
  
  constructor() { }

  ngOnInit() {

    this.ativoDescricao = this.ativo == true ? "Sim" : "Não";
    this.perfil = this.admin == true ? "Admin" : "Técnico";
  }

}
