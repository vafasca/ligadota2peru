import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamsPerTournamentComponent } from './teams-per-tournament.component';

describe('TeamsPerTournamentComponent', () => {
  let component: TeamsPerTournamentComponent;
  let fixture: ComponentFixture<TeamsPerTournamentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeamsPerTournamentComponent]
    });
    fixture = TestBed.createComponent(TeamsPerTournamentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
