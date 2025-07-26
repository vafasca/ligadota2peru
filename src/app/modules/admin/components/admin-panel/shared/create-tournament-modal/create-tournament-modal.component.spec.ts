import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTournamentModalComponent } from './create-tournament-modal.component';

describe('CreateTournamentModalComponent', () => {
  let component: CreateTournamentModalComponent;
  let fixture: ComponentFixture<CreateTournamentModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateTournamentModalComponent]
    });
    fixture = TestBed.createComponent(CreateTournamentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
