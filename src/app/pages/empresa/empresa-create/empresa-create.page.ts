import { NgIf, NgFor, CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, IonModal, ModalController } from '@ionic/angular';
import { HeaderComponent } from 'src/app/components/header/header/header.component';
import { ErrorMessageModalComponent } from 'src/app/components/modals/error-message-modal/error-message-modal.component';
import { SucessoMessageModalComponent } from 'src/app/components/modals/sucesso-message-modal/sucesso-message-modal.component';
import { SearchableSelectComponent } from 'src/app/components/select/searchable-select/searchable-select.component';
import { EmpresaArmadilhaListInterface, EmpresaInsertArmadilhaGrupoInterface, EmpresaInsertArmadilhaGrupoItemInterface, EmpresaItemListInterface, EmpresaMapaItemListInterface } from 'src/app/interfaces/empresa.interface';
import { EmpresaService } from 'src/app/services/empresa.service';
import { SharedService } from 'src/app/services/shared.service';
import { EmpresaArmadilhaPage } from '../empresa-armadilha/empresa-armadilha.page';
import { EmpresaMapaPage } from '../empresa-mapa/empresa-mapa.page';
import { CidadesInterface, EstadosInterface } from 'src/app/interfaces/shared.interface';
import { LoaderModalComponent } from 'src/app/components/loader-modal/loader-modal.component';
import { Filesystem, Directory, WriteFileOptions } from '@capacitor/filesystem';
import { FileOpener, FileOpenerOptions } from '@capacitor-community/file-opener';

