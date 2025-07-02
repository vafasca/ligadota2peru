import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallengeResponseDialogComponent } from './challenge-response-dialog.component';

describe('ChallengeResponseDialogComponent', () => {
  let component: ChallengeResponseDialogComponent;
  let fixture: ComponentFixture<ChallengeResponseDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChallengeResponseDialogComponent]
    });
    fixture = TestBed.createComponent(ChallengeResponseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
