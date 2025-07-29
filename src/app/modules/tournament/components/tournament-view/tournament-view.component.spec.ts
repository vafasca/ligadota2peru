import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentViewComponent } from './tournament-view.component';

describe('TournamentViewComponent', () => {
  let component: TournamentViewComponent;
  let fixture: ComponentFixture<TournamentViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TournamentViewComponent]
    });
    fixture = TestBed.createComponent(TournamentViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
