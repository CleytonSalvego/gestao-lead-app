import { NgIf, NgFor, CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, IonModal, ModalController } from '@ionic/angular';
import { HeaderComponent } from 'src/app/components/header/header/header.component';
import { ErrorMessageModalComponent } from 'src/app/components/modals/error-message-modal/error-message-modal.component';
import { SucessoMessageModalComponent } from 'src/app/components/modals/sucesso-message-modal/sucesso-message-modal.component';
import { EmpresaMapaItemListInterface } from 'src/app/interfaces/empresa.interface';
import { ApontamentoArmadilhaListInterface, ApontamentoArmadilhaRespostaInterface, OcorrenciaInterface, OrdemServicoItemListInterface } from 'src/app/interfaces/ordem-servico.interface';
import { SharedService } from 'src/app/services/shared.service';
import { ApontamentoArmadilhaPipPage } from '../apontamento-armadilha-pip/apontamento-armadilha-pip.page';
import { OrdemServicoService } from 'src/app/services/orderm-servico.service';
import { ApontamentoArmadilhaLuminosaPage } from '../apontamento-armadilha-luminosa/apontamento-armadilha-luminosa.page';
import { ApontamentoArmadilhaFeromonioPage } from '../apontamento-armadilha-feromonio/apontamento-armadilha-feromonio.page';
import { ApontamentoArmadilhaTunelPage } from '../apontamento-armadilha-tunel/apontamento-armadilha-tunel.page';
import { ApontamentoOcorrenciaPage } from '../apontamento-ocorrencia/apontamento-ocorrencia.page';
import { LoaderModalComponent } from 'src/app/components/loader-modal/loader-modal.component';
import { Filesystem, Directory, WriteFileOptions } from '@capacitor/filesystem';
import { FileOpener, FileOpenerOptions } from '@capacitor-community/file-opener';
import { BackgroundTask } from '@capawesome/capacitor-background-task';

