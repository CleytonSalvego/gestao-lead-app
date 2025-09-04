import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmpresaListPage } from './empresa-list.page';

describe('EmpresaListPage', () => {
  let component: EmpresaListPage;
  let fixture: ComponentFixture<EmpresaListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EmpresaListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
