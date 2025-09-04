import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-skeleton-list',
  templateUrl: './skeleton-list.component.html',
  styleUrls: ['./skeleton-list.component.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class SkeletonListComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
