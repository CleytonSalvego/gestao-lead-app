import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { User, UserRole, Permission, LoginRequest, LoginResponse, RegisterRequest } from '../../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private needsInstagramSetupSubject = new BehaviorSubject<boolean>(false);
  public needsInstagramSetup$ = this.needsInstagramSetupSubject.asObservable();

  private mockUsers: User[] = [
    {
      id: '1',
      name: 'Admin Porto Seguro',
      email: 'admin@teste.com',
      role: UserRole.ADMIN,
      permissions: [
        Permission.VIEW_DASHBOARD,
        Permission.MANAGE_LEADS,
        Permission.MANAGE_CONSULTANTS,
        Permission.VIEW_REPORTS,
        Permission.MANAGE_SETTINGS,
        Permission.EXPORT_DATA,
        Permission.VIEW_INTEGRATIONS,
        Permission.VIEW_SOCIAL_MEDIA
      ],
      isActive: true,
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date(),
      preferences: {
        theme: 'light',
        language: 'pt-BR',
        notifications: {
          email: true,
          push: true,
          newLeads: true,
          leadUpdates: true,
          reminders: true
        }
      }
    },
    {
      id: '2',
      name: 'João Silva',
      email: 'joao.silva@teste.com',
      role: UserRole.CONSULTANT,
      permissions: [
        Permission.VIEW_DASHBOARD,
        Permission.MANAGE_LEADS,
        Permission.VIEW_REPORTS
      ],
      isActive: true,
      createdAt: new Date('2024-02-01'),
      lastLogin: new Date(),
      preferences: {
        theme: 'dark',
        language: 'pt-BR',
        notifications: {
          email: true,
          push: true,
          newLeads: true,
          leadUpdates: false,
          reminders: true
        }
      }
    },
    {
      id: '3',
      name: 'Analista Meta',
      email: 'analista-meta@teste.com',
      role: UserRole.META_ANALYST,
      permissions: [
        Permission.VIEW_INTEGRATIONS,
        Permission.VIEW_SOCIAL_MEDIA
      ],
      isActive: true,
      createdAt: new Date('2024-03-01'),
      lastLogin: new Date(),
      preferences: {
        theme: 'light',
        language: 'pt-BR',
        notifications: {
          email: true,
          push: false,
          newLeads: false,
          leadUpdates: false,
          reminders: false
        }
      }
    }
  ];

  constructor() {
    this.checkAuthStatus();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return of(null).pipe(
      delay(1000),
      map(() => {
        const user = this.mockUsers.find(u => u.email === credentials.email);

        // Verificar senha específica para analista-meta
        if (user && user.email === 'analista-meta@teste.com') {
          if (credentials.password !== 'Met@Teste123') {
            throw new Error('Credenciais inválidas');
          }
        } else if (!user || credentials.password !== '123456') {
          throw new Error('Credenciais inválidas');
        }

        const response: LoginResponse = {
          user,
          token: 'mock-jwt-token-' + Math.random(),
          refreshToken: 'mock-refresh-token-' + Math.random(),
          expiresIn: 3600
        };

        this.setCurrentUser(user);
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('current_user', JSON.stringify(user));

        // Sinalizar que precisa configurar Instagram para analista-meta
        if (user.email === 'analista-meta@teste.com') {
          console.log('📸 Login do analista-meta detectado - disparando setup do Instagram');
          this.needsInstagramSetupSubject.next(true);
        }

        return response;
      })
    );
  }

  register(userData: RegisterRequest): Observable<LoginResponse> {
    return of(null).pipe(
      delay(1000),
      map(() => {
        if (userData.password !== userData.confirmPassword) {
          throw new Error('Senhas não conferem');
        }

        const existingUser = this.mockUsers.find(u => u.email === userData.email);
        if (existingUser) {
          throw new Error('Email já cadastrado');
        }

        const newUser: User = {
          id: (this.mockUsers.length + 1).toString(),
          name: userData.name,
          email: userData.email,
          role: userData.role || UserRole.CONSULTANT,
          permissions: [
            Permission.VIEW_DASHBOARD,
            Permission.MANAGE_LEADS,
            Permission.VIEW_REPORTS
          ],
          isActive: true,
          createdAt: new Date(),
          preferences: {
            theme: 'light',
            language: 'pt-BR',
            notifications: {
              email: true,
              push: true,
              newLeads: true,
              leadUpdates: true,
              reminders: true
            }
          }
        };

        this.mockUsers.push(newUser);

        const response: LoginResponse = {
          user: newUser,
          token: 'mock-jwt-token-' + Math.random(),
          refreshToken: 'mock-refresh-token-' + Math.random(),
          expiresIn: 3600
        };

        this.setCurrentUser(newUser);
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('current_user', JSON.stringify(newUser));

        return response;
      })
    );
  }

  logout(): Observable<boolean> {
    return of(true).pipe(
      delay(500),
      map(() => {
        this.setCurrentUser(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
        return true;
      })
    );
  }

  forgotPassword(email: string): Observable<boolean> {
    return of(null).pipe(
      delay(1000),
      map(() => {
        const user = this.mockUsers.find(u => u.email === email);
        if (!user) {
          throw new Error('Email não encontrado');
        }
        return true;
      })
    );
  }

  private setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(!!user);
  }

  private checkAuthStatus(): void {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('current_user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.setCurrentUser(user);
      } catch (error) {
        this.logout();
      }
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasPermission(permission: Permission): boolean {
    const user = this.getCurrentUser();
    return user ? user.permissions.includes(permission) : false;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === UserRole.ADMIN : false;
  }

  getDefaultRoute(): string {
    const user = this.getCurrentUser();
    if (!user) return '/login';

    // Para analista-meta, redirecionar para redes sociais
    if (user.role === UserRole.META_ANALYST) {
      return '/social-media';
    }

    // Para outros usuários, usar dashboard se tiver permissão
    if (user.permissions.includes(Permission.VIEW_DASHBOARD)) {
      return '/dashboard';
    }

    // Fallback baseado em permissões disponíveis
    if (user.permissions.includes(Permission.MANAGE_LEADS)) {
      return '/leads';
    }

    if (user.permissions.includes(Permission.VIEW_INTEGRATIONS)) {
      return '/integrations';
    }

    // Se não tiver nenhuma permissão específica, ir para dashboard
    return '/dashboard';
  }

  getInstagramConfig() {
    return {
      platform: 'instagram',
      name: 'Instagram',
      appId: '722085609076707',
      appSecret: '045f9424e3d03a7dc02c8ca468edfa72',
      accessToken: 'dd03a6d9346805abffd989d966ece52d',
      businessManagerId: '630140316714253',
      pageId: '579080491964703',
      instagramAccountId: '17841474874248436'
    };
  }

  markInstagramSetupComplete() {
    this.needsInstagramSetupSubject.next(false);
  }
}