import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrdemServicoCreatePage } from './ordem-servico-create.page';

describe('OrdemServicoCreatePage', () => {
  let component: OrdemServicoCreatePage;
  let fixture: ComponentFixture<OrdemServicoCreatePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdemServicoCreatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
