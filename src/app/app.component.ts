import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { PageTransitionService, TransitionState } from './services/page-transition.service';
import { InstagramSetupService } from './services/instagram-setup.service';
import { AutoIntegrationService } from './services/auto-integration.service';

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

  showMenu: boolean = true;

  private transitionSubscription?: Subscription;
  private routeSubscription?: Subscription;

  constructor(
    private router: Router,
    private pageTransitionService: PageTransitionService,
    private instagramSetupService: InstagramSetupService,
    private autoIntegrationService: AutoIntegrationService
  ) {}

  ngOnInit() {
    // Subscribe to transition state changes
    this.transitionSubscription = this.pageTransitionService.transition$.subscribe(
      state => {
        this.transitionState = state;
      }
    );

    // Subscribe to route changes to control menu visibility
    this.routeSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navigationEvent = event as NavigationEnd;
        // Hide menu on login, register, forgot-password and splash pages
        const hideMenuRoutes = ['/login', '/register', '/forgot-password', '/splash'];
        this.showMenu = !hideMenuRoutes.some(route => navigationEvent.url.includes(route));
      });
  }

  ngOnDestroy() {
    if (this.transitionSubscription) {
      this.transitionSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }
}
