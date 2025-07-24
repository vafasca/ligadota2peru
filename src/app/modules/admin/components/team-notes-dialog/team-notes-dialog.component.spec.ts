import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamNotesDialogComponent } from './team-notes-dialog.component';

describe('TeamNotesDialogComponent', () => {
  let component: TeamNotesDialogComponent;
  let fixture: ComponentFixture<TeamNotesDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeamNotesDialogComponent]
    });
    fixture = TestBed.createComponent(TeamNotesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
