import { NgFor, NgIf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HeaderComponent } from 'src/app/components/header/header/header.component';
import { SearchItemComponent } from 'src/app/components/search/search-item/search-item.component';
import { ItemListComponent } from 'src/app/components/tecnico/item-list/item-list.component';
import { SharedService } from 'src/app/services/shared.service';
import { UsuarioCreatePage } from '../usuario-create/usuario-create.page';
import { UsuarioService } from 'src/app/services/usuario.service';
import { InputUsuarioInterface, UsuarioEditarListInterface } from 'src/app/interfaces/usuario.interface';
import { SkeletonListComponent } from 'src/app/components/skeleton-list/skeleton-list.component';
import { ErrorMessageModalComponent } from 'src/app/components/modals/error-message-modal/error-message-modal.component';
import { SucessoMessageModalComponent } from 'src/app/components/modals/sucesso-message-modal/sucesso-message-modal.component';

@Component({
  selector: 'app-usuario-list',
  templateUrl: './usuario-list.page.html',
  styleUrls: ['./usuario-list.page.scss'],
  standalone: true,
  imports:[
    HeaderComponent,
    ItemListComponent,
    SearchItemComponent,
    SkeletonListComponent,
    NgIf,
    NgFor
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class UsuarioListPage implements OnInit {

  showBackDrop: boolean = false;
  list: UsuarioEditarListInterface[] = [];
  results: UsuarioEditarListInterface[] = [];
  loaded: boolean = false;

  constructor(
    private sharedService: SharedService,
    private modalCtrl: ModalController,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit() {

  }

  async ionViewDidEnter() {
    await this.sharedService.setTitle("Usuários");
    await this.sharedService.adjustTop();
    await this.sharedService.showSideMenu();
    await this.loadData();

  }

  async loadData() {
    this.loaded = false;
    
    var response: any[] = [];

    await this.usuarioService.getList().then((data) => {
      if (data.status) 
        response = data.data.data;
    });

    if (response == null || !response) {
      this.loaded = true;
      return;
    }

    response.forEach(element => {
      element.created_at = this.sharedService.formatFilterDateListagem(element.created_at);
    });
      
    this.list = response;
    this.results = this.list;
    this.loaded = true;
  }
  

  handleInput(event: any) {

    this.results = [...this.list];
    const query = event.target.value.toLowerCase();

    this.results = this.list.filter((data) => {
      return (
        data.name.toLowerCase().includes(query)
      )
    });
  }

  async showCreate() {

    const modal = await this.modalCtrl.create({
      component: UsuarioCreatePage,
      componentProps: {
        
      }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    //if (role != 'confirm') return;
    this.loadData();

  }

  async ativar(codigo: number){
    await this.usuarioService.updateAtivo(codigo, true);
    this.loadData();
  }

  async desativar(codigo: number){
    await this.usuarioService.updateAtivo(codigo, false);
    this.loadData();
  }

   async remover(codigo: number){
    var response = await this.usuarioService.remove(codigo);
    if(response == null){
      await this.errorMessageModal("Excluir", "Houve um erro ao tentar excluir o dado!");
      return;
    }

    await this.sucessoMessageModal("Excluir", "Dado excluído com sucesso!");
    let index = this.results.findIndex((element: any) => element.id === codigo);
    this.results.splice(index, 1);

    //this.loadData();
  }

  async editar(item:any){
    const modal = await this.modalCtrl.create({
      component: UsuarioCreatePage,
      componentProps: {
        editar: true,
        item: item
      }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    this.loadData();
  }

  async handleRefresh(event: any) {
    await this.loadData();
    event.target.complete();
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
    
      async sucessoMessageModal(title:string, mensagem:string) {
    
        const modal = await this.modalCtrl.create({
          component: SucessoMessageModalComponent,
          backdropDismiss: true,
          initialBreakpoint: 0.40,
          componentProps: {
            title: title,
            message: mensagem
          }
        });
        modal.present();
        const { data, role } = await modal.onWillDismiss();
        if (role == 'confirm'){
          return this.modalCtrl.dismiss('dismiss');
        }
          
        return true;
    
      }

}
