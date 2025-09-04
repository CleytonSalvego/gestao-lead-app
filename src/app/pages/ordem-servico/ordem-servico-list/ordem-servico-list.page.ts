import { NgIf, NgFor, CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { HeaderComponent } from 'src/app/components/header/header/header.component';
import { SearchItemComponent } from 'src/app/components/search/search-item/search-item.component';
import { ItemListComponent } from 'src/app/components/ordem-servico/item-list/item-list.component';
import { SharedService } from 'src/app/services/shared.service';
import { OrdemServicoService } from 'src/app/services/orderm-servico.service';
import { OrdemServicoCreatePage } from '../ordem-servico-create/ordem-servico-create.page';
import { OrdemServicoInsertInterface, OrdemServicoItemListInterface } from 'src/app/interfaces/ordem-servico.interface';
import { ApontamentoArmadilhaPage } from '../../apontamento/apontamento-armadilha/apontamento-armadilha.page';
import { SucessoMessageModalComponent } from 'src/app/components/modals/sucesso-message-modal/sucesso-message-modal.component';
import { SkeletonListComponent } from 'src/app/components/skeleton-list/skeleton-list.component';
import { ErrorMessageModalComponent } from 'src/app/components/modals/error-message-modal/error-message-modal.component';
import { LoaderModalComponent } from 'src/app/components/loader-modal/loader-modal.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ordem-servico-list',
  templateUrl: './ordem-servico-list.page.html',
  styleUrls: ['./ordem-servico-list.page.scss'],
  standalone: true,
  imports:[
    HeaderComponent,
    ItemListComponent,
    SearchItemComponent,
    SkeletonListComponent,
    LoaderModalComponent,
    NgIf,
    NgFor,
    IonicModule,
    CommonModule,
    FormsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OrdemServicoListPage implements OnInit {

  showBackDrop: boolean = false;
  list: OrdemServicoInsertInterface[] = [];
  results: OrdemServicoInsertInterface[] = [];
  loaded: boolean = false;
  loading: boolean = false;
  currentFiltro: string = "HOJE";
  

  constructor(
    private sharedService: SharedService,
    private modalCtrl: ModalController,
    private ordemServicoService: OrdemServicoService
  ) { }

  ngOnInit() {

  }

  async ionViewDidEnter() {
    await this.sharedService.setTitle("Ordem de Serviço");
    await this.sharedService.adjustTop();
    await this.sharedService.showSideMenu();
    await this.loadHoje();

  }

  async loadData() {
    this.currentFiltro = "TODOS";
    this.loaded = false;
    
    var response: any[] = [];

    await this.ordemServicoService.getList().then((data) => {
      if (data && data.data.data.length > 0) 
        response = data.data.data;
    });

    if (response == null || !response) {
      this.loaded = true;
      return;
    }

    // response.forEach(element => {
    //   element.data = this.sharedService.formatFilterDateListagem(element.data);
    //   element.local = this.sharedService.isEmpty(element.local) ? "" : element.local;
    // });
      
    this.list = response;
    this.results = this.list;
    this.loaded = true;
  }

  async loadHoje(){
    this.currentFiltro = "HOJE";
    this.loaded = false;
    
    var response: any[] = [];
    var today = this.sharedService.formatFilterDateCalendar(new Date().toISOString());
    await this.ordemServicoService.getListByToday(today.toString()).then((data) => {
        if (data && data.data.length > 0) 
          response = data.data;
    });

    if (response == null || !response) {
      this.loaded = true;
      return;
    }
   
    this.list = response;
    this.results = this.list;
    this.loaded = true;
  }
  

  handleInput(event: any) {

    this.results = [...this.list];
    const query = event.target.value.toLowerCase();

    this.results = this.list.filter((data) => {
      return (
        data.descricao_empresa.toLowerCase().includes(query) ||
        data.descricao_tecnico.toLowerCase().includes(query) 
      )
    });
  }

  async showCreate() {

    const modal = await this.modalCtrl.create({
      component: OrdemServicoCreatePage,
      componentProps: {
        
      }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    
    if(this.currentFiltro == "HOJE"){
      await this.loadHoje();
    }else{
      await this.loadData();
    }

  }

  async remover(item:any){

    this.loading = true;

    var response = await this.ordemServicoService.remove(item.id);

    if(response.status == false){
      this.errorMessageModal("validação", "Não foi possível remover esta OS.");
      this.loading = false;
      return;
    }

    this.loading = false;
    this.sucessoMessageModal(item.id);
    this.loadData();

  }

  async editar(item:any){

    const modal = await this.modalCtrl.create({
      component: OrdemServicoCreatePage,
      componentProps: {
        editar: true,
        item: item
      }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    this.loadData();
  }

  async showApontamento(item:any){
    const modal = await this.modalCtrl.create({
      component: ApontamentoArmadilhaPage,
      componentProps: {
        item: item
      }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    this.loadData();

  }

  async handleRefresh(event: any) {

    if(this.currentFiltro == "HOJE"){
      await this.loadHoje();
    }else{
      await this.loadData();
    }
    
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
  
  async sucessoMessageModal(codigo: number) {

    const modal = await this.modalCtrl.create({
      component: SucessoMessageModalComponent,
      backdropDismiss: true,
      initialBreakpoint: 0.40,
      componentProps: {
        title: `Ordem Serviço: ${codigo}`,
        message: `Removida com sucesso.`
      }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
      
    return true;

  }

}
