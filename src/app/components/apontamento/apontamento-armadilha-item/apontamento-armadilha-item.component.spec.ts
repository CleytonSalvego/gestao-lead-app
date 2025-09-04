import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ApontamentoArmadilhaItemComponent } from './apontamento-armadilha-item.component';

describe('ApontamentoArmadilhaItemComponent', () => {
  let component: ApontamentoArmadilhaItemComponent;
  let fixture: ComponentFixture<ApontamentoArmadilhaItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ApontamentoArmadilhaItemComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ApontamentoArmadilhaItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
