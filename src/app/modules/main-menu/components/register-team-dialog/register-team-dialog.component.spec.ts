import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterTeamDialogComponent } from './register-team-dialog.component';

describe('RegisterTeamDialogComponent', () => {
  let component: RegisterTeamDialogComponent;
  let fixture: ComponentFixture<RegisterTeamDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegisterTeamDialogComponent]
    });
    fixture = TestBed.createComponent(RegisterTeamDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
