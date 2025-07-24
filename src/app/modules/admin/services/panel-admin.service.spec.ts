import { TestBed } from '@angular/core/testing';

import { PanelAdminService } from './panel-admin.service';

describe('PanelAdminService', () => {
  let service: PanelAdminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PanelAdminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
