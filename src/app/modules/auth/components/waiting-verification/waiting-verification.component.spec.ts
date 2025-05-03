import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitingVerificationComponent } from './waiting-verification.component';

describe('WaitingVerificationComponent', () => {
  let component: WaitingVerificationComponent;
  let fixture: ComponentFixture<WaitingVerificationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WaitingVerificationComponent]
    });
    fixture = TestBed.createComponent(WaitingVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
