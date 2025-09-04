import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmpresaCreatePage } from './empresa-create.page';

describe('EmpresaCreatePage', () => {
  let component: EmpresaCreatePage;
  let fixture: ComponentFixture<EmpresaCreatePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EmpresaCreatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
