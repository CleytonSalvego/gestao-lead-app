import { NgIf, NgFor, CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { HeaderComponent } from 'src/app/components/header/header/header.component';
import { LoaderModalComponent } from 'src/app/components/loader-modal/loader-modal.component';
import { ErrorMessageModalComponent } from 'src/app/components/modals/error-message-modal/error-message-modal.component';
import { ArmadilhaRespostaStatusLuminosaEnum } from 'src/app/enums/armadilha-respostas.enum';
import { ApontamentoArmadilhaRespostaInterface } from 'src/app/interfaces/ordem-servico.interface';
import { ComboInterface } from 'src/app/interfaces/shared.interface';
import { OrdemServicoService } from 'src/app/services/orderm-servico.service';
import { PhotoService } from 'src/app/services/photo.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-apontamento-armadilha-luminosa',
  templateUrl: './apontamento-armadilha-luminosa.page.html',
  styleUrls: ['./apontamento-armadilha-luminosa.page.scss'],
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
export class ApontamentoArmadilhaLuminosaPage implements OnInit {

  subscription!: Subscription;
  item!: ApontamentoArmadilhaRespostaInterface;
  statusOrdemServico: number = -1;
  status: string = "";
  base64:string | null = "";
  imagemBase64:string| null = "";

  statusArmadilha: string | string[] | null = "";
  quantidadeInsetoscapturados: number | null = 0;
  ocorrencia: string | null = "";

  listStatusArmadilhaPIP: ComboInterface[] = [];

  codigoOrdemServico: number = -1;
  loader: boolean = false;

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
    this.quantidadeInsetoscapturados = this.item.quantidade;
    this.ocorrencia = this.item.ocorrencia;
    this.base64 = this.item.base64;
    this.imagemBase64 = `data:image/png;base64,${this.item.base64}`;
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
    for (const tl of this.enumKeys(ArmadilhaRespostaStatusLuminosaEnum)) {
      var item: ComboInterface ={
          codigo: tl,
          descricao: ArmadilhaRespostaStatusLuminosaEnum[tl]
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
    this.item.quantidade = this.quantidadeInsetoscapturados;
    this.item.capturas = null;
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
      
    this.loader = false;
    this.dismiss();
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

}
