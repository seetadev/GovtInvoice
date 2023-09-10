import { TestBed } from '@angular/core/testing';

import { CloudServiceService } from './cloud-service.service';

describe('CloudServiceService', () => {
  let service: CloudServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CloudServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
