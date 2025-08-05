import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamDialogViewComponent } from './team-dialog-view.component';

describe('TeamDialogViewComponent', () => {
  let component: TeamDialogViewComponent;
  let fixture: ComponentFixture<TeamDialogViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeamDialogViewComponent]
    });
    fixture = TestBed.createComponent(TeamDialogViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
