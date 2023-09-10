import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InappPurchasePage } from './inapp-purchase.page';

describe('InappPurchasePage', () => {
  let component: InappPurchasePage;
  let fixture: ComponentFixture<InappPurchasePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InappPurchasePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InappPurchasePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
