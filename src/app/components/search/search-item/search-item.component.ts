import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-search-item',
  templateUrl: './search-item.component.html',
  styleUrls: ['./search-item.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule]
})
export class SearchItemComponent  implements OnInit {

  @Input() placeHolder: string = '';

  constructor() { }

  ngOnInit() { }

}
