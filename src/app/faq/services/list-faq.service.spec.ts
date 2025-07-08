import { TestBed } from '@angular/core/testing';

import { ListFaqService } from './list-faq.service';

describe('ListFaqService', () => {
  let service: ListFaqService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListFaqService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
