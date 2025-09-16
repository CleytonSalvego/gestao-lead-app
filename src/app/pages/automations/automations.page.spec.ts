import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AutomationsPage } from './automations.page';

describe('AutomationsPage', () => {
  let component: AutomationsPage;
  let fixture: ComponentFixture<AutomationsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AutomationsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
