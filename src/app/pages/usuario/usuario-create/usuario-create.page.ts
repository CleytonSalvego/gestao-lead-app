import { NgIf, NgFor, CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { HeaderComponent } from 'src/app/components/header/header/header.component';
import { LoaderModalComponent } from 'src/app/components/loader-modal/loader-modal.component';
import { ErrorMessageModalComponent } from 'src/app/components/modals/error-message-modal/error-message-modal.component';
import { SucessoMessageModalComponent } from 'src/app/components/modals/sucesso-message-modal/sucesso-message-modal.component';
import { InputUsuarioInterface, UsuarioEditarListInterface, UsuarioItemListInterface } from 'src/app/interfaces/usuario.interface';
import { SharedService } from 'src/app/services/shared.service';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-usuario-create',
  templateUrl: './usuario-create.page.html',
  styleUrls: ['./usuario-create.page.scss'],
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
export class UsuarioCreatePage implements OnInit {
  loader: boolean = false;
  showBackDrop: boolean = false;

  nome:string = "";
  numero: string = "";
  senha: string = "";
  ativo: boolean = true;
  tecnico: boolean = true;
  admin: boolean = false;

  editar: boolean = false;
  item!: UsuarioEditarListInterface;
  itemCodigo: number = -1;

  constructor(
    private sharedService: SharedService,
    private modalCtrl: ModalController,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit() {
    if(this.editar)
      this.carregaDadosItem();
  }
  

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    return this.modalCtrl.dismiss('confirm');
  }

  dismiss() {

    return this.modalCtrl.dismiss('dismiss');
  }

  async salvar(){

    var result = false;

    if(! this.validate()){
      await this.errorMessageModal("validação", "Número, Nome e Senha são obrigatórios!");
      return;
    }

    this.loader = true;

    if(this.editar){

      var update: UsuarioEditarListInterface = {
        id: this.itemCodigo,
        numero: this.numero,
        name: this.nome,
        tecnico: this.tecnico,
        admin: this.admin,
        ativo: this.ativo,
    }
      
      var updateInsert = await this.usuarioService.updateData(update);
      result = updateInsert.status;

    }else{

      var insert: InputUsuarioInterface = {
        numero: this.numero,
        name: this.nome,
        email: this.nome,
        password: this.senha,
        tecnico: this.tecnico,
        admin: this.admin,
        ativo: this.ativo
    }

      var resultInsert = await this.usuarioService.insertData(insert);
      result = resultInsert.status;
      if(result)
        this.itemCodigo = resultInsert.data.id;

    }

    if(!result){
      this.loader = false;
      await this.errorMessageModal("Erro", `Não foi possível ${this.editar ? "alterar" : "realizar"} o cadastro!`);
      return;
    }

    this.loader = false;
    await this.sucessoMessageModal();
    
    this.dismiss();
  }

  validate(){
    if(this.sharedService.isEmpty(this.numero)) return false;
    if(this.sharedService.isEmpty(this.nome)) return false;
    
    if(!this.editar)
      if(this.sharedService.isEmpty(this.senha)) return false;

    return true;
  }

  async errorMessageModal(titulo: string, message: string) {

    const modal = await this.modalCtrl.create({
      component: ErrorMessageModalComponent,
      backdropDismiss: true,
      initialBreakpoint: 0.40,
      componentProps: {
        title: titulo,
        message: message
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
        title: "Cadastro",
        message: `${this.editar == true ? "Atualizado" : "Realizado"} com sucesso.`
      }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role == 'confirm'){
      return this.modalCtrl.dismiss('dismiss');
    }
      
    return true;

  }

  async carregaDadosItem(){

    if(this.item == null || this.item == undefined)
      return;

    this.itemCodigo = this.item.id,
    this.nome = this.item.name,
    this.numero = this.item.numero,
    this.tecnico = this.item.tecnico,
    this.admin = this.item.admin,
    this.ativo = this.item.ativo

  }

  async selectTecnicoAdmin(tipo:string, event: any){

    switch(tipo) { 
      case 'tecnico': { 
        this.tecnico = event.detail.checked;
        this.admin = !event.detail.checked;
         break; 
      } 
      case 'admin': { 
        this.tecnico = !event.detail.checked;
        this.admin = event.detail.checked;
         break; 
      } 
      default: { 
        this.tecnico = false;
        this.admin = false;
         break; 
      } 
    } 
  }
  

}
