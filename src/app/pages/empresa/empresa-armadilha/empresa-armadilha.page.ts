import { NgIf, NgFor, CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { HeaderComponent } from 'src/app/components/header/header/header.component';
import { ErrorMessageModalComponent } from 'src/app/components/modals/error-message-modal/error-message-modal.component';
import { SucessoMessageModalComponent } from 'src/app/components/modals/sucesso-message-modal/sucesso-message-modal.component';
import { EmpresaArmadilhaItemListInterface, EmpresaArmadilhaListInterface } from 'src/app/interfaces/empresa.interface';
import { SharedService } from 'src/app/services/shared.service';
import { FixMeLater, QRCodeModule } from 'angularx-qrcode';

@Component({
  selector: 'app-empresa-armadilha',
  templateUrl: './empresa-armadilha.page.html',
  styleUrls: ['./empresa-armadilha.page.scss'],
  standalone: true,
  imports:[
    HeaderComponent,
    NgIf,
    NgFor,
    IonicModule,
    CommonModule,
    FormsModule,
    QRCodeModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EmpresaArmadilhaPage implements OnInit {

  numeroOrdem: number = 1;
  numeroOrdemGrupo: number = 1;
  descricao: string = "";

  tipo: string = "feromonio";
  descricaoArmadilha: string = "Feromônio";

  feromonio: boolean = true;
  luminosa: boolean = false;
  pontoIscaPermanente: boolean = false;
  tunel: boolean = false;

  listArmadilha: EmpresaArmadilhaListInterface[] = [];
  codigo: number = -1;

  ultimaOrdem: number = 0;
  ultimaOrdemGrupo: number = 0;

  qrCode: string = "";

  constructor(
    private sharedService: SharedService,
    private modalCtrl: ModalController,
  ) { }

  async ngOnInit() {
    await this.getUltimaOrdemGrupo();
    await this.getUltimaOrdemArmadilha();
    await this.gerarQRCode();
  }

  async getUltimaOrdemGrupo(){
    var armadilhasList = this.listArmadilha.find(x => x.tipo === this.tipo);

    if(armadilhasList != null || armadilhasList != undefined){
      this.ultimaOrdemGrupo = armadilhasList.ordem;
      this.numeroOrdemGrupo = this.ultimaOrdemGrupo;
      return;
    }
      
    this.ultimaOrdemGrupo = Math.max(...this.listArmadilha.map((o: EmpresaArmadilhaListInterface) => o.ordem));

    if(this.ultimaOrdemGrupo.toString() == '-Infinity')
      this.ultimaOrdemGrupo = 0;

    this.ultimaOrdemGrupo++;
    this.numeroOrdemGrupo = this.ultimaOrdemGrupo;
  }

  async getUltimaOrdemArmadilha(){
    var armadilhasList = this.listArmadilha.find(x => x.tipo === this.tipo);
    this.ultimaOrdem = 0;

    if(armadilhasList != null || armadilhasList != undefined)
      this.ultimaOrdem = Math.max(...armadilhasList.armadilhas.map((o: EmpresaArmadilhaItemListInterface) => o.ordem));

    if(this.ultimaOrdem.toString() == '-Infinity')
      this.ultimaOrdem = 0;

    this.ultimaOrdem++;
    this.numeroOrdem = this.ultimaOrdem;
  }
  

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    return this.modalCtrl.dismiss('confirm');
  }

  dismiss() {

    return this.modalCtrl.dismiss( this.listArmadilha, 'dismiss');
  }

  async salvar(){

    if(! this.validate()){
      await this.errorMessageModal();
      return;
    }

    var item: EmpresaArmadilhaItemListInterface = {
      id_grupo: -1,
      ordem: this.numeroOrdem,
      tipo: this.tipo,
      descricao: this.descricao,
      status: "Pendente"
    }

    let index = this.listArmadilha.findIndex((element: any) => element.tipo === this.tipo)
    
    if(this.listArmadilha[index] != null && this.listArmadilha[index] != undefined){
      this.listArmadilha[index].armadilhas.push(item);
      this.dismiss();
      return;
    }

    await this.gerarQRCode();

    await this.insertNewArmadilha(item);

    this.dismiss();
  }

  async insertNewArmadilha(armadilha: EmpresaArmadilhaItemListInterface){
    
    var ordem = Math.max(...this.listArmadilha.map((o: EmpresaArmadilhaListInterface) => o.ordem));

    if(ordem.toString() == '-Infinity')
      ordem = 0;

    ordem++;

    var tipoList: EmpresaArmadilhaListInterface = {
      id: -1,
      ordem: this.numeroOrdemGrupo,
      tipo: this.tipo,
      descricao: this.descricaoArmadilha,
      armadilhas: []
    }

    tipoList.armadilhas.push(armadilha);

    this.listArmadilha.push(tipoList);

  }


  validate(){
    if(this.sharedService.isEmpty(this.descricaoArmadilha))
      return false;

    return true;
  }

  async errorMessageModal() {

    const modal = await this.modalCtrl.create({
      component: ErrorMessageModalComponent,
      backdropDismiss: true,
      initialBreakpoint: 0.40,
      componentProps: {
        title: "Validação",
        message: "Tipo de armadilha é obrigatório!"
      }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    return;

  }

  async sucessoMessageModal() {

    const modal = await this.modalCtrl.create({
      component: SucessoMessageModalComponent,
      backdropDismiss: true,
      initialBreakpoint: 0.40,
      componentProps: {
        title: "Armadilhada",
        message: "Selecionada com sucesso"
      }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role == 'confirm'){
      return this.modalCtrl.dismiss('dismiss');
    }
      
    return true;

  }

  async selectArmadilha(armadilha:string){
    this.feromonio = false;
    this.luminosa = false;
    this.pontoIscaPermanente = false;
    this.tunel = false;

    this.tipo = armadilha;

    switch(armadilha) { 
      case 'feromonio': { 
         this.feromonio = true;
         this.descricaoArmadilha = "Feromônio";
         break; 
      } 
      case 'luminosa': { 
        this.luminosa = true;
        this.descricaoArmadilha = "Luminosa";
         break; 
      } 
      case 'pontoIscaPermanente': { 
        this.pontoIscaPermanente = true;
        this.descricaoArmadilha = "Ponto Isca Permanente";
        break; 
      } 
      case 'tunel': { 
        this.tunel = true;
        this.descricaoArmadilha = "Túnel";
        break; 
      } 
      default: { 
        this.tipo = "";
        this.descricaoArmadilha = "";
         break; 
      } 
    } 
    await this.getUltimaOrdemGrupo();
    await this.getUltimaOrdemArmadilha();
    await this.gerarQRCode();
  }

  async gerarQRCode(){
    this.qrCode = `${this.descricao}|${this.numeroOrdem}|${this.numeroOrdemGrupo}|${this.tipo}`;
  }

  async downloadQRCode(parent: FixMeLater){
    var parentElement = parent.qrcElement.nativeElement
        .querySelector("canvas")
        .toDataURL("image/png")

    if (parentElement) {
      // converts base 64 encoded image to blobData
      let blobData = this.sharedService.convertBase64ToBlob(parentElement)
      // saves as image
      const blob = new Blob([blobData], { type: "image/png" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      // name of the file
      link.download = "angularx-qrcode"
      link.click()
    }
  }

 
}
