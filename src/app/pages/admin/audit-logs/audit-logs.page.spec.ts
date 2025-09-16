import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuditLogsPage } from './audit-logs.page';

describe('AuditLogsPage', () => {
  let component: AuditLogsPage;
  let fixture: ComponentFixture<AuditLogsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditLogsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
