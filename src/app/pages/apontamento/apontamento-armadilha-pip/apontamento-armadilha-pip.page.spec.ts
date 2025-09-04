import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApontamentoArmadilhaPipPage } from './apontamento-armadilha-pip.page';

describe('ApontamentoArmadilhaPipPage', () => {
  let component: ApontamentoArmadilhaPipPage;
  let fixture: ComponentFixture<ApontamentoArmadilhaPipPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ApontamentoArmadilhaPipPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
