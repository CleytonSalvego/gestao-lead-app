import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PageTransitionService, TransitionState } from './services/page-transition.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  
  transitionState: TransitionState = {
    show: false,
    message: 'Carregando...'
  };

  private transitionSubscription?: Subscription;

  constructor(private pageTransitionService: PageTransitionService) {}

  ngOnInit() {
    // Subscribe to transition state changes
    this.transitionSubscription = this.pageTransitionService.transition$.subscribe(
      state => {
        this.transitionState = state;
      }
    );
  }

  ngOnDestroy() {
    if (this.transitionSubscription) {
      this.transitionSubscription.unsubscribe();
    }
  }
}
