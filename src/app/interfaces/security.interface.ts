// Security and Audit Interfaces
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  entityName?: string;
  oldValue?: any;
  newValue?: any;
  changes?: FieldChange[];
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  timestamp: Date;
  location?: GeoLocation;
  risk: RiskLevel;
  metadata?: Record<string, any>;
}

export type AuditAction = 
  | 'login' 
  | 'logout' 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete' 
  | 'export' 
  | 'import' 
  | 'access_denied'
  | 'password_change'
  | 'permission_change'
  | 'data_export'
  | 'report_generation'
  | 'integration_sync';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface FieldChange {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'added' | 'modified' | 'removed';
}

export interface GeoLocation {
  country: string;
  region: string;
  city: string;
  latitude?: number;
  longitude?: number;
}

// Access Control
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  scope: PermissionScope;
  conditions?: PermissionCondition[];
}

export type PermissionScope = 'own' | 'team' | 'department' | 'company' | 'all';

export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  ipAddress: string;
  userAgent: string;
  location?: GeoLocation;
  isActive: boolean;
  expiresAt: Date;
  lastActivity: Date;
  createdAt: Date;
  riskScore: number;
}

// LGPD Compliance
export interface DataSubject {
  id: string;
  type: 'lead' | 'customer' | 'employee' | 'partner';
  entityId: string;
  personalData: PersonalDataField[];
  consent: ConsentRecord[];
  requests: LGPDRequest[];
  retentionPolicy: DataRetentionPolicy;
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonalDataField {
  field: string;
  category: DataCategory;
  sensitivity: DataSensitivity;
  legalBasis: LegalBasis;
  purpose: string[];
  retention: DataRetentionRule;
  encryption: EncryptionInfo;
}

export type DataCategory = 
  | 'identification' 
  | 'contact' 
  | 'financial' 
  | 'professional' 
  | 'behavioral' 
  | 'biometric' 
  | 'health' 
  | 'genetic'
  | 'location'
  | 'other';

export type DataSensitivity = 'public' | 'internal' | 'confidential' | 'restricted' | 'sensitive';

export type LegalBasis = 
  | 'consent' 
  | 'contract' 
  | 'legal_obligation' 
  | 'vital_interests' 
  | 'public_task' 
  | 'legitimate_interests';

export interface ConsentRecord {
  id: string;
  purpose: string;
  granted: boolean;
  grantedAt?: Date;
  revokedAt?: Date;
  method: 'explicit' | 'implicit' | 'opt_in' | 'opt_out';
  evidence: ConsentEvidence;
  version: string;
}

export interface ConsentEvidence {
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  consentText: string;
  checkboxState?: boolean;
  signature?: string;
}

export interface LGPDRequest {
  id: string;
  type: LGPDRequestType;
  status: LGPDRequestStatus;
  requestedBy: string;
  requestedAt: Date;
  processedBy?: string;
  processedAt?: Date;
  description: string;
  response?: string;
  attachments: string[];
  deadline: Date;
  urgency: 'low' | 'medium' | 'high';
}

export type LGPDRequestType = 
  | 'access' 
  | 'rectification' 
  | 'erasure' 
  | 'portability' 
  | 'restriction' 
  | 'objection' 
  | 'consent_withdrawal';

export type LGPDRequestStatus = 
  | 'pending' 
  | 'in_progress' 
  | 'completed' 
  | 'rejected' 
  | 'partially_completed';

export interface DataRetentionPolicy {
  id: string;
  name: string;
  description: string;
  retentionPeriod: number; // months
  triggerEvent: 'creation' | 'last_activity' | 'contract_end' | 'consent_withdrawal';
  autoDelete: boolean;
  archiveBeforeDelete: boolean;
  notificationPeriod: number; // days before deletion
}

export interface DataRetentionRule {
  policyId: string;
  customPeriod?: number;
  deleteAfter: Date;
  notifyBefore: Date;
  status: 'active' | 'notified' | 'deleted' | 'archived';
}

export interface EncryptionInfo {
  algorithm: string;
  keyVersion: string;
  encryptedAt: Date;
  isEncrypted: boolean;
}

// Security Settings
export interface SecuritySettings {
  passwordPolicy: PasswordPolicy;
  sessionSettings: SessionSettings;
  auditSettings: AuditSettings;
  encryptionSettings: EncryptionSettings;
  lgpdSettings: LGPDSettings;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  expiration: number; // days
  historyLimit: number;
  maxAttempts: number;
  lockoutDuration: number; // minutes
}

export interface SessionSettings {
  timeout: number; // minutes
  maxConcurrentSessions: number;
  requireMFA: boolean;
  ipRestriction: boolean;
  allowedIPs: string[];
}

export interface AuditSettings {
  enabled: boolean;
  retentionPeriod: number; // days
  highRiskEvents: AuditAction[];
  realTimeAlerts: boolean;
  exportFormats: string[];
}

export interface EncryptionSettings {
  algorithm: string;
  keyRotationPeriod: number; // days
  requireFieldEncryption: string[];
  requireTransitEncryption: boolean;
  requireRestEncryption: boolean;
}

export interface LGPDSettings {
  enabled: boolean;
  dpoEmail: string;
  defaultRetentionPeriod: number; // months
  autoResponseEnabled: boolean;
  requestTimeout: number; // days
  consentRequired: string[];
}