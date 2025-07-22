import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleEliminationComponent } from './single-elimination.component';

describe('SingleEliminationComponent', () => {
  let component: SingleEliminationComponent;
  let fixture: ComponentFixture<SingleEliminationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SingleEliminationComponent]
    });
    fixture = TestBed.createComponent(SingleEliminationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
