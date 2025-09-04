import { NgIf, NgFor, CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { HeaderComponent } from 'src/app/components/header/header/header.component';
import { LoaderModalComponent } from 'src/app/components/loader-modal/loader-modal.component';
import { ErrorMessageModalComponent } from 'src/app/components/modals/error-message-modal/error-message-modal.component';
import { OcorrenciaInterface, OrdemServicoItemListInterface } from 'src/app/interfaces/ordem-servico.interface';
import { OrdemServicoService } from 'src/app/services/orderm-servico.service';
import { PhotoService } from 'src/app/services/photo.service';

@Component({
  selector: 'app-apontamento-ocorrencia',
  templateUrl: './apontamento-ocorrencia.page.html',
  styleUrls: ['./apontamento-ocorrencia.page.scss'],
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
export class ApontamentoOcorrenciaPage implements OnInit {

  subscription!: Subscription;
  item!: OrdemServicoItemListInterface;
  descricao: string = "";
  base64:string  = "";
  imagemBase64:string| null = "";

  loader: boolean = false;

  constructor(
    private modalCtrl: ModalController,
    private photoService: PhotoService,
    private ordemServicoService: OrdemServicoService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
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

    if (this.descricao == "")
      this.dismiss();

    this.loader = true;
    
    var ocorrencia: OcorrenciaInterface = {
      id_ordem_servico: this.item.id,
      ordem: 1,
      descricao: this.descricao,
      base64: this.base64
    }

    var result = await this.ordemServicoService.insertOcorrencia(ocorrencia);

    if(!result.status){
      this.loader = false;
      await this.errorMessageModal("Erro", `Não foi possível inserir a ocorrência!`);
      return;
    }

    this.loader = false;
    this.dismiss();
  }

    async errorMessageModal(titulo: string, mensagem: string) {
  
      const modal = await this.modalCtrl.create({
        component: ErrorMessageModalComponent,
        backdropDismiss: true,
        initialBreakpoint: 0.40,
        componentProps: {
          title: titulo,
          message: mensagem
        }
      });
      modal.present();
      const { data, role } = await modal.onWillDismiss();
      return;
  
    }
}
