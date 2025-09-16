import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

export interface TransitionState {
  show: boolean;
  message: string;
  targetRoute?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PageTransitionService {
  private transitionSubject = new BehaviorSubject<TransitionState>({
    show: false,
    message: 'Carregando...'
  });

  public transition$: Observable<TransitionState> = this.transitionSubject.asObservable();

  constructor(private router: Router) {}

  /**
   * Show transition animation with custom message
   */
  showTransition(message: string = 'Carregando...', duration: number = 1000): Promise<void> {
    this.transitionSubject.next({
      show: true,
      message: message
    });

    return new Promise(resolve => {
      setTimeout(() => {
        this.hideTransition();
        resolve();
      }, duration);
    });
  }

  /**
   * Hide transition animation
   */
  hideTransition(): void {
    this.transitionSubject.next({
      show: false,
      message: 'Carregando...'
    });
  }

  /**
   * Navigate with transition animation
   */
  async navigateWithTransition(route: string | string[], message?: string): Promise<void> {
    // Get page-specific message
    const transitionMessage = message || this.getPageMessage(route);
    
    // Show transition
    this.transitionSubject.next({
      show: true,
      message: transitionMessage,
      targetRoute: Array.isArray(route) ? route.join('/') : route
    });

    // Wait a bit for animation to start
    await new Promise(resolve => setTimeout(resolve, 100));

    // Navigate to route
    try {
      if (Array.isArray(route)) {
        await this.router.navigate(route);
      } else {
        await this.router.navigateByUrl(route);
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }

    // Wait for page to load and hide transition
    await new Promise(resolve => setTimeout(resolve, 800));
    this.hideTransition();
  }

  /**
   * Get page-specific loading message
   */
  private getPageMessage(route: string | string[]): string {
    const routeStr = Array.isArray(route) ? route.join('/') : route;
    
    const messages: { [key: string]: string } = {
      '/dashboard': 'Carregando painel...',
      '/leads': 'Carregando leads...',
      '/kanban': 'Carregando pipeline...',
      '/consultants': 'Carregando consultores...',
      '/invoices': 'Carregando faturas...',
      '/commissions': 'Carregando comissões...',
      '/payments': 'Carregando pagamentos...',
      '/erp': 'Carregando integrações...',
      '/integrations': 'Carregando APIs...',
      '/automations': 'Carregando automações...',
      '/support': 'Carregando suporte...',
      '/knowledge-base': 'Carregando base de conhecimento...',
      '/users': 'Carregando usuários...',
      '/roles': 'Carregando perfis...',
      '/audit-logs': 'Carregando logs...',
      '/settings': 'Carregando configurações...'
    };

    // Check for exact match first
    if (messages[routeStr]) {
      return messages[routeStr];
    }

    // Check for partial matches
    for (const path in messages) {
      if (routeStr.includes(path.replace('/', ''))) {
        return messages[path];
      }
    }

    return 'Carregando...';
  }

  /**
   * Get current transition state
   */
  getCurrentState(): TransitionState {
    return this.transitionSubject.value;
  }

  /**
   * Quick transition for menu navigation
   */
  quickTransition(route: string): void {
    this.navigateWithTransition(route).catch(error => {
      console.error('Quick transition error:', error);
    });
  }
}