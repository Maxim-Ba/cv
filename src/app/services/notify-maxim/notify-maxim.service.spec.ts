import { TestBed } from '@angular/core/testing';

import { NotifyMaximService } from './notify-maxim.service';

describe('NotifyMaximService', () => {
  let service: NotifyMaximService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotifyMaximService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
