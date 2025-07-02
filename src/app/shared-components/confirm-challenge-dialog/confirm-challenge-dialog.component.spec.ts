import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmChallengeDialogComponent } from './confirm-challenge-dialog.component';

describe('ConfirmChallengeDialogComponent', () => {
  let component: ConfirmChallengeDialogComponent;
  let fixture: ComponentFixture<ConfirmChallengeDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmChallengeDialogComponent]
    });
    fixture = TestBed.createComponent(ConfirmChallengeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
