import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmpresaMapaPage } from './empresa-mapa.page';

describe('EmpresaMapaPage', () => {
  let component: EmpresaMapaPage;
  let fixture: ComponentFixture<EmpresaMapaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EmpresaMapaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
