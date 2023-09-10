import { TestBed } from '@angular/core/testing';

import { LocalServiceService } from './local-service.service';

describe('LocalServiceService', () => {
  let service: LocalServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