@Component({
  selector: 'app-empresa-create',
  templateUrl: './empresa-create.page.html',
  styleUrls: ['./empresa-create.page.scss'],
  standalone: true,
  imports:[
    HeaderComponent,
    SearchableSelectComponent,
    NgIf,
    NgFor,
    IonicModule,
    CommonModule,
    FormsModule,
    LoaderModalComponent

  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EmpresaCreatePage implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;

  loader: boolean = false;
  loaderMapa: boolean = false;
  loaderArmadilha: boolean = false;

  isModalOpen:boolean = false;
  imageSrc: string | any = "";
  ModalTitle: string = "";

  inputBlock = false;
  showBackDrop: boolean = false;
  isAndroid = true;

  editar: boolean = false;
  item!: EmpresaItemListInterface;
  itemCodigo: number|undefined = -1;

  cnpj: string = "";
  razaoSocial: string = "";
  telefone: string = "";
  email: string = "";
  responsavel: string = "";
  logradouro: string = "";
  numero: string = "";
  bairro: string = "";
  complemento: string = "";
  cidade: number = -1;
  cidadeDescricao: string = "";
  listCidade: CidadesInterface[] = [];
  estado: number|any = -1;
  estadoDescricao: string = "";
  listEstado: EstadosInterface[] = [];
  ativo: boolean = true;

  listArmadilha: EmpresaArmadilhaListInterface[] = [];
  listMapa: EmpresaMapaItemListInterface[] = [];

  validacao: boolean = true;

  showArmadilhas: boolean = false;
  showMapas: boolean = false;

  tipoArquivo:string = "jpeg";
  constructor(
    private sharedService: SharedService,
    private modalCtrl: ModalController,
    private empresaService: EmpresaService
  ) { }

  async ngOnInit() {


    this.loader = true;
    this.loaderArmadilha = true;
    this.loaderMapa = true;

    var estados = await this.sharedService.getEstados();
    this.listEstado = estados;
    await this.ordenarListaDescricao(this.listEstado);

    // this.estado = 35;
    // this.estadoDescricao = "São Paulo";

    var cidades = await this.sharedService.getCidades(this.estado);
    this.listCidade = cidades;
    await this.ordenarListaDescricao(this.listCidade);

    // if(this.editar){
    //   await this.carregaDadosItem();
    //   await this.loadArmadilhas();
    // }
     

    if(!this.editar){
      this.estado = "35";
      this.estadoDescricao = "São Paulo";

      var cidades = await this.sharedService.getCidades(this.estado);
      this.listCidade = cidades;
      await this.ordenarListaDescricao(this.listCidade);

      this.cidade = 3524402;
      this.cidadeDescricao = "Jacareí";

    }else{
      this.cidade = this.sharedService.isEmpty(this.item.cidade) ? -1 : this.item.cidade;
      this.cidadeDescricao = this.sharedService.isEmpty(this.item.cidadeDescricao) ? "" : this.item.cidadeDescricao;
      this.estado = this.sharedService.isEmpty(this.item.estado) ? -1 : this.item.estado;
      this.estadoDescricao = this.sharedService.isEmpty(this.item.estadoDescricao) ? "" : this.item.estadoDescricao;
    }

  }

  async ionViewDidEnter() {
    this.loader = true;
    this.loaderArmadilha = true;
    this.loaderMapa = true;

    if(this.editar){
      await this.carregaDadosItem();
      this.loader = false;
      await this.loadArmadilhas();
      this.loaderArmadilha = false;
      await this.loadMapas();
      this.loaderMapa = false;

    }

    this.loader = false;
    this.loaderArmadilha = false;
    this.loaderMapa = false;

    
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

  async salvar(tipo: boolean = false){
    var result = false;

    if(! this.validate()){
      this.validacao = false;
      await this.errorMessageModal("Validação", "CNPJ e Razão Social são obrigatórios!");
      return;
    }

    this.loader = true;

    var item: EmpresaItemListInterface = {
      cnpj: this.cnpj,
      razao_social: this.razaoSocial,
      telefone: this.telefone,
      email: this.email,
      responsavel:this.responsavel,
      logradouro: this.logradouro,
      numero:this.numero,
      bairro: this.bairro,
      complemento: this.complemento,
      cidade: this.cidade,
      cidadeDescricao: this.cidadeDescricao,
      estado: this.estado, 
      estadoDescricao:this.estadoDescricao,
      armadilhas: this.listArmadilha,
      mapas: this.listMapa,
      ativo: this.ativo
    }

    if(this.editar){
      item.id = this.itemCodigo;
      var updateInsert = await this.empresaService.updateData(item);
      result = updateInsert.status;
    }else{
      var resultInsert = await this.empresaService.insertData(item);
      result = resultInsert.status;
      if(result)
        this.itemCodigo = resultInsert.data.id;
    }

    if(!tipo){
      if(!result){
        this.loader = false;
        await this.errorMessageModal("Erro", `Não foi possível ${this.editar ? "alterar" : "realizar"} o cadastro!`);
        return;
      }

      await this.salvarArmadilhasMapas();

      this.loader = false;
      await this.sucessoMessageModal();

      this.dismiss();
    }

  }

  async salvarArmadilhasMapas(){
    await this.salvarArmadilha(this.listArmadilha);
    await this.salvarMapas(this.listMapa);
  }

  async salvarArmadilha(lista: EmpresaArmadilhaListInterface[]){

    if(lista.length <=0)
      return;

    //Percorre cada item do grupo e verificar se ainda não foi adicionado ao banco de dados
    lista.forEach(async element => {

      var idGrupo: number | undefined = -1;

      var grupo: EmpresaInsertArmadilhaGrupoInterface = {
        id_empresa : this.itemCodigo,
        ordem: element.ordem,
        tipo: element.tipo,
        descricao: element.descricao,
      }

      if(this.sharedService.isEmpty(element.id) || element.id == -1){
        var dataGrupo = await this.empresaService.insertArmadilhaGrupo(grupo);
        if(dataGrupo.status){
          idGrupo = dataGrupo.data.id;
          element.id = idGrupo;
        }
      }else{
        idGrupo = this.sharedService.isEmpty(element.id) ? -1 : element.id;
      }
      
      if(idGrupo != -1){

        if(element.armadilhas.length > 0){

          //Percorre cada armadilha e verifica se ainda não foi adicionada ao banco de dados
          element.armadilhas.forEach(async armadilha => {
            var idGrupoItem = this.sharedService.isEmpty(armadilha.id) ? -1 : element.id;

            if(idGrupoItem == -1){
              var grupoItem: EmpresaInsertArmadilhaGrupoItemInterface = {
                id_empresa : this.itemCodigo,
                id_grupo: idGrupo,
                ordem: armadilha.ordem,
                tipo: armadilha.tipo,
                descricao: armadilha.descricao,
                status: armadilha.status
              }
  
              var dataGrupoItem = await this.empresaService.insertArmadilhaGrupoItem(grupoItem);
              if(dataGrupoItem.status)
                armadilha.id = dataGrupoItem.data.id;
            }

          });

        }
      }
    });
  }

  async salvarMapas(lista: EmpresaMapaItemListInterface[]){

    if(lista.length <=0)
      return;

    lista.forEach(async element => {

      var idMapa = this.sharedService.isEmpty(element.id) ? -1 : element.id;

      if(idMapa == -1){

        var input: EmpresaMapaItemListInterface = {
          id_empresa: this.itemCodigo,
          ordem: element.ordem,
          descricao: element.descricao,
          base64: element.base64,
          fileName: element.fileName,
          filePath: element.filePath
        }

        var result = await this.empresaService.insertMapas(input);
        if(result.status){
          element.id = result.data.id;
        }
      }
    });

  }

  validate(){
    if(this.sharedService.isEmpty(this.cnpj))
      return false;

    if(this.sharedService.isEmpty(this.razaoSocial))
      return false;

    return true;
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

  async sucessoMessageModal() {

    const modal = await this.modalCtrl.create({
      component: SucessoMessageModalComponent,
      backdropDismiss: true,
      initialBreakpoint: 0.40,
      componentProps: {
        title: "Cadastro",
        message: `${this.editar ? "Alterado" : "Realizado"} com sucesso`
      }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role == 'confirm'){
      return this.modalCtrl.dismiss('dismiss');
    }
      
    return true;

  }

  async validateForm() {

    // var campos: any[] = [];
    // if (this.data == null || this.data == "") campos.push("Prazo Execução");
    // if (this.validPrazoExecucao == false) campos.push("Prazo Execução");
    // // if (this.prioridade == -1) campos.push("Prioridade");
    // // if (this.setor == -1) campos.push("Setor");
    // // if (this.descricao == null || this.descricao == "") campos.push("Descrição");

    // if (campos.length > 0) {
    //   this.ordemServicoValida = false;
    //   return false;
    // }

    // this.ordemServicoValida = true;;
    return true;
  }

  async estadoSelected(dados: any){

    if (dados.detail.value == null || dados.detail.value == undefined) {
      this.estado = -1;
      this.estadoDescricao = "";
      this.inputBlock = false;
      this.showBackDrop = false;
      return;
    }

    this.estado = dados.detail.value;
    const item = this.listEstado.find(x => x.codigo === this.estado);
    if (item)
      this.estadoDescricao = item.descricao;

    this.cidade = -1;
    this.cidadeDescricao = "Nenhum Valor";
    var cidades = await this.sharedService.getCidades(this.estado);
    this.listCidade = cidades;
    await this.ordenarListaDescricao(this.listCidade);
    
    this.validateForm();
    this.inputBlock = false;
    this.showBackDrop = false;

  }

  async cidadeSelected(dados: any){
    if (dados.detail.value == null || dados.detail.value == undefined) {
      this.cidade = -1;
      this.cidadeDescricao = "";
      this.inputBlock = false;
      this.showBackDrop = false;
      return;
    }

    this.cidade = dados.detail.value;
    const item = this.listCidade.find(x => x.codigo === this.cidade);
    if (item)
      this.cidadeDescricao = item.descricao;
    
    this.validateForm();
    this.inputBlock = false;
    this.showBackDrop = false;

  }

  showModal(){
    this.inputBlock = true;
    this.showBackDrop = true;

  }

  async showArmadilha() {

    const modal = await this.modalCtrl.create({
      component: EmpresaArmadilhaPage,
      componentProps: {
        listArmadilha: this.listArmadilha,
        codigo: this.itemCodigo
      }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();

    this.showArmadilhas = true;

    this.ordenarLista(this.listArmadilha);

  }

  async removeArmadilha(item:any){

    var result = await this.empresaService.removeArmadilhaGrupoItem(item.id)

    if(!result.status)
      return;

    this.listArmadilha.forEach(element => {

      if(element.tipo == item.tipo){
        let index = element.armadilhas.findIndex((element: any) => element.ordem === item.ordem)
        element.armadilhas.splice(index, 1);
      }
      
    });

    var list = this.listArmadilha.find(x => x.tipo === item.tipo);

    if(list != null && list.armadilhas.length == 0 ){
      let index = this.listArmadilha.findIndex((element: any) => element.tipo === item.tipo)
      this.listArmadilha.splice(index, 1);
    }

    this.ordenarLista(this.listArmadilha);
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

 

  ordenarLista(list:any[]){
    list.sort((a, b) => (a.ordem < b.ordem) ? -1 : 1);
  }

  async ordenarListaDescricao(list:any[]){
    list.sort((a, b) => (a.descricao.localeCompare(b.descricao)));
  }

  async showMapa() {
    const modal = await this.modalCtrl.create({
      component: EmpresaMapaPage,
      componentProps: {
        listMapa: this.listMapa
      }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    this.ordenarLista(this.listMapa);

  }

  async removeMapa(item:any){

    if(item.id == -1){
      let index = this.listMapa.findIndex((element: any) => element.ordem === item.ordem)
      this.listMapa.splice(index, 1);
      this.ordenarLista(this.listMapa);
      return;
    }

    var result = await this.empresaService.removeMapa(item.id);

    if(!result.status)
      return;

    let index = this.listMapa.findIndex((element: any) => element.ordem === item.ordem)
    this.listMapa.splice(index, 1);
    this.ordenarLista(this.listMapa);
  }

  async carregaDadosItem(){

    if(this.item == null || this.item == undefined)
      return;

    var cidades = await this.sharedService.getCidades(this.item.estado);
    this.listCidade = cidades;
    await this.ordenarListaDescricao(this.listCidade);

    if(this.item.armadilhas == undefined){
      this.item.armadilhas = [];
    }

    if(this.item.mapas == undefined)
      this.item.mapas = [];

    this.itemCodigo = this.item.id,
    this.cnpj = this.item.cnpj,
    this.razaoSocial = this.sharedService.isEmpty(this.item.razao_social) ? "" : this.item.razao_social,
    this.telefone = this.sharedService.isEmpty(this.item.telefone) ? "" : this.item.telefone,
    this.email = this.sharedService.isEmpty(this.item.email)  ? "" : this.item.email,
    this.responsavel = this.sharedService.isEmpty(this.item.responsavel) ? "" : this.item.responsavel,
    this.logradouro = this.sharedService.isEmpty(this.item.logradouro) ? "" : this.item.logradouro,
    this.numero = this.sharedService.isEmpty(this.item.numero) ? "" : this.item.numero,
    this.bairro = this.sharedService.isEmpty(this.item.bairro) ? "" : this.item.bairro,
    this.complemento = this.sharedService.isEmpty(this.item.complemento) ? "" : this.item.complemento,
    
    this.listArmadilha = this.item.armadilhas,
    this.listMapa = this.item.mapas,
    this.ativo = this.item.ativo

  }

  async loadArmadilhas(){

    var grupos: any[] = [];

    var armadilhas = await this.empresaService.getListArmadilha(this.item.id == undefined ? -1 : this.item.id);
    if(armadilhas.status && armadilhas.data.length > 0){
      grupos = armadilhas.data;
    }

    if(grupos.length > 0){
      grupos.forEach(async element => {

        if(element.armadilhas == null || element.armadilhas == undefined)
          element.armadilhas = [];

        var itens = await this.empresaService.getListArmadilhaItens(element.id, element.id_empresa);
        if(itens.status && itens.data.length > 0){
          element.armadilhas = itens.data;
        }

        if(element.armadilhas.length > 0)
          this.showArmadilhas = true;

      });
    }

   this.listArmadilha = grupos;
   this.item.armadilhas = grupos;
  }

 async loadMapas(){
  var mapas = await this.empresaService.getListMapas(this.item.id == undefined ? -1 : this.item.id);
    if(mapas.status && mapas.data.length > 0){
      this.listMapa = mapas.data;
      this.item.mapas = mapas.data;
    }


 } 
  
}
