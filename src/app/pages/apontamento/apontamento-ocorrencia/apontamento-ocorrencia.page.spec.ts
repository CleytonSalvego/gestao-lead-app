import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApontamentoOcorrenciaPage } from './apontamento-ocorrencia.page';

describe('ApontamentoOcorrenciaPage', () => {
  let component: ApontamentoOcorrenciaPage;
  let fixture: ComponentFixture<ApontamentoOcorrenciaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ApontamentoOcorrenciaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