@Component({
  selector: 'app-apontamento-armadilha',
  templateUrl: './apontamento-armadilha.page.html',
  styleUrls: ['./apontamento-armadilha.page.scss'],
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
export class ApontamentoArmadilhaPage implements OnInit {

  @ViewChild(IonModal) modal!: IonModal;
  isModalOpen:boolean = false;
  imageSrc: string | any = "";
  ModalTitle: string = "";

  nome:string = "";
  numero: string = "";
  ativo: boolean = true;

  item!: OrdemServicoItemListInterface;
  listArmadilha: ApontamentoArmadilhaListInterface[] = [];
  listOcorrencia: OcorrenciaInterface[] = [];
  listMapa: EmpresaMapaItemListInterface[] = [];

  loadingArmadilha: boolean = false;
  loadingOcorrencia: boolean = false;
  loadingMapa: boolean = false;

  loader: boolean = false;
  tipoArquivo:string = "jpeg";
  
  private file: File | undefined;

  private taskId: string | null = null;
  
  constructor(
    private sharedService: SharedService,
    private modalCtrl: ModalController,
    private ordemServicoService: OrdemServicoService
  ) { }

  async ngOnInit() {
    await this.loadData();
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

  async loadData(){

    this.loadingArmadilha = true;
    this.loadingOcorrencia = true;
    this.loadingMapa = true;

    await this.loadArmadilhas();
    this.loadingArmadilha = false;

    await this.loadOcorrencias();
    this.loadingOcorrencia = false;

    await this.loadMapas();
    this.loadingMapa = false;

  }

  async loadArmadilhas(){

    var grupos: any[] = [];
    var codigo_ordem_servico = this.item.id == undefined ? -1 : this.item.id;

    var armadilhas = await this.ordemServicoService.getListArmadilha(codigo_ordem_servico);
    if(armadilhas.status && armadilhas.data.length > 0){
      grupos = armadilhas.data;
    }

    if(grupos.length > 0){
      grupos.forEach(async element => {

        if(element.armadilhas == null || element.armadilhas == undefined)
          element.armadilhas = [];

        var itens = await this.ordemServicoService.getListArmadilhaItens(element.id, codigo_ordem_servico);
        if(itens.status && itens.data.length > 0){

          // itens.data.forEach((armadilhaItens: any) => {
          //   armadilhaItens =  this.sharedService.convertStringToArray(armadilhaItens.status_armadilha);
          // })

          element.armadilhas = itens.data;
        }
      });
    }

   this.listArmadilha = grupos;
   this.item.armadilhas = grupos;
  }

  async loadOcorrencias(){
    var codigo_ordem_servico = this.item.id == undefined ? -1 : this.item.id;
    var list = await this.ordemServicoService.getListOcorrencias(codigo_ordem_servico);
      if(list.status && list.data.length > 0){
        this.listOcorrencia = list.data;
        this.item.ocorrencias = list.data;
      }else{
        this.listOcorrencia = [];
        this.item.ocorrencias = [];
      }
  }

  async loadMapas(){
    var codigo_ordem_servico = this.item.id == undefined ? -1 : this.item.id;
    var list = await this.ordemServicoService.getListMapas(codigo_ordem_servico);
      if(list.status && list.data.length > 0){
        this.listMapa = list.data;
        this.item.mapas = list.data;
      }
   } 

  async salvar(){

    this.loader = true;

    var codigo_ordem_servico = this.item.id == undefined ? -1 : this.item.id;
    var result = await this.ordemServicoService.updateStatus(codigo_ordem_servico, 2, 'Andamento');

    if(!result.status){
      this.loader = false;
      await this.errorMessageModal("Erro", "Não foi possível salvar esta OS!");
      return;
    }
 
    this.loader = false;
    await this.sucessoMessageModal("", "OS salva com sucesso!");
  }

  async finalizar(){

    this.loader = true;

    var codigo_ordem_servico = this.item.id == undefined ? -1 : this.item.id;
    var result = await this.ordemServicoService.updateStatus(codigo_ordem_servico, 3, 'Concluído');

    if(!result.status){
      this.loader = false;
      await this.errorMessageModal("Erro", "Não foi possível finalizar esta OS!");
      return;
    }

    //Gera e envia o documento do apontamento por email
    this.startBackgroundTask(codigo_ordem_servico);
 
    this.loader = false;
    await this.sucessoMessageModal("", "OS finalizada com sucesso!");
    this.dismiss();
  }

  validate(){
    if(this.sharedService.isEmpty(this.nome))
      return false;

    return true;
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

  async sucessoMessageModal(title: string, message: string) {

    const modal = await this.modalCtrl.create({
      component: SucessoMessageModalComponent,
      backdropDismiss: true,
      initialBreakpoint: 0.40,
      componentProps: {
        title: title,
        message: message
      }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    return this.modalCtrl.dismiss('dismiss');
      
  }

  async realizarAPontamento(item:ApontamentoArmadilhaRespostaInterface){

    switch(item.tipo) { 
      case 'feromonio': { 
         await this.apontamentoFeromonio(item);
         break; 
      } 
      case 'luminosa': { 
        await this.apontamentoLuminosa(item);
         break; 
      } 
      case 'pontoIscaPermanente': { 
        await this.apontamentoPontoIscaPermanente(item);
        break; 
      } 
      case 'tunel': { 
        await this.apontamentoTunel(item);
        break; 
      } 
      default: { 
         break; 
      } 
    } 

  }

  async apontamentoFeromonio(item:ApontamentoArmadilhaRespostaInterface){ 

    const modal = await this.modalCtrl.create({
      component: ApontamentoArmadilhaFeromonioPage,
      componentProps: {
        item: item,
        status: this.item.status,
        statusOrdemServico: this.item.status,
        codigoOrdemServico: this.item.id
      }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    //await this.updateData();
  }

  async apontamentoTunel(item:ApontamentoArmadilhaRespostaInterface){ 
    const modal = await this.modalCtrl.create({
      component: ApontamentoArmadilhaTunelPage,
      componentProps: {
        item: item,
        statusOrdemServico: this.item.status,
        status: this.item.status,
        codigoOrdemServico: this.item.id
      }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    //await this.updateData();
  }


  async apontamentoLuminosa(item:ApontamentoArmadilhaRespostaInterface){ 
    const modal = await this.modalCtrl.create({
      component: ApontamentoArmadilhaLuminosaPage,
      componentProps: {
        item: item,
        status: this.item.status,
        statusOrdemServico: this.item.status,
        codigoOrdemServico: this.item.id
      }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    //await this.updateData();
  }


  async apontamentoPontoIscaPermanente(item:ApontamentoArmadilhaRespostaInterface){
    const modal = await this.modalCtrl.create({
      component: ApontamentoArmadilhaPipPage,
      componentProps: {
        item: item,
        status: this.item.status,
        statusOrdemServico: this.item.status,
        codigoOrdemServico: this.item.id
      }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    //await this.updateData();
  }

  async updateData(){
    var list: OrdemServicoItemListInterface[] = [];

    var response = await this.ordemServicoService.getList();
    if(response != null)
      list = [...response];

    var status = this.item.status == 1 ? 2 : this.item.status;

    let index = list.findIndex((element: any) => element.codigo === this.item.id)
    if(list[index] != null && list[index] != undefined){
      list[index].armadilhas = this.listArmadilha;
      list[index].ocorrencias = this.listOcorrencia;
      list[index].status = status;
      list[index].statusDescricao = this.obtemDescricaoStatus(status);
    }

    //this.ordemServicoService.insertData(list);
  }


  async ocorrencia(){
    const modal = await this.modalCtrl.create({
      component: ApontamentoOcorrenciaPage,
      componentProps: {
        item: this.item,
        codigoOrdemServico: this.item.id
      }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();

    this.loadingOcorrencia = true;
    await this.loadOcorrencias();
    this.loadingOcorrencia = false;
  }

  async removerOcorrencia(item:any){

    this.loader = true;

    var result = await this.ordemServicoService.removeOcorrencia(item.id);
    if(!result.status){
      this.loader = false;
      this.errorMessageModal("Erro", "Não foi possível remover a ocorrência!");
      return;
    }
      
    this.loader = false;
    this.loadingOcorrencia = true;
    await this.loadOcorrencias();
    this.loadingOcorrencia = false;
  }

  obtemDescricaoStatus(status:number): string{

    switch(status) { 
      case 1: { 
         return 'Pendente';
         break; 
      } 
      case 2: { 
        return 'Andamento';
         break; 
      } 
      case 3: { 
        return 'Concluído';
        break; 
      } 
      default: { 
        return 'Pendente';
        break; 
      } 
    } 

  }

  async setOpen(item:any, isOpen: boolean) {

    if(!isOpen){
      this.imageSrc = "";
      this.ModalTitle = "";
      this.isModalOpen = false;
      this.modal.dismiss(null, 'cancel');
      return;
    }

    if(item.filePath != "pdf"){
      var foto = "";
      if (!item.base64.includes('data:image/jpeg;base64,')){
        foto = `data:image/jpeg;base64,${item.base64}`;
      }else{
        foto = item.base64;
      }
        
      this.tipoArquivo = "jpeg";
      this.ModalTitle = item.descricao;
      this.imageSrc = foto;
      this.isModalOpen = isOpen;
    }else{
      if(item.base64 != ""){
        const writeOptions: WriteFileOptions = 
        {
            path: `arquivo.pdf`,
            directory: Directory.Cache,
            data: item.base64
        }
    
        const writeResult = await Filesystem.writeFile(writeOptions);
        const options: FileOpenerOptions = 
        {
            filePath: writeResult.uri,
            contentType: "application/pdf",
            openWithDefault: true,
        };
        await FileOpener.open(options);
      }
    }
  }

  obtemDescricaoStatusArmadilha(status: string | string[] | null){

    if (typeof status !== "string" || status == null) {
      return 'N/A';
    }

    var listStatus = status.split(",").map(item => item.trim());
    var result = '';

   if(listStatus.length == 0)
    return 'N/A';


    listStatus.forEach((element: any) => {
      var descricao = this.obtemDescricao(element);
      if(result == ''){
        result = descricao; 
      }else{
        result = result + ', ' + descricao;
      }
    });
    

   return result;
    
  }

  obtemDescricao(status: string){
    switch (status) {

      case "ControleMariposa": return "Controle Mariposa";
      case "ControleCarunchos": return "Controle Carunchos";
      case "Ausente": return "Ausente";
      case "Subistituida": return "Substituída";
      case "RetiradaReverMapeamento": return "Retirada Rever Mapeamento";
      case "Quebrada": return "Quebrada";
      case "NecessitaLimpeza": return "Necessário Limpeza";
      case "SemAcesso": return "Sem Acesso";
      case "IscaAusente": return "Isca Ausente";
      case "IscaDeteriorada": return "Isca Deteriorada";
      case "IscaRoida": return "Isca Roída";
      case "IscaIntacta": return "Isca Intacta";
      case "RefilAusente": return "Refil Ausente";
      case "UmaLampadaQueimada": return "1 Lâmpada Queimada";
      case "DuasLampadasOuRotorQueimado": return "2 Lâmpadas ou Rotor Queimado";
      default: return 'N/A';
    }

  }

  async startBackgroundTask(codigo: number) {
    this.taskId = await BackgroundTask.beforeExit(async () => {
      try {
        this.ordemServicoService.enviarApontamentoEmail(codigo);
      } catch (error) {
      }
      // Finaliza a tarefa em background
      BackgroundTask.finish({ taskId: this.taskId! });
    });
  }

}
