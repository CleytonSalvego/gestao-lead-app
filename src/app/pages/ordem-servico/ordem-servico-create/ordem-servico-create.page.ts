import { NgIf, NgFor, CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { HeaderComponent } from 'src/app/components/header/header/header.component';
import { LoaderModalComponent } from 'src/app/components/loader-modal/loader-modal.component';
import { ErrorMessageModalComponent } from 'src/app/components/modals/error-message-modal/error-message-modal.component';
import { SucessoMessageModalComponent } from 'src/app/components/modals/sucesso-message-modal/sucesso-message-modal.component';
import { SearchableSelectComponent } from 'src/app/components/select/searchable-select/searchable-select.component';
import { EmpresaArmadilhaListInterface, EmpresaItemListInterface, EmpresaMapaItemListInterface } from 'src/app/interfaces/empresa.interface';
import { ApontamentoArmadilhaListInterface, ApontamentoArmadilhaRespostaInterface, OrdemServicoInsertInterface, OrdemServicoItemListInterface } from 'src/app/interfaces/ordem-servico.interface';
import { EmpresaService } from 'src/app/services/empresa.service';
import { OrdemServicoService } from 'src/app/services/orderm-servico.service';
import { SharedService } from 'src/app/services/shared.service';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-ordem-servico-create',
  templateUrl: './ordem-servico-create.page.html',
  styleUrls: ['./ordem-servico-create.page.scss'],
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
export class OrdemServicoCreatePage implements OnInit {

  @ViewChild('popoverDate') popoverDate!: HTMLIonPopoverElement;
  @ViewChild('popoverHora') popoverHora!: HTMLIonPopoverElement;

  loader: boolean = false;

  inputBlock = false;
  showBackDrop: boolean = false;
  isAndroid = true;

  editar: boolean = false;
  item!: OrdemServicoInsertInterface;
  itemCodigo: number | undefined = -1;

  empresa: number = -1;
  empresaDescricao: string = "";
  listEmpresa: any[] = [];

  tecnico: number = -1;
  tecnicoDescricao: string = "";
  listTecnico: any[] = [];

  acompanhante?: number = -1;
  acompanhanteDescricao?: string = "";
  listAcompanhante: any[] = [];

  local?:string = "";

  validPrazoExecucao: boolean= true;
  ordemServicoValida: boolean = true;

  listArmadilha: EmpresaArmadilhaListInterface[] = [];
  listMapa: EmpresaMapaItemListInterface[] = [];

  data: string = "";
  private dateValue: any;
  get date(): any {
    return this.dateValue;
  }

  set date(value: any) {
    this.dateValue = value;
  }

  hora: string = "";
  private timeValue: any;
  get time(): any {
    return this.timeValue;
  }

  set time(value: any) {
    this.timeValue = value;
  }

  constructor(
    private sharedService: SharedService,
    private modalCtrl: ModalController,
    private ordemServicoService: OrdemServicoService,
    private empresaService: EmpresaService,
    private usuarioService: UsuarioService
  ) { }

  async ngOnInit() {

    this.loader = true;
    var currentDate = new Date();
    this.dateValue = this.sharedService.formatDateCalendar(currentDate);
    this.data = this.dateValue;
    this.time = currentDate;
    this.hora = await this.formatHora(currentDate);

    var empresas = await this.empresaService.getCombo();
    if(empresas.status == true && empresas.data.length > 0)
      this.listEmpresa = empresas.data;

    var tecnicos = await this.usuarioService.getCombo();
    if(tecnicos.status == true && tecnicos.data.length > 0){
      this.listTecnico = tecnicos.data;
      this.listAcompanhante = tecnicos.data;
    }

    if(this.editar)
      this.carregaDadosItem();

    this.loader = false;

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

  async loadArmadilhaData(): Promise<EmpresaArmadilhaListInterface[]>{
    
    var list: EmpresaItemListInterface[] = [];
    var response = await this.empresaService.getList();
    if(response == null)
      return list[0].armadilhas;

    list = response;

    const item = list.find(x => x.id === this.empresa);
    if (item)
      this.listArmadilha = item.armadilhas;

    return this.listArmadilha;
  }

  async loadMapaData(): Promise<EmpresaMapaItemListInterface[]>{
    
    var list: EmpresaItemListInterface[] = [];
    var response = await this.empresaService.getList();
    if(response == null)
      return list[0].mapas;

    list = response;

    const item = list.find(x => x.id === this.empresa);
    if (item)
      this.listMapa = item.mapas;

    return this.listMapa;
  }

  async salvar(){
    var result = false;

    if(! this.validate()){
      await this.errorMessageModal("Validação", "Data e Empresa são obrigatórios!");
      return;
    }

    var item: OrdemServicoInsertInterface = {
      data : this.date,
      hora: this.hora,
      id_empresa:this.empresa,
      descricao_empresa: this.empresaDescricao,
      id_tecnico: this.tecnico,
      descricao_tecnico: this.tecnicoDescricao,
      local: this.local,
      status: 1,
      descricao_status: "Pendente",
      id_acompanhante: this.acompanhante,
      descricao_acompanhante: this.acompanhanteDescricao,
    };

    this.loader = true;

    if(this.editar){
      item.id = this.itemCodigo;
      var updateInsert = await this.ordemServicoService.updateData(item);
      result = updateInsert.status;
    }else{
      var resultInsert = await this.ordemServicoService.insertData(item);
      result = resultInsert.status;
      if(result)
        this.itemCodigo = resultInsert.data.id;
    }

    if(!result){
      this.loader = false;
      await this.errorMessageModal("Erro", `Não foi possível ${this.editar ? "alterar" : "realizar"} o cadastro!`);
      return;
    }

    if(!this.editar)
      await this.salvarArmadilhas();

    this.loader = false;
    await this.sucessoMessageModal();

    if(!this.editar)
      this.dismiss();

  }

  async salvarArmadilhas(){
    var id_ordem_servico = this.itemCodigo == null ? 0 : this.itemCodigo;
    await this.ordemServicoService.insertArmadilhas(id_ordem_servico, this.empresa);
  }

  validate(){
    if(this.sharedService.isEmpty(this.data))
      return false;

    if(this.empresa == -1)
      return false;

    return true;
  }

  async errorMessageModal1() {

    const modal = await this.modalCtrl.create({
      component: ErrorMessageModalComponent,
      backdropDismiss: true,
      initialBreakpoint: 0.40,
      componentProps: {
        title: "Validação",
        message: "Data e Empresa são obrigatórios!"
      }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    return;

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

  pickDateModelChange(): void {
    
    this.validPrazoExecucao = true;
    var secondDate = new Date(this.date);
    var today = new Date();
    today.setHours(today.getHours() -1);
    if (secondDate.getTime() < today.getTime()) this.validPrazoExecucao = false;
    
    this.data = this.date;
    this.validateForm();
    this.fecharPicker();
  }

  async pickTimeModelChange() {
    this.hora = await this.formatHora(new Date(this.time))
  }

  fecharPicker(){
    const picker = window.document.querySelector('ion-popover')!
    if (picker) picker.dismiss();
  }

  fecharPickerDate() {
    this.popoverDate.isOpen = false;
    this.popoverDate.dismiss();
  }

  fecharPickerHora() {
    this.popoverHora.isOpen = false;
    this.popoverHora.dismiss();
  }


  async empresaSelected(dados: any){

    if (dados.detail.value == null || dados.detail.value == undefined) {
      this.empresa = -1;
      this.empresaDescricao = "";
      this.inputBlock = false;
      this.showBackDrop = false;
      return;
    }

    this.empresa = dados.detail.value;
    const empresaEncontrada = this.listEmpresa.find(x => x.id === this.empresa);
    if (empresaEncontrada)
      this.empresaDescricao = empresaEncontrada.descricao;

    this.validateForm();
    this.inputBlock = false;
    this.showBackDrop = false;

  }

  async tecnicoSelected(dados: any){
    if (dados.detail.value == null || dados.detail.value == undefined) {
      this.tecnico = -1;
      this.tecnicoDescricao = "";
      this.inputBlock = false;
      this.showBackDrop = false;
      return;
    }

    this.tecnico = dados.detail.value;
    const tecnicoEncontrado = this.listTecnico.find(x => x.id === this.tecnico);
    if (tecnicoEncontrado)
      this.tecnicoDescricao = tecnicoEncontrado.descricao;

    this.validateForm();
    this.inputBlock = false;
    this.showBackDrop = false;

  }

  async acompanhanteSelected(dados: any){
    if (dados.detail.value == null || dados.detail.value == undefined) {
      this.acompanhante = -1;
      this.acompanhanteDescricao = "";
      this.inputBlock = false;
      this.showBackDrop = false;
      return;
    }

    this.acompanhante = dados.detail.value;
    const acompanhanteEncontrado = this.listAcompanhante.find(x => x.id === this.acompanhante);
    if (acompanhanteEncontrado)
      this.acompanhanteDescricao = acompanhanteEncontrado.descricao;

    this.validateForm();
    this.inputBlock = false;
    this.showBackDrop = false;

  }

  showModal(){
    this.inputBlock = true;
    this.showBackDrop = true;

  }

  async carregaDadosItem(){

    if(this.item == null || this.item == undefined)
      return;

    this.dateValue = this.sharedService.formatFilterDateCalendar(this.item.data.toString());

    this.itemCodigo = this.item.id;
    this.data= this.sharedService.formatFilterDateCalendar(this.item.data.toString()).toLocaleString();

    if(this.sharedService.isEmpty(this.item.hora)){
      this.hora = await this.formatHora(new Date(this.item.data))
    }else{
      this.hora = this.item.hora;
    }
    this.empresa= this.item.id_empresa;
    this.empresaDescricao= this.item.descricao_empresa;
    this.tecnico= this.item.id_tecnico;
    this.tecnicoDescricao= this.item.descricao_tecnico;
    this.acompanhante = this.item.id_acompanhante;
    this.acompanhanteDescricao = this.item.descricao_acompanhante;
    this.local= this.item.local;
  }

  async formatHora(data: Date) {
    var horaFormatada = "";
    var minutoFormatado = "";

    var hora = data.getHours();
    if(hora.toString().length == 1){
      horaFormatada = `0${hora}`;
    }else{
      horaFormatada = hora.toString();
    }

    var minutos = data.getMinutes();
    if(minutos.toString().length == 1){
      minutoFormatado = `0${minutos}`;
    }else{
      minutoFormatado = minutos.toString();
    }

    return `${horaFormatada}:${minutoFormatado}`;
  }


}
