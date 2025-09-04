import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsuarioCreatePage } from './usuario-create.page';

describe('UsuarioCreatePage', () => {
  let component: UsuarioCreatePage;
  let fixture: ComponentFixture<UsuarioCreatePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UsuarioCreatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
