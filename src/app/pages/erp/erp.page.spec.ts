import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErpPage } from './erp.page';

describe('ErpPage', () => {
  let component: ErpPage;
  let fixture: ComponentFixture<ErpPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ErpPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
