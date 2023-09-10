import { TestBed } from '@angular/core/testing';

import { InappPurchaseService } from './inapp-purchase.service';

describe('InappPurchaseService', () => {
  let service: InappPurchaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InappPurchaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
