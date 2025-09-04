import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SearchItemComponent } from '../../search/search-item/search-item.component';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-searchable-select',
  templateUrl: './searchable-select.component.html',
  styleUrls: ['./searchable-select.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    SearchItemComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SearchableSelectComponent  implements OnInit {

  @Input() title = "";
  @Input() data: any[] = [];
  @Input() multiple = false;
  @Input() itemTextField = 'name';
  @Input() value:any = '';
  @Input() isAndroid:boolean = true;
  @Output() selectedChanged = new EventEmitter<any>();
  @Output() outputObservacao = new EventEmitter<any>();
  
  page: number = 0;
  perPage: number = 100;
  isOpen = false;
  selected:any[] = [];
  filtered: any[] = [];
  list:any[] = [];
  existData = true;
  itemSelecionado: any = '';
  searching = true;


  constructor(private sharedService: SharedService) { }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    this.page = 0;
    this.filtered = await this.paginateArray(false);
    if (changes.data && this.selected.length > 0  )  {

      const result = changes.data.currentValue.filter((item:any) => {
        return (item.codigo == this.selected[0].codigo && 
                item.descricao == this.selected[0].descricao);
      });
      if (!result) {
        this.selected = [];
        return;
      }
      
      this.selected == result;
      return;
    }

    if (changes.value && this.selected.length > 0  )  {
      if (changes.value.currentValue == -1)
        this.selected = [];
    }
 
  }

  ngOnInit() {

  

    if (this.data.length == 0){
      this.selected = [];
    }
   
  }

  async open(){
    //this.filtered = this.data;
    this.page = 0;
    this.filtered = await this.paginateArray(true);
    this.existData = this.data.length == 0 ? false : true;
    this.isOpen = true;
    this.searching = true;
  }

  cancel(){
    this.selectedChanged.emit(null);
    this.isOpen = false;
  }

  select(){
    this.isOpen = false;
  }

  itemSelected(value: any) {
    if (value == '' || value == null){
      this.selected = [];
      this.selectedChanged.emit(null);
      this.isOpen = false;
      return;
    };

    this.selected = this.data.filter((item:any) => {
      return (item.codigo == value.codigo);
    });

    value.item = this.selected;
    this.selectedChanged.emit(value);
    this.isOpen = false;
  }

  leaf(obj:any){
    const result = this.itemTextField.split('.').reduce((value, el) => this.sharedService.removeAcento(value[el]), obj);
    return result;
  }

  //leaf = (obj:any) => this.itemTextField.split('.').reduce((value, el) => value[el], obj);

  filter(event:any){
    const filter = this.sharedService.removeAcento(event.detail.value?.toLocaleLowerCase());
    this.filtered = this.data.filter((item:any) => this.leaf(item).toLocaleLowerCase().indexOf(filter) >= 0);

    if (this.filtered.length > 0){
      this.searching = true;
    }else{
      this.searching = false;
    }
      
  }

  ngOnDestroy(){
    this.isOpen = false;
  }

  ionViewDidLeave(){
    this.isOpen = false;
  }

  async paginateArray(pagination:boolean){
    this.page++;
    const result = await  this.paginate(this.data, this.page, this.perPage);
    return result.items;
  }

 async paginate(items:any, page:number, perPage:number){
    const offset = (perPage * (page - 1)) == 0 ? 0 : (perPage * (page - 1)) ;
    const totalPages = Math.ceil(items.length / perPage);
    const paginatedItems = items.slice(offset, perPage * page);

    return {
        previousPage: page - 1 ? page - 1 : null,
        nextPage: (totalPages > page) ? page + 1 : null,
        total: items.length,
        totalPages: totalPages,
        items: paginatedItems
    };
};

  async loadInfiniteScroll(event: any){
    setTimeout(async () => {
      const array = await this.paginateArray(true);
      this.filtered = this.filtered.concat(array);
      event.target.complete();
      if (array?.length < this.perPage){
        event.target.disable = true;
      }
    }, 500);
  }

}
