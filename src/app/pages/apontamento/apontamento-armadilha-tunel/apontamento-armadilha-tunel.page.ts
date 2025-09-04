import { NgIf, NgFor, CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { HeaderComponent } from 'src/app/components/header/header/header.component';
import { ArmadilhaRespostaStatusTunelEnum } from 'src/app/enums/armadilha-respostas.enum';
import { ApontamentoArmadilhaRespostaInterface, CapituraInterface } from 'src/app/interfaces/ordem-servico.interface';
import { ComboInterface } from 'src/app/interfaces/shared.interface';
import { PhotoService } from 'src/app/services/photo.service';
import { SharedService } from 'src/app/services/shared.service';
import { ApontamentoArmadilhaTunelCapturaPage } from '../apontamento-armadilha-tunel-captura/apontamento-armadilha-tunel-captura.page';
import { LoaderModalComponent } from 'src/app/components/loader-modal/loader-modal.component';
import { OrdemServicoService } from 'src/app/services/orderm-servico.service';
import { ErrorMessageModalComponent } from 'src/app/components/modals/error-message-modal/error-message-modal.component';

@Component({
  selector: 'app-apontamento-armadilha-tunel',
  templateUrl: './apontamento-armadilha-tunel.page.html',
  styleUrls: ['./apontamento-armadilha-tunel.page.scss'],
  standalone: true,
  imports:[
    HeaderComponent,
    NgIf,
    NgFor,
    IonicModule,
    CommonModule,
    FormsModule,
    LoaderModalComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ApontamentoArmadilhaTunelPage implements OnInit {

  subscription!: Subscription;
  item!: ApontamentoArmadilhaRespostaInterface;
  statusOrdemServico: number = -1;
  status: string = "";
  base64:string | null = "";
  imagemBase64:string| null = "";
  capturas: CapituraInterface[] | null = [];
  statusArmadilha: string | string[] | null = "";
  ocorrencia: string | null = "";

  listStatusArmadilhaPIP: ComboInterface[] = [];

  codigoOrdemServico: number = -1;
  loader: boolean = false;
  loadingCaptura: boolean = false;

  constructor(
    private sharedService: SharedService,
    private modalCtrl: ModalController,
    private photoService: PhotoService,
    private ordemServicoService: OrdemServicoService,
    private changeDetectorRef: ChangeDetectorRef
    
  ) { }

  async ngOnInit() {
    
    await this.loadComboStatusArmadilha();

    this.status = this.item.status;
    this.statusArmadilha = await this.sharedService.convertStringToArray(this.item.status_armadilha);
    this.ocorrencia = this.item.ocorrencia;
    this.base64 = this.item.base64;
    this.imagemBase64 = `data:image/png;base64,${this.item.base64}`;

    
  }

  
  async ionViewDidEnter() {
    if(this.item.id_apontamento != null && this.item.id_apontamento != undefined)
      await this.loadCapturas();
    
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

  async statusArmadilhaSelected(item:any){
    this.statusArmadilha = item.detail.value; 
  }

  enumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
    return Object.keys(obj).filter(k => !Number.isNaN(k)) as K[]
  }

  async loadComboStatusArmadilha(){
    for (const tl of this.enumKeys(ArmadilhaRespostaStatusTunelEnum)) {
      var item: ComboInterface ={
          codigo: tl,
          descricao: ArmadilhaRespostaStatusTunelEnum[tl]
      }
      this.listStatusArmadilhaPIP.push(item);
      }
  }

  async getPhotoGallery() {
    try {
      var result = await this.photoService.getPhoto();
      this.base64 = `${result}`;
      this.imagemBase64 = `data:image/jpeg;base64,${this.base64}`;
      // this.subscription = this.photoService.emitGetImageCompressedCamera.subscribe(async (photo: any) => {
      // this.base64 = photo;
      // this.imagemBase64 = photo;
      // this.changeDetectorRef.markForCheck();     
      // this.subscription.unsubscribe();
      //});
    } catch (error) {
      this.base64 = "";
      this.imagemBase64 = "";
    }
  }

  async salvar(){
    this.loader = true;
    
    if (Array.isArray(this.statusArmadilha)) {
      this.item.status_armadilha = this.statusArmadilha.join(", ");
    }else{
      this.item.status_armadilha = this.statusArmadilha;
    }

    this.item.quantidade = 0;
    this.item.ocorrencia = this.ocorrencia;
    this.item.base64 = this.base64;
    this.item.status = "OK";

    var input: ApontamentoArmadilhaRespostaInterface = {
      id_ordem_servico: this.item.id_ordem_servico ,
      id_grupo: this.item.id_grupo,
      id_armadilha: this.item.id,
      ordem: this.item.ordem,
      tipo: this.item.tipo,
      descricao: this.item.descricao,
      status: this.item.status,
      status_armadilha: this.item.status_armadilha,
      quantidade: this.item.quantidade,
      capturas: this.item.capturas,
      ocorrencia: this.item.ocorrencia,
      base64: this.item.base64
}

    var result = await this.ordemServicoService.insertApontamento(input);
    if(!result.status){
      this.loader = false;
      this.errorMessageModal("Erro", "Não foi possível realizar o apontamento!");
      return;
    }

    this.item.id_apontamento = result.data.id;

    if(input.capturas == undefined ? 0 : input.capturas.length > 0){
      if(input.capturas == null)
        return;


      var capturaErro = false;

      input.capturas.forEach(async element => {
        var captura: CapituraInterface = {
          id_ordem_servico: this.item.id_ordem_servico ,
          id_apontamento: result.data.id,
          codigo: element.codigo,
          descricao: element.descricao,
          quantidade: element.quantidade
        }

        var resultCaptura = await this.ordemServicoService.insertApontamentoCaptura(captura);
        if(!resultCaptura.status){
          capturaErro = true;
        }
          
      });

      if(capturaErro){
        this.loader = false;
          this.errorMessageModal("Erro", "Não foi possível inserir a captura!");
          return;
      }
    }

      
    this.loader = false;
    this.dismiss();
  }

  remover(item:any){

  }

  async showCaptura(){ 
    const modal = await this.modalCtrl.create({
      component: ApontamentoArmadilhaTunelCapturaPage,
      componentProps: {
        item: this.item
      }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    await this.loadCapturasLocal();
    //await this.loadCapturas();
  }

  async errorMessageModal(title: string, message: string) {
  
      const modal = await this.modalCtrl.create({
        component: ErrorMessageModalComponent,
        backdropDismiss: true,
        initialBreakpoint: 0.40,
        componentProps: {
          title: title,
          message: message
        }
      });
      modal.present();
      const { data, role } = await modal.onWillDismiss();
      return;
  
    }

  async loadCapturas(){

    this.loadingCaptura = true;

    var response: any[] = [];
    var codigo_ordem_servico = this.item.id_ordem_servico == undefined ? -1 : this.item.id_ordem_servico;
    var codigo_apontamento = this.item.id_apontamento == undefined ? -1 : this.item.id_apontamento;
    await this.ordemServicoService.getListCaptura(codigo_ordem_servico, codigo_apontamento).then((data) => {
      if (data.status) 
        response = data.data;
    });

    if(response != null && response.length >0)
      this.capturas = response.filter((data) => {
        return (
          data.quantidade > 0
        )
      });

      this.loadingCaptura = false;
  }

  async loadCapturasLocal(){
    this.loadingCaptura = true;

    if(this.item.capturas != null && this.item.capturas.length >0)
      this.capturas = this.item.capturas.filter((data) => {
        return (
          data.quantidade > 0
        )
      });

      this.loadingCaptura = false;
  }
}
