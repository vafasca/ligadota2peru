import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerRegistrationComponent } from './player-registration.component';

describe('PlayerRegistrationComponent', () => {
  let component: PlayerRegistrationComponent;
  let fixture: ComponentFixture<PlayerRegistrationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlayerRegistrationComponent]
    });
    fixture = TestBed.createComponent(PlayerRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
