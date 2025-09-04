import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrdemServicoListPage } from './ordem-servico-list.page';

describe('OrdemServicoListPage', () => {
  let component: OrdemServicoListPage;
  let fixture: ComponentFixture<OrdemServicoListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdemServicoListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
