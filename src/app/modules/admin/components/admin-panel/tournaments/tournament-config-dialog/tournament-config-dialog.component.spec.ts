import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentConfigDialogComponent } from './tournament-config-dialog.component';

describe('TournamentConfigDialogComponent', () => {
  let component: TournamentConfigDialogComponent;
  let fixture: ComponentFixture<TournamentConfigDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TournamentConfigDialogComponent]
    });
    fixture = TestBed.createComponent(TournamentConfigDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
