import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LoginModalPage } from './login-modal.page';

describe('LoginModalPage', () => {
  let component: LoginModalPage;
  let fixture: ComponentFixture<LoginModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
