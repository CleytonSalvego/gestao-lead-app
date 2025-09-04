import { NgIf, NgFor, CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { HeaderComponent } from 'src/app/components/header/header/header.component';
import { ArmadilhaRespostaStatusTunelCapturaEnum } from 'src/app/enums/armadilha-respostas.enum';
import { ApontamentoArmadilhaRespostaInterface, CapituraInterface } from 'src/app/interfaces/ordem-servico.interface';

@Component({
  selector: 'app-apontamento-armadilha-tunel-captura',
  templateUrl: './apontamento-armadilha-tunel-captura.page.html',
  styleUrls: ['./apontamento-armadilha-tunel-captura.page.scss'],
  standalone: true,
  imports:[
    HeaderComponent,
    NgIf,
    NgFor,
    IonicModule,
    CommonModule,
    FormsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ApontamentoArmadilhaTunelCapturaPage implements OnInit {

  item!: ApontamentoArmadilhaRespostaInterface;
  listCapturas: CapituraInterface[] = [];
  constructor(
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {

    if(this.item.capturas == null || this.item.capturas.length == 0){
      this.loadComboStatusArmadilha();
    }else{
      this.listCapturas = this.item.capturas;
    }
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    return this.modalCtrl.dismiss('confirm');
  }

  dismiss() {

    return this.modalCtrl.dismiss(this.item,'dismiss');
  }

  salvar(){
    this.item.capturas = this.listCapturas;
    this.dismiss();
  }

  remover(item:any){

  }

  enumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
    return Object.keys(obj).filter(k => !Number.isNaN(k)) as K[]
  }

  async loadComboStatusArmadilha(){
    for (const tl of this.enumKeys(ArmadilhaRespostaStatusTunelCapturaEnum)) {
      var item: CapituraInterface ={
        id_apontamento: 1,
        codigo: tl,
        descricao: ArmadilhaRespostaStatusTunelCapturaEnum[tl],
        quantidade: 0
      }
      this.listCapturas.push(item);
      }
  }

  setQuantidade(event:any, item:CapituraInterface){
      let index = this.listCapturas.findIndex((element: any) => element.codigo === item.codigo)
      if(this.listCapturas[index] != null && this.listCapturas[index] != undefined){
        this.listCapturas[index].quantidade = event.detail.value;
      }
  }


}
