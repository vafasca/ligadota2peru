import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTounamentComponent } from './create-tounament.component';

describe('CreateTounamentComponent', () => {
  let component: CreateTounamentComponent;
  let fixture: ComponentFixture<CreateTounamentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateTounamentComponent]
    });
    fixture = TestBed.createComponent(CreateTounamentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
