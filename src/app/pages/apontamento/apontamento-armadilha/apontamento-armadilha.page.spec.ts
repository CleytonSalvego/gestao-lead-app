import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApontamentoArmadilhaPage } from './apontamento-armadilha.page';

describe('ApontamentoArmadilhaPage', () => {
  let component: ApontamentoArmadilhaPage;
  let fixture: ComponentFixture<ApontamentoArmadilhaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ApontamentoArmadilhaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
