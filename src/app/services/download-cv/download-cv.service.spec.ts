import { TestBed } from '@angular/core/testing';

import { DownloadCvService } from './download-cv.service';

describe('DownloadCvService', () => {
  let service: DownloadCvService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DownloadCvService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
