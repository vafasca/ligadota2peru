import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentInvitationDialogComponent } from './tournament-invitation-dialog.component';

describe('TournamentInvitationDialogComponent', () => {
  let component: TournamentInvitationDialogComponent;
  let fixture: ComponentFixture<TournamentInvitationDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TournamentInvitationDialogComponent]
    });
    fixture = TestBed.createComponent(TournamentInvitationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
