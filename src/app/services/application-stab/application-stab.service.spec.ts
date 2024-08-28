import { TestBed } from '@angular/core/testing';

import { ApplicationStabService } from './application-stab.service';

describe('ApplicationStabService', () => {
  let service: ApplicationStabService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApplicationStabService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
