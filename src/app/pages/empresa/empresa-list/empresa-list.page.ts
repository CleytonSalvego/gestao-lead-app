import { NgIf, NgFor } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HeaderComponent } from 'src/app/components/header/header/header.component';
import { SearchItemComponent } from 'src/app/components/search/search-item/search-item.component';
import { ItemListComponent } from 'src/app/components/empresa/item-list/item-list.component';
import { SharedService } from 'src/app/services/shared.service';
import { EmpresaItemListInterface } from 'src/app/interfaces/empresa.interface';
import { EmpresaCreatePage } from '../empresa-create/empresa-create.page';
import { EmpresaService } from 'src/app/services/empresa.service';
import { SkeletonListComponent } from 'src/app/components/skeleton-list/skeleton-list.component';
import { ErrorMessageModalComponent } from 'src/app/components/modals/error-message-modal/error-message-modal.component';
import { SucessoMessageModalComponent } from 'src/app/components/modals/sucesso-message-modal/sucesso-message-modal.component';

@Component({
  selector: 'app-empresa-list',
  templateUrl: './empresa-list.page.html',
  styleUrls: ['./empresa-list.page.scss'],
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
export class EmpresaListPage implements OnInit {

  showBackDrop: boolean = false;
  list: EmpresaItemListInterface[] = [];
  results: EmpresaItemListInterface[] = [];
  loaded: boolean = false;

  constructor(
    private sharedService: SharedService,
    private modalCtrl: ModalController,
    private empresaService: EmpresaService
  ) { }

  ngOnInit() {

  }

  async ionViewDidEnter() {
    await this.sharedService.setTitle("Empresas");
    await this.sharedService.adjustTop();
    await this.sharedService.showSideMenu();
    await this.loadData();

  }

  async loadData() {
    this.loaded = false;
    var response: any[] = [];
    await this.empresaService.getList().then((data) => {
      if (data.status) 
        response = data.data.data;
    });

    if (response == null || !response) {
      this.loaded = true;
      return;
    }

    response.forEach(element => {
      element.created_at = this.sharedService.formatFilterDateListagem(element.created_at);
      element.razaoSocial = this.sharedService.isEmpty(element.razao_social) ? "" : element.razao_social;
      element.telefone = this.sharedService.isEmpty(element.telefone) ? "" : element.telefone;
      element.email = this.sharedService.isEmpty(element.email)  ? "" : element.email;
      element.responsavel = this.sharedService.isEmpty(element.responsavel) ? "" : element.responsavel;
      element.logradouro = this.sharedService.isEmpty(element.logradouro) ? "" : element.logradouro;
      element.numero = this.sharedService.isEmpty(element.numero) ? "" : element.numero;
      element.bairro = this.sharedService.isEmpty(element.bairro) ? "" : element.bairro;
      element.complemento = this.sharedService.isEmpty(element.complemento) ? "" : element.complemento;
      element.cidade = this.sharedService.isEmpty(element.cidade) ? -1 : element.cidade;
      element.cidadeDescricao = this.sharedService.isEmpty(element.cidadeDescricao) ? "" : element.cidadeDescricao;
      element.estado = this.sharedService.isEmpty(element.estado) ? -1 : element.estado;
      element.estadoDescricao = this.sharedService.isEmpty(element.estadoDescricao) ? "" : element.estadoDescricao;
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
        data.cnpj.toLowerCase().includes(query) ||
        data.razao_social.toLowerCase().includes(query) 
      )
    });
  }

  async showCreate() {

    const modal = await this.modalCtrl.create({
      component: EmpresaCreatePage,
      componentProps: {
        
      }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    //if (role != 'confirm') return;
    this.loadData();

  }

  formataEndereco(item:any){
    return `${item.logradouro}, ${item.numero}, ${item.bairro}, ${item.complemento}, ${item.cidadeDescricao} - ${item.estadoDescricao}`;
  }

  async editar(item:any){

    const modal = await this.modalCtrl.create({
      component: EmpresaCreatePage,
      componentProps: {
        editar: true,
        item: item
      }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    //if (role != 'confirm') return;
    this.loadData();
  }

  async remover(codigo: number|undefined){
    var response = await this.empresaService.remove(codigo);
    if(response == null){
      await this.errorMessageModal("Excluir", "Houve um erro ao tentar excluir o dado!");
      return;
    }

    await this.sucessoMessageModal("Excluir", "Dado excluído com sucesso!");
    let index = this.results.findIndex((element: any) => element.id === codigo);
    this.results.splice(index, 1);

    //this.loadData();
  }

  async ativar(codigo: number|undefined){
    await this.empresaService.updateAtivo(codigo, true);
    this.loadData();
  }

  async desativar(codigo: number|undefined){
    await this.empresaService.updateAtivo(codigo, false);
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
