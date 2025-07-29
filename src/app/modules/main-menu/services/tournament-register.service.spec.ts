import { TestBed } from '@angular/core/testing';

import { TournamentRegisterService } from './tournament-register.service';

describe('TournamentRegisterService', () => {
  let service: TournamentRegisterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TournamentRegisterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
