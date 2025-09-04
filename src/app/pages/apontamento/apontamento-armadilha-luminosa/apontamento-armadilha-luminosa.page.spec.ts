import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApontamentoArmadilhaLuminosaPage } from './apontamento-armadilha-luminosa.page';

describe('ApontamentoArmadilhaLuminosaPage', () => {
  let component: ApontamentoArmadilhaLuminosaPage;
  let fixture: ComponentFixture<ApontamentoArmadilhaLuminosaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ApontamentoArmadilhaLuminosaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
