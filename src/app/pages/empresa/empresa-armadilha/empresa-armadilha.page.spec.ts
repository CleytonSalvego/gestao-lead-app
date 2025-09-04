import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmpresaArmadilhaPage } from './empresa-armadilha.page';

describe('EmpresaArmadilhaPage', () => {
  let component: EmpresaArmadilhaPage;
  let fixture: ComponentFixture<EmpresaArmadilhaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EmpresaArmadilhaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
