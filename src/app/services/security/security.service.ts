import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { 
  AuditLog, 
  AuditAction, 
  RiskLevel,
  Role, 
  Permission,
  DataSubject,
  ConsentRecord,
  DataProcessingActivity,
  SecurityEvent,
  AccessRequest
} from '../../interfaces/security.interface';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private apiUrl = '/api/security';
  private auditLogsSubject = new BehaviorSubject<AuditLog[]>([]);
  private rolesSubject = new BehaviorSubject<Role[]>([]);
  private permissionsSubject = new BehaviorSubject<Permission[]>([]);
  private dataSubjectsSubject = new BehaviorSubject<DataSubject[]>([]);
  private securityEventsSubject = new BehaviorSubject<SecurityEvent[]>([]);

  auditLogs$ = this.auditLogsSubject.asObservable();
  roles$ = this.rolesSubject.asObservable();
  permissions$ = this.permissionsSubject.asObservable();
  dataSubjects$ = this.dataSubjectsSubject.asObservable();
  securityEvents$ = this.securityEventsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadMockData();
  }

  // Audit Logging
  logAction(
    action: AuditAction,
    entityType: string,
    entityId: string,
    oldValue?: any,
    newValue?: any,
    risk: RiskLevel = 'low'
  ): Observable<AuditLog> {
    const currentUser = this.authService.getCurrentUser();
    
    const auditLog: Partial<AuditLog> = {
      userId: currentUser?.id || 'system',
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
      ipAddress: '127.0.0.1', // In real app, get from request
      timestamp: new Date(),
      risk
    };

    return this.http.post<AuditLog>(`${this.apiUrl}/audit-logs`, auditLog)
      .pipe(
        map(log => {
          const currentLogs = this.auditLogsSubject.value;
          this.auditLogsSubject.next([log, ...currentLogs]);
          
          // Check for suspicious activity
          this.checkSuspiciousActivity(log);
          
          return log;
        }),
        catchError(this.handleError)
      );
  }

  getAuditLogs(filters?: {
    userId?: string;
    action?: AuditAction;
    entityType?: string;
    risk?: RiskLevel;
    startDate?: Date;
    endDate?: Date;
  }): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.apiUrl}/audit-logs`, {
      params: filters as any
    }).pipe(catchError(this.handleError));
  }

  exportAuditLogs(format: 'csv' | 'pdf' | 'excel', filters?: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/audit-logs/export`, 
      { format, filters }, 
      { responseType: 'blob' }
    ).pipe(catchError(this.handleError));
  }

  // Role and Permission Management
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/roles`)
      .pipe(catchError(this.handleError));
  }

  createRole(role: Partial<Role>): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/roles`, role)
      .pipe(
        map(newRole => {
          const currentRoles = this.rolesSubject.value;
          this.rolesSubject.next([...currentRoles, newRole]);
          
          this.logAction('create', 'role', newRole.id, null, newRole, 'medium');
          
          return newRole;
        }),
        catchError(this.handleError)
      );
  }

  updateRole(id: string, updates: Partial<Role>): Observable<Role> {
    const oldRole = this.rolesSubject.value.find(r => r.id === id);
    
    return this.http.put<Role>(`${this.apiUrl}/roles/${id}`, updates)
      .pipe(
        map(updatedRole => {
          const currentRoles = this.rolesSubject.value;
          const index = currentRoles.findIndex(r => r.id === id);
          if (index !== -1) {
            currentRoles[index] = updatedRole;
            this.rolesSubject.next([...currentRoles]);
          }
          
          this.logAction('update', 'role', id, oldRole, updatedRole, 'medium');
          
          return updatedRole;
        }),
        catchError(this.handleError)
      );
  }

  deleteRole(id: string): Observable<void> {
    const roleToDelete = this.rolesSubject.value.find(r => r.id === id);
    
    return this.http.delete<void>(`${this.apiUrl}/roles/${id}`)
      .pipe(
        map(() => {
          const currentRoles = this.rolesSubject.value;
          const filteredRoles = currentRoles.filter(r => r.id !== id);
          this.rolesSubject.next(filteredRoles);
          
          this.logAction('delete', 'role', id, roleToDelete, null, 'high');
        }),
        catchError(this.handleError)
      );
  }

  getPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.apiUrl}/permissions`)
      .pipe(catchError(this.handleError));
  }

  checkPermission(userId: string, resource: string, action: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/permissions/check`, {
      params: { userId, resource, action }
    }).pipe(catchError(this.handleError));
  }

  // LGPD Compliance
  registerDataSubject(dataSubject: Partial<DataSubject>): Observable<DataSubject> {
    return this.http.post<DataSubject>(`${this.apiUrl}/data-subjects`, dataSubject)
      .pipe(
        map(newSubject => {
          const currentSubjects = this.dataSubjectsSubject.value;
          this.dataSubjectsSubject.next([...currentSubjects, newSubject]);
          
          this.logAction('create', 'data-subject', newSubject.id, null, newSubject, 'low');
          
          return newSubject;
        }),
        catchError(this.handleError)
      );
  }

  recordConsent(dataSubjectId: string, consent: Partial<ConsentRecord>): Observable<ConsentRecord> {
    return this.http.post<ConsentRecord>(`${this.apiUrl}/consent`, {
      ...consent,
      dataSubjectId
    }).pipe(
      map(consentRecord => {
        this.logAction('create', 'consent', consentRecord.id, null, consentRecord, 'medium');
        return consentRecord;
      }),
      catchError(this.handleError)
    );
  }

  withdrawConsent(consentId: string, reason: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/consent/${consentId}/withdraw`, { reason })
      .pipe(
        map(() => {
          this.logAction('update', 'consent', consentId, null, { withdrawn: true, reason }, 'medium');
        }),
        catchError(this.handleError)
      );
  }

  getDataProcessingActivities(): Observable<DataProcessingActivity[]> {
    return this.http.get<DataProcessingActivity[]>(`${this.apiUrl}/data-processing`)
      .pipe(catchError(this.handleError));
  }

  requestDataDeletion(dataSubjectId: string, reason: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/data-subjects/${dataSubjectId}/delete`, { reason })
      .pipe(
        map(() => {
          this.logAction('delete', 'data-subject', dataSubjectId, null, { reason }, 'high');
        }),
        catchError(this.handleError)
      );
  }

  requestDataPortability(dataSubjectId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/data-subjects/${dataSubjectId}/export`, {
      responseType: 'blob'
    }).pipe(
      map(blob => {
        this.logAction('export', 'data-subject', dataSubjectId, null, { exported: true }, 'medium');
        return blob;
      }),
      catchError(this.handleError)
    );
  }

  // Security Events
  reportSecurityEvent(event: Partial<SecurityEvent>): Observable<SecurityEvent> {
    return this.http.post<SecurityEvent>(`${this.apiUrl}/events`, event)
      .pipe(
        map(securityEvent => {
          const currentEvents = this.securityEventsSubject.value;
          this.securityEventsSubject.next([securityEvent, ...currentEvents]);
          
          this.logAction('create', 'security-event', securityEvent.id, null, securityEvent, 'high');
          
          return securityEvent;
        }),
        catchError(this.handleError)
      );
  }

  getSecurityEvents(filters?: {
    type?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    startDate?: Date;
    endDate?: Date;
  }): Observable<SecurityEvent[]> {
    return this.http.get<SecurityEvent[]>(`${this.apiUrl}/events`, {
      params: filters as any
    }).pipe(catchError(this.handleError));
  }

  // Access Requests
  requestAccess(request: Partial<AccessRequest>): Observable<AccessRequest> {
    return this.http.post<AccessRequest>(`${this.apiUrl}/access-requests`, request)
      .pipe(
        map(accessRequest => {
          this.logAction('create', 'access-request', accessRequest.id, null, accessRequest, 'medium');
          return accessRequest;
        }),
        catchError(this.handleError)
      );
  }

  approveAccessRequest(requestId: string, approverNotes?: string): Observable<AccessRequest> {
    return this.http.put<AccessRequest>(`${this.apiUrl}/access-requests/${requestId}/approve`, {
      approverNotes
    }).pipe(
      map(approvedRequest => {
        this.logAction('update', 'access-request', requestId, null, { status: 'approved' }, 'high');
        return approvedRequest;
      }),
      catchError(this.handleError)
    );
  }

  denyAccessRequest(requestId: string, reason: string): Observable<AccessRequest> {
    return this.http.put<AccessRequest>(`${this.apiUrl}/access-requests/${requestId}/deny`, {
      reason
    }).pipe(
      map(deniedRequest => {
        this.logAction('update', 'access-request', requestId, null, { status: 'denied', reason }, 'medium');
        return deniedRequest;
      }),
      catchError(this.handleError)
    );
  }

  // Security Analysis
  private checkSuspiciousActivity(log: AuditLog): void {
    // Check for multiple failed login attempts
    if (log.action === 'login_failed') {
      const recentFailedLogins = this.auditLogsSubject.value
        .filter(l => 
          l.userId === log.userId && 
          l.action === 'login_failed' && 
          l.timestamp > new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
        );

      if (recentFailedLogins.length >= 5) {
        this.reportSecurityEvent({
          type: 'suspicious_login_attempts',
          description: `Multiple failed login attempts for user ${log.userId}`,
          severity: 'high',
          userId: log.userId,
          ipAddress: log.ipAddress,
          timestamp: new Date()
        });
      }
    }

    // Check for unusual access patterns
    if (log.action === 'view' && log.risk === 'high') {
      this.reportSecurityEvent({
        type: 'unusual_access',
        description: `High-risk access to ${log.entityType} ${log.entityId}`,
        severity: 'medium',
        userId: log.userId,
        ipAddress: log.ipAddress,
        timestamp: new Date()
      });
    }
  }

  private loadMockData(): void {
    const mockRoles: Role[] = [
      {
        id: '1',
        name: 'Administrador',
        description: 'Acesso total ao sistema',
        permissions: ['all'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Consultor',
        description: 'Acesso a leads e vendas',
        permissions: ['leads:read', 'leads:write', 'policies:read'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Supervisor',
        description: 'Gestão de equipe e relatórios',
        permissions: ['leads:read', 'leads:write', 'reports:read', 'users:read'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const mockPermissions: Permission[] = [
      {
        id: '1',
        name: 'all',
        description: 'Acesso total',
        resource: '*',
        action: '*'
      },
      {
        id: '2',
        name: 'leads:read',
        description: 'Visualizar leads',
        resource: 'leads',
        action: 'read'
      },
      {
        id: '3',
        name: 'leads:write',
        description: 'Editar leads',
        resource: 'leads',
        action: 'write'
      }
    ];

    const mockAuditLogs: AuditLog[] = [
      {
        id: '1',
        userId: 'user-1',
        action: 'login',
        entityType: 'user',
        entityId: 'user-1',
        ipAddress: '192.168.1.100',
        timestamp: new Date(),
        risk: 'low'
      },
      {
        id: '2',
        userId: 'user-1',
        action: 'update',
        entityType: 'lead',
        entityId: 'lead-123',
        oldValue: { status: 'novo' },
        newValue: { status: 'contatado' },
        ipAddress: '192.168.1.100',
        timestamp: new Date(Date.now() - 60000),
        risk: 'low'
      }
    ];

    this.rolesSubject.next(mockRoles);
    this.permissionsSubject.next(mockPermissions);
    this.auditLogsSubject.next(mockAuditLogs);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Security Service Error:', error);
    return throwError(error);
  }
}