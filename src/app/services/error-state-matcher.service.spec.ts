import { TestBed } from '@angular/core/testing';

import { ErrorStateMatcherService } from './error-state-matcher.service';

describe('ErrorStateMatcherService', () => {
  let service: ErrorStateMatcherService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorStateMatcherService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
