import { TestBed } from '@angular/core/testing';

import { MyErrorStateMatcher } from './error-state-matcher.service';

describe('MyErrorStateMatcher', () => {
  let service: MyErrorStateMatcher;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyErrorStateMatcher);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
