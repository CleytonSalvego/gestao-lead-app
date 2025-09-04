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

  @Input() codigo: number|undefined = 0;
  @Input() cnpj: string = "";
  @Input() razaoSocial: string = "";
  @Input() endereco: string = "";
  @Input() telefone: string = "";
  @Input() email: string = "";  
  @Input() responsavel: string = "";  
  @Input() ativo: boolean = true;
  ativoDescricao = "";
  
  constructor() { }

  ngOnInit() {
    this.ativoDescricao = this.ativo == true ? "Sim" : "Não";
  }

}
