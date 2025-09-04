import { NgIf, NgFor, CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { HeaderComponent } from 'src/app/components/header/header/header.component';
import { ErrorMessageModalComponent } from 'src/app/components/modals/error-message-modal/error-message-modal.component';
import { EmpresaMapaItemListInterface } from 'src/app/interfaces/empresa.interface';
import { PhotoService } from 'src/app/services/photo.service';
import { SharedService } from 'src/app/services/shared.service';


@Component({
  selector: 'app-empresa-mapa',
  templateUrl: './empresa-mapa.page.html',
  styleUrls: ['./empresa-mapa.page.scss'],
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
export class EmpresaMapaPage implements OnInit {

  subscription!: Subscription;
  
  numeroOrdem: number = 1;
  descricao: string = "";
  base64:string = "";
  imagemBase64:string = "";

  listMapa: EmpresaMapaItemListInterface[] = [];

  ultimaOrdem: number = 1;

  filePath: string = '';
  fileName: string = '';
  file: any;
  
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  constructor(
    private sharedService: SharedService,
    private modalCtrl: ModalController,
    private photoService: PhotoService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.ultimaOrdem = Math.max(...this.listMapa.map((o: EmpresaMapaItemListInterface) => o.ordem));

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

    return this.modalCtrl.dismiss( this.listMapa, 'dismiss');
  }

  async salvar(){

    if(! this.validate()){
      await this.errorMessageModal();
      return;
    }

    var item: EmpresaMapaItemListInterface = {
      id: -1,
      ordem: this.numeroOrdem,
      descricao : this.descricao,
      base64: this.base64,
      fileName: this.fileName,
      filePath : this.filePath
    }

    this.listMapa.push(item);

    this.dismiss();
  }

  validate(){
    if(this.sharedService.isEmpty(this.descricao))
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
        message: "Ordem e Descrição são obrigatórios!"
      }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    return;

  }


  async getPhotoCamera() {
    try {
      var result = await this.photoService.getPhoto();
      this.base64 = `${result}`;
      this.imagemBase64 = `data:image/jpeg;base64,${this.base64}`;

      this.fileName = '';
      this.filePath = 'jpeg';

    } catch (error) {
      this.base64 = "";
      this.imagemBase64 = "";
    }
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  handleFileSelection(event: any) {
    this.file = event.target.files[0];
    if (this.file && this.file.type === 'application/pdf') {
      this.fileName = this.file.name;
      this.filePath = 'pdf';
      const reader = new FileReader();
      reader.onload = () => {
        this.base64 = (reader.result as string).split(',')[1];
      };
      
      reader.readAsDataURL(this.file);
    } 

    this.imagemBase64 = "";
  }

  

}
